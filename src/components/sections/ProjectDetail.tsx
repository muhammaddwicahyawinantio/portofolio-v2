import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const getProject = cache(async (slug: string) => {
  return prisma.project.findFirst({ where: { slug, archived: false } });
});

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)$/i.test(url);
}

export default async function ProjectDetail({ locale, slug }: { locale: string; slug: string }) {
  const row = await getProject(slug);
  if (!row) notFound();

  const t = await getTranslations({ locale, namespace: "projects" });
  const title = locale === "id" ? row.title_id : row.title_en;
  const description = locale === "id" ? row.description_id : row.description_en;
  const caseStudy = locale === "id" ? row.caseStudy_id : row.caseStudy_en;
  const gallery = toStringArray(row.images);
  const cover = row.coverImage ?? gallery[0] ?? "/images/placeholder-1.jpg";

  return (
    <>
      <section className="pt-40 pb-16 md:pt-56 md:pb-24">
        <Container>
          <Link
            href="/projects"
            className="text-ash hover:text-paper mb-10 inline-block text-xs tracking-[0.2em] uppercase"
          >
            ← {t("back")}
          </Link>
          <p className="text-ash mb-8 text-[11px] font-semibold tracking-[0.3em] uppercase">
            {row.category}
          </p>
          <h1
            data-headline
            className="font-display max-w-4xl text-[clamp(2.5rem,8vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.045em] text-balance"
          >
            {title}
          </h1>
          <p className="text-silver mt-10 max-w-xl text-base leading-[1.65] text-pretty md:text-lg">
            {description}
          </p>

          <dl className="border-graphite/40 mt-12 grid grid-cols-2 gap-8 border-t pt-8 sm:grid-cols-4">
            <div>
              <dt className="text-graphite text-[10px] tracking-[0.2em] uppercase">{t("role")}</dt>
              <dd className="text-paper mt-2 text-sm">{row.role}</dd>
            </div>
            <div>
              <dt className="text-graphite text-[10px] tracking-[0.2em] uppercase">{t("year")}</dt>
              <dd className="text-paper mt-2 text-sm">{row.year}</dd>
            </div>
            {row.client ? (
              <div>
                <dt className="text-graphite text-[10px] tracking-[0.2em] uppercase">{t("client")}</dt>
                <dd className="text-paper mt-2 text-sm">{row.client}</dd>
              </div>
            ) : null}
            {row.link ? (
              <div>
                <dt className="text-graphite text-[10px] tracking-[0.2em] uppercase">
                  {t("visitSite")}
                </dt>
                <dd className="mt-2 text-sm">
                  <a
                    href={row.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-paper hover:text-silver underline"
                  >
                    {t("visitSite")}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </Container>
      </section>

      <Section className="pt-0">
        <Container>
          <div className="border-graphite/60 relative mb-16 aspect-video w-full overflow-hidden border">
            {isVideoUrl(cover) ? (
              <video src={cover} controls className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
              <img src={cover} alt={title} className="h-full w-full object-cover" />
            )}
          </div>

          <p className="text-silver max-w-2xl text-base leading-[1.75] text-pretty whitespace-pre-line">
            {caseStudy}
          </p>

          {gallery.length > 0 ? (
            <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gallery.map((url) => (
                <div key={url} className="border-graphite/60 overflow-hidden border">
                  {isVideoUrl(url) ? (
                    <video src={url} controls className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
