import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { templates } from "@/lib/templates/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Plantillas de presupuestos gratis | Presuly",
  description:
    "Plantillas de presupuesto listas para usar por rubro: diseño web, branding, fotografía, reformas y más.",
  alternates: { canonical: "/templates" },
};

export default async function TemplatesGalleryPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">{dict.templatesGallery.title}</h1>
        <p className="text-muted-foreground">{dict.templatesGallery.subtitle}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((template) => (
          <Link key={template.slug} href={`/templates/${template.slug}`}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader>
                <CardDescription>{template.industryLabel[locale]}</CardDescription>
                <CardTitle>{template.title[locale]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.intro[locale]}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <footer className="text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← {dict.common.appName}
        </Link>
      </footer>
    </div>
  );
}
