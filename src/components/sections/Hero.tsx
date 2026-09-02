import "server-only";
import { getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toStringArray } from "@/lib/media";
import Container from "@/components/ui/Container";
import { buttonClassName } from "@/components/ui/Button";
import RiveAnimation from "@/components/ui/RiveAnimation";
import HeroParallax from "@/components/animations/HeroParallax";
import ProposalButton from "@/components/ui/proposal-button";

/**
 * Bidang pembuka satu layar penuh. Sticky supaya section berikutnya menutupinya
 * saat digulir. Visual hero dibangun dari bentuk-bentuk CSS sehingga tetap tajam,
 * cepat, dan selalu memakai sistem warna Dwi Studio.
 *
 * data-hero-bg dibaca Intro: ia menahan visual di scale(1.18) lalu menariknya
 * kembali ke 1 saat tirai membuka. data-headline dipakai untuk slide-up-nya.
 * Keduanya dicari lewat document.querySelector, jadi atributnya WAJIB tetap
 * ada di elemen yang sama walau isi hero datang dari CMS.
 *
 * Dikelola dari CMS: Content → Hero Section (baris tunggal).
 */
export default async function Hero({ locale }: { locale: string }) {
  const id = locale === "id";
  const [row, t] = await Promise.all([prisma.heroSection.findFirst(), getTranslations("hero")]);

  // Fallback ke i18n, bukan ke string kosong: sebelum seed dijalankan tabelnya
  // masih kosong, dan hero adalah hal pertama yang dilihat pengunjung.
  const headline =
    (id ? row?.headline_id : row?.headline_en) ?? `${t("line1")}\n${t("line2")} ${t("line3")}`;
  const subheadline =
    (id ? row?.subheadline_id : row?.subheadline_en) ?? `${t("scroll")} · ${t("scrollHint")}`;
  const paragraph = id ? row?.paragraph_id : row?.paragraph_en;
  const metrics = toStringArray(id ? row?.metrics_id : row?.metrics_en);
  const ctaText = id ? row?.ctaText_id : row?.ctaText_en;

  // Satu baris teks = satu baris judul. Baris pertama tegak, sisanya italic —
  // bentuk yang sama dengan "One studio." / "Five mediums." sebelumnya, tapi
  // jumlah barisnya kini bebas diatur dari CMS.
  const lines = headline.split("\n").filter((line) => line.trim() !== "");

  return (
    <section className="sticky top-0 flex h-svh flex-col overflow-hidden">
      {/* Visual dibungkus sendiri karena Intro dan HeroParallax menulis transform
          pada dua lapisan berbeda. Tanpa backgroundImage dari admin, isinya
          cuma gradasi CSS (.hero-visual, background-image: none di globals.css)
          — inline style di sini menang atas itu begitu admin unggah gambar,
          jadi tidak perlu mengubah CSS-nya sama sekali.

          hidden md:block: background foto sengaja tidak aktif di mobile (<
          md) — layar sekecil itu foto cover jadi terlalu ramai di belakang
          headline. Elemennya tetap ada di DOM (bukan dihapus) supaya
          [data-hero-photo] tetap ditemukan HeroParallax; display:none cukup
          untuk menyembunyikannya, transform GSAP di elemen tersembunyi tidak
          berdampak apa pun secara visual. Mobile jatuh balik ke
          background-color polos .hero-canvas seperti sebelum fitur ini ada. */}
      <div data-hero-bg className="hero-canvas absolute inset-0 will-change-transform">
        <div
          data-hero-photo
          className="hero-visual absolute inset-0 hidden will-change-transform md:block"
          style={
            row?.backgroundImage
              ? {
                  backgroundImage: `url("${row.backgroundImage}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
          aria-hidden="true"
        />
      </div>

      {/* Bidang bawah sedikit lebih pekat agar judul tetap terbaca di semua ukuran. */}
      <div
        aria-hidden
        className="hero-bottom-scrim absolute inset-0"
      />

      {/* Pita atas menjaga navigasi terbaca di atas bidang gelap, termasuk saat
          pengguna meminta gerak dikurangi. */}
      <div
        aria-hidden
        className="hero-top-scrim absolute inset-x-0 top-0 h-56 md:h-48"
      />

      {/* Di desktop (md+) kucing digeser ke tengah-bawah hero, persis di tepi
          bawah section, dan diperkecil supaya muat berdampingan dengan teks
          tanpa menutupinya — cuma posisi & ukuran lewat className, seluruh
          logic klik/suara di RiveAnimation.tsx tidak disentuh sama sekali.
          Karena hit-area dan suara klik dihitung dari boundingClientRect
          elemen ini sendiri, keduanya otomatis ikut pindah & mengecil
          bareng canvasnya. Mobile & tablet (< md) tetap memakai posisi
          bottom-right lama.

          md:translate-y-[18%] dipakai lagi dari versi mobile: artboard .riv
          punya ruang kosong bawaan di bawah kaki kucing (untuk rentang
          animasi ekor/telinga), jadi bottom-0 saja masih menyisakan celah
          kosong di bawahnya — translate ini yang menutup celah itu, bukan
          mengubah canvas. Ruang amannya di atas (lihat pt/pb Container &
          data-hero-text di bawah) sengaja diatur supaya headline s/d metrik
          tidak pernah turun sampai menabrak kucing. */}
      <RiveAnimation
        src="/rive/angrycat.riv"
        className="!absolute bottom-0 left-1/2 z-[1] h-[clamp(11rem,48vw,17rem)] w-[clamp(11rem,48vw,17rem)] -translate-x-1/2 translate-y-[18%] opacity-95 sm:top-auto sm:right-[3rem] sm:bottom-0 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:h-[clamp(12rem,26vw,20rem)] sm:w-[clamp(12rem,26vw,20rem)] md:right-auto md:left-1/2 md:h-[clamp(8rem,15vw,13rem)] md:w-[clamp(8rem,15vw,13rem)] md:-translate-x-1/2 md:translate-y-[18%]"
        ariaLabel="Angry cat animation"
        clickSoundSrc="/soundeffect/blackcat-sound.mp3"
      />

      {/* pointer-events-none: Container ini `w-full`, jadi kotaknya terbentang
          sampai tepi kanan layar walau teksnya rata kiri. Tanpa ini, kotak
          kosong Container (dan anak-anaknya) menelan hover/klik sebelum
          sampai ke canvas Rive di bawahnya. Tombol CTA menyalakan lagi
          pointer-events-nya sendiri.

          pt-24/md:pt-48: pt-24 cukup untuk nav mobile, md:pt-48 menyamai
          tinggi .hero-top-scrim (md:h-48) — angka yang sama persis dipakai
          supaya headline mulai TEPAT di ujung zona aman nav, bukan di bawah
          nav. h-full (semua ukuran) dipakai supaya Container selalu
          setinggi section: dulu blok teks didorong lewat justify-end di
          section, begitu tinggi blok bawah bertambah — misalnya sesudah
          kucing pindah ke tengah-bawah — bagian ATAS blok ikut terdorong
          naik sampai ketutup navbar. */}
      <Container className="pointer-events-none relative z-10 h-full pt-24 pb-0 md:pt-48">
        {/* Lapisan foreground: seluruh blok teks keluar lebih cepat + memudar
            saat hero tertutup (HeroParallax). Bungkus sendiri supaya laju scroll
            menulis transform di sini, bukan di [data-headline] yang dikelola
            Intro.

            justify-between (semua ukuran, bukan cuma md+): headline/subheadline
            (grup atas) dan paragraf/CTA/metrik (grup bawah) dua flex-item
            terpisah di dalam kolom setinggi penuh (h-full), masing-masing
            dikunci ke jarak amannya sendiri (pt-24/md:pt-48 di atas,
            pb-64/md:pb-56 grup bawah di bawah) — bukan satu blok yang
            didorong dari bawah. Jarak di ANTARA keduanya yang menyusut/
            melebar sesuai tinggi viewport; headline & subheadline selalu
            tetap di atas, paragraf & social proof selalu turun ke dekat
            kucing di bawah, di mobile maupun desktop. */}
        <div
          data-hero-text
          className="will-change-transform flex h-full flex-col justify-between"
        >
          <div>
            <h1
              data-headline
              className="hero-heading font-display text-ink max-w-6xl font-semibold tracking-normal [overflow-wrap:anywhere] will-change-transform"
            >
              {lines.map((line, index) => (
                <span key={index} className={index === 0 ? "block" : "text-ink/65 block"}>
                  {line}
                </span>
              ))}
            </h1>

            <div className="text-ink/75 mt-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase md:mt-8">
              <span aria-hidden className="bg-ink/40 h-px w-10" />
              <p>{subheadline}</p>
            </div>
          </div>

          {/* pb-64/md:pb-56: >= tinggi maks kucing di ukuran masing-masing
              (mobile h-[...20rem] lebih besar dari desktop h-[...13rem])
              supaya grup ini berhenti sebelum menabraknya, dengan sedikit
              celah. Paragraf, tombol, dan metrik sengaja satu grup ini —
              rata kiri, berurut ke bawah, dan berhenti di atas kucing,
              bukan lagi ikut menempel langsung di bawah subheadline. */}
          <div className="pb-64 md:pb-56">
            {paragraph ? (
              <p className="text-ink/80 mt-5 max-w-xl text-sm leading-relaxed md:mt-0 md:text-base">
                {paragraph}
              </p>
            ) : null}

            {/* Tombol tanpa label atau tanpa proposal sama-sama tidak ada
                gunanya di layar. Dua file per bahasa (proposalPdf_id/_en),
                bukan satu ctaUrl — ProposalButton yang menentukan sendiri
                apakah perlu menampilkan pemilih bahasa (dua-duanya ada) atau
                langsung membuka satu-satunya yang tersedia. Gaya tombolnya
                disamakan dengan Button variant="cream" lewat buttonClassName,
                tapi elemennya harus <button onClick>, bukan <a href>, karena
                aksinya showModal() bukan navigasi.

                triggerIcon dioper sebagai elemen JSX yang SUDAH dirender
                (<Download .../>), bukan komponennya (Download saja) — Hero
                ini Server Component, dan React tidak bisa mengirim
                function/component reference ke Client Component
                (ProposalButton), cuma elemen JSX biasa. */}
            {ctaText && (row?.proposalPdf_id || row?.proposalPdf_en) ? (
              <ProposalButton
                label={ctaText}
                urlId={row?.proposalPdf_id}
                urlEn={row?.proposalPdf_en}
                downloadLabel={t("proposalDownload")}
                loadingLabel={t("proposalLoading")}
                errorLabel={t("proposalError")}
                closeLabel={t("proposalClose")}
                chooseLanguageLabel={t("proposalChooseLanguage")}
                chooseCloseLabel={t("proposalChooseClose")}
                languageIdLabel={t("proposalLanguageId")}
                languageEnLabel={t("proposalLanguageEn")}
                triggerIcon={<Download aria-hidden className="size-4" />}
                triggerClassName={buttonClassName({
                  variant: "cream",
                  // scale (bukan px-*/text-* dari SIZES): buttonClassName
                  // memakai clsx, bukan tailwind-merge — utility padding/font
                  // tambahan di sini akan BERTABRAKAN dengan punya SIZES.md
                  // pada breakpoint yang sama dan pemenangnya tergantung
                  // urutan di stylesheet, bukan urutan class di JSX (lihat
                  // komentar BASE/SIZES di Button.tsx). scale mengecilkan
                  // seluruh tombol tanpa menyentuh properti yang sudah
                  // dikuasai SIZES sama sekali, jadi tidak ada tabrakan.
                  // origin-left: menyusut ke arah kiri, bukan dari tengah,
                  // supaya tepi kiri tombol (yang rata kiri dengan teks di
                  // atasnya) tidak ikut bergeser.
                  className: "pointer-events-auto mt-5 origin-left scale-90",
                })}
              />
            ) : null}

            {/* Social proof: baris kecil di dasar blok teks, bukan badge besar —
                hero ini sudah punya headline raksasa, metrik cukup jadi catatan
                kaki yang meyakinkan, bukan elemen kedua yang bersaing perhatian.
                flex-col (bukan flex-wrap horizontal): satu metrik satu baris,
                berurut ke bawah, sama di mobile maupun desktop. */}
            {metrics.length > 0 ? (
              <ul className="text-ink/70 mt-8 flex flex-col items-start gap-2 font-mono text-[10px] tracking-[0.14em] uppercase md:mt-6 md:text-[11px]">
                {metrics.map((metric, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span aria-hidden className="bg-gold-ink h-1 w-1 shrink-0 rounded-full" />
                    {metric}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Container>

      <HeroParallax />
    </section>
  );
}
