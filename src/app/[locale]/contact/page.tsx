import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
import { alternates } from "@/lib/seo";
import { getContactSettings } from "@/lib/contact-settings";
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

  const [t, contactSettings] = await Promise.all([getTranslations("contact"), getContactSettings()]);
  const points = [t("point1"), t("point2"), t("point3")];
  const qrLabel =
    (locale === "id" ? contactSettings?.qrLabel_id : contactSettings?.qrLabel_en) || t("qrFallback");

  return (
    <div className="interior-page">
      <Section className="pt-20 pb-10 md:pt-20 md:pb-12">
        <Container>
          {/* items-stretch (default grid behavior, dieksplisitkan): kartu form
              kanan ikut tinggi kartu foto kiri lewat kolomnya sendiri, form
              di dalamnya (h-full) yang benar-benar mengisi tinggi itu — lihat
              komentar h-full di ContactForm.tsx. */}
          <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
              <p className="eyebrow">{t("breadcrumb")}</p>

              {/* contact-heading: [data-headline].font-rampart-one.font-display
                  di .interior-page punya font-size !important global
                  (globals.css, clamp(3rem,8vw,5.4rem) — dipakai semua
                  halaman interior lain juga), jadi utility text-[clamp...]
                  di sini tidak berpengaruh sama sekali. Class penanda ini
                  dipakai supaya override-nya scoped ke /contact saja, tidak
                  ikut mengecilkan headline halaman interior lain. */}
              <h1
                data-headline
                className="contact-heading font-rampart-one font-display mt-4 font-medium tracking-[-0.01em] text-balance"
              >
                {t("title")}
              </h1>

              <p className="text-ink-soft mt-3 max-w-md text-sm leading-[1.6] text-pretty md:text-base">
                {t("lead")}
              </p>

              <ul className="mt-5 flex flex-col gap-2">
                {points.map((point) => (
                  <li key={point} className="flex items-center gap-2.5">
                    <Check
                      aria-hidden
                      className="bg-card text-ink size-4 shrink-0 rounded-full p-1"
                    />
                    <span className="text-ink-soft text-xs">{point}</span>
                  </li>
                ))}
              </ul>

              {/* h-auto (bukan aspect-ratio + object-cover): foto ini kolase
                  produk, memotongnya sama saja menghilangkan sebagian
                  konten. Tanpa aspect paksaan, <img> selalu tampil utuh
                  sesuai rasio aslinya (1200×800) di lebar kartu berapa pun —
                  pas di desktop (kartu sempit di kolom kiri) maupun mobile
                  (kartu selebar layar). */}
              <div className="border-line bg-card rounded-card mt-6 overflow-hidden border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
                <img
                  src="/images/dwi.png"
                  alt={
                    locale === "id"
                      ? "Contoh produk yang pernah kami kembangkan"
                      : "Examples of products we've built"
                  }
                  className="rounded-card h-auto w-full"
                />
              </div>
            </div>

            <ContactForm
              privacy={t("privacy")}
              qrImage={contactSettings?.qrImage ?? null}
              qrLabel={qrLabel}
            />
          </div>
        </Container>
      </Section>
    </div>
  );
}
