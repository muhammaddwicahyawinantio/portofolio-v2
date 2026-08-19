import Container from "@/components/ui/Container";

/**
 * Foto full-bleed satu layar penuh. Sticky supaya section berikutnya menutupinya
 * saat digulir, seperti hero sebelumnya.
 *
 * data-hero-bg dibaca Intro: ia menahan foto di scale(1.18) lalu menariknya
 * kembali ke 1 saat tirai membuka. data-headline dipakai untuk slide-up-nya.
 */
export default function Hero({
  line1,
  line2,
  line3,
  scroll,
  scrollHint,
}: {
  line1: string;
  line2: string;
  line3: string;
  scroll: string;
  scrollHint: string;
}) {
  return (
    <section className="sticky top-0 flex h-screen flex-col justify-end overflow-hidden">
      {/* Pembungkus sendiri, bukan class di <img>: Intro men-scale elemen ini,
          dan object-cover milik <img> tetap bekerja penuh di dalamnya. */}
      <div data-hero-bg className="absolute inset-0 will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
        <img
          src="/images/hero.jpg"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Scrim: foto ini terang di bagian atas, jadi teks putih butuh dasar
          gelap yang menguat ke bawah agar tetap terbaca di semua ukuran. */}
      <div
        aria-hidden
        className="from-ink/95 via-ink/40 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      <Container className="relative z-10 pb-10 md:pb-14">
        <h1
          data-headline
          className="font-display max-w-4xl text-[clamp(2.5rem,9vw,7.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em] uppercase will-change-transform"
        >
          <span className="block">{line1}</span>
          <span className="text-silver block">
            {line2} {line3}
          </span>
        </h1>

        <div className="text-ash mt-8 flex items-center gap-3 text-[10px] font-medium tracking-[0.25em] uppercase md:mt-10">
          <span aria-hidden className="bg-graphite h-px w-8" />
          <p>
            {scroll}
            <br />
            <span className="text-graphite">{scrollHint}</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
