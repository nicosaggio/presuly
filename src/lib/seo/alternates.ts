import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";

/**
 * `alternates` (canonical + hreflang) para una página pública migrada a URLs
 * por idioma. `esPath` es la ruta SIN prefijo (la versión en español, que es
 * el default). La versión en inglés vive en "/en" + esPath (o "/en" solo,
 * para la home).
 *
 * `canonical` es self-referencial: cada variante (es/en) apunta a su propia
 * URL, no a la del otro idioma. Un canonical cruzado (ej. /en/pricing
 * apuntando a /pricing) le diría a Google que /en/pricing es un duplicado a
 * consolidar en la versión en español — exactamente lo que esta migración
 * busca evitar. `languages` (el bloque hreflang) sí es el mismo en ambas
 * variantes: describe el cluster completo de URLs equivalentes. `x-default`
 * apunta al español por ser el default sin prefijo.
 */
export function buildAlternates(locale: Locale, esPath: string): NonNullable<Metadata["alternates"]> {
  const enPath = esPath === "/" ? "/en" : `/en${esPath}`;
  return {
    canonical: locale === "es" ? esPath : enPath,
    languages: {
      es: esPath,
      en: enPath,
      "x-default": esPath,
    },
  };
}
