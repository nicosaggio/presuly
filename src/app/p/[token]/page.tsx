import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getBudgetByToken, getAcceptanceForBudget, getUserById } from "@/lib/db/queries";
import { recordBudgetView, acceptBudget } from "@/lib/actions/budgets";
import { dictionaries, type Locale } from "@/lib/i18n";
import { hasBranding } from "@/lib/plans";
import { PublicBudgetView } from "@/components/public-budget-view";

export const dynamic = "force-dynamic";

// Páginas privadas por token: nunca deben indexarse.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicBudgetPage(props: PageProps<"/p/[token]">) {
  const { token } = await props.params;
  const budget = await getBudgetByToken(token);

  if (!budget || budget.status === "draft") notFound();

  if (budget.status === "sent" || budget.status === "viewed") {
    after(() => recordBudgetView(budget.id));
  }

  const [acceptance, owner] = await Promise.all([
    budget.status === "accepted" ? getAcceptanceForBudget(budget.id) : Promise.resolve(null),
    getUserById(budget.userId),
  ]);
  const showBranding = !owner || hasBranding(owner);
  const locale = (budget.locale as Locale) ?? "es";
  const dict = dictionaries[locale];
  const boundAccept = acceptBudget.bind(null, token);
  // Server Component: Date.now() acá es el reloj del servidor en el momento
  // del request (la ruta es force-dynamic), no un valor de render inestable.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const isExpired =
    !!budget.validUntil && budget.validUntil.getTime() < now && budget.status !== "accepted";

  return (
    <PublicBudgetView
      budget={budget}
      acceptance={acceptance}
      dict={dict}
      locale={locale}
      acceptAction={boundAccept}
      isExpired={isExpired}
      showBranding={showBranding}
    />
  );
}
