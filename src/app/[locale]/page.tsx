import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { KeyRound, MousePointerClick, Search, ShieldCheck, Smartphone, TrendingUp } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import HorizontalScroll from "@/components/ui/horizontal-scroll";
import Hero from "@/components/sections/Hero";
import ExploreColumns from "@/components/sections/ExploreColumns";
import WorksShowcase from "@/components/sections/WorksShowcase";
import FeatureShowcase from "@/components/sections/FeatureShowcase";
import BenefitGrid from "@/components/sections/BenefitGrid";
import ContactPanel from "@/components/sections/ContactPanel";
import ReadyPanel from "@/components/sections/ReadyPanel";

/** Badge kapabilitas statis di panel "Work" — bukan konten CMS, jadi cukup
    array tetap di sini, dilokalkan lewat `locale` yang sudah dioper halaman. */
const WORK_BADGES = [
  { Icon: Search, en: "SEO Optimized", id: "SEO Teroptimasi" },
  { Icon: TrendingUp, en: "High Conversion", id: "Konversi Tinggi" },
  { Icon: Smartphone, en: "Mobile First", id: "Mobile-First" },
  { Icon: MousePointerClick, en: "Interactive UI/UX", id: "UI/UX Interaktif" },
  { Icon: ShieldCheck, en: "Secure & Fast", id: "Aman & Cepat" },
  { Icon: KeyRound, en: "Full Ownership", id: "Kepemilikan Penuh" },
];

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const services = useTranslations("services");
  const benefits = useTranslations("benefits");
  const cta = useTranslations("cta");

  return (
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
            wordmark "Dwi Studio" dibesarkan jadi judul; panel 2 accordion
            Features (AccordionFeatureSection) — gambar fitur aktif berganti
            saat item accordion dibuka.

            `!py-0` karena panggung HorizontalScroll sudah setinggi satu layar;
            padding section hanya akan menambah ruang kosong di atas dan di
            bawahnya. Ritme vertikalnya dikembalikan pembungkusnya sendiri saat
            mode statis. Pola yang sama dengan section #benefits. */}
        <Section
          id="projects"
          className="border-line border-t !bg-white !py-0"
        >
          <HorizontalScroll>
            {/* Rata tengah, jadi Container di sini cuma menjaga geometri kolom
                halaman — bukan lagi menempelkan kata ini ke gutter rule.
                Spectral huruf besar-kecil biasa, bukan uppercase: ini lembar
                kalkir, bukan poster. */}
            {/* md:gap-6 (bukan gap-0): flex gap adalah jarak MINIMUM yang
                tetap dihormati bahkan saat justify-between menyebarkan
                sisa ruang kosong — jadi di viewport pendek sekalipun (di
                mana sisa ruang nyaris habis) judul, kartu, dan badge tetap
                punya jarak minimal, tidak pernah benar-benar bersentuhan.

                gap-6/pt-14/pb-8 di mobile (bukan gap-8/pt-20/pb-12): panel ini
                duduk di dalam <ul class="h-svh"> milik HorizontalScroll saat
                mode gerak aktif (viewport tinggi >= 640px + motion diizinkan)
                — tingginya TERPATOK persis setinggi viewport, bukan cuma
                dibatasi. Diukur lewat CDP di 390x700 (viewport terlihat yang
                realistis dengan address bar terbuka): dengan padding lama,
                baris badge terakhir jatuh persis di tepi bawah viewport,
                sebagian ketutup tombol mengambang "Dwi AI". Dipangkas di sini
                supaya ada jarak aman — pola yang sama dengan pemangkasan
                footer (ruang yang dikurangi, bukan ukuran teks/ikon). */}
            <Container className="relative flex flex-col items-center justify-center gap-6 overflow-hidden pt-14 pb-8 text-center md:min-h-svh md:justify-between md:gap-6 md:pt-[clamp(5.5rem,14vh,9rem)] md:pb-[clamp(5.5rem,12vh,7.5rem)]">
              {/* Wordmark literal, bukan projects("eyebrow"): ini nama brand,
                  sama di kedua bahasa. Ukurannya BUKAN di sini — `.home-work-heading`
                  di globals.css membawa font-size !important (lihat komentar di
                  sana), jadi utility text-[...] di className manapun tidak akan
                  pernah berpengaruh. leading tetap diatur lewat utility karena
                  aturan global itu cuma menyetel font-size. */}
              <h2 className="home-work-heading relative w-full font-rampart-one font-display leading-[0.95] font-medium tracking-[-0.03em] md:leading-[0.82]">
                Dwi Studio
              </h2>
              {/* Pengganti animasi kucing Rive: dulu foto dibingkai kartu
                  (border + bg-card + shadow + rounded + padding), sekarang
                  background-like — bingkainya dibuang total, dan tepi
                  persegi panjang fotonya dilarutkan lewat mask radial
                  (.home-work-photo di globals.css, pola yang sama dengan
                  fade grid .interior-page::before) supaya foto terasa
                  menyatu ke kertas, bukan tertempel sebagai kotak UI. Lebar
                  mobile/sm dikembalikan ke ukuran kartu yang LAMA (bukan
                  dibesarkan) — bingkai yang hilang saja sudah cukup membuatnya
                  terasa lebih besar/lepas, dan mobile tidak punya ruang lebih
                  (lihat catatan di Container di atas). md: tetap dibesarkan,
                  desktop punya ruang untuk itu.

                  TETAP flex-item BIASA di antara judul & badge, BUKAN
                  `!absolute top-1/2 -translate-y-1/2` — itu menengahkan pada
                  50% TINGGI VIEWPORT, yang cuma aman kalau viewport-nya
                  kebetulan cukup tinggi; di layar pendek (atau browser
                  di-zoom) 50% itu jatuh tepat di area judul atau badge, dan
                  keduanya bertumpuk — persis bug yang pernah dilaporkan.
                  Sebagai flex-item, urutan dokumen (bukan posisi absolut)
                  yang menjamin foto tidak PERNAH bertumpuk dengan judul atau
                  badge tetangganya.

                  Itu bukan jaminan semuanya muat, dua mode HorizontalScroll
                  beda perilaku saat kepanjangan: mode statis (viewport
                  pendek/reduced-motion) membiarkan section-nya jadi lebih
                  tinggi dari satu layar dan halaman biasa yang scroll — aman.
                  Mode gerak (viewport >= 640px tinggi) MEMATOK panel ini di
                  dalam `<ul class="h-svh">` milik HorizontalScroll; kalau
                  total tinggi kontennya melebihi itu, kelebihannya bukan
                  mendorong section jadi lebih tinggi, tapi kepotong di tepi
                  viewport — persis yang ditemukan lewat CDP di 390x700
                  sebelum lebar foto ini dikembalikan (lihat komentar
                  Container). h-auto: lebar tetap, tinggi mengikuti rasio asli
                  1200x800 supaya foto tidak pernah terpotong RASIONYA
                  sendiri — beda soal dari panel yang kepotong viewport. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
              <img
                aria-hidden
                src="/images/dwi.png"
                alt=""
                className="home-work-photo h-auto w-[clamp(14rem,70vw,19rem)] opacity-90 sm:w-[clamp(18rem,32vw,26rem)] md:w-[clamp(34rem,52vw,50rem)]"
              />

              {/* Social proof: badge kapabilitas, bukan CMS — dasar panel "Work".
                  Chip bordered ber-font Rampart One, seirama dengan display
                  font judul "Work" di atasnya, bukan font-mono kecil generik.

                  3 kolom sejak mobile (bukan 1): grid-cols-3 menghasilkan 2
                  baris x 3 kolom untuk 6 badge, alih-alih 6 baris bertumpuk.

                  justify-items-stretch (bukan center) + li w-full DI BAWAH md:
                  tanpa ini tiap <li> selebar isinya sendiri ("Kepemilikan Penuh"
                  jauh lebih lebar dari kolom ~112px-nya) dan justify-items-center
                  cuma menengahkan lebar itu — hasilnya pil-pil bertabrakan ke
                  kolom tetangga, bahkan meluber keluar viewport di kedua tepi.
                  Diukur lewat CDP elementFromPoint sebelum diperbaiki. Dengan
                  w-full, teks yang tak muat memilih baris kedua DI DALAM
                  pilnya sendiri — bukan meluber ke luar. Di md ke atas kolom
                  sudah longgar, jadi dikembalikan ke w-auto + center biasa. */}
              <ul className="relative z-[1] grid grid-cols-2 items-center justify-items-stretch gap-2 sm:grid-cols-3 sm:gap-2.5 md:justify-items-center md:gap-3.5">
                {WORK_BADGES.map(({ Icon, en, id }) => (
                  <li
                    key={en}
                    className="border-line bg-card/70 text-ink/80 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full border px-3 py-2 sm:min-h-10 sm:px-3.5 md:w-auto md:gap-2.5 md:px-6 md:py-3"
                  >
                    <Icon
                      aria-hidden
                      className="h-3.5 w-3.5 shrink-0 md:h-5 md:w-5"
                      strokeWidth={1.6}
                    />

                    <span className="font-mono text-center text-[10px] leading-tight font-medium tracking-[0.03em] md:font-rampart-one md:font-display md:text-base md:leading-none md:font-normal md:tracking-normal">
                      {locale === "id" ? id : en}
                    </span>
                  </li>
                ))}
              </ul>
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
        <Section
          id="services"
          className="border-line border-t !bg-white"
        >
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
  );
}
