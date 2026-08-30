import "server-only";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { isVideoUrl, toStringArray } from "@/lib/media";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { ArgentLoopInfiniteSlider, type GalleryProject } from "@/components/ui/argent-loop-infinite-slider";

/**
 * Sama seperti ProjectShowcase: featured && !archived, order asc. Sengaja
 * TIDAK mengubah data atau menambah baris — kalau tabelnya kosong, section
 * ini tidak pernah dirender (lihat guard di bawah).
 */
export default async function ProjectsGallery({ locale }: { locale: string }) {
  const [rows, t] = await Promise.all([
    prisma.project.findMany({
      where: { featured: true, archived: false },
      orderBy: { order: "asc" },
    }),
    getTranslations({ locale, namespace: "projects" }),
  ]);
  if (rows.length === 0) return null;

  const id = locale === "id";
  const projects: GalleryProject[] = rows.map((row) => {
    const gallery = toStringArray(row.images).filter((url) => !isVideoUrl(url));
    const image =
      (row.coverImage && !isVideoUrl(row.coverImage) ? row.coverImage : null) ??
      gallery[0] ??
      "/images/placeholder-1.jpg";

    return {
      slug: row.slug,
      title: id ? row.title_id : row.title_en,
      category: row.category,
      year: row.year,
      description: id ? row.description_id : row.description_en,
      image,
    };
  });

  return (
    <Section className="border-line border-t">
      <Container>
        <p className="eyebrow mb-4">{t("eyebrow")}</p>
        <h2 className="font-rampart-one font-display mb-10 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] font-medium tracking-[-0.01em] text-balance">
          {t("title")}
        </h2>
        <ArgentLoopInfiniteSlider
          projects={projects}
          exploreLabel={t("exploreProject")}
          openHintLabel={t("openHint")}
        />
      </Container>
    </Section>
  );
}
