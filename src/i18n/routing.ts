import { defineRouting } from "next-intl/routing";

// "as-needed": EN tanpa prefix (/about), ID dengan prefix (/id/about).
export const routing = defineRouting({
  locales: ["en", "id"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
