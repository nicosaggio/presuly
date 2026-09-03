"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "@/lib/db";
import { budgets, acceptances, users, type BudgetItem } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { renderBudgetPdf } from "@/lib/pdf/budget-pdf";
import { sendEmail } from "@/lib/email/resend";
import {
  budgetAcceptedClientEmail,
  budgetAcceptedOwnerEmail,
  budgetViewedEmail,
} from "@/lib/email/templates";

const itemSchema = z.object({
  id: z.string(),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  optional: z.boolean(),
  selected: z.boolean(),
});

const budgetFormSchema = z.object({
  title: z.string().trim().min(1),
  clientName: z.string().trim().min(1),
  clientEmail: z
    .union([z.literal(""), z.string().trim().email()])
    .optional()
    .transform((v) => (v ? v : undefined)),
  intro: z.string().trim().optional(),
  scope: z.string().trim().optional(),
  conditions: z.string().trim().optional(),
  currency: z.string().trim().min(1),
  paymentLink: z
    .union([z.literal(""), z.string().trim().url()])
    .optional()
    .transform((v) => (v ? v : undefined)),
  validityDays: z.coerce.number().int().min(1).max(180),
  items: z.array(itemSchema),
});

function parseBudgetForm(formData: FormData) {
  const rawItems = formData.get("items");
  let items: unknown[] = [];
  if (typeof rawItems === "string" && rawItems.length > 0) {
    try {
      items = JSON.parse(rawItems);
    } catch {
      items = [];
    }
  }

  return budgetFormSchema.parse({
    title: formData.get("title"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail") ?? "",
    intro: formData.get("intro") ?? "",
    scope: formData.get("scope") ?? "",
    conditions: formData.get("conditions") ?? "",
    currency: formData.get("currency"),
    paymentLink: formData.get("paymentLink") ?? "",
    validityDays: formData.get("validityDays"),
    items,
  });
}

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

async function requireOwnedBudget(id: string) {
  const session = await requireSession();
  const [budget] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.id, id))
    .limit(1);
  if (!budget || budget.userId !== session.userId) {
    redirect("/dashboard");
  }
  return { session, budget: budget! };
}

export async function createBudget(formData: FormData) {
  const session = await requireSession();
  const locale = await getLocale();
  const data = parseBudgetForm(formData);

  const [created] = await db
    .insert(budgets)
    .values({
      userId: session.userId,
      token: nanoid(21),
      locale,
      title: data.title,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      intro: data.intro,
      scope: data.scope,
      conditions: data.conditions,
      currency: data.currency,
      paymentLink: data.paymentLink,
      validityDays: data.validityDays,
      items: data.items as BudgetItem[],
    })
    .returning({ id: budgets.id });

  redirect(`/dashboard/${created.id}`);
}

export async function updateBudget(id: string, formData: FormData) {
  await requireOwnedBudget(id);
  const data = parseBudgetForm(formData);

  await db
    .update(budgets)
    .set({
      title: data.title,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      intro: data.intro,
      scope: data.scope,
      conditions: data.conditions,
      currency: data.currency,
      paymentLink: data.paymentLink,
      validityDays: data.validityDays,
      items: data.items as BudgetItem[],
      updatedAt: new Date(),
    })
    .where(eq(budgets.id, id));

  revalidatePath(`/dashboard/${id}`);
}

export async function publishBudget(id: string) {
  const { budget } = await requireOwnedBudget(id);
  if (budget.status !== "draft") {
    revalidatePath(`/dashboard/${id}`);
    return;
  }

  const now = new Date();
  const validUntil = new Date(
    now.getTime() + budget.validityDays * 24 * 60 * 60 * 1000
  );

  await db
    .update(budgets)
    .set({ status: "sent", publishedAt: now, validUntil, updatedAt: now })
    .where(eq(budgets.id, id));

  revalidatePath(`/dashboard/${id}`);
}

const acceptSchema = z.object({
  signerName: z.string().trim().min(1),
});

const selectionsSchema = z.array(z.object({ id: z.string(), selected: z.boolean() }));

/** Aplica solo el flag `selected` de ítems opcionales; nunca precio/descripción. */
function applySelections(items: BudgetItem[], selections: z.infer<typeof selectionsSchema>) {
  const selectedById = new Map(selections.map((s) => [s.id, s.selected]));
  return items.map((item) =>
    item.optional && selectedById.has(item.id)
      ? { ...item, selected: selectedById.get(item.id)! }
      : item
  );
}

export type AcceptBudgetState = {
  ok: boolean;
  error?: "invalid" | "not_available" | "unknown";
};

export async function acceptBudget(
  token: string,
  _prev: AcceptBudgetState,
  formData: FormData
): Promise<AcceptBudgetState> {
  const parsed = acceptSchema.safeParse({
    signerName: formData.get("signerName"),
  });
  if (!parsed.success) return { ok: false, error: "invalid" };

  let selections: z.infer<typeof selectionsSchema> = [];
  const rawSelections = formData.get("selections");
  if (typeof rawSelections === "string" && rawSelections.length > 0) {
    const parsedSelections = selectionsSchema.safeParse(JSON.parse(rawSelections));
    if (parsedSelections.success) selections = parsedSelections.data;
  }

  const [budget] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.token, token))
    .limit(1);

  if (!budget) return { ok: false, error: "not_available" };
  if (!["sent", "viewed"].includes(budget.status)) {
    return { ok: false, error: "not_available" };
  }
  if (budget.validUntil && budget.validUntil.getTime() < Date.now()) {
    return { ok: false, error: "not_available" };
  }

  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = h.get("user-agent") ?? null;
    const now = new Date();
    const finalItems = applySelections(budget.items, selections);

    const [acceptance] = await db
      .insert(acceptances)
      .values({
        budgetId: budget.id,
        signerName: parsed.data.signerName,
        ip,
        userAgent,
      })
      .returning();

    await db
      .update(budgets)
      .set({ status: "accepted", items: finalItems, acceptedAt: now, updatedAt: now })
      .where(eq(budgets.id, budget.id));

    const pdf = await renderBudgetPdf(
      { ...budget, items: finalItems, status: "accepted", acceptedAt: now },
      acceptance,
      budget.locale as "es" | "en"
    );

    const ownerMail = budgetAcceptedOwnerEmail(budget.locale as "es" | "en", {
      clientName: parsed.data.signerName,
      title: budget.title,
    });

    const emailTasks: Promise<unknown>[] = [];

    const [owner] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, budget.userId))
      .limit(1);

    if (owner?.email) {
      emailTasks.push(
        sendEmail({
          to: owner.email,
          subject: ownerMail.subject,
          html: ownerMail.html,
          attachments: [{ filename: "presupuesto.pdf", content: pdf }],
        })
      );
    }

    if (budget.clientEmail) {
      const clientMail = budgetAcceptedClientEmail(
        budget.locale as "es" | "en",
        { title: budget.title }
      );
      emailTasks.push(
        sendEmail({
          to: budget.clientEmail,
          subject: clientMail.subject,
          html: clientMail.html,
          attachments: [{ filename: "presupuesto.pdf", content: pdf }],
        })
      );
    }

    await Promise.allSettled(emailTasks);

    revalidatePath(`/p/${token}`);
    return { ok: true };
  } catch (err) {
    console.error("acceptBudget failed", err);
    return { ok: false, error: "unknown" };
  }
}

/** Se llama desde la página pública al renderizarse. Marca "visto" solo la primera vez. */
export async function recordBudgetView(id: string) {
  const [budget] = await db.select().from(budgets).where(eq(budgets.id, id)).limit(1);
  if (!budget) return;

  const now = new Date();
  const isFirstView = budget.status === "sent";

  await db
    .update(budgets)
    .set({
      status: isFirstView ? "viewed" : budget.status,
      viewedAt: budget.viewedAt ?? now,
      viewCount: budget.viewCount + 1,
      updatedAt: now,
    })
    .where(eq(budgets.id, id));

  if (!isFirstView) return;

  try {
    const [owner] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, budget.userId))
      .limit(1);
    if (!owner?.email) return;

    const origin = process.env.APP_URL ?? "http://localhost:3000";
    const mail = budgetViewedEmail(budget.locale as "es" | "en", {
      clientName: budget.clientName,
      title: budget.title,
      dashboardUrl: `${origin}/dashboard/${id}`,
    });
    await sendEmail({ to: owner.email, subject: mail.subject, html: mail.html });
  } catch (err) {
    console.error("recordBudgetView notification failed", err);
  }
}
