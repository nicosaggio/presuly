import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { calculateViralCoefficient } from "@/lib/metrics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

  const [locale, metrics] = await Promise.all([getLocale(), calculateViralCoefficient()]);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">
        {locale === "en" ? "Growth metrics" : "Métricas de crecimiento"}
      </h1>

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
