import { getDictionary, getLocale } from "@/lib/i18n/server";
import { legalContent } from "@/lib/legal/content";
import { LegalPage } from "@/components/legal-page";

export default async function RefundsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return <LegalPage content={legalContent[locale].refunds} backLabel={dict.common.appName} />;
}
