import { dictionaries, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n/routes";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/queries";
import { getPriceIds } from "@/lib/paddle/server";
import { effectivePlan, PLAN_PRICES } from "@/lib/plans";
import { formatCurrency } from "@/lib/format";
import { LinkButton } from "@/components/link-button";
import { PaddleCheckoutButton } from "@/components/paddle-checkout-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Presuly",
  description: "Presupuestos y propuestas que se envían como link, con firma electrónica simple.",
  offers: [
    {
      "@type": "Offer",
      name: "Gratis",
      price: "0",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Pro (mensual)",
      price: String(PLAN_PRICES.pro.monthlyUSD),
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Pro (anual)",
      price: String(PLAN_PRICES.pro.annualUSD),
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Estudio (mensual)",
      price: String(PLAN_PRICES.studio.monthlyUSD),
      priceCurrency: "USD",
    },
  ],
};

/**
 * Página pública de precios. Recibe el locale explícito del route segment que
 * la invoca (`/pricing` = "es", `/en/pricing` = "en") en vez de leerlo de la
 * cookie `presuly_locale` — ver docs/DECISIONS.md, entrada 2026-09-05.
 */
export async function PricingPage({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;

  const priceIds = getPriceIds();
  const paddleConfigured = Boolean(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
  const plan = user ? effectivePlan(user) : "free";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">
          {user ? dict.billing.title : dict.billing.publicTitle}
        </h1>
        <p className="text-muted-foreground">{dict.landing.freeNote}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className={plan === "free" ? "border-foreground" : ""}>
          <CardHeader>
            <CardTitle>{dict.billing.free}</CardTitle>
            <CardDescription>{dict.billing.freeDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-semibold">{formatCurrency(0, "USD", locale)}</p>
            {!user && (
              <LinkButton href="/login" size="sm" className="w-full">
                {dict.landing.cta}
              </LinkButton>
            )}
          </CardContent>
        </Card>

        <Card className={plan === "pro" ? "border-foreground" : ""}>
          <CardHeader>
            <CardTitle>{dict.billing.pro}</CardTitle>
            <CardDescription>{dict.billing.proDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-2xl font-semibold">
                {formatCurrency(PLAN_PRICES.pro.monthlyUSD, "USD", locale)}
                {dict.billing.perMonth}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(PLAN_PRICES.pro.annualUSD, "USD", locale)}
                {dict.billing.perYear} ({dict.billing.annual})
              </p>
            </div>
            {plan === "pro" ? (
              <p className="text-sm font-medium">{dict.dashboard.planBadgePro} ✓</p>
            ) : user && paddleConfigured ? (
              <div className="flex flex-col gap-2">
                <PaddleCheckoutButton
                  priceId={priceIds.proMonthly}
                  userId={user.id}
                  email={user.email}
                  activatingLabel={dict.billing.activating}
                >
                  {dict.billing.monthly}
                </PaddleCheckoutButton>
                <PaddleCheckoutButton
                  priceId={priceIds.proAnnual}
                  userId={user.id}
                  email={user.email}
                  activatingLabel={dict.billing.activating}
                  variant="outline"
                >
                  {dict.billing.annual}
                </PaddleCheckoutButton>
              </div>
            ) : (
              <LinkButton
                href={`/login?next=${encodeURIComponent(localizedPath(locale, "/pricing"))}`}
                size="sm"
                className="w-full"
              >
                {dict.billing.upgradeToPro}
              </LinkButton>
            )}
          </CardContent>
        </Card>

        <Card className={plan === "studio" ? "border-foreground" : ""}>
          <CardHeader>
            <CardTitle>{dict.billing.studio}</CardTitle>
            <CardDescription>{dict.billing.studioDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(PLAN_PRICES.studio.monthlyUSD, "USD", locale)}
              {dict.billing.perMonth}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
