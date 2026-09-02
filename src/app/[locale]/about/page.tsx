import type { Metadata } from "next";
import type { ReactNode } from "react";
import clsx from "clsx";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { alternates } from "@/lib/seo";
import { toStringArray } from "@/lib/media";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/animations/Reveal";
import ScrollReveal from "@/components/ui/scroll-reveal";
import PdfPreview from "@/components/ui/pdf-preview";
import SkillMarquee from "@/components/sections/SkillMarquee";
import MediaShowcase from "@/components/sections/MediaShowcase";
import DriftWall from "@/components/ui/drift-wall";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    // absolute: metaTitle sudah membawa suffix "DwiStudio" sendiri (lihat
    // seobasic.md §2-6) — kalau lewat `title` biasa, template layout root
    // ("%s — DwiStudio") menambahkannya LAGI dan menghasilkan "... — DwiStudio — DwiStudio".
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: alternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const id = locale === "id";
  const [t, tCta, about, work, education, skills, certifications] = await Promise.all([
    getTranslations("about"),
    getTranslations("cta"),
    prisma.about.findFirst(),
    prisma.workExperience.findMany({ orderBy: { order: "asc" } }),
    prisma.education.findMany({ orderBy: { order: "asc" } }),
    prisma.skill.findMany({ orderBy: { order: "asc" } }),
    prisma.certification.findMany({ orderBy: { order: "asc" } }),
  ]);

  // Kolom Json, jadi bentuknya tidak dijamin — disaring lewat penyaring yang
  // sama dengan yang dipakai halaman project.
  const portraits = toStringArray(about?.images);

  // Dulu keduanya dilebur jadi SATU larik "timeline" dan dirender sebagai satu
  // lini masa bertitik. Dipisah karena memang dua hal berbeda: pekerjaan punya
  // kolom perusahaan, pendidikan tidak, dan menumpuknya di satu daftar membuat
  // "2019 - 2023" (kuliah) terbaca seolah menyela urutan pekerjaan yang tepat
  // di atasnya. Sekarang dua tabel terpisah, masing-masing dengan judul
  // kolomnya sendiri.
  const hasHistory = work.length > 0 || education.length > 0;

  return (
    <div className="interior-page pb-24 md:pb-36">
      {/* 2 - Hero: bio dan potret duduk di satu bingkai, dipisah satu garis.
          Padding atas tetap besar - navbar mengambang di atasnya. */}
      <section className="pt-28 md:pt-32">
        <Container>
          <Frame className="md:grid-cols-12">
            <Panel
              label={t("eyebrow")}
              className={portraits.length > 0 ? "md:col-span-7" : "md:col-span-12"}
            >
              <h1
                data-headline
                className="font-rampart-one font-display text-[clamp(2.2rem,6.5vw,4.75rem)] leading-[1.05] font-medium tracking-[-0.022em] text-balance"
              >
                {about ? (id ? about.title_id : about.title_en) : t("title")}
              </h1>

              {about ? (
                <>
                  <p className="text-ink-soft mt-6 max-w-lg text-base leading-[1.7] text-pretty md:text-lg">
                    {id ? about.shortDescription_id : about.shortDescription_en}
                  </p>

                  {/* Lokasi, status, dan CV satu baris. Tombol CV duduk di
                      LUAR <dl>: isi <dl> hanya boleh dt/dd (atau div yang
                      membungkus keduanya), sedangkan tombolnya bukan pasangan
                      istilah-definisi. */}
                  <div className="border-line mt-10 flex flex-wrap items-end gap-x-12 gap-y-6 border-t pt-6">
                    <dl className="flex flex-wrap gap-x-12 gap-y-4">
                      <div>
                        <dt className="text-ink-soft font-mono text-[11px] tracking-[0.1em] uppercase">
                          {id ? "Lokasi" : "Location"}
                        </dt>
                        <dd className="text-ink mt-2 text-sm">{about.location}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-soft font-mono text-[11px] tracking-[0.1em] uppercase">
                          Status
                        </dt>
                        <dd className="text-ink mt-2 text-sm">
                          {id ? about.status_id : about.status_en}
                        </dd>
                      </div>
                    </dl>

                    {/* Muncul sendiri begitu PDF-nya diunggah lewat CMS
                        (About → "CV / Resume (PDF)"); tanpa berkas, tombolnya
                        tidak dirender sama sekali. Tombol unduhnya ada di
                        dalam modal pratinjau. */}
                    {about.cvFile ? (
                      <PdfPreview
                        url={about.cvFile}
                        previewLabel={t("cvPreview")}
                        downloadLabel={t("cvDownload")}
                        loadingLabel={t("cvLoading")}
                        errorLabel={t("cvError")}
                        closeLabel={t("cvClose")}
                      />
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="text-ink-soft mt-8 max-w-xl text-base leading-[1.65] text-pretty md:text-lg">
                  {t("lead")}
                </p>
              )}
            </Panel>

            {portraits.length > 0 ? (
              /* Sel potret: tanpa padding sama sekali, dinding fotonya mengisi
                 selnya sampai ke garis - tingginya ikut sel bio di sebelahnya. */
              <div className="bg-card min-h-[320px] md:col-span-5 md:h-full">
                <DriftWall
                  items={portraits.map((image) => ({
                    image,
                    title: id ? about?.title_id : about?.title_en,
                  }))}
                  columns={3}
                  tileWidth={168}
                  tileHeight={118}
                  gap={12}
                  radius={4}
                  speed={24}
                  depth={70}
                  lift={28}
                  grayscale
                  overlayColor="var(--color-cream)"
                />
              </div>
            ) : null}
          </Frame>
        </Container>
      </section>

      {/* 3 - Cerita panjang di kiri, lini masa vertikal di kanan. */}
      {about ? (
        <section id="story">
          <Container>
            <Frame className={hasHistory ? "md:grid-cols-[1.4fr_1fr]" : undefined}>
              {/* row-span hanya kalau KEDUA tabel ada: dengan satu tabel saja,
                  memaksa cerita membentang dua baris menyisakan sel kosong di
                  bawahnya - dan sel kosong di Frame ini terlihat, karena
                  jaraknya sendiri yang berwarna garis. */}
              <Panel
                label={t("storyTitle")}
                className={work.length > 0 && education.length > 0 ? "md:row-span-2" : undefined}
              >
                <ScrollReveal>{id ? about.fullStory_id : about.fullStory_en}</ScrollReveal>

                <blockquote className="border-sand-deep mt-14 border-l pl-6">
                  <p className="font-display text-lg leading-[1.25] font-medium tracking-[-0.01em] text-balance md:text-xl">
                    {id ? about.motto_id : about.motto_en}
                  </p>
                </blockquote>
              </Panel>

              {work.length > 0 ? (
                <Panel label={t("workTitle")}>
                  <HistoryTable
                    periodLabel={t("periodLabel")}
                    titleLabel={t("roleLabel")}
                    rows={work.map((row) => ({
                      id: row.id,
                      period: row.period,
                      title: id ? row.role_id : row.role_en,
                      detail: row.company,
                    }))}
                  />
                </Panel>
              ) : null}

              {education.length > 0 ? (
                <Panel label={t("educationTitle")}>
                  <HistoryTable
                    periodLabel={t("periodLabel")}
                    titleLabel={t("institutionLabel")}
                    rows={education.map((row) => ({
                      id: row.id,
                      period: row.period,
                      title: row.institution,
                    }))}
                  />
                </Panel>
              ) : null}
            </Frame>
          </Container>
        </section>
      ) : null}

      {/* 4 - Keahlian sebagai teks serif besar berjalan, bukan ikon berwarna. */}
      {skills.length > 0 ? (
        <section id="skills">
          <Container>
            <Frame>
              <Panel label={t("skillsTitle")} className="overflow-hidden">
                <SkillMarquee
                  skills={skills.map((s) => ({ id: s.id, title: s.title, icon: s.icon }))}
                />
              </Panel>
            </Frame>
          </Container>
        </section>
      ) : null}

      {certifications.length > 0 ? (
        <section id="certifications">
          <Container>
            <Frame>
              <Panel label={t("certificationsTitle")} bodyClassName="">
                <Reveal targets="li">
                  <ul className="bg-line grid h-full gap-px sm:grid-cols-2 lg:grid-cols-3">
                    {certifications.map((cert) => (
                      <li key={cert.id} className="bg-card">
                        {cert.image ? (
                          <div className="aspect-video w-full overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
                            <img
                              src={cert.image}
                              alt={cert.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : null}
                        <p className="p-5 text-sm font-semibold">{cert.name}</p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </Panel>
            </Frame>
          </Container>
        </section>
      ) : null}

      {/* How I Work: tiga sel berangka besar, dipisah garis - bukan tiga
          kartu terpisah yang berjarak. */}
      <section id="values">
        <Container>
          <Frame>
            <Panel label={t("valuesTitle")} bodyClassName="">
              <Reveal targets="li">
                {/* Kunci ditulis literal, bukan dirangkai dari variabel: next-intl
                  mengetik nama pesan, dan penggabungan string biasa ditolak
                  compiler. */}
                <ul className="bg-line grid h-full gap-px md:grid-cols-3">
                  {(
                    [
                      ["values.one.title", "values.one.body"],
                      ["values.two.title", "values.two.body"],
                      ["values.three.title", "values.three.body"],
                    ] as const
                  ).map(([titleKey, bodyKey], index) => (
                    <li key={titleKey} className="bg-card p-6 md:p-8">
                      <p className="font-display text-sand-deep text-3xl font-medium tracking-[-0.01em]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h2 className="font-display mt-4 text-base font-medium tracking-[-0.01em]">
                        {t(titleKey)}
                      </h2>
                      <p className="text-ink-soft mt-3 text-sm leading-[1.6]">{t(bodyKey)}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Panel>
          </Frame>
        </Container>
      </section>

      {/* Musik & Film: dua kolom, kartunya memakai tilt yang sama dengan
          kartu layanan. */}
      <section id="media">
        <Container>
          <Frame>
            <Panel label={t("mediaTitle")}>
              <MediaShowcase musicTitle={t("musicTitle")} filmTitle={t("filmTitle")} />
            </Panel>
          </Frame>
        </Container>
      </section>

      {/* 6 - CTA kecil ke Contact. */}
      <section>
        <Container>
          <Frame>
            <Panel label={tCta("eyebrow")}>
              <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <h2 className="font-rampart-one font-display max-w-xl text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.05] font-medium tracking-[-0.01em] text-balance">
                  {tCta("heading")}
                </h2>
                <Button href="/contact">{tCta("action")}</Button>
              </Reveal>
            </Panel>
          </Frame>
        </Container>
      </section>
    </div>
  );
}

/**
 * Bingkai satu tabel: garis luar setipis rambut, sudut siku.
 *
 * Garis DALAM tidak datang dari border per sel, tapi dari gap-px di atas latar
 * berwarna garis - celah 1px itulah yang terlihat sebagai garisnya. Dengan
 * begitu tidak ada garis ganda di pertemuan dua sel, tidak perlu mematikan
 * border di sel terakhir, dan sel yang membungkus ke baris berikutnya (kisi
 * sertifikat) tetap dapat garis yang benar.
 */
/**
 * Tabel riwayat: periode di kiri, judul di kanan, satu garis rambut per baris.
 *
 * <table> betulan, bukan daftar yang didandani: isinya memang dua kolom dengan
 * judul kolom, dan pembaca layar mengumumkan "Periode"/"Peran" tiap sel karena
 * <th scope="col">-nya. Perusahaan ikut di sel yang sama dengan perannya, bukan
 * kolom ketiga - di kolom kanan Frame yang cuma 1fr, tiga kolom akan memaksa
 * tiap nama perusahaan pecah jadi tiga baris.
 */
function HistoryTable({
  periodLabel,
  titleLabel,
  rows,
}: {
  periodLabel: string;
  titleLabel: string;
  rows: { id: string; period: string; title: string; detail?: string | null }[];
}) {
  return (
    <Reveal targets="tbody tr">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-line border-b">
            <th
              scope="col"
              className="text-ink-soft pr-4 pb-3 font-mono text-[10px] font-normal tracking-[0.18em] uppercase"
            >
              {periodLabel}
            </th>
            <th
              scope="col"
              className="text-ink-soft pb-3 font-mono text-[10px] font-normal tracking-[0.18em] uppercase"
            >
              {titleLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-line border-b last:border-b-0">
              {/* whitespace-nowrap: periodenya pendek dan berupa rentang -
                  "2019 -" lalu "2023" di baris berikutnya membuat kolom kiri
                  terbaca seperti dua entri. */}
              <td className="text-ink-soft py-4 pr-4 align-top font-mono text-[11px] tracking-[0.1em] whitespace-nowrap uppercase">
                {row.period}
              </td>
              <td className="py-4 align-top">
                <span className="font-display block text-base leading-[1.25] font-medium tracking-[-0.01em]">
                  {row.title}
                </span>
                {row.detail ? (
                  <span className="text-ink-soft mt-1 block text-sm">{row.detail}</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    // -mt-px: garis atas bingkai ini menimpa garis bawah bingkai sebelumnya,
    // jadi pertemuan dua section tetap satu garis 1px — bukan dua garis
    // bertumpuk jadi 2px. Di bingkai pertama efeknya cuma naik 1px.
    <div className={clsx("border-line bg-line -mt-px grid gap-px border", className)}>
      {children}
    </div>
  );
}

/**
 * Satu sel di dalam Frame: label kecil di strip atas, isinya di bawah.
 * bodyClassName dikosongkan kalau isi selnya sendiri sudah berupa kisi sel
 * (values, sertifikat) - biar garisnya lurus sampai tepi bingkai, bukan masuk
 * ke dalam sejauh padding.
 */
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
      {/* Strip label dibungkus div, bukan diberi kelas latar langsung:
          .eyebrow itu inline-flex, jadi latar dan garisnya hanya akan selebar
          teksnya, bukan selebar sel. */}
      <div className="bg-cream-deep border-line border-b px-6 py-4 md:px-10">
        <p className="eyebrow">{label}</p>
      </div>
      <div className={clsx("flex-1", bodyClassName)}>{children}</div>
    </div>
  );
}
