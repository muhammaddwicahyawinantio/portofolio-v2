import "server-only";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/animations/Reveal";
import { ExpandingCards, type CardItem } from "@/components/ui/expanding-cards";

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)$/i.test(url);
}

export default async function ProjectShowcase({ locale }: { locale: string }) {
  const rows = await prisma.project.findMany({
    where: { featured: true, archived: false },
    orderBy: { order: "asc" },
  });
  if (rows.length === 0) return null;

  const items: CardItem[] = rows.map((row) => {
    const gallery = toStringArray(row.images).filter((url) => !isVideoUrl(url));
    const imgSrc =
      (row.coverImage && !isVideoUrl(row.coverImage) ? row.coverImage : null) ??
      gallery[0] ??
      "/images/placeholder-1.jpg";

    return {
      id: row.id,
      title: locale === "id" ? row.title_id : row.title_en,
      description: locale === "id" ? row.description_id : row.description_en,
      imgSrc,
      icon: <ArrowUpRight size={24} />,
      linkHref: `/projects/${row.slug}`,
    };
  });

  return (
    <Reveal>
      <ExpandingCards items={items} />
    </Reveal>
  );
}
