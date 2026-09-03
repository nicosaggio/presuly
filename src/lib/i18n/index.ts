import { es, type Dictionary } from "./es";
import { en } from "./en";

export const LOCALE_COOKIE = "presuly_locale";

export const dictionaries = { es, en } as const;
export type Locale = keyof typeof dictionaries;
export type { Dictionary };

export function isLocale(value: string | undefined): value is Locale {
  return value === "es" || value === "en";
}

/** Interpola {placeholders} en un string del diccionario. */
export function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}
