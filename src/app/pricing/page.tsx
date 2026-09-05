import type { Metadata } from "next";
import { PricingPage } from "@/components/pages/pricing-page";
import { buildAlternates } from "@/lib/seo/alternates";
import { PLAN_PRICES } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Precios | Presuly",
  description: `Planes y precios de Presuly: gratis para siempre, o Pro por USD ${PLAN_PRICES.pro.monthlyUSD}/mes.`,
  alternates: buildAlternates("es", "/pricing"),
};

export default function Page() {
  return <PricingPage locale="es" />;
}
