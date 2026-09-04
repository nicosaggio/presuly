import type { User } from "@/lib/db/schema";

export type Plan = "free" | "pro" | "studio";

export const PLAN_LIMITS: Record<Plan, { maxActiveBudgets: number | null; branding: boolean }> = {
  free: { maxActiveBudgets: 3, branding: true },
  pro: { maxActiveBudgets: null, branding: false },
  studio: { maxActiveBudgets: null, branding: false },
};

export const PLAN_PRICES = {
  pro: { monthlyUSD: 5, annualUSD: 45 },
  studio: { monthlyUSD: 29 },
} as const;

/** Estados de presupuesto que ocupan un lugar del cupo del plan gratis. */
export const ACTIVE_BUDGET_STATUSES = ["draft", "sent", "viewed"] as const;

export function isPaidPlan(plan: Plan): boolean {
  return plan !== "free";
}

/** Un plan pago con la suscripción no-activa (pago fallido, cancelada) se trata como free. */
export function effectivePlan(user: Pick<User, "plan" | "planStatus">): Plan {
  if (user.plan !== "free" && user.planStatus !== "active") return "free";
  return user.plan;
}

export function hasBranding(user: Pick<User, "plan" | "planStatus">): boolean {
  return PLAN_LIMITS[effectivePlan(user)].branding;
}

export function activeBudgetLimit(user: Pick<User, "plan" | "planStatus">): number | null {
  return PLAN_LIMITS[effectivePlan(user)].maxActiveBudgets;
}
