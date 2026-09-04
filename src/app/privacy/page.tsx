import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { legalContent } from "@/lib/legal/content";
import { LegalPage } from "@/components/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: `${legalContent[locale].privacy.title} | Presuly`,
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return <LegalPage content={legalContent[locale].privacy} backLabel={dict.common.appName} />;
}
