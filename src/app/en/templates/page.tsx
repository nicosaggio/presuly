import type { Metadata } from "next";
import { TemplatesGalleryPage } from "@/components/pages/templates-gallery-page";
import { buildAlternates } from "@/lib/seo/alternates";

export const metadata: Metadata = {
  title: "Free budget templates | Presuly",
  description:
    "Ready-to-use budget templates by industry: web design, branding, photography, renovations and more.",
  alternates: buildAlternates("en", "/templates"),
};

export default function Page() {
  return <TemplatesGalleryPage locale="en" />;
}
