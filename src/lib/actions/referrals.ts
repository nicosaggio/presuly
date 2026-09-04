import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const REFERRAL_BONUS_DAYS = 30;

/**
 * Recompensa de dos lados: quien refiere gana un mes de Pro por cada referido
 * que publica su primer presupuesto; el referido arranca con un mes de Pro.
 * Solo se aplica el mes gratis si la persona no tiene ya una suscripción paga
 * real (paddleSubscriptionId) — evita pisar/confundir la facturación real de
 * Paddle; el próximo webhook de Paddle es la fuente de verdad para esos casos.
 */
export async function grantReferralReward(referredUserId: string, referrerUserId: string) {
  const now = new Date();

  await db
    .update(users)
    .set({ referralRewardGranted: true })
    .where(eq(users.id, referredUserId));

  for (const userId of [referredUserId, referrerUserId]) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || user.paddleSubscriptionId) continue;

    const currentRenewal = user.planRenewsAt && user.planRenewsAt > now ? user.planRenewsAt : now;
    const newRenewal = new Date(currentRenewal.getTime() + REFERRAL_BONUS_DAYS * 24 * 60 * 60 * 1000);

    await db
      .update(users)
      .set({ plan: "pro", planStatus: "active", planRenewsAt: newRenewal })
      .where(eq(users.id, userId));
  }
}
