import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, localePath } from "@/lib/seo";

const PATHS = ["", "/about", "/projects", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    PATHS.map((path) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      // Tiap entri menyebut versi bahasa lainnya, jadi crawler tahu keduanya
      // pasangan, bukan duplikat.
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}${localePath(l, path)}`]),
        ),
      },
    })),
  );
}
