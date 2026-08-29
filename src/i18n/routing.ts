import { defineRouting } from "next-intl/routing";

// "as-needed": ID (default) tanpa prefix (/about), EN dengan prefix (/en/about).
export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "as-needed",
  // Tanpa ini next-intl menegosiasikan locale dari cookie + header
  // Accept-Language browser, dan pengunjung ber-browser Inggris akan
  // di-redirect 307 dari "/" ke "/en" di kunjungan pertama. ID harus jadi
  // default untuk SEMUA pengunjung; EN hanya lewat pilihan eksplisit
  // (LocaleSwitch atau URL /en).
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
