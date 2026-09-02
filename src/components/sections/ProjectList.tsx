import "server-only";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { isVideoUrl, toStringArray } from "@/lib/media";
import Reveal from "@/components/animations/Reveal";

/**
 * Grid kartu tiga kolom: gambar 16:9, label kategori, judul, ringkasan, lalu
 * baris "Read more" yang sejajar di semua kartu.
 *
 * Susunannya mengikuti referensi Blog7 dari shadcnblocks, tapi TANPA memasang
 * shadcn Card/Badge/Button: ketiganya cuma div ber-border, pill, dan tautan,
 * dan repo ini sudah punya semuanya — .card-glow, .eyebrow, dan token
 * border-line/bg-card/rounded-card di globals.css. Memasangnya berarti
 * menambah class-variance-authority + @radix-ui/react-slot dan palet
 * primary/secondary kedua yang tidak dipakai komponen lain mana pun di sini.
 *
 * grid-rows-[auto_auto_1fr_auto]: baris ringkasan yang memuai, jadi "Read more"
 * berhenti di garis yang sama walau panjang deskripsinya beda-beda.
 *
 * SATU tautan per kartu, bukan tiga seperti referensi (gambar, judul, dan
 * "Read more" masing-masing <a> ke URL yang sama) — pembaca layar akan
 * membacakan tujuan yang sama tiga kali per kartu.
 */
export default async function ProjectList({
  locale,
  readMoreLabel,
}: {
  locale: string;
  readMoreLabel: string;
}) {
  const rows = await prisma.project.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  });
  if (rows.length === 0) return null;

  const id = locale === "id";

  return (
    // targets="li": tiap kartu masuk bergantian, bukan seluruh grid sekaligus.
    <Reveal targets="li">
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {rows.map((row) => {
          const gallery = toStringArray(row.images).filter((url) => !isVideoUrl(url));
          const cover =
            (row.coverImage && !isVideoUrl(row.coverImage) ? row.coverImage : null) ??
            gallery[0] ??
            "/images/placeholder.svg";
          const title = id ? row.title_id : row.title_en;
          const description = id ? row.description_id : row.description_en;

          return (
            <li key={row.id} className="h-full">
              <Link
                href={`/projects/${row.slug}`}
                className="card-glow border-line bg-card rounded-card group grid h-full grid-rows-[auto_auto_1fr_auto] overflow-hidden border"
              >
                <div className="border-line aspect-[16/9] w-full overflow-hidden border-b">
                  {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
                  <img
                    src={cover}
                    alt={title}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col gap-3 p-5 pb-0">
                  <span className="bg-cream-deep text-gold-ink self-start rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] uppercase">
                    {row.category}
                  </span>
                  <h2 className="project-card-title font-display text-lg leading-tight font-medium tracking-[-0.01em] text-balance group-hover:underline md:text-xl">
                    {title}
                  </h2>
                </div>

                <div className="flex flex-col gap-3 p-5 pt-3">
                  <p className="project-card-copy text-ink-soft line-clamp-3 text-sm leading-[1.6] text-pretty">
                    {description}
                  </p>
                  <p className="project-card-meta text-ink-soft font-mono text-[11px] tracking-[0.1em] uppercase">
                    {row.year} · {row.role}
                    {row.client ? ` · ${row.client}` : ""}
                  </p>
                </div>

                {/* <span>, bukan <a> kedua: seluruh kartunya sudah satu tautan. */}
                <span className="project-card-action border-line text-ink flex items-center gap-2 border-t p-5 text-[11px] font-semibold tracking-[0.2em] uppercase">
                  {readMoreLabel}
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}
