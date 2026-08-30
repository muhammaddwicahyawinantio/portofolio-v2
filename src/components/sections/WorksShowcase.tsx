import "server-only";
import { prisma } from "@/lib/prisma";
import { isVideoUrl, toStringArray } from "@/lib/media";
import { WorksScrollShowcase, type WorkProject } from "@/components/ui/works-scroll-showcase";

/**
 * 6-8 project pertama saja: kanvas absolute desktop dirender sebagai node
 * DOM + ScrollTrigger tersendiri per project, bukan grid virtual — puluhan
 * node sekaligus di satu pinned canvas akan berat dan tetap tidak akan
 * pernah semuanya kebagian slot komposisi yang wajar.
 */
const MAX_PROJECTS = 8;

export default async function WorksShowcase({ locale }: { locale: string }) {
  const rows = await prisma.project.findMany({
    where: { archived: false },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    take: MAX_PROJECTS,
  });
  if (rows.length === 0) return null;

  const id = locale === "id";
  const projects: WorkProject[] = rows.map((row) => {
    const gallery = toStringArray(row.images).filter((url) => !isVideoUrl(url));
    const image = row.coverImage && !isVideoUrl(row.coverImage) ? row.coverImage : (gallery[0] ?? null);

    return {
      slug: row.slug,
      title: id ? row.title_id : row.title_en,
      description: id ? row.description_id : row.description_en,
      category: row.category,
      year: row.year,
      image,
    };
  });

  return <WorksScrollShowcase projects={projects} />;
}
