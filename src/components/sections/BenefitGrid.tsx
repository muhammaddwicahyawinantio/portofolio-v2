import "server-only";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/animations/Reveal";
import { iconFor } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Ikon garis dari peta emoji CMS. Emoji mentah dirender font sistem dengan
 * paletnya SENDIRI (👤 biru, 🔑 kuning), jadi empat kartu di sini menyuntikkan
 * empat warna asing ke palet yang seluruh aturannya soal menahan diri. Ikon
 * Lucide mewarisi `currentColor`, jadi ia ikut token seperti elemen lain.
 *
 * Warnanya ink-soft, bukan sand: ia berulang empat kali dalam satu layar, dan
 * aturan 2 melarang aksen dipakai berulang di banyak tempat sekaligus. Identitas
 * section ini datang dari pergantian bidang ke cream-1, bukan dari aksen.
 *
 * Emoji yang belum dipetakan tetap dirender apa adanya — lebih baik satu ikon
 * meleset daripada kartunya kehilangan penanda sama sekali.
 */
function BenefitIcon({ emoji, className }: { emoji: string; className?: string }) {
  const Icon = iconFor(emoji);
  if (!Icon) {
    return (
      <span aria-hidden className={cn("text-ink-soft shrink-0 text-lg leading-none", className)}>
        {emoji}
      </span>
    );
  }
  return (
    <Icon
      aria-hidden
      className={cn("text-ink-soft size-5 shrink-0", className)}
      strokeWidth={1.5}
    />
  );
}

/**
 * Kenapa klien untung kerja sama — bukan tahapan proyek. Tahapannya sudah
 * dipegang FeatureShowcase ("How the work runs"), jadi section ini sengaja
 * berbicara soal keuntungan, bukan urutan kerja.
 *
 * Dikelola dari CMS: Content → Benefits.
 *
 * Tanpa pustaka animasi baru: Reveal (stagger 0.08s per kartu, GSAP yang sudah
 * terpasang) dan .card-glow (angkat-bayangan saat hover, sudah di globals.css)
 * sudah memberi gerak yang sama dengan kartu-kartu referensi 21st.dev, dan
 * keduanya sudah dipakai ServiceGrid serta ProductList.
 */
export default async function BenefitGrid({ locale }: { locale: string }) {
  const rows = await prisma.benefit.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) return null;

  const id = locale === "id";

  return (
    // targets="li": tiap kartu masuk bergantian, pola yang sama dengan
    // ServiceGrid dan ProductList.
    <Reveal targets="li">
      <ul className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {rows.map((row, index) => (
          <li key={row.id} className="h-full">
            {/* DUA tata letak, SATU markup — tidak ada teks yang dirender dua
                kali lalu disembunyikan sebelah.

                Di ponsel kartunya adalah BARIS: ikon, judul, dan nomor berbagi
                satu baris, keterangannya di bawahnya. Bentuk ini bukan selera —
                ia syarat. Section ini duduk di dalam ScrollExpand, yang
                panggungnya setinggi satu layar dan memotong apa pun yang lewat;
                versi kartu bertumpuk setinggi ~1040px di layar 740px, jadi
                efeknya selalu mundur ke mode statis dan ponsel tidak pernah
                kebagian animasinya. Baris memangkasnya ke ~600px.

                Dari sm ke atas `sm:contents` melarutkan pembungkus barisnya,
                anak-anaknya naik jadi sel langsung di grid kartu, dan susunan
                lamanya kembali utuh: ikon kiri-atas, nomor kanan-atas, judul
                lalu keterangan di bawahnya. */}
            <article className="card-glow border-line bg-card rounded-card flex h-full flex-col gap-2 border p-4 sm:grid sm:grid-cols-[1fr_auto] sm:content-start sm:items-baseline sm:gap-3 sm:p-6">
              <div className="flex items-center gap-3 sm:contents">
                <BenefitIcon emoji={row.icon} className="sm:col-start-1 sm:row-start-1" />

                <h3 className="font-display flex-1 text-sm leading-tight font-medium tracking-[-0.01em] text-balance sm:col-span-2 sm:row-start-2 sm:text-base md:text-lg">
                  {id ? row.title_id : row.title_en}
                </h3>

                {/* Nomor urut sebagai elemen visual, bukan informasi: ia sudah
                    terbaca dari urutan kartunya sendiri, jadi disembunyikan
                    dari pembaca layar alih-alih dibacakan dua kali. */}
                <span
                  aria-hidden
                  className="font-display text-ink/10 text-2xl leading-none font-medium sm:col-start-2 sm:row-start-1 sm:text-4xl"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <p className="text-ink-soft text-[0.6875rem] leading-[1.6] text-pretty sm:col-span-2 sm:row-start-3 sm:text-xs sm:leading-[1.7] md:text-sm">
                {id ? row.description_id : row.description_en}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
