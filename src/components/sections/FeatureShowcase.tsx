import "server-only";
import { prisma } from "@/lib/prisma";
import { FeatureSteps, type FeatureStep } from "@/components/ui/feature-section";

/** Dikelola dari CMS: Content → Features. Urutannya ikut kolom `order`. */
export default async function FeatureShowcase({
  locale,
  title,
  exploreLabel,
}: {
  locale: string;
  title: string;
  exploreLabel: string;
}) {
  const rows = await prisma.feature.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) return null;

  const steps: FeatureStep[] = rows.map((row) => ({
    slug: row.slug,
    title: locale === "id" ? row.title_id : row.title_en,
    content: locale === "id" ? row.description_id : row.description_en,
    image: row.image,
    link: row.link,
  }));

  return <FeatureSteps features={steps} title={title} exploreLabel={exploreLabel} />;
}
