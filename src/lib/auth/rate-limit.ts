import { sql, gte, lt, and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { magicLinkRequests } from "@/lib/db/schema";

/**
 * Límites server-side del magic link, además del cooldown de 30s por cookie
 * (que un navegador incógnito o distinto ya esquiva). Pensados para frenar un
 * abuso distribuido moderado sin necesitar un servicio de rate limiting aparte.
 */
const EMAIL_LIMIT = 5;
const EMAIL_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const IP_LIMIT = 15;
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const RETENTION_MS = 24 * 60 * 60 * 1000;

export type RateLimitResult = { limited: false } | { limited: true; reason: "email" | "ip" };

/**
 * Chequea los límites y, si no se superaron, registra el pedido. No lanza: un
 * fallo acá no debe bloquear el envío del magic link (ver requestMagicLink()).
 */
export async function checkMagicLinkRateLimit(
  email: string,
  ip: string | null
): Promise<RateLimitResult> {
  const now = Date.now();

  const [{ count: emailCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(magicLinkRequests)
    .where(
      and(
        eq(magicLinkRequests.email, email),
        gte(magicLinkRequests.createdAt, new Date(now - EMAIL_WINDOW_MS))
      )
    );
  if (emailCount >= EMAIL_LIMIT) return { limited: true, reason: "email" };

  if (ip) {
    const [{ count: ipCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(magicLinkRequests)
      .where(
        and(eq(magicLinkRequests.ip, ip), gte(magicLinkRequests.createdAt, new Date(now - IP_WINDOW_MS)))
      );
    if (ipCount >= IP_LIMIT) return { limited: true, reason: "ip" };
  }

  await db.insert(magicLinkRequests).values({ email, ip });
  await db
    .delete(magicLinkRequests)
    .where(lt(magicLinkRequests.createdAt, new Date(now - RETENTION_MS)));

  return { limited: false };
}
