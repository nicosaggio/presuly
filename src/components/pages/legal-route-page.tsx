import { dictionaries, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n/routes";
import { legalContent, type LegalContent } from "@/lib/legal/content";
import { LegalPage } from "@/components/legal-page";

export type LegalSectionKey = keyof (typeof legalContent)["es"];

/**
 * Página legal pública (términos, privacidad, reembolsos). Recibe el locale
 * explícito del route segment que la invoca (p. ej. `/terms` = "es",
 * `/en/terms` = "en") en vez de leerlo de la cookie `presuly_locale` — ver
 * docs/DECISIONS.md, entrada 2026-09-05.
 */
export function LegalRoutePage({ locale, section }: { locale: Locale; section: LegalSectionKey }) {
  const dict = dictionaries[locale];
  const content: LegalContent = legalContent[locale][section];
  return (
    <LegalPage
      content={content}
      backLabel={dict.common.appName}
      homeHref={localizedPath(locale, "/")}
    />
  );
}
