import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { alternates } from "@/lib/seo";
import ProjectDetail, { getProject } from "@/components/sections/ProjectDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const row = await getProject(slug);
  if (!row) return {};

  const title = locale === "id" ? row.title_id : row.title_en;
  const description = locale === "id" ? row.description_id : row.description_en;
  const images = row.coverImage ? [{ url: row.coverImage }] : undefined;

  return {
    title,
    description,
    alternates: alternates(locale, `/projects/${slug}`),
    openGraph: { type: "article", title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = use(params);
  setRequestLocale(locale);

  return <ProjectDetail locale={locale} slug={slug} />;
}
