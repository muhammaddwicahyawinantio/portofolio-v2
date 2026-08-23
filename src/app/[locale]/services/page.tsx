import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { alternates } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import Container from "@/components/ui/Container";
import ServiceGrid from "@/components/sections/ServiceGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });

  return {
    title: t("title"),
    description: t("lead"),
    alternates: alternates(locale, "/services"),
  };
}

export default function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("services");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <Container className="pb-24 md:pb-36">
        <ServiceGrid locale={locale} priceFromLabel={t("priceFrom")} exploreLabel={t("explore")} />
      </Container>
    </>
  );
}
