import "server-only";
import { prisma } from "@/lib/prisma";
import { isVideoUrl, toStringArray } from "@/lib/media";
import ColorChangeCards, { type ShowcaseCard } from "@/components/ui/color-change-card";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export default async function ProjectShowcase({ locale }: { locale: string }) {
  // 2x2 grid → empat kartu, featured duluan.
  const rows = await prisma.project.findMany({
    where: { archived: false },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    take: 4,
  });
  if (rows.length === 0) return null;

  const cards: ShowcaseCard[] = rows.map((row) => {
    const gallery = toStringArray(row.images).filter((url) => !isVideoUrl(url));
    const image =
      (row.coverImage && !isVideoUrl(row.coverImage) ? row.coverImage : null) ??
      gallery[0] ??
      FALLBACK_IMAGE;

    return {
      slug: row.slug,
      heading: locale === "id" ? row.title_id : row.title_en,
      description: locale === "id" ? row.description_id : row.description_en,
      image,
    };
  });

  return <ColorChangeCards cards={cards} />;
}
