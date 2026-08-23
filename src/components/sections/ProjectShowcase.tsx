import "server-only";
import { prisma } from "@/lib/prisma";
import { isVideoUrl, toStringArray } from "@/lib/media";
import Reveal from "@/components/animations/Reveal";
import ProjectAccordion, { type ProjectPanel } from "@/components/sections/ProjectAccordion";

export default async function ProjectShowcase({ locale }: { locale: string }) {
  // Featured duluan, sisanya menyusul: akordeon dengan satu panel terlihat
  // rusak, jadi barisnya selalu diisi sampai enam proyek kalau ada.
  const rows = await prisma.project.findMany({
    where: { archived: false },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    take: 6,
  });
  if (rows.length === 0) return null;

  const panels: ProjectPanel[] = rows.map((row) => {
    const gallery = toStringArray(row.images).filter((url) => !isVideoUrl(url));
    const image =
      (row.coverImage && !isVideoUrl(row.coverImage) ? row.coverImage : null) ??
      gallery[0] ??
      "/images/placeholder-1.jpg";

    return {
      slug: row.slug,
      title: locale === "id" ? row.title_id : row.title_en,
      category: row.category,
      image,
    };
  });

  return (
    <Reveal>
      <ProjectAccordion panels={panels} />
    </Reveal>
  );
}
