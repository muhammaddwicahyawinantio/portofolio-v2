import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
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
    title: t("title"),
    description: t("lead"),
    alternates: alternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const id = locale === "id";
  const [t, testimonials] = await Promise.all([
    getTranslations("contact"),
    prisma.testimonial.findMany({ orderBy: { order: "asc" }, take: 3 }),
  ]);

  const points = [t("point1"), t("point2"), t("point3")];

  return (
    // isolate wajib: latar di bawah duduk pada -z-10, dan tanpa konteks
    // penumpukan sendiri ia akan tenggelam ke belakang <body> alih-alih
    // berhenti tepat di belakang isi halaman ini.
    <div className="relative isolate">
      {/* Latar yang membungkus seluruh section, form, dan teks di halaman ini.
          background-image, bukan <img>: berkasnya diunggah terpisah, dan kalau
          belum ada yang tampil cuma kosong — bukan ikon gambar rusak. */}
      <div
        aria-hidden
        className="backdrop-expand pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/contact-bg.jpg')" }}
        />
        {/* Scrim. Fotonya punya bidang krom yang terang; tanpa lapisan ini teks
            silver di atasnya kehilangan kontras. */}
        <div className="bg-cream/88 absolute inset-0" />
      </div>

      <Section className="pt-28 md:pt-36">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="eyebrow">{t("breadcrumb")}</p>

              <h1
                data-headline
                className="font-display mt-6 text-[clamp(1.9rem,5vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.018em] text-balance"
              >
                {t("title")}
              </h1>

              <p className="text-ink-soft mt-6 max-w-md text-sm leading-[1.7] text-pretty">
                {t("lead")}
              </p>

              <ul className="mt-10 flex flex-col gap-3">
                {points.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <Check
                      aria-hidden
                      className="bg-card text-ink size-6 shrink-0 rounded-full p-1.5"
                    />
                    <span className="text-ink-soft text-sm">{point}</span>
                  </li>
                ))}
              </ul>

              {/* Referensinya memasang dinding wordmark OpenAI/Claude/GitHub di
                bawah "Trusted by". Itu diganti kutipan klien sungguhan dari CMS:
                perusahaan-perusahaan itu bukan klien studio ini, dan memasang
                lambangnya di halaman kontak adalah klaim dukungan yang palsu. */}
              {testimonials.length > 0 ? (
                <div className="border-line mt-12 border-t pt-8">
                  <p className="eyebrow">{t("trustedBy")}</p>
                  <ul className="mt-6 flex flex-col gap-6">
                    {testimonials.map((item) => (
                      <li key={item.id}>
                        <p className="text-ink-soft text-sm leading-[1.6] text-pretty">
                          {id ? item.content_id : item.content_en}
                        </p>
                        <p className="text-ink-soft mt-2 font-mono text-[11px] tracking-[0.1em] uppercase">
                          {item.clientName} — {item.position}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <ContactForm privacy={t("privacy")} />
          </div>
        </Container>
      </Section>
    </div>
  );
}
