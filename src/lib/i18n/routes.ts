import type { Locale } from "@/lib/i18n";

/**
 * Antepone el prefijo de idioma a una ruta pública migrada a URLs por idioma
 * (ver docs/DECISIONS.md, entrada 2026-09-05). Español es el default sin
 * prefijo; inglés vive bajo "/en".
 *
 * No usar para rutas fuera del alcance de esa migración (/login, /dashboard,
 * /p/[token]) — esas siguen resolviendo el idioma por cookie, sin prefijo.
 */
export function localizedPath(locale: Locale, path: string): string {
  if (locale === "es") return path;
  return path === "/" ? "/en" : `/en${path}`;
}
