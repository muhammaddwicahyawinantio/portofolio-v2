"use client";

import LogoLoop from "@/components/ui/logo-loop";

export type SkillItem = { id: string; title: string; icon: string | null };

/**
 * Keahlian sebagai teks serif besar yang berjalan, bukan deretan ikon berwarna.
 *
 * LogoLoop menerima `node` selain `src`, jadi satu komponen yang sama memenuhi
 * dua permintaan sekaligus: gerak logo-loop, dengan isi berupa tipografi. Ikon
 * dari CMS tetap dipakai kalau ada, tampil kecil dan grayscale di sebelah kiri
 * nama, jadi kolom `icon` tidak percuma tanpa mengubah bagian ini jadi dinding
 * ikon berwarna.
 */
export default function SkillMarquee({ skills }: { skills: SkillItem[] }) {
  if (skills.length === 0) return null;

  return (
    <LogoLoop
      ariaLabel="Skills and tools"
      speed={40}
      gap={52}
      logoHeight={38}
      pauseOnHover
      fadeOut
      fadeOutColor="var(--color-card)"
      logos={skills.map((skill) => ({
        title: skill.title,
        node: (
          <span className="flex items-center gap-4 whitespace-nowrap">
            {skill.icon ? (
              // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
              <img src={skill.icon} alt="" className="size-6 object-contain grayscale" />
            ) : null}
            <span className="font-display text-ink text-2xl font-medium tracking-[-0.01em] md:text-4xl">
              {skill.title}
            </span>
          </span>
        ),
      }))}
    />
  );
}
