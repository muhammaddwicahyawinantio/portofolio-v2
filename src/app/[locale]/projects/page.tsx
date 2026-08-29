import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import ProjectList from "@/components/sections/ProjectList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });

  return {
    // absolute: lihat catatan di about/page.tsx — metaTitle sudah bawa "DwiStudio".
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: alternates(locale, "/projects"),
  };
}

export default function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("projects");

  return (
    <div className="interior-page">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} centered />
      <Section className="pt-0">
        <Container>
          <ProjectList locale={locale} readMoreLabel={t("readMore")} />
        </Container>
      </Section>
    </div>
  );
}
