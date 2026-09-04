import { createSignedToken, verifySignedToken } from "./token";

const MAGIC_LINK_TTL_SECONDS = 60 * 15; // 15 minutos

type MagicLinkPayload = {
  email: string;
  locale: string;
  purpose: "magic-link";
  /** A dónde redirigir después de verificar (ej: volver a la plantilla que eligió). */
  next?: string;
};

export function createMagicLinkToken(email: string, locale: string, next?: string): string {
  return createSignedToken(
    { email, locale, purpose: "magic-link", ...(next ? { next } : {}) },
    MAGIC_LINK_TTL_SECONDS
  );
}

export function verifyMagicLinkToken(
  token: string
): { email: string; locale: string; next?: string } | null {
  const payload = verifySignedToken<MagicLinkPayload>(token);
  if (!payload || payload.purpose !== "magic-link") return null;
  return { email: payload.email, locale: payload.locale, next: payload.next };
}
