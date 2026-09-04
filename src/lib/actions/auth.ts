"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createMagicLinkToken } from "@/lib/auth/magic-link";
import { checkMagicLinkRateLimit } from "@/lib/auth/rate-limit";
import { destroySession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/resend";
import { magicLinkEmail } from "@/lib/email/templates";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

const emailSchema = z.string().trim().toLowerCase().email();

const COOLDOWN_COOKIE = "presuly_ml_cooldown";
const COOLDOWN_SECONDS = 30;

export type RequestMagicLinkState = {
  ok: boolean;
  error?: "invalid_email" | "too_soon" | "too_many" | "unknown";
};

export async function requestMagicLink(
  _prev: RequestMagicLinkState,
  formData: FormData
): Promise<RequestMagicLinkState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, error: "invalid_email" };
  }
  const email = parsed.data;

  const store = await cookies();
  if (store.get(COOLDOWN_COOKIE)?.value) {
    return { ok: false, error: "too_soon" };
  }

  const locale = await getLocale();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const rateLimit = await checkMagicLinkRateLimit(email, ip).catch((err) => {
    console.error("checkMagicLinkRateLimit failed", err);
    return { limited: false as const };
  });
  if (rateLimit.limited) {
    return { ok: false, error: "too_many" };
  }

  // Solo rutas relativas propias (evita open-redirect a un dominio externo).
  const rawNext = formData.get("next");
  const next =
    typeof rawNext === "string" && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : undefined;

  try {
    const token = createMagicLinkToken(email, locale, next);
    const origin = h.get("origin") ?? process.env.APP_URL ?? "http://localhost:3000";
    const url = `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`;

    const { subject, html } = magicLinkEmail(locale, url);
    await sendEmail({ to: email, subject, html });

    store.set(COOLDOWN_COOKIE, "1", { maxAge: COOLDOWN_SECONDS, path: "/" });
    return { ok: true };
  } catch (err) {
    console.error("requestMagicLink failed", err);
    return { ok: false, error: "unknown" };
  }
}

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}

export async function logout() {
  await destroySession();
  redirect("/");
}
