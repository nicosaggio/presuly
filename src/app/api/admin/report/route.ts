import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getSession } from "@/lib/auth/session";
import { calculateOverviewStats, calculateViralCoefficient, calculateChurnStats } from "@/lib/metrics";
import { getEmailQuotaSnapshot } from "@/lib/email/quota";

function timingSafeStringEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Protegido por token (para que un agente/cron lo llame sin sesión de navegador)
 * o por la sesión de ADMIN_EMAIL (para abrirlo a mano). Ver docs/RUNBOOK.md. */
async function isAuthorized(request: NextRequest) {
  const token = process.env.ADMIN_REPORT_TOKEN;
  if (token) {
    const header = request.headers.get("authorization");
    const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (bearer && timingSafeStringEqual(bearer, token)) return true;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  const session = await getSession();
  return session?.email === adminEmail;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [overview, viral, churn, emailQuota] = await Promise.all([
    calculateOverviewStats(),
    calculateViralCoefficient(),
    calculateChurnStats(),
    getEmailQuotaSnapshot(),
  ]);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    users: {
      total: overview.totalUsers,
      newLast7Days: overview.newUsersLast7Days,
      subscribed: overview.subscribedUsers,
      byPlan: overview.planBreakdown,
    },
    budgets: {
      total: overview.totalBudgets,
      active: overview.activeBudgets,
      accepted: overview.acceptedBudgets,
      acceptanceRate: overview.acceptanceRate,
    },
    revenue: {
      estimatedMrrUsd: overview.estimatedMrrUsd,
    },
    churn,
    viral: {
      k: viral.k,
      windowDays: viral.windowDays,
      totalSignups: viral.totalSignups,
      attributedSignups: viral.attributedSignups,
      activeUsers: viral.activeUsers,
      bySource: viral.bySource,
    },
    quotas: {
      resendEmail: emailQuota,
    },
    // Sentry todavía no está configurado (ver docs/RUNBOOK.md) — cuando lo esté,
    // sumar acá errores 24h y las anomalías más relevantes con severidad.
  });
}
