import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use, type CSSProperties } from "react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import GutterRule from "@/components/ui/GutterRule";
import ScrollExpand from "@/components/ui/scroll-expand";
import HorizontalScroll from "@/components/ui/horizontal-scroll";
import Lottie from "@/components/ui/lottie";
import Hero from "@/components/sections/Hero";
import ExploreColumns from "@/components/sections/ExploreColumns";
import ProjectShowcase from "@/components/sections/ProjectShowcase";
import FeatureShowcase from "@/components/sections/FeatureShowcase";
import BenefitGrid from "@/components/sections/BenefitGrid";
import ContactPanel from "@/components/sections/ContactPanel";
import ReadyPanel from "@/components/sections/ReadyPanel";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const services = useTranslations("services");
  const features = useTranslations("features");
  const projects = useTranslations("projects");
  const benefits = useTranslations("benefits");
  const cta = useTranslations("cta");

  return (
    <>
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
      <div className="paper relative z-10">
        {/* Wrapper ini opaque, jadi GutterRule milik <main> tertutup di sini —
            garisnya dipasang ulang di dalam. */}
        <GutterRule />
        {/* Dipaku saat digulir: satu layar per langkah, lalu halaman lanjut.
            Duduk tepat setelah hero — proses kerjanya diperkenalkan lebih dulu,
            baru karyanya. */}
        <Section id="features" className="border-line border-t !py-6 md:!py-8">
          <Container>
            <FeatureShowcase
              locale={locale}
              title={features("title")}
              exploreLabel={features("explore")}
            />
          </Container>
        </Section>

        {/* Section yang sama, isi yang sama — ProjectShowcase tidak disentuh
            sedikit pun. Yang ditambahkan hanya pembungkus geraknya: isi section
            ini jadi DUA panel selebar layar yang digeser mendatar oleh scroll.
            Panel 1 kata "Work"-nya sendiri, dibesarkan jadi judul; panel 2
            akordeon karyanya, masuk dari kanan lalu berhenti di tengah supaya
            bisa dibaca dan diklik.

            Eyebrow lama tidak dihapus, ia DIPINDAH: teks yang sama
            (projects.eyebrow) kini jadi panel pertama. Menyisakan "+ WORK"
            kecil di atas akordeon berarti kata yang sama muncul dua kali
            berturut-turut di satu section.

            `!py-0` karena panggung HorizontalScroll sudah setinggi satu layar;
            padding section hanya akan menambah ruang kosong di atas dan di
            bawahnya. Ritme vertikalnya dikembalikan pembungkusnya sendiri saat
            mode statis. Pola yang sama dengan section #benefits. */}
        <Section id="projects" className="border-line border-t !py-0">
          <HorizontalScroll>
            {/* Rata tengah, jadi Container di sini cuma menjaga geometri kolom
                halaman — bukan lagi menempelkan kata ini ke gutter rule.
                Spectral huruf besar-kecil biasa, bukan uppercase: ini lembar
                kalkir, bukan poster. */}
            <Container className="text-center">
              <h2 className="font-display text-[clamp(3.5rem,17vw,14rem)] leading-[0.82] font-medium tracking-[-0.03em]">
                {projects("eyebrow")}
              </h2>
              {/* Kucing hitam pekat = objek dekoratif, bukan teks — persis
                  wilayah charcoal, jadi ia tidak melanggar aturan "ink untuk
                  teks". Aset lokal di public/, bukan lottie.host: URL yang
                  diberikan itu halaman embed, dan menariknya saat runtime
                  berarti setiap pengunjung bergantung pada host pihak ketiga. */}
              <Lottie
                src="/lottie/running-cat/data.json"
                className="mx-auto -mt-4 aspect-[16/9] w-[min(80vw,44rem)] md:-mt-8"
              />
            </Container>

            <Container>
              <ProjectShowcase locale={locale} />
            </Container>
          </HorizontalScroll>
        </Section>

        {/* Lembar KEDUA — dan sekarang ia MEMUAI. Section-nya tetap yang ini,
            tidak ada section baru: seluruh isinya (eyebrow, judul, empat kartu)
            masuk ke dalam satu bingkai ScrollExpand yang tumbuh dari kotak kecil
            di tengah sampai full-bleed mengikuti scroll.

            Bidang cream-1 pindah dari section ke BINGKAI-nya lewat
            `--se-frame-*`. Itu yang membuat gerakannya terbaca: di luar bingkai
            tetap cream-0, di dalamnya cream-1 — jadi yang memuai betul-betul
            terlihat sebagai selembar kertas yang diletakkan lalu memenuhi layar.
            Tanpa beda nada, bingkainya tak kelihatan sama sekali.

            `!py-0`: panggungnya sendiri setinggi satu layar, jadi padding
            section akan menambah ruang kosong di atas dan di bawahnya. */}
        <Section id="benefits" className="border-line border-t !py-0">
          <ScrollExpand
            useWindowScroll
            startWidth={62}
            startHeight={68}
            startRadius={6}
            endRadius={0}
            scrollDistance={0.85}
            holdDistance={0.15}
            smoothing={0.08}
            // Tanpa media, jadi tanpa scrim: scrim itu untuk menjaga teks tetap
            // terbaca di atas foto, dan di sini tidak ada foto.
            overlayScrim={0}
            // Lembar istirahatnya kosong sampai isinya masuk di paruh kedua.
            // Tanpa petunjuk, persegi krem diam itu terbaca seperti gambar gagal
            // dimuat, bukan sesuatu yang menunggu digulir.
            scrollHint={benefits("scrollHint")}
            // Bingkai yang memuai = lembar KEDUA, jadi ia memakai plester yang
            // sama dengan bidang cream-1 lain. Warna dan teksturnya dioper
            // terpisah supaya komponennya tetap netral.
            style={
              {
                "--se-frame-bg": "var(--color-cream-deep)",
                "--se-frame-image": "var(--paper-mottle)",
                "--se-frame-size": "var(--paper-mottle-size)",
              } as CSSProperties
            }
          >
            {/* Padding di Container, bukan di Section: di mode expand ia diserap
                flex yang center, di mode statis (reduced-motion / < md) ia yang
                mengembalikan ritme vertikal section. */}
            <Container className="py-8 md:py-20">
              <p className="eyebrow mb-4 md:mb-6">{benefits("eyebrow")}</p>
              <h2 className="font-display mb-6 max-w-2xl text-[clamp(1.6rem,4vw,3rem)] leading-[1.05] font-medium tracking-[-0.015em] text-balance md:mb-14">
                {benefits("title")}
              </h2>
              <BenefitGrid locale={locale} />
            </Container>
          </ScrollExpand>
        </Section>

        <Section id="services" className="border-line border-t">
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
    </>
  );
}
