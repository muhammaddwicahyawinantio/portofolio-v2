import "server-only";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { isVideoUrl } from "@/lib/media";
import Reveal from "@/components/animations/Reveal";

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export default async function ProjectList({ locale }: { locale: string }) {
  const rows = await prisma.project.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  });
  if (rows.length === 0) return null;

  return (
    <Reveal targets="li">
      <ul className="border-graphite/50 border-t">
        {rows.map((row) => {
          const gallery = toStringArray(row.images).filter((url) => !isVideoUrl(url));
          const cover =
            (row.coverImage && !isVideoUrl(row.coverImage) ? row.coverImage : null) ??
            gallery[0] ??
            "/images/placeholder-1.jpg";
          const title = locale === "id" ? row.title_id : row.title_en;
          const description = locale === "id" ? row.description_id : row.description_en;

          return (
            <li key={row.id} className="border-graphite/50 border-b">
              <Link
                href={`/projects/${row.slug}`}
                className="group flex flex-col gap-6 py-8 md:flex-row md:items-center md:gap-12 md:py-10"
              >
                <div className="border-graphite/60 relative aspect-[4/3] w-full shrink-0 overflow-hidden border md:w-64">
                  {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
                  <img
                    src={cover}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <p className="text-ash text-[11px] font-semibold tracking-[0.3em] uppercase">
                    {row.category}
                  </p>
                  <h2 className="font-display text-2xl leading-tight font-extrabold tracking-[-0.02em] md:text-3xl">
                    {title}
                  </h2>
                  <p className="text-silver line-clamp-2 max-w-xl text-sm leading-[1.6]">
                    {description}
                  </p>
                  <p className="text-graphite text-xs tracking-[0.15em] uppercase">
                    {row.year} · {row.role}
                    {row.client ? ` · ${row.client}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}
