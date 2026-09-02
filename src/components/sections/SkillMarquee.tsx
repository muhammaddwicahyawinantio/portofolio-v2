"use client";

import LogoLoop from "@/components/ui/logo-loop";

export type SkillItem = { id: string; title: string; icon: string | null };

/**
 * Keahlian sebagai kartu ikon besar + label kecil yang berjalan, bukan baris
 * ikon-sejajar-teks. Ikon jadi elemen utama (jauh lebih besar dari labelnya),
 * ditumpuk vertikal di atas nama — kalau `icon` kosong, cuma nama yang tampil,
 * berdiri sendiri di tengah selnya.
 *
 * LogoLoop menerima `node` selain `src`, jadi satu komponen yang sama memenuhi
 * dua permintaan sekaligus: gerak logo-loop, dengan isi berupa tipografi.
 */
export default function SkillMarquee({ skills }: { skills: SkillItem[] }) {
  if (skills.length === 0) return null;

  return (
    <LogoLoop
      ariaLabel="Skills and tools"
      speed={90}
      gap={52}
      logoHeight={96}
      pauseOnHover
      fadeOut
      fadeOutColor="var(--color-card)"
      logos={skills.map((skill) => ({
        title: skill.title,
        node: (
          <span className="flex flex-col items-center gap-3">
            {skill.icon ? (
              // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
              <img src={skill.icon} alt="" className="size-16 object-contain md:size-24" />
            ) : null}
            {/* font-mono, BUKAN font-display: globals.css punya aturan global
                "main .font-display:not(.font-rampart-one):is(...,span) {
                font-size: calc(1em * 1.18)}" yang selalu menang atas kelas
                Tailwind text-* (aturan CSS di luar @layer utilities selalu
                menang atas utility Tailwind di codebase ini) — dan basis 1em
                itu diwarisi dari li LogoLoop yang font-size-nya = logoHeight
                (96px di sini untuk ikon), jadi label sempat kebesaran.

                text-transform inline, BUKAN kelas `uppercase`: globals.css
                JUGA punya ".font-mono.uppercase { font-size: 0.92em }" —
                bundel gaya "label kecil" yang dipakai di seluruh situs (dt,
                eyebrow, dst). Selector-nya mencocokkan token kelas literal,
                jadi begitu span ini punya font-mono DAN uppercase sekaligus,
                aturan itu ikut menimpa text-[10px] dengan 0.92em dari basis
                96px yang sama tadi — kebesaran lagi walau sumbernya beda.
                Menaikkan huruf besar lewat style, bukan kelas `uppercase`,
                membuat selector itu tidak pernah cocok, jadi text-[10px]/
                md:text-[11px] benar-benar yang menentukan ukurannya. */}
            <span
              className="text-ink-soft font-mono text-[10px] tracking-[0.08em] whitespace-nowrap md:text-[11px]"
              style={{ textTransform: "uppercase" }}
            >
              {skill.title}
            </span>
          </span>
        ),
      }))}
    />
  );
}
