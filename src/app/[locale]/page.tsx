import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import HorizontalScroll from "@/components/ui/horizontal-scroll";
import IntroGate from "@/components/ui/IntroGate";
import Hero from "@/components/sections/Hero";
import ExploreColumns from "@/components/sections/ExploreColumns";
import WorksShowcase from "@/components/sections/WorksShowcase";
import FeatureShowcase from "@/components/sections/FeatureShowcase";
import BenefitGrid from "@/components/sections/BenefitGrid";
import ContactPanel from "@/components/sections/ContactPanel";
import ReadyPanel from "@/components/sections/ReadyPanel";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const services = useTranslations("services");
  const benefits = useTranslations("benefits");
  const cta = useTranslations("cta");

  return (
    <IntroGate>
      <div className="homepage-main">
        {/* Isinya dari CMS (Content → Hero Section). Halaman ini tetap sinkron:
          Hero server component async, dan RSC boleh menyusun anak async di
          dalam induk yang tidak async. */}
        <Hero locale={locale} />

        {/* Lapisan yang menutupi hero — butuh bg opaque, kalau transparan hero
          tembus. `.paper` = cream-0 + plester, TANPA sapuan gradasi milik body:
          di beranda kedalaman sudah datang dari pergantian lembar antar-section
          (benefits naik ke cream-1, footer cream-1). Sapuan di atas ritme itu
          cuma akan mengeruhkan keduanya. Halaman interior yang tidak punya
          pergantian section-lah yang memakai sapuan body. */}
        <div className="homepage-paper relative z-10">
          <WorksShowcase locale={locale} />

          {/* Dua panel selebar layar yang digeser mendatar oleh scroll. Panel 1
            memakai video text motion sebagai background; panel 2 accordion
            Features (AccordionFeatureSection) — gambar fitur aktif berganti
            saat item accordion dibuka.

            `!py-0` karena panggung HorizontalScroll sudah setinggi satu layar;
            padding section hanya akan menambah ruang kosong di atas dan di
            bawahnya. Ritme vertikalnya dikembalikan pembungkusnya sendiri saat
            mode statis. Pola yang sama dengan section #benefits. */}
          <Section id="projects" className="border-line border-t !bg-white !py-0">
            <HorizontalScroll>
              {/* Rata tengah, jadi Container di sini cuma menjaga geometri kolom
                halaman dan menjadi bidang penuh untuk video background.
                min-h-svh dipasang juga di mobile supaya video tetap memenuhi
                panel saat mode horizontal aktif. */}
              <Container className="relative isolate flex min-h-svh flex-col items-center justify-end overflow-hidden pt-14 pb-8 text-center md:gap-6 md:pt-[clamp(5.5rem,14vh,9rem)] md:pb-[clamp(5.5rem,12vh,7.5rem)]">
                <video
                  aria-hidden
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 z-0 h-full w-full scale-[1.6] object-contain object-center md:scale-[1.35] md:object-cover"
                >
                  <source src="/videos/textmotion.mp4" type="video/mp4" />
                </video>

              </Container>

              <FeatureShowcase locale={locale} />
            </HorizontalScroll>
          </Section>

          {/* Why us langsung mengikuti section projects. Tidak memakai ScrollExpand
            karena frame awalnya kosong dan membuat ruang putih setinggi beberapa
            viewport sebelum isi section terlihat. */}
          <Section id="benefits" className="border-line border-t !py-0">
            <Container className="py-8 md:py-20">
              <p className="eyebrow mb-4 md:mb-6">{benefits("eyebrow")}</p>
              <h2 className="home-benefits-heading font-rampart-one font-display mb-6 max-w-4xl text-[clamp(2.1rem,5.4vw,4.25rem)] leading-[1.02] font-medium tracking-[-0.015em] text-balance md:mb-14">
                {benefits("title")}
              </h2>
              <BenefitGrid locale={locale} />
            </Container>
          </Section>

          {/* Dua section terakhir berbagi SATU lembar: `.paper-warm` di sini dan
            di latar tirai ReadyPanel. Sampai titik ini halaman berganti-ganti
            cream-0/cream-1 tiap section; mulai dari sini ia berhenti berganti
            dan menghangat sekali jalan sampai ajakan bertindak. */}
          <Section id="services" className="border-line border-t !bg-white">
            <Container>
              <p className="eyebrow mb-10 md:mb-14">{services("eyebrow")}</p>
              <ExploreColumns
                locale={locale}
                builderLabel={services("builder")}
                digitalProductLabel={services("digitalProduct")}
                exploreLabel={services("explore")}
              />
            </Container>
          </Section>

          {/* Section penutup, SATU section: judul, formulir kontak, dan "What
            clients say" semuanya di dalamnya. Ia membawa `id="contact"`, padding
            vertikalnya sendiri, dan tirainya sendiri — jadi tidak dibungkus
            <Section> lagi. Tanpa `border-t` juga: yang menandai tepi atasnya
            adalah pergantian bidang cream-0 → cream-1 yang tersingkap.

            Di sinilah halaman meminta pengunjung bertindak, jadi di sinilah
            satu-satunya fokus warna hangat ditaruh; charcoal yang memimpin hero
            sudah tidak hadir sama sekali di layar ini. */}
          <ReadyPanel eyebrow={cta("eyebrow")} heading={cta("ready")}>
            <ContactPanel locale={locale} />
          </ReadyPanel>
        </div>
      </div>
    </IntroGate>
  );
}
