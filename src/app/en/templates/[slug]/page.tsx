import type { Metadata } from "next";
import { TemplateDetailPage } from "@/components/pages/template-detail-page";
import { buildAlternates } from "@/lib/seo/alternates";
import { getTemplateBySlug, templates } from "@/lib/templates/data";

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(
  props: PageProps<"/en/templates/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const template = getTemplateBySlug(slug);
  if (!template) return {};
  return {
    title: `${template.title.en} — Free template | Presuly`,
    description: template.intro.en,
    alternates: buildAlternates("en", `/templates/${slug}`),
  };
}

export default async function Page(props: PageProps<"/en/templates/[slug]">) {
  const { slug } = await props.params;
  return <TemplateDetailPage locale="en" slug={slug} />;
}
