import Link from "next/link";
import { dictionaries, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n/routes";
import { templates } from "@/lib/templates/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * Galería pública de plantillas. Recibe el locale explícito del route
 * segment que la invoca (`/templates` = "es", `/en/templates` = "en") en vez
 * de leerlo de la cookie `presuly_locale` — ver docs/DECISIONS.md, entrada
 * 2026-09-05.
 */
export function TemplatesGalleryPage({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">{dict.templatesGallery.title}</h1>
        <p className="text-muted-foreground">{dict.templatesGallery.subtitle}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((template) => (
          <Link key={template.slug} href={localizedPath(locale, `/templates/${template.slug}`)}>
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
        <Link
          href={localizedPath(locale, "/")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {dict.common.appName}
        </Link>
      </footer>
    </div>
  );
}
