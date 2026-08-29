import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternates } from "@/lib/seo";
import LegalDoc, { type LegalSection } from "@/components/sections/LegalDoc";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });

  return {
    title: t("privacy.title"),
    description: t("privacy.lead"),
    alternates: alternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal");

  return (
    <LegalDoc
      eyebrow={t("eyebrow")}
      title={t("privacy.title")}
      lead={t("privacy.lead")}
      updated={t("updated")}
      // `raw` karena isinya larik objek, bukan satu string; kuncinya tetap
      // literal supaya pengetikan pesan next-intl ikut memeriksanya.
      sections={t.raw("privacy.sections") as LegalSection[]}
    />
  );
}
