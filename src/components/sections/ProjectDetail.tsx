import "server-only";
import { cache } from "react";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { isVideoUrl, toStringArray } from "@/lib/media";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const getProject = cache(async (slug: string) => {
  return prisma.project.findFirst({ where: { slug, archived: false } });
});

export default async function ProjectDetail({ locale, slug }: { locale: string; slug: string }) {
  const row = await getProject(slug);
  if (!row) notFound();

  const t = await getTranslations({ locale, namespace: "projects" });
  const title = locale === "id" ? row.title_id : row.title_en;
  const description = locale === "id" ? row.description_id : row.description_en;
  const caseStudy = locale === "id" ? row.caseStudy_id : row.caseStudy_en;
  const images = toStringArray(row.images);
  const cover = row.coverImage ?? images[0] ?? "/images/placeholder-1.jpg";
  const gallery = images.filter((u) => u !== cover);

  // Baris tabel detail: role/year selalu ada, client/link cuma kalau diisi
  // admin — dirangkai jadi satu larik supaya Panel-nya tidak perlu tiga blok
  // JSX terpisah untuk hal yang bentuknya sama (label + nilai).
  const meta: { label: string; value: string; href?: string }[] = [
    { label: t("role"), value: row.role },
    { label: t("year"), value: row.year },
  ];
  if (row.client) meta.push({ label: t("client"), value: row.client });
  if (row.link) meta.push({ label: t("visitSite"), value: t("visitSite"), href: row.link });

  return (
    // interior-page: sama seperti /about dan /projects — tanpa kelas ini,
    // override tipografi headline/paragraf besar di globals.css (blok
    // "Interior typography scale") tidak pernah aktif, dan itulah sebabnya
    // headline halaman ini dulu jauh lebih kecil dari halaman interior lain.
    <div className="interior-page pb-24 md:pb-36">
      <section className="pt-28 md:pt-32">
        <Container>
          <Link
            href="/projects"
            className="text-ink-soft hover:text-ink mb-10 inline-block text-xs tracking-[0.2em] uppercase"
          >
            ← {t("back")}
          </Link>

          <Frame className="md:grid-cols-[1.6fr_1fr]">
            <Panel label={row.category}>
              <h1
                data-headline
                className="font-rampart-one font-display max-w-4xl text-[clamp(2.2rem,6.5vw,4.75rem)] leading-[1.05] font-medium tracking-[-0.01em] text-balance"
              >
                {title}
              </h1>
              <p className="text-ink-soft mt-6 max-w-xl text-base leading-[1.65] text-pretty whitespace-pre-line md:text-lg">
                {description}
              </p>
            </Panel>

            <Panel label={t("detailsLabel")}>
              <dl className="divide-line divide-y">
                {meta.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <dt className="text-ink-soft font-mono text-[11px] tracking-[0.1em] uppercase">
                      {item.label}
                    </dt>
                    <dd className="text-ink text-right text-base font-medium">
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-ink-soft underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </Frame>
        </Container>
      </section>

      <Section className="pt-0">
        <Container>
          <div className="border-line rounded-card relative mb-16 aspect-video w-full overflow-hidden border">
            {isVideoUrl(cover) ? (
              <video src={cover} controls className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
              <img src={cover} alt={title} className="h-full w-full object-cover" />
            )}
          </div>

          <Frame className={gallery.length > 0 ? "md:grid-cols-[1.4fr_1fr]" : undefined}>
            <Panel label={t("overviewLabel")}>
              <p className="text-ink-soft max-w-2xl text-base leading-[1.75] text-pretty whitespace-pre-line">
                {caseStudy}
              </p>
            </Panel>

            {gallery.length > 0 ? (
              <Panel label={t("galleryLabel")} bodyClassName="">
                <div className="bg-line grid h-full gap-px sm:grid-cols-2 md:grid-cols-1">
                  {gallery.map((url) => (
                    <div key={url} className="bg-card aspect-video overflow-hidden">
                      {isVideoUrl(url) ? (
                        <video src={url} controls className="h-full w-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}
          </Frame>
        </Container>
      </Section>
    </div>
  );
}

/**
 * Bingkai + sel hairline yang sama dengan /about (Frame/Panel di
 * src/app/[locale]/about/page.tsx) — diduplikasi di sini apa adanya, bukan
 * diimpor, supaya perubahan halaman project ini tidak berisiko menyentuh
 * about/page.tsx. Garis dalam datang dari gap-px di atas latar bg-line, bukan
 * border per sel, jadi tidak ada garis dobel di pertemuan dua Panel.
 */
function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("border-line bg-line -mt-px grid gap-px border", className)}>{children}</div>
  );
}

function Panel({
  label,
  children,
  className,
  bodyClassName = "p-6 md:p-10",
}: {
  label: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={clsx("bg-card flex flex-col", className)}>
      <div className="bg-cream-deep border-line border-b px-6 py-4 md:px-10">
        <p className="eyebrow">{label}</p>
      </div>
      <div className={clsx("flex-1", bodyClassName)}>{children}</div>
    </div>
  );
}
