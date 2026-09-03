import { eq, desc } from "drizzle-orm";
import { db } from "./index";
import { budgets, acceptances, users } from "./schema";

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

/**
 * Upsert atómico: dos verificaciones de magic link casi simultáneas (común porque
 * Gmail/Outlook "pre-visitan" los links por seguridad) no deben pisarse en una
 * carrera select-then-insert. ON CONFLICT DO UPDATE con un no-op garantiza que
 * RETURNING siempre traiga la fila, gane quien gane la carrera.
 */
export async function upsertUserByEmail(email: string, locale: string) {
  const [user] = await db
    .insert(users)
    .values({ email, locale })
    .onConflictDoUpdate({
      target: users.email,
      set: { email },
    })
    .returning();
  return user;
}
