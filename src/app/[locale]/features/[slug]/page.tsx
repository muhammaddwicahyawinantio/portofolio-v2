import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { alternates } from "@/lib/seo";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

const getFeature = (slug: string) => prisma.feature.findUnique({ where: { slug } });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const row = await getFeature(slug);
  if (!row) return {};

  return {
    title: locale === "id" ? row.title_id : row.title_en,
    description: locale === "id" ? row.description_id : row.description_en,
    alternates: alternates(locale, `/features/${slug}`),
  };
}

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const row = await getFeature(slug);
  if (!row) notFound();

  const t = await getTranslations("features");
  const title = locale === "id" ? row.title_id : row.title_en;

  return (
    <>
      {/* PageHeader sudah membawa <section> dan <Container> sendiri. */}
      <PageHeader
        eyebrow={t("eyebrow")}
        title={title}
        lead={locale === "id" ? row.description_id : row.description_en}
      />

      <Section>
        <Container>
          {row.image ? (
            <div className="border-line rounded-card aspect-video w-full overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
              <img src={row.image} alt={title} className="h-full w-full object-cover" />
            </div>
          ) : null}

          <Button href="/" className="mt-12">
            {t("back")}
          </Button>
        </Container>
      </Section>
    </>
  );
}
