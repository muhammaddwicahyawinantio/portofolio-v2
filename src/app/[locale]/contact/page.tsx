import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
import { alternates } from "@/lib/seo";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import ContactForm from "@/components/ui/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    // absolute: lihat catatan di about/page.tsx — metaTitle sudah bawa "DwiStudio".
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: alternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const points = [t("point1"), t("point2"), t("point3")];

  return (
    <div className="interior-page">
      <Section className="pt-24 pb-12 md:pt-28 md:pb-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="eyebrow">{t("breadcrumb")}</p>

              <h1
                data-headline
                className="font-rampart-one font-display mt-5 text-[clamp(2.1rem,5.2vw,3.75rem)] leading-[1.04] font-medium tracking-[-0.01em] text-balance"
              >
                {t("title")}
              </h1>

              <p className="text-ink-soft mt-4 max-w-md text-base leading-[1.65] text-pretty md:text-lg">
                {t("lead")}
              </p>

              <ul className="mt-7 flex flex-col gap-2.5">
                {points.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <Check
                      aria-hidden
                      className="bg-card text-ink size-5 shrink-0 rounded-full p-1.5"
                    />
                    <span className="text-ink-soft text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ContactForm privacy={t("privacy")} compact />
          </div>
        </Container>
      </Section>
    </div>
  );
}
