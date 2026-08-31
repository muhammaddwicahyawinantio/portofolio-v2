import "server-only";

import { prisma } from "@/lib/prisma";
import { isVideoUrl, toStringArray } from "@/lib/media";
import {
  WorksScrollShowcase,
  type WorkProject,
} from "@/components/ui/works-scroll-showcase";

/**
 * Maksimal 8 project untuk kanvas editorial desktop.
 *
 * Alasannya:
 * - setiap project menjadi absolute DOM node tersendiri
 * - masing-masing punya timing + GSAP transform sendiri
 * - layout presentation saat ini memang menyediakan 8 slot
 *
 * Jika project CMS lebih dari 8, section ini hanya mengambil 8 project
 * prioritas teratas berdasarkan featured lalu order.
 */
const MAX_PROJECTS = 8;

export default async function WorksShowcase({
  locale,
}: {
  locale: string;
}) {
  const rows = await prisma.project.findMany({
    where: {
      archived: false,
    },
    orderBy: [
      {
        featured: "desc",
      },
      {
        order: "asc",
      },
    ],
    take: MAX_PROJECTS,
  });

  if (rows.length === 0) {
    return null;
  }

  const isIndonesian = locale === "id";

  const projects: WorkProject[] = rows.map((row) => {
    const galleryImages = toStringArray(row.images).filter(
      (url) => !isVideoUrl(url),
    );

    const coverImage =
      row.coverImage && !isVideoUrl(row.coverImage)
        ? row.coverImage
        : null;

    const image = coverImage ?? galleryImages[0] ?? null;

    return {
      slug: row.slug,
      title: isIndonesian
        ? row.title_id
        : row.title_en,
      description: isIndonesian
        ? row.description_id
        : row.description_en,
      category: row.category ?? "",
      year: row.year ?? "",
      image,
    };
  });

  return <WorksScrollShowcase projects={projects} />;
}