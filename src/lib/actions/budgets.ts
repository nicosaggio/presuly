"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and, inArray, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "@/lib/db";
import { budgets, acceptances, users, type BudgetItem, type BudgetAttachment } from "@/lib/db/schema";
import { saveItemsForUser } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { activeBudgetLimit, ACTIVE_BUDGET_STATUSES, hasBranding } from "@/lib/plans";
import { grantReferralReward } from "@/lib/actions/referrals";
import { renderBudgetPdf } from "@/lib/pdf/budget-pdf";
import { sendEmail } from "@/lib/email/resend";
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE,
  uploadAttachment,
  deleteAttachment,
} from "@/lib/storage/attachments";
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
  kind: z.enum(["service", "product"]),
  deliveryMode: z.enum(["online", "in_person", "hybrid"]),
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
    kind: formData.get("kind") || "service",
    deliveryMode: formData.get("deliveryMode") || "online",
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

/**
 * Junta los adjuntos que se mantienen (por id, mandados como JSON) con los archivos nuevos
 * del input de la parte del form. Sube los nuevos a Netlify Blobs y borra los que se sacaron.
 * Tira Error en el primer archivo inválido — el form ya valida esto mismo del lado del cliente,
 * así que llegar hasta acá con algo inválido debería ser raro.
 */
async function resolveAttachments(
  formData: FormData,
  existing: BudgetAttachment[]
): Promise<BudgetAttachment[]> {
  const rawKept = formData.get("keptAttachments");
  let keptIds = existing.map((a) => a.id);
  if (typeof rawKept === "string" && rawKept.length > 0) {
    try {
      keptIds = z.array(z.string()).parse(JSON.parse(rawKept));
    } catch {
      // valor inesperado: no se saca nada por las dudas
    }
  }

  const kept = existing.filter((a) => keptIds.includes(a.id));
  const removed = existing.filter((a) => !keptIds.includes(a.id));
  const newFiles = formData
    .getAll("newAttachments")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (kept.length + newFiles.length > MAX_ATTACHMENTS) {
    throw new Error(`No se pueden tener más de ${MAX_ATTACHMENTS} archivos adjuntos.`);
  }

  const uploaded: BudgetAttachment[] = [];
  for (const file of newFiles) {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      throw new Error(`"${file.name}" supera el tamaño máximo de 10MB.`);
    }
    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      throw new Error(`"${file.name}" no es un tipo de archivo permitido.`);
    }
    const key = nanoid(24);
    await uploadAttachment(key, await file.arrayBuffer(), file.type);
    uploaded.push({ id: nanoid(8), name: file.name, contentType: file.type, size: file.size, key });
  }

  await Promise.all(removed.map((a) => deleteAttachment(a.key).catch(() => {})));

  return [...kept, ...uploaded];
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

  const [owner] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  const limit = activeBudgetLimit(owner!);
  if (limit !== null) {
    const [{ value: activeCount }] = await db
      .select({ value: count() })
      .from(budgets)
      .where(
        and(eq(budgets.userId, session.userId), inArray(budgets.status, ACTIVE_BUDGET_STATUSES))
      );
    if (activeCount >= limit) {
      redirect("/dashboard/new?error=limit_reached");
    }
  }

  const attachments = await resolveAttachments(formData, []);

  const [created] = await db
    .insert(budgets)
    .values({
      userId: session.userId,
      token: nanoid(21),
      locale,
      title: data.title,
      kind: data.kind,
      deliveryMode: data.deliveryMode,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      intro: data.intro,
      scope: data.scope,
      conditions: data.conditions,
      currency: data.currency,
      paymentLink: data.paymentLink,
      validityDays: data.validityDays,
      items: data.items as BudgetItem[],
      attachments,
    })
    .returning({ id: budgets.id });

  await saveItemsForUser(session.userId, data.items as BudgetItem[], data.currency);

  redirect(`/dashboard/${created.id}`);
}

export async function updateBudget(id: string, formData: FormData) {
  const { budget } = await requireOwnedBudget(id);
  const data = parseBudgetForm(formData);
  const attachments = await resolveAttachments(formData, budget.attachments);

  await db
    .update(budgets)
    .set({
      title: data.title,
      kind: data.kind,
      deliveryMode: data.deliveryMode,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      intro: data.intro,
      scope: data.scope,
      conditions: data.conditions,
      currency: data.currency,
      paymentLink: data.paymentLink,
      validityDays: data.validityDays,
      items: data.items as BudgetItem[],
      attachments,
      updatedAt: new Date(),
    })
    .where(eq(budgets.id, id));

  await saveItemsForUser(budget.userId, data.items as BudgetItem[], data.currency);

  revalidatePath(`/dashboard/${id}`);
}

/** Borra el presupuesto y sus adjuntos en Netlify Blobs (no se limpian solos,
 * a diferencia de la fila en la base). La aceptación, si la hay, se borra
 * en cascada por la FK. Irreversible — no hay confirmación server-side más
 * allá de la de ownership; la confirmación de "¿estás seguro?" es responsabilidad
 * de la UI que llama a esto. */
export async function deleteBudget(id: string) {
  const { budget } = await requireOwnedBudget(id);

  await Promise.all(budget.attachments.map((a) => deleteAttachment(a.key).catch(() => {})));
  await db.delete(budgets).where(eq(budgets.id, id));

  revalidatePath("/dashboard");
}

export async function publishBudget(id: string) {
  const { budget, session } = await requireOwnedBudget(id);
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

  const [owner] = await db
    .select({
      referredByUserId: users.referredByUserId,
      referralRewardGranted: users.referralRewardGranted,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (owner?.referredByUserId && !owner.referralRewardGranted) {
    await grantReferralReward(session.userId, owner.referredByUserId).catch((err) =>
      console.error("grantReferralReward failed", err)
    );
  }

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

    const [owner] = await db
      .select({ email: users.email, plan: users.plan, planStatus: users.planStatus })
      .from(users)
      .where(eq(users.id, budget.userId))
      .limit(1);

    const pdf = await renderBudgetPdf(
      { ...budget, items: finalItems, status: "accepted", acceptedAt: now },
      acceptance,
      budget.locale as "es" | "en",
      !owner || hasBranding(owner)
    );

    const ownerMail = budgetAcceptedOwnerEmail(budget.locale as "es" | "en", {
      clientName: parsed.data.signerName,
      title: budget.title,
    });

    const emailTasks: Promise<unknown>[] = [];

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
