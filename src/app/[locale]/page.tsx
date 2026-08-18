import clsx from "clsx";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
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
      {/* Hero — tipe adalah tesisnya. Roboto Slab 800, tracking rapat, leading 0.86. */}
      <section className="flex min-h-screen flex-col justify-end pt-32 pb-20 md:pb-28">
        <Container>
          <h1 className="font-display text-[clamp(3rem,11vw,10.5rem)] leading-[0.86] font-extrabold tracking-[-0.045em] uppercase">
            <span className="block">{hero("line1")}</span>
            <span className="text-ash block">{hero("line2")}</span>
            <span className="block">{hero("line3")}</span>
          </h1>
          <p className="text-silver mt-10 max-w-xl text-base leading-[1.65] text-pretty md:mt-14 md:text-lg">
            {hero("lead")}
          </p>
        </Container>
      </section>

      {/* Medium Index — urutan tonal identik dengan ValueRail. */}
      <Section id="mediums">
        <Container>
          <p className="text-ash mb-14 text-[11px] font-semibold tracking-[0.3em] uppercase md:mb-20">
            {index("eyebrow")}
          </p>
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
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-ash mb-6 text-[11px] font-semibold tracking-[0.3em] uppercase">
              {cta("eyebrow")}
            </p>
            <h2 className="font-display max-w-2xl text-[clamp(2.25rem,6vw,5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] text-balance">
              {cta("heading")}
            </h2>
          </div>
          <Button href="/contact">{cta("action")}</Button>
        </Container>
      </Section>
    </>
  );
}
