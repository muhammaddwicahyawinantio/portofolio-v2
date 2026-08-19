import clsx from "clsx";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import ScrollScrub from "@/components/animations/ScrollScrub";
import Reveal from "@/components/animations/Reveal";
import { MEDIUMS } from "@/lib/mediums";
import ServiceGrid from "@/components/sections/ServiceGrid";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const hero = useTranslations("hero");
  const mediums = useTranslations("mediums");
  const index = useTranslations("index");
  const cta = useTranslations("cta");
  const services = useTranslations("services");
  const footer = useTranslations("footer");

  return (
    <>
      {/* Hero satu layar penuh dengan tiga baris: kosong di atas, judul di
          tengah, penunjuk gulir di bawah — justify-between yang menempatkannya,
          bukan angka margin. Tetap sticky supaya section berikutnya menutupinya. */}
      <section className="sticky top-0 flex h-screen flex-col justify-between overflow-hidden pt-24 pb-8 md:pt-28 md:pb-10">
        <div aria-hidden />

        {/* Meredup saat lapisan berikutnya menutupinya. Tanpa ini, potongan
            sticky terbaca sebagai teks terpotong, bukan lapisan di belakang. */}
        <ScrollScrub to={{ opacity: 0.16, scale: 0.97 }} start="clamp(top top)">
          <Container className="text-center">
            <ScrollScrub to={{ yPercent: 6 }}>
              <h1
                data-headline
                className="font-display mx-auto max-w-5xl text-[clamp(2.25rem,6.5vw,5.8rem)] leading-[1.05] font-extrabold tracking-[-0.02em] uppercase"
              >
                <span className="block">{hero("line1")}</span>
                <span className="text-ash block">
                  {hero("line2")} {hero("line3")}
                </span>
              </h1>
            </ScrollScrub>

            {/* Daftar medium menggantikan baris peran di referensi: isi yang
                sama dengan Value Rail, dipisah titik. */}
            <ScrollScrub to={{ yPercent: 24 }}>
              <ul className="text-ash mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-medium tracking-[0.25em] uppercase md:mt-8">
                {MEDIUMS.map((m, i) => (
                  <li key={m.key} className="flex items-center gap-4">
                    {i > 0 ? (
                      <span aria-hidden className="text-graphite">
                        •
                      </span>
                    ) : null}
                    {mediums(m.key)}
                  </li>
                ))}
              </ul>
            </ScrollScrub>
          </Container>
        </ScrollScrub>

        <Container className="text-ash flex items-end justify-between gap-6 text-[10px] font-medium tracking-[0.2em] uppercase">
          <div className="flex items-center gap-3">
            <span aria-hidden className="bg-graphite h-px w-8" />
            <p>
              {hero("scroll")}
              <br />
              <span className="text-graphite">{hero("scrollHint")}</span>
            </p>
          </div>
          <p className="hidden text-right sm:block">{footer("statement")}</p>
        </Container>
      </section>

      {/* Lapisan yang menutupi hero — butuh bg opaque, kalau transparan hero tembus. */}
      <div className="bg-ink relative z-10">
        {/* Medium Index — urutan tonal identik dengan ValueRail. */}
        <Section id="mediums" className="border-graphite/40 border-t">
          <Container>
            <p className="text-ash mb-14 text-[11px] font-semibold tracking-[0.3em] uppercase md:mb-20">
              {index("eyebrow")}
            </p>
            <Reveal targets="li">
              <ul className="border-graphite/50 border-t">
                {MEDIUMS.map((m) => (
                  <li
                    key={m.key}
                    className="border-graphite/50 flex flex-col gap-4 border-b py-8 md:flex-row md:items-baseline md:gap-12 md:py-10"
                  >
                    <span aria-hidden className={clsx("h-3 w-10 shrink-0 md:mt-2", m.tone)} />
                    <h2 className="font-display w-52 shrink-0 text-3xl leading-none font-extrabold tracking-[-0.03em] md:text-4xl">
                      {mediums(m.key)}
                    </h2>
                    <p className="text-silver max-w-md text-base leading-[1.6]">{index(m.key)}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </Container>
        </Section>

        <Section id="services" className="border-graphite/40 border-t">
          <Container>
            <p className="text-ash mb-14 text-[11px] font-semibold tracking-[0.3em] uppercase md:mb-20">
              {services("eyebrow")}
            </p>
            <ServiceGrid
              locale={locale}
              priceFromLabel={services("priceFrom")}
              inquireLabel={services("inquire")}
            />
          </Container>
        </Section>

        <Section>
          <Container>
            <Reveal className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-ash mb-6 text-[11px] font-semibold tracking-[0.3em] uppercase">
                  {cta("eyebrow")}
                </p>
                <h2 className="font-display max-w-2xl text-[clamp(2.25rem,6vw,5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] text-balance">
                  {cta("heading")}
                </h2>
              </div>
              <Button href="/contact">{cta("action")}</Button>
            </Reveal>
          </Container>
        </Section>
      </div>
    </>
  );
}
