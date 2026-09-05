import type { Metadata } from "next";
import { LegalRoutePage } from "@/components/pages/legal-route-page";
import { buildAlternates } from "@/lib/seo/alternates";
import { legalContent } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: `${legalContent.es.privacy.title} | Presuly`,
  alternates: buildAlternates("/privacy"),
};

export default function Page() {
  return <LegalRoutePage locale="es" section="privacy" />;
}
