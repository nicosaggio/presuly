import type { Metadata } from "next";
import { PricingPage } from "@/components/pages/pricing-page";
import { buildAlternates } from "@/lib/seo/alternates";
import { PLAN_PRICES } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing | Presuly",
  description: `Presuly plans and pricing: free forever, or Pro for USD ${PLAN_PRICES.pro.monthlyUSD}/mo.`,
  alternates: buildAlternates("/pricing"),
};

export default function Page() {
  return <PricingPage locale="en" />;
}
