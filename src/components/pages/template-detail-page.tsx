import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n/routes";
import { getSession } from "@/lib/auth/session";
import { getTemplateBySlug } from "@/lib/templates/data";
import { formatCurrency } from "@/lib/format";
import { LinkButton } from "@/components/link-button";
import { AttributionCapture } from "@/components/attribution-capture";

/**
 * Detalle de una plantilla pública. Recibe el locale explícito del route
 * segment que la invoca (`/templates/[slug]` = "es",
 * `/en/templates/[slug]` = "en") en vez de leerlo de la cookie
 * `presuly_locale` — ver docs/DECISIONS.md, entrada 2026-09-05.
 */
export async function TemplateDetailPage({ locale, slug }: { locale: Locale; slug: string }) {
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  const dict = dictionaries[locale];
  const session = await getSession();

  const useTemplateHref = session
    ? `/dashboard/new?template=${template.slug}`
    : `/login?next=${encodeURIComponent(`/dashboard/new?template=${template.slug}`)}`;

  const total = template.items
    .filter((i) => !i.optional)
    .reduce((sum, i) => sum + i.price, 0);

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Presuly", item: `${appUrl}${localizedPath(locale, "/")}` },
      {
        "@type": "ListItem",
        position: 2,
        name: dict.common.templates,
        item: `${appUrl}${localizedPath(locale, "/templates")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: template.title[locale],
        item: `${appUrl}${localizedPath(locale, `/templates/${template.slug}`)}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-16 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={null}>
        <AttributionCapture implicitSource="template_gallery" />
      </Suspense>
      <Link
        href={localizedPath(locale, "/templates")}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← {dict.templatesGallery.backToGallery}
      </Link>

      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{template.industryLabel[locale]}</p>
        <h1 className="text-3xl font-semibold text-balance">{template.title[locale]}</h1>
        <p className="text-muted-foreground text-pretty">{template.intro[locale]}</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          {dict.publicView.scopeTitle}
        </h2>
        <p className="whitespace-pre-line text-pretty">{template.scope[locale]}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          {dict.templatesGallery.itemsTitle}
        </h2>
        <div className="space-y-2">
          {template.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between border-b py-2 last:border-b-0">
              <span>
                {item.description[locale]}
                {item.optional && (
                  <span className="text-muted-foreground"> ({dict.common.optional})</span>
                )}
              </span>
              <span className="tabular-nums">
                {formatCurrency(item.price, template.currency, locale)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t pt-3 font-semibold text-lg">
          <span>{dict.publicView.total}</span>
          <span className="tabular-nums">
            {formatCurrency(total, template.currency, locale)}
          </span>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          {dict.templatesGallery.conditionsTitle}
        </h2>
        <p className="whitespace-pre-line text-pretty text-sm text-muted-foreground">
          {template.conditions[locale]}
        </p>
      </section>

      <LinkButton href={useTemplateHref} size="lg" className="w-full">
        {dict.templatesGallery.useTemplate}
      </LinkButton>
    </div>
  );
}
