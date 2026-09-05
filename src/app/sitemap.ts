import type { MetadataRoute } from "next";
import { templates } from "@/lib/templates/data";
import { localizedPath } from "@/lib/i18n/routes";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

type PageOpts = {
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

/**
 * Una página pública migrada a URLs por idioma (ver docs/DECISIONS.md,
 * entrada 2026-09-05) entra al sitemap dos veces —la variante /es (sin
 * prefijo, default) y la /en— y cada entrada declara `alternates.languages`
 * apuntando a la otra, tal como pide el hreflang real que motivó la
 * migración.
 */
function localizedPages(esPath: string, opts: PageOpts, now: Date): MetadataRoute.Sitemap {
  const enPath = localizedPath("en", esPath);
  const languages = {
    es: `${APP_URL}${esPath}`,
    en: `${APP_URL}${enPath}`,
    "x-default": `${APP_URL}${esPath}`,
  };

  return [
    { url: `${APP_URL}${esPath}`, lastModified: now, alternates: { languages }, ...opts },
    { url: `${APP_URL}${enPath}`, lastModified: now, alternates: { languages }, ...opts },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    ...localizedPages("/", { changeFrequency: "weekly", priority: 1 }, now),
    ...localizedPages("/pricing", { changeFrequency: "monthly", priority: 0.8 }, now),
    ...localizedPages("/templates", { changeFrequency: "weekly", priority: 0.8 }, now),
    ...localizedPages("/terms", { changeFrequency: "yearly", priority: 0.3 }, now),
    ...localizedPages("/privacy", { changeFrequency: "yearly", priority: 0.3 }, now),
    ...localizedPages("/refunds", { changeFrequency: "yearly", priority: 0.3 }, now),
  ];

  const templatePages: MetadataRoute.Sitemap = templates.flatMap((t) =>
    localizedPages(`/templates/${t.slug}`, { changeFrequency: "monthly", priority: 0.6 }, now)
  );

  return [...staticPages, ...templatePages];
}
