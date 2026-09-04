import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { calculateViralCoefficient, calculateOverviewStats } from "@/lib/metrics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PLAN_LABELS: Record<string, { es: string; en: string }> = {
  free: { es: "Gratis", en: "Free" },
  pro: { es: "Pro", en: "Pro" },
  studio: { es: "Estudio", en: "Studio" },
};

const SOURCE_LABELS: Record<string, { es: string; en: string }> = {
  direct: { es: "Directo", en: "Direct" },
  shared_link: { es: "Link de presupuesto", en: "Shared proposal link" },
  referral: { es: "Referido", en: "Referral" },
  template_gallery: { es: "Galería de plantillas", en: "Template gallery" },
};

export default async function MetricsPage() {
  const session = await getSession();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || session?.email !== adminEmail) notFound();

  const [locale, metrics, overview] = await Promise.all([
    getLocale(),
    calculateViralCoefficient(),
    calculateOverviewStats(),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">
        {locale === "en" ? "Growth metrics" : "Métricas de crecimiento"}
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{overview.totalUsers}</CardTitle>
            <CardDescription>
              {locale === "en" ? "Registered users" : "Usuarios registrados"}
              {overview.newUsersLast7Days > 0 && (
                <span className="ml-1 text-emerald-600">
                  +{overview.newUsersLast7Days} {locale === "en" ? "last 7d" : "últimos 7d"}
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{overview.activeBudgets}</CardTitle>
            <CardDescription>
              {locale === "en" ? "Active proposals" : "Presupuestos activos"}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{overview.subscribedUsers}</CardTitle>
            <CardDescription>
              {locale === "en" ? "Paying subscribers" : "Suscriptos"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "en" ? "Plans" : "Planes"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {overview.planBreakdown.map((row) => (
            <div key={row.plan} className="flex items-center justify-between text-sm">
              <span>{PLAN_LABELS[row.plan]?.[locale] ?? row.plan}</span>
              <span className="tabular-nums font-medium">{row.count}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-2 text-sm">
            <span>
              {locale === "en" ? "Estimated MRR" : "MRR estimado"}{" "}
              <span className="text-muted-foreground">
                ({locale === "en" ? "assumes monthly" : "asume mensual"})
              </span>
            </span>
            <span className="tabular-nums font-medium">
              USD {overview.estimatedMrrUsd}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "en" ? "Proposals" : "Presupuestos"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{locale === "en" ? "Total (all-time)" : "Total (histórico)"}</span>
            <span className="tabular-nums font-medium">{overview.totalBudgets}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{locale === "en" ? "Accepted (all-time)" : "Aceptados (histórico)"}</span>
            <span className="tabular-nums font-medium">{overview.acceptedBudgets}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2 text-sm">
            <span>{locale === "en" ? "Acceptance rate" : "Tasa de aceptación"}</span>
            <span className="tabular-nums font-medium">
              {overview.acceptanceRate !== null
                ? `${(overview.acceptanceRate * 100).toFixed(0)}%`
                : "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">
            {metrics.k !== null ? metrics.k.toFixed(2) : "—"}
          </CardTitle>
          <CardDescription>
            {locale === "en"
              ? `Viral coefficient (k) — last ${metrics.windowDays} days. Below 0.15 means the loop needs a redesign, not paid ads.`
              : `Coeficiente viral (k) — últimos ${metrics.windowDays} días. Por debajo de 0.15 significa rediseñar el bucle, no gastar en pauta.`}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{metrics.totalSignups}</CardTitle>
            <CardDescription>
              {locale === "en" ? "New signups" : "Registros nuevos"}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{metrics.attributedSignups}</CardTitle>
            <CardDescription>
              {locale === "en" ? "Attributed to shared links" : "Atribuidos a links compartidos"}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{metrics.activeUsers}</CardTitle>
            <CardDescription>
              {locale === "en" ? "Active users (all-time)" : "Usuarios activos (histórico)"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "en" ? "Signups by source" : "Registros por origen"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {metrics.bySource.map((row) => (
            <div key={row.source} className="flex items-center justify-between text-sm">
              <span>{SOURCE_LABELS[row.source]?.[locale] ?? row.source}</span>
              <span className="tabular-nums font-medium">{row.count}</span>
            </div>
          ))}
          {metrics.bySource.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {locale === "en" ? "No signups yet in this window." : "Todavía no hay registros en esta ventana."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
