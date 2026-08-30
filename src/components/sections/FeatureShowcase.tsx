import "server-only";
import { prisma } from "@/lib/prisma";
import { AccordionFeatureSection, type AccordionFeatureItem } from "@/components/ui/accordion-feature-section";

/** Dikelola dari CMS: Content → Features. Urutannya ikut kolom `order`. */
export default async function FeatureShowcase({ locale }: { locale: string }) {
  const rows = await prisma.feature.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) return null;

  const features: AccordionFeatureItem[] = rows.map((row) => ({
    id: row.id,
    title: locale === "id" ? row.title_id : row.title_en,
    description: locale === "id" ? row.description_id : row.description_en,
    image: row.image,
  }));

  return <AccordionFeatureSection features={features} />;
}
