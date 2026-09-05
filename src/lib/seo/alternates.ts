import type { Metadata } from "next";

/**
 * `alternates` (canonical + hreflang) para una página pública migrada a URLs
 * por idioma. `esPath` es la ruta SIN prefijo (la versión en español, que es
 * el default y también el canonical/x-default). La versión en inglés vive en
 * "/en" + esPath (o "/en" solo, para la home).
 *
 * Se usa el mismo resultado desde el page.tsx de ambas variantes (es/en):
 * el canonical y el hreflang de una página describen el cluster de URLs
 * equivalentes, no "la URL actual", así que no cambian según qué variante
 * los está declarando.
 */
export function buildAlternates(esPath: string): NonNullable<Metadata["alternates"]> {
  const enPath = esPath === "/" ? "/en" : `/en${esPath}`;
  return {
    canonical: esPath,
    languages: {
      es: esPath,
      en: enPath,
      "x-default": esPath,
    },
  };
}
