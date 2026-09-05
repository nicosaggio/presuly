import type { Metadata } from "next";
import { TemplateDetailPage } from "@/components/pages/template-detail-page";
import { buildAlternates } from "@/lib/seo/alternates";
import { getTemplateBySlug, templates } from "@/lib/templates/data";

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(
  props: PageProps<"/templates/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const template = getTemplateBySlug(slug);
  if (!template) return {};
  return {
    title: `${template.title.es} — Plantilla gratis | Presuly`,
    description: template.intro.es,
    alternates: buildAlternates("es", `/templates/${slug}`),
  };
}

export default async function Page(props: PageProps<"/templates/[slug]">) {
  const { slug } = await props.params;
  return <TemplateDetailPage locale="es" slug={slug} />;
}
