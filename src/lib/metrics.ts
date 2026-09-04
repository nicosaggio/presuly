import { sql, ne, eq, gte, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, budgets } from "@/lib/db/schema";
import { ACTIVE_BUDGET_STATUSES, PLAN_PRICES } from "@/lib/plans";

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

export type OverviewStats = {
  totalUsers: number;
  newUsersLast7Days: number;
  totalBudgets: number;
  activeBudgets: number;
  acceptedBudgets: number;
  /** Aceptados / (enviado + visto + aceptado + vencido) — de lo que se mandó, cuánto se cerró. */
  acceptanceRate: number | null;
  subscribedUsers: number;
  planBreakdown: { plan: string; count: number }[];
  /** Estimado asumiendo que todas las suscripciones activas son mensuales (no distinguimos mensual/anual acá). */
  estimatedMrrUsd: number;
};

const SENT_OR_LATER_STATUSES = ["sent", "viewed", "accepted", "expired"] as const;

/** Plan "efectivo": si la suscripción no está activa (pago fallido, cancelada), cuenta como free — igual que effectivePlan() en plans.ts. */
const effectivePlanExpr = sql<string>`case when ${users.plan} != 'free' and ${users.planStatus} = 'active' then ${users.plan} else 'free' end`;

export async function calculateOverviewStats(): Promise<OverviewStats> {
  const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    [{ count: totalUsers }],
    [{ count: newUsersLast7Days }],
    [{ count: totalBudgets }],
    [{ count: activeBudgets }],
    [{ count: acceptedBudgets }],
    [{ count: sentOrLater }],
    planRows,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(users),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(gte(users.createdAt, since7Days)),
    db.select({ count: sql<number>`count(*)::int` }).from(budgets),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(budgets)
      .where(inArray(budgets.status, ACTIVE_BUDGET_STATUSES)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(budgets)
      .where(eq(budgets.status, "accepted")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(budgets)
      .where(inArray(budgets.status, SENT_OR_LATER_STATUSES)),
    db
      .select({ plan: effectivePlanExpr, count: sql<number>`count(*)::int` })
      .from(users)
      .groupBy(effectivePlanExpr),
  ]);

  const proCount = planRows.find((r) => r.plan === "pro")?.count ?? 0;
  const studioCount = planRows.find((r) => r.plan === "studio")?.count ?? 0;

  return {
    totalUsers,
    newUsersLast7Days,
    totalBudgets,
    activeBudgets,
    acceptedBudgets,
    acceptanceRate: sentOrLater > 0 ? acceptedBudgets / sentOrLater : null,
    subscribedUsers: proCount + studioCount,
    planBreakdown: planRows,
    estimatedMrrUsd:
      proCount * PLAN_PRICES.pro.monthlyUSD + studioCount * PLAN_PRICES.studio.monthlyUSD,
  };
}
