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
import RiveAnimation from "@/components/ui/RiveAnimation";

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
            {/* gap-[19rem]: bukan whitespace kosong — ini ruang yang memang
                dibutuhkan kucing Rive (h-[clamp(20rem,88vw,24rem)]) di
                belakang judul & badge supaya tidak menimpa badge. Diukur via
                CDP: tanpa gap ini, jarak judul-ke-badge cuma 32px sementara
                kucingnya 320-384px — pasti bertabrakan berapa pun top-nya. */}
            <Container className="relative flex flex-col items-center justify-center gap-[19rem] overflow-hidden pt-20 pb-12 text-center md:min-h-svh md:justify-between md:gap-0 md:pt-[clamp(5.5rem,14vh,9rem)] md:pb-[clamp(5.5rem,12vh,7.5rem)]">
              {/* Wordmark literal, bukan projects("eyebrow"): ini nama brand,
                  sama di kedua bahasa. Ukurannya BUKAN di sini — `.home-work-heading`
                  di globals.css membawa font-size !important (lihat komentar di
                  sana), jadi utility text-[...] di className manapun tidak akan
                  pernah berpengaruh. leading tetap diatur lewat utility karena
                  aturan global itu cuma menyetel font-size. */}
              <h2 className="home-work-heading relative z-[1] w-full font-rampart-one font-display leading-[0.95] font-medium tracking-[-0.03em] md:leading-[0.82]">
                Dwi Studio
              </h2>
              {/* Container mobile sekarang tinggi-mengikuti-konten (~350-375px,
                  bukan min-h-svh), tapi kucing dominan (20-24rem = 320-384px)
                  tetap lebih tinggi dari seluruh panel — beberapa overlap
                  dengan judul/badge tidak terhindarkan secara matematis kalau
                  panelnya pendek DAN kucingnya besar sekaligus. Diselesaikan
                  seperti desktop: z-0 di BELAKANG judul & badge (keduanya
                  z-[1]), jadi teks badge tetap terbaca penuh di atasnya —
                  bukan "tertutup", cuma siluet kucing terlihat di baliknya.
                  top-1/2 + -translate-y-1/2 menengahkan pada tinggi container
                  APA PUN tanpa perlu menghitung ulang persentase manual. */}
              <RiveAnimation
                src="/rive/cat-run.riv"
                stateMachines="State Machine 1"
                className="!absolute top-1/2 left-1/2 z-0 h-[clamp(20rem,88vw,24rem)] w-[clamp(20rem,88vw,24rem)] -translate-x-1/2 -translate-y-1/2 opacity-90 sm:top-[22%] sm:h-[clamp(25rem,46vw,39rem)] sm:w-[clamp(25rem,46vw,39rem)] sm:translate-y-0"
                ariaLabel="Running cat animation"
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
<ul className="relative z-[1] grid grid-cols-2 items-center justify-items-stretch gap-1.5 sm:grid-cols-3 sm:gap-2 md:justify-items-center md:gap-3">
  {WORK_BADGES.map(({ Icon, en, id }) => (
    <li
      key={en}
      className="border-line bg-card/70 text-ink/80 flex min-h-8 w-full items-center justify-center gap-1 rounded-full border px-2 py-1.5 sm:min-h-9 sm:px-2.5 md:w-auto md:gap-2 md:px-5 md:py-2.5"
    >
      <Icon aria-hidden className="h-3 w-3 shrink-0 md:h-[18px] md:w-[18px]" strokeWidth={1.6} />
      <span className="font-mono text-center text-[9px] leading-tight font-medium tracking-[0.03em] md:font-rampart-one md:font-display md:text-sm md:leading-none md:font-normal md:tracking-normal">
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
