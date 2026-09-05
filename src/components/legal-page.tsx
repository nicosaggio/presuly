import Link from "next/link";
import type { LegalContent } from "@/lib/legal/content";

export function LegalPage({
  content,
  backLabel,
  homeHref = "/",
}: {
  content: LegalContent;
  backLabel: string;
  /** Adónde vuelve el link "← {backLabel}". Default "/" para no romper otros usos. */
  homeHref?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 space-y-8">
      <Link href={homeHref} className="text-sm text-muted-foreground hover:text-foreground">
        ← {backLabel}
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{content.title}</h1>
        <p className="text-sm text-muted-foreground">{content.updated}</p>
      </header>

      <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
        {content.disclaimer}
      </p>

      <div className="space-y-6">
        {content.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="font-semibold">{section.heading}</h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
