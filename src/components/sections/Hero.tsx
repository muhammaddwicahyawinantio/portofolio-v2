import "server-only";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HeroParallax from "@/components/animations/HeroParallax";

/**
 * Foto full-bleed satu layar penuh. Sticky supaya section berikutnya menutupinya
 * saat digulir, seperti hero sebelumnya.
 *
 * Teksnya cream, bukan ink: ini satu-satunya blok yang duduk di atas foto
 * ber-scrim gelap. Navbar tetap ink -- bagian ATAS foto ini terang, dan di
 * sana tintalah yang justru terbaca.
 *
 * data-hero-bg dibaca Intro: ia menahan foto di scale(1.18) lalu menariknya
 * kembali ke 1 saat tirai membuka. data-headline dipakai untuk slide-up-nya.
 * Keduanya dicari lewat document.querySelector, jadi atributnya WAJIB tetap
 * ada di elemen yang sama walau isinya kini datang dari CMS.
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
  const ctaText = id ? row?.ctaText_id : row?.ctaText_en;

  // Satu baris teks = satu baris judul. Baris pertama tegak, sisanya italic —
  // bentuk yang sama dengan "One studio." / "Five mediums." sebelumnya, tapi
  // jumlah barisnya kini bebas diatur dari CMS.
  const lines = headline.split("\n").filter((line) => line.trim() !== "");

  return (
    <section className="sticky top-0 flex h-svh flex-col justify-end overflow-hidden">
      {/* Pembungkus sendiri, bukan class di <img>: Intro men-scale elemen ini,
          dan object-cover milik <img> tetap bekerja penuh di dalamnya. */}
      <div data-hero-bg className="absolute inset-0 will-change-transform">
        {/* Lapisan foto terpisah untuk parallax: HeroParallax men-scale-nya pelan
            (push-in) saat hero tertutup. Scale dari pusat tak pernah menyingkap
            tepi, jadi framing asli foto dipertahankan — tak perlu over-scan. */}
        <div data-hero-photo className="absolute inset-0 will-change-transform">
          {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
          <img
            src={row?.backgroundImage ?? "/images/hero.jpg"}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>

      {/* Scrim: foto ini terang di bagian atas, jadi teks putih butuh dasar
          gelap yang menguat ke bawah agar tetap terbaca di semua ukuran. */}
      <div
        aria-hidden
        className="from-charcoal/95 via-charcoal/40 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      <Container className="relative z-10 pb-8 md:pb-10">
        {/* Lapisan foreground: seluruh blok teks keluar lebih cepat + memudar
            saat hero tertutup (HeroParallax). Bungkus sendiri supaya laju scroll
            menulis transform di sini, bukan di [data-headline] yang dikelola
            Intro. */}
        <div data-hero-text className="will-change-transform">
          <h1
            data-headline
            className="font-display text-cream max-w-4xl text-[clamp(1.9rem,6.5vw,5rem)] leading-[1.05] font-medium tracking-[-0.022em] will-change-transform"
          >
            {lines.map((line, index) => (
              <span key={index} className={index === 0 ? "block" : "text-cream/70 block italic"}>
                {line}
              </span>
            ))}
          </h1>

          <div className="text-cream/75 mt-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase md:mt-8">
            <span aria-hidden className="bg-cream/40 h-px w-10" />
            <p>{subheadline}</p>
          </div>

          {/* Keduanya harus terisi: tombol tanpa tujuan, atau tujuan tanpa label,
              sama-sama tidak ada gunanya di layar. */}
          {ctaText && row?.ctaUrl ? (
            <Button href={row.ctaUrl} variant="cream" className="mt-8">
              {ctaText}
            </Button>
          ) : null}
        </div>
      </Container>

      <HeroParallax />
    </section>
  );
}
