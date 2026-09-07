import type { Metadata } from "next";
import { TemplatesGalleryPage } from "@/components/pages/templates-gallery-page";
import { buildAlternates } from "@/lib/seo/alternates";

export const metadata: Metadata = {
  title: "Plantillas de presupuestos gratis | Presuly",
  description:
    "Plantillas de presupuesto listas para usar por rubro: diseño web, branding, fotografía, reformas y más.",
  alternates: buildAlternates("es", "/templates"),
};

export default function Page() {
  return <TemplatesGalleryPage locale="es" />;
}
