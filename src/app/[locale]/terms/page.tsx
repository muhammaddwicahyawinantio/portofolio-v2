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
    title: t("terms.title"),
    description: t("terms.lead"),
    alternates: alternates(locale, "/terms"),
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal");

  return (
    <LegalDoc
      eyebrow={t("eyebrow")}
      title={t("terms.title")}
      lead={t("terms.lead")}
      updated={t("updated")}
      // `raw` karena isinya larik objek, bukan satu string; kuncinya tetap
      // literal supaya pengetikan pesan next-intl ikut memeriksanya.
      sections={t.raw("terms.sections") as LegalSection[]}
    />
  );
}
