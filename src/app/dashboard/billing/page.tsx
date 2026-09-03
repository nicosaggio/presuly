import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { getPriceIds } from "@/lib/paddle/server";
import { effectivePlan, PLAN_PRICES } from "@/lib/plans";
import { openBillingPortal } from "@/lib/actions/billing";
import { PaddleCheckoutButton } from "@/components/paddle-checkout-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function BillingPage(props: PageProps<"/dashboard/billing">) {
  const session = await getSession();
  const [dict, locale, user] = await Promise.all([
    getDictionary(),
    getLocale(),
    getUserById(session!.userId),
  ]);
  const searchParams = await props.searchParams;
  const noSubscriptionError = searchParams?.error === "no_subscription";

  const plan = effectivePlan(user!);
  const priceIds = getPriceIds();
  const paddleConfigured = Boolean(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">{dict.billing.title}</h1>

      {noSubscriptionError && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          {dict.billing.manageBillingError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {dict.billing.currentPlan}:{" "}
            {plan === "free" ? dict.billing.free : plan === "pro" ? dict.billing.pro : dict.billing.studio}
          </CardTitle>
          {user?.planStatus === "past_due" && (
            <CardDescription className="text-destructive">{dict.billing.pastDue}</CardDescription>
          )}
          {user?.planStatus === "canceled" && plan !== "free" && (
            <CardDescription className="text-destructive">{dict.billing.canceled}</CardDescription>
          )}
          {plan !== "free" && user?.planRenewsAt && (
            <CardDescription>
              {locale === "en" ? "Renews on" : "Se renueva el"} {formatDate(user.planRenewsAt, locale)}
            </CardDescription>
          )}
        </CardHeader>
        {plan !== "free" && user?.paddleSubscriptionId && (
          <CardContent>
            <form action={openBillingPortal}>
              <Button type="submit" variant="outline" size="sm">
                {dict.billing.manageBilling}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {!paddleConfigured && (
        <p className="text-sm text-muted-foreground">
          {locale === "en"
            ? "Payments aren't configured yet in this environment."
            : "Los pagos todavía no están configurados en este entorno."}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className={plan === "free" ? "border-foreground" : ""}>
          <CardHeader>
            <CardTitle>{dict.billing.free}</CardTitle>
            <CardDescription>{dict.billing.freeDescription}</CardDescription>
          </CardHeader>
        </Card>

        <Card className={plan === "pro" ? "border-foreground" : ""}>
          <CardHeader>
            <CardTitle>
              {dict.billing.pro} · {formatCurrency(PLAN_PRICES.pro.monthlyUSD, "USD", locale)}
              {dict.billing.perMonth}
            </CardTitle>
            <CardDescription>{dict.billing.proDescription}</CardDescription>
          </CardHeader>
          {plan !== "pro" && paddleConfigured && user && (
            <CardContent className="flex flex-wrap gap-2">
              <PaddleCheckoutButton
                priceId={priceIds.proMonthly}
                userId={user.id}
                email={user.email}
                activatingLabel={dict.billing.activating}
              >
                {dict.billing.upgradeToPro} — {dict.billing.monthly}
              </PaddleCheckoutButton>
              <PaddleCheckoutButton
                priceId={priceIds.proAnnual}
                userId={user.id}
                email={user.email}
                activatingLabel={dict.billing.activating}
                variant="outline"
              >
                {dict.billing.annual} ({formatCurrency(PLAN_PRICES.pro.annualUSD, "USD", locale)}
                {dict.billing.perYear})
              </PaddleCheckoutButton>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
