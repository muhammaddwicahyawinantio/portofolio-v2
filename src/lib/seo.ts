import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Path publik untuk satu locale. EN tanpa prefix, ID dengan prefix. */
export function localePath(locale: string, path = "") {
  return locale === routing.defaultLocale ? path || "/" : `/${locale}${path}`;
}

/**
 * Canonical + hreflang untuk satu halaman. Tanpa ini Google melihat /about dan
 * /id/about sebagai dua halaman terpisah yang saling bersaing, bukan sebagai
 * dua bahasa dari halaman yang sama.
 */
export function alternates(locale: string, path = "") {
  return {
    canonical: localePath(locale, path),
    languages: Object.fromEntries(routing.locales.map((l) => [l, localePath(l, path)])),
  };
}
