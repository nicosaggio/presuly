import { sql, ne, gte, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, budgets } from "@/lib/db/schema";

const WINDOW_DAYS = 60;

export type ViralMetrics = {
  windowDays: number;
  attributedSignups: number;
  totalSignups: number;
  activeUsers: number;
  k: number | null;
  bySource: { source: string; count: number }[];
};

/**
 * k = registros atribuidos a un link compartido (referido, footer de presupuesto,
 * galería de plantillas) / usuarios activos (quienes publicaron al menos un
 * presupuesto), en una ventana de 60 días. Ver docs/PLAN.md.
 */
export async function calculateViralCoefficient(): Promise<ViralMetrics> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [{ count: attributedSignups }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(gte(users.createdAt, since), ne(users.signupSource, "direct")));

  const [{ count: totalSignups }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(gte(users.createdAt, since));

  const [{ count: activeUsers }] = await db
    .select({ count: sql<number>`count(distinct ${budgets.userId})::int` })
    .from(budgets)
    .where(ne(budgets.status, "draft"));

  const bySourceRows = await db
    .select({ source: users.signupSource, count: sql<number>`count(*)::int` })
    .from(users)
    .where(gte(users.createdAt, since))
    .groupBy(users.signupSource);

  return {
    windowDays: WINDOW_DAYS,
    attributedSignups,
    totalSignups,
    activeUsers,
    k: activeUsers > 0 ? attributedSignups / activeUsers : null,
    bySource: bySourceRows,
  };
}
