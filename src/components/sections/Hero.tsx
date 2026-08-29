import "server-only";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { toStringArray } from "@/lib/media";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import RiveAnimation from "@/components/ui/RiveAnimation";
import HeroParallax from "@/components/animations/HeroParallax";

/**
 * Bidang pembuka satu layar penuh. Sticky supaya section berikutnya menutupinya
 * saat digulir. Visual hero dibangun dari bentuk-bentuk CSS sehingga tetap tajam,
 * cepat, dan selalu memakai sistem warna Dwi Studio.
 *
 * data-hero-bg dibaca Intro: ia menahan visual di scale(1.18) lalu menariknya
 * kembali ke 1 saat tirai membuka. data-headline dipakai untuk slide-up-nya.
 * Keduanya dicari lewat document.querySelector, jadi atributnya WAJIB tetap
 * ada di elemen yang sama walau isi hero datang dari CMS.
 *
 * Dikelola dari CMS: Content → Hero Section (baris tunggal).
 */
export default async function Hero({ locale }: { locale: string }) {
  const id = locale === "id";
  const [row, t] = await Promise.all([prisma.heroSection.findFirst(), getTranslations("hero")]);

  // Fallback ke i18n, bukan ke string kosong: sebelum seed dijalankan tabelnya
  // masih kosong, dan hero adalah hal pertama yang dilihat pengunjung.
  const headline =
    (id ? row?.headline_id : row?.headline_en) ?? `${t("line1")}\n${t("line2")} ${t("line3")}`;
  const subheadline =
    (id ? row?.subheadline_id : row?.subheadline_en) ?? `${t("scroll")} · ${t("scrollHint")}`;
  const paragraph = id ? row?.paragraph_id : row?.paragraph_en;
  const metrics = toStringArray(id ? row?.metrics_id : row?.metrics_en);
  const ctaText = id ? row?.ctaText_id : row?.ctaText_en;

  // Satu baris teks = satu baris judul. Baris pertama tegak, sisanya italic —
  // bentuk yang sama dengan "One studio." / "Five mediums." sebelumnya, tapi
  // jumlah barisnya kini bebas diatur dari CMS.
  const lines = headline.split("\n").filter((line) => line.trim() !== "");

  return (
    <section className="sticky top-0 flex h-svh flex-col justify-start overflow-hidden md:justify-end">
      {/* Visual dibungkus sendiri karena Intro dan HeroParallax menulis transform
          pada dua lapisan berbeda. Isinya sengaja hanya gradasi CSS, bukan video. */}
      <div data-hero-bg className="hero-canvas absolute inset-0 will-change-transform">
        <div data-hero-photo className="hero-visual absolute inset-0 will-change-transform" aria-hidden="true" />
      </div>

      {/* Bidang bawah sedikit lebih pekat agar judul tetap terbaca di semua ukuran. */}
      <div
        aria-hidden
        className="hero-bottom-scrim absolute inset-0"
      />

      {/* Pita atas menjaga navigasi terbaca di atas bidang gelap, termasuk saat
          pengguna meminta gerak dikurangi. */}
      <div
        aria-hidden
        className="hero-top-scrim absolute inset-x-0 top-0 h-56 md:h-48"
      />

      <RiveAnimation
        src="/rive/angrycat.riv"
        className="!absolute bottom-0 left-1/2 z-[1] h-[clamp(15rem,62vw,23rem)] w-[clamp(15rem,62vw,23rem)] -translate-x-1/2 opacity-95 sm:top-auto sm:right-[3rem] sm:bottom-0 sm:left-auto sm:translate-x-0 sm:h-[clamp(16rem,34vw,26rem)] sm:w-[clamp(16rem,34vw,26rem)]"
        ariaLabel="Angry cat animation"
        clickSoundSrc="/soundeffect/blackcat-sound.mp3"
      />

      {/* pointer-events-none: Container ini `w-full`, jadi kotaknya terbentang
          sampai tepi kanan layar walau teksnya rata kiri. Di desktop
          (`md:justify-end`) blok ini duduk di pita bawah yang sama dengan
          RiveAnimation kucing di kanan — tanpa ini, kotak kosong Container
          (dan anak-anaknya) menelan hover/klik sebelum sampai ke canvas Rive
          di bawahnya. Tombol CTA menyalakan lagi pointer-events-nya sendiri. */}
      <Container className="pointer-events-none relative z-10 pt-24 pb-8 md:pt-0 md:pb-10">
        {/* Lapisan foreground: seluruh blok teks keluar lebih cepat + memudar
            saat hero tertutup (HeroParallax). Bungkus sendiri supaya laju scroll
            menulis transform di sini, bukan di [data-headline] yang dikelola
            Intro. */}
        <div data-hero-text className="will-change-transform">
          <h1
            data-headline
            className="hero-heading font-display text-ink max-w-6xl font-semibold tracking-normal [overflow-wrap:anywhere] will-change-transform"
          >
            {lines.map((line, index) => (
              <span key={index} className={index === 0 ? "block" : "text-ink/65 block"}>
                {line}
              </span>
            ))}
          </h1>

          <div className="text-ink/75 mt-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase md:mt-8">
            <span aria-hidden className="bg-ink/40 h-px w-10" />
            <p>{subheadline}</p>
          </div>

          {paragraph ? (
            <p className="text-ink/80 mt-5 max-w-xl text-sm leading-relaxed md:mt-6 md:text-base">
              {paragraph}
            </p>
          ) : null}

          {/* Keduanya harus terisi: tombol tanpa tujuan, atau tujuan tanpa label,
              sama-sama tidak ada gunanya di layar. */}
          {ctaText && row?.ctaUrl ? (
            <Button href={row.ctaUrl} variant="cream" className="pointer-events-auto mt-8">
              {ctaText}
            </Button>
          ) : null}

          {/* Social proof: baris kecil di dasar blok teks, bukan badge besar —
              hero ini sudah punya headline raksasa, metrik cukup jadi catatan
              kaki yang meyakinkan, bukan elemen kedua yang bersaing perhatian. */}
          {metrics.length > 0 ? (
            <ul className="text-ink/70 mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.14em] uppercase md:mt-10 md:text-[11px]">
              {metrics.map((metric, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span aria-hidden className="bg-gold-ink h-1 w-1 shrink-0 rounded-full" />
                  {metric}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>

      <HeroParallax />
    </section>
  );
}
