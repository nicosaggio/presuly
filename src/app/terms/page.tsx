import { getDictionary, getLocale } from "@/lib/i18n/server";
import { legalContent } from "@/lib/legal/content";
import { LegalPage } from "@/components/legal-page";

export default async function TermsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return <LegalPage content={legalContent[locale].terms} backLabel={dict.common.appName} />;
}
