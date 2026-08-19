import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import PageHeader from "@/components/ui/PageHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("title"),
    description: t("lead"),
    alternates: alternates(locale, "/about"),
  };
}

export default function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("about");

  return <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />;
}
