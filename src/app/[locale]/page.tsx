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

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const hero = useTranslations("hero");
  const mediums = useTranslations("mediums");
  const index = useTranslations("index");
  const cta = useTranslations("cta");

  return (
    <>
      {/* Hero sticky: tetap di tempat sementara section berikutnya menutupinya.
          Overlap-nya murni CSS position:sticky — GSAP hanya untuk parallax. */}
      <section className="sticky top-0 flex h-screen flex-col justify-end overflow-hidden pt-32 pb-20 md:pb-28">
        {/* Meredup saat lapisan berikutnya menutupinya. Tanpa ini, potongan
            sticky terbaca sebagai teks terpotong, bukan lapisan di belakang. */}
        <ScrollScrub to={{ opacity: 0.16, scale: 0.97 }} start="clamp(top top)">
          <Container>
            {/* Judul dan lead parallax beda kecepatan; selisihnya yang bikin kedalaman. */}
            <ScrollScrub to={{ yPercent: 6 }}>
              <h1 className="font-display text-[clamp(3rem,11vw,10.5rem)] leading-[0.86] font-extrabold tracking-[-0.045em] uppercase">
                <span className="block">{hero("line1")}</span>
                <span className="text-ash block">{hero("line2")}</span>
                <span className="block">{hero("line3")}</span>
              </h1>
            </ScrollScrub>
            <ScrollScrub to={{ yPercent: 24 }}>
              <p className="text-silver mt-10 max-w-xl text-base leading-[1.65] text-pretty md:mt-14 md:text-lg">
                {hero("lead")}
              </p>
            </ScrollScrub>
          </Container>
        </ScrollScrub>
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
