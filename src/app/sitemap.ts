import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, localePath } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

const PATHS = [
  "",
  "/about",
  "/projects",
  "/services",
  "/products",
  "/contact",
  "/terms",
  "/privacy",
];

function entry(path: string, lastModified?: Date) {
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}${localePath(locale, path)}`,
    ...(lastModified ? { lastModified } : {}),
    // Tiap entri menyebut versi bahasa lainnya, jadi crawler tahu keduanya
    // pasangan, bukan duplikat.
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}${localePath(l, path)}`]),
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await prisma.project.findMany({
    where: { archived: false },
    select: { slug: true, updatedAt: true },
  });

  return [
    ...PATHS.flatMap((path) => entry(path)),
    ...projects.flatMap((p) => entry(`/projects/${p.slug}`, p.updatedAt)),
  ];
}
