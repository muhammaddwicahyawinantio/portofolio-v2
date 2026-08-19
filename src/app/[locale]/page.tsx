import clsx from "clsx";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Reveal from "@/components/animations/Reveal";
import { MEDIUMS } from "@/lib/mediums";
import Hero from "@/components/sections/Hero";
import ServiceGrid from "@/components/sections/ServiceGrid";
import ProjectShowcase from "@/components/sections/ProjectShowcase";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const hero = useTranslations("hero");
  const mediums = useTranslations("mediums");
  const index = useTranslations("index");
  const cta = useTranslations("cta");
  const services = useTranslations("services");
  const projects = useTranslations("projects");

  return (
    <>
      <Hero
        line1={hero("line1")}
        line2={hero("line2")}
        line3={hero("line3")}
        scroll={hero("scroll")}
        scrollHint={hero("scrollHint")}
      />

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

        <Section id="projects" className="border-graphite/40 border-t">
          <Container>
            <p className="text-ash mb-14 text-[11px] font-semibold tracking-[0.3em] uppercase md:mb-20">
              {projects("eyebrow")}
            </p>
            <ProjectShowcase locale={locale} />
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
