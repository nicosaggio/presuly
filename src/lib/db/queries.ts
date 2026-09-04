import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./index";
import { budgets, acceptances, users, type signupSourceEnum } from "./schema";

export async function getBudgetByToken(token: string) {
  const [budget] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.token, token))
    .limit(1);
  return budget ?? null;
}

export async function getAcceptanceForBudget(budgetId: string) {
  const [acceptance] = await db
    .select()
    .from(acceptances)
    .where(eq(acceptances.budgetId, budgetId))
    .limit(1);
  return acceptance ?? null;
}

export async function getUserBudgets(userId: string) {
  return db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(desc(budgets.updatedAt));
}

export async function getBudgetById(id: string) {
  const [budget] = await db.select().from(budgets).where(eq(budgets.id, id)).limit(1);
  return budget ?? null;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function getUserByReferralCode(code: string) {
  const [user] = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
  return user ?? null;
}

type SignupSource = (typeof signupSourceEnum.enumValues)[number];

/**
 * Upsert atómico: dos verificaciones de magic link casi simultáneas (común porque
 * Gmail/Outlook "pre-visitan" los links por seguridad) no deben pisarse en una
 * carrera select-then-insert. ON CONFLICT DO UPDATE con un no-op garantiza que
 * RETURNING siempre traiga la fila, gane quien gane la carrera.
 *
 * La atribución (signupSource/referredByUserId) solo se aplica si el INSERT
 * gana la carrera (usuario nuevo) — en un login existente el UPDATE no la toca.
 */
export async function upsertUserByEmail(
  email: string,
  locale: string,
  attribution?: { signupSource?: SignupSource; referredByUserId?: string }
) {
  const [user] = await db
    .insert(users)
    .values({
      email,
      locale,
      referralCode: nanoid(8),
      signupSource: attribution?.signupSource ?? "direct",
      referredByUserId: attribution?.referredByUserId ?? null,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { email },
    })
    .returning();
  return user;
}
