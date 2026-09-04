import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { legalContent } from "@/lib/legal/content";
import { LegalPage } from "@/components/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: `${legalContent[locale].refunds.title} | Presuly`,
    alternates: { canonical: "/refunds" },
  };
}

export default async function RefundsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return <LegalPage content={legalContent[locale].refunds} backLabel={dict.common.appName} />;
}
