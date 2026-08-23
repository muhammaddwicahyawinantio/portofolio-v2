import "server-only";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/animations/Reveal";
import TiltedCard from "@/components/ui/tilted-card";
import MusicPlayer from "@/components/ui/music-player";

/**
 * Dua kolom: musik di kiri, film di kanan.
 *
 * Dikelola dari CMS: Content -> Music dan Content -> Films. Keduanya model yang
 * sudah lama ada di skema (MusicItem, FilmItem) tapi belum pernah dirender di
 * halaman publik mana pun — jadi tidak ada model baru untuk bagian ini.
 */
export default async function MediaShowcase({
  musicTitle,
  filmTitle,
}: {
  musicTitle: string;
  filmTitle: string;
}) {
  const [music, films] = await Promise.all([
    prisma.musicItem.findMany({ orderBy: { order: "asc" } }),
    prisma.filmItem.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (music.length === 0 && films.length === 0) return null;

  return (
    <div className="grid gap-14 md:grid-cols-2 md:gap-12">
      <div>
        <h2 className="font-display border-line mb-6 border-b pb-3 text-lg font-medium tracking-[-0.01em]">
          {musicTitle}
        </h2>
        {/* Reveal targets="li" sama seperti kolom film: kartunya masuk
            bergantian, bukan seluruh grid sekaligus. */}
        <Reveal targets="li">
          <MusicPlayer
            tracks={music.map((row) => ({
              id: row.id,
              title: row.title,
              cover: row.cover,
              audioUrl: row.audioUrl,
            }))}
          />
        </Reveal>
      </div>

      <div>
        <h2 className="font-display border-line mb-6 border-b pb-3 text-lg font-medium tracking-[-0.01em]">
          {filmTitle}
        </h2>
        <Reveal targets="li">
          <ul className="grid grid-cols-3 gap-4">
            {films.map((film) => (
              <li key={film.id}>
                {/* Tautan luar, jadi <a> biasa: videoUrl menunjuk ke Vimeo/YouTube,
                    bukan rute internal yang butuh awalan locale. */}
                <a
                  href={film.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                  aria-label={film.title}
                >
                  <TiltedCard rotateAmplitude={12} scaleOnHover={1.08}>
                    <div className="border-line rounded-card aspect-[4/3] w-full overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
                      <img src={film.thumbnail} alt="" className="h-full w-full object-cover" />
                    </div>
                  </TiltedCard>
                  <p className="group-hover:text-ink-soft mt-3 text-sm font-semibold transition-colors">
                    {film.title}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
