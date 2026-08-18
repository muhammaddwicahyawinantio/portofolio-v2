import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import PageHeader from "@/components/ui/PageHeader";

export default function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("about");

  return <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />;
}
