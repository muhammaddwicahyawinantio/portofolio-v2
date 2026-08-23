"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { CustomEase } from "gsap/CustomEase";
import { INTRO_REPLAY_EVENT, replayIntro } from "@/lib/intro";

gsap.registerPlugin(CustomEase);

// Easing khas Apple/Awwwards, persis cubic-bezier(0.16, 1, 0.3, 1).
const FLUID = CustomEase.create("dwiFluid", "0.16, 1, 0.3, 1");
// Untuk tirai: masuk dan keluar sama beratnya.
const SHUTTER = CustomEase.create("dwiShutter", "0.77, 0, 0.175, 1");

const MIN_SPIN_MS = 1000;

/**
 * Scope modul, bukan sessionStorage: bertahan selama navigasi client-side dan
 * hilang saat hard reload. Tanpa ini intro terputar ulang tiap ganti bahasa,
 * karena layout [locale] remount saat segmen locale berubah. Di server selalu
 * false (efek tidak pernah jalan di sana), jadi SSR dan hidrasi tetap cocok.
 */
let hasPlayed = false;

/**
 * Intro cinematic "DWI STUDIO".
 *
 *   0.0  arc spinner berputar di layar hitam pekat
 *   1.0  ring mengecil-memudar, kartu logo (public/logo.svg) masuk
 *   1.6  "DWI" meluncur keluar dari balik logo, di balik mask
 *   2.2  garis pemisah memanjang (scaleY)
 *   2.7  "STUDIO" meluncur keluar di kanan garis
 *   3.0  tagline (hero.line1-3) fade-up di bawah lockup
 *   3.8  seluruh lockup fade-out + micro scale-down
 *   4.3  tirai 3 panel membuka dari tengah, stagger 120ms
 *        halaman menyusul: zoom-out 1.1 -> 1.0, header, lalu Value Rail
 *
 * Semua gerak memakai transform/opacity saja supaya tetap di GPU. Lockup sudah
 * berada pada lebar akhirnya sejak awal; yang bergeser adalah panggungnya,
 * jadi logo tetap terlihat di tengah tanpa satu pun animasi properti layout.
 *
 * Timeline-nya TIDAK diubah sama sekali di rev. ini — hanya isi dan ukuran
 * elemennya. Gerakannya persis yang sudah ada.
 */
export default function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [runId, setRunId] = useState(0);
  const [playing, setPlaying] = useState(false);
  const hero = useTranslations("hero");
  const lenis = useLenis();

  // Dibekukan sebagai state, BUKAN `const skip = hasPlayed` yang dibaca ulang
  // tiap render: efek di bawah menulis hasPlayed = true lalu setPlaying(true),
  // dan pembacaan ulang akan membuat render berikutnya mengembalikan null —
  // intro mencabut dirinya sendiri sebelum timeline sempat main. Nilai awal
  // tetap dibaca saat mount, jadi remount karena ganti bahasa tetap melewati
  // intro; replay meresetnya lewat setSkip(false) di bawah.
  const [skip, setSkip] = useState(hasPlayed);

  /**
   * Kunci scroll lapis kedua. overflow:hidden saja tidak cukup: Lenis membaca
   * wheel/touch sendiri dan menggerakkan scroll secara programatik, jadi tanpa
   * stop() halaman masih bisa digulir di balik tirai yang belum membuka.
   * Efek terpisah karena instance Lenis bisa datang setelah timeline dimulai —
   * memasukkannya ke dependency timeline akan mengulang intro dari awal.
   */
  useEffect(() => {
    if (!playing || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [playing, lenis]);

  useEffect(() => {
    const onReplay = () => {
      hasPlayed = false;
      setSkip(false);
      setRunId((n) => n + 1);
    };

    window.addEventListener(INTRO_REPLAY_EVENT, onReplay);
    const w = window as Window & { dwiIntroReplay?: () => void };
    w.dwiIntroReplay = replayIntro;

    return () => {
      window.removeEventListener(INTRO_REPLAY_EVENT, onReplay);
      delete w.dwiIntroReplay;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const main = document.querySelector("main");
    const header = document.querySelector("header");
    // heroBg = pembungkus foto hero. headline = judul halaman yang sedang
    // aktif, apa pun rute yang pertama kali dibuka pengunjung.
    const heroBg = document.querySelector<HTMLElement>("[data-hero-bg]");
    const headline = document.querySelector<HTMLElement>("[data-headline]");
    // headline SENGAJA tidak masuk sini, dibersihkan terpisah di bawah lewat
    // clearProps:"transform" saja. clearProps:"all" pada gsap.set() yang
    // berdiri sendiri (bukan sambungan tween) menghapus SELURUH inline style
    // elemen, bukan cuma yang disentuh Intro. Pelajaran dari bug nyata: dulu
    // headline dibungkus efek kinetic yang menulis visibility:hidden langsung
    // ke DOM, dan clearProps:"all" di sini membongkarnya sehingga <h1> asli
    // muncul di belakang kanvasnya — teks dobel. Efek itu sudah tidak ada,
    // tapi aturannya tetap dipertahankan: elemen manapun yang inline style-nya
    // juga dikelola sistem lain di luar Intro tidak boleh kena clearProps:"all"
    // yang menyapu semuanya.
    const revealTargets = [main, header, heroBg].filter(Boolean) as Element[];

    const tl = gsap.timeline({ paused: true });

    // Wadah, bukan variabel biasa: hide() perlu bisa membatalkan timernya
    // sendiri padahal timer itu baru dibuat setelah hide() didefinisikan.
    const timer: { id?: number } = {};
    // Dimatikan oleh cleanup: tanpa ini, timer dari putaran sebelumnya bisa
    // menutup intro yang baru saja di-replay.
    let cancelled = false;

    const hide = () => {
      if (cancelled) return;
      // Failsafe wajib dibatalkan di sini juga, bukan hanya di cleanup —
      // setelah timeline selesai normal, timernya masih menggantung.
      if (timer.id !== undefined) window.clearTimeout(timer.id);
      tl.kill();
      root.style.display = "none";
      document.documentElement.style.overflow = "";
      // Melepas kunci Lenis lewat efek pendamping di atas.
      setPlaying(false);
      // Wajib: kalau failsafe menyela di tengah, elemen-elemen ini bisa
      // tertinggal pada opacity 0 dan seluruh halaman jadi tak terlihat.
      if (revealTargets.length) gsap.set(revealTargets, { clearProps: "all" });
      // Dibersihkan terpisah dan hanya "transform": satu-satunya properti
      // yang pernah disentuh Intro di elemen ini, jadi inline style yang
      // ditulis sistem lain tidak ikut terhapus.
      if (headline) gsap.set(headline, { clearProps: "transform" });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hide();
      return;
    }

    timer.id = window.setTimeout(hide, 9000);
    tl.eventCallback("onComplete", hide);

    hasPlayed = true;
    document.documentElement.style.overflow = "hidden";
    setPlaying(true);
    window.scrollTo(0, 0);

    const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);
    const spinner = q("[data-spinner]");
    const emblem = q("[data-emblem]");
    const stage = q("[data-stage]");
    const logo = q("[data-logo]");
    const divider = q("[data-divider]");
    const dwi = q("[data-word='dwi'] > span");
    const studio = q("[data-word='studio'] > span");
    const tagline = q("[data-tagline]");
    // Array, bukan NodeList: tiap panel butuh delay sendiri (0 / 0.1 / 0.2s),
    // jadi diindeks satu-satu alih-alih di-stagger seragam.
    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-panel]"));

    // Reset eksplisit ke keadaan awal. Wajib untuk replay: setelah satu putaran
    // semua elemen tertinggal di keadaan akhir, jadi tween berikutnya tidak
    // punya jarak untuk bergerak.
    //
    // JSX sengaja TIDAK memakai kelas Tailwind translate-x-[...]/scale-[...]/
    // scale-y-0 pada elemen yang di-tween GSAP. Tailwind v4 menulis translate
    // dan scale ke properti CSS `translate`/`scale` yang terpisah dari
    // `transform`, sementara xPercent/scale/scaleY GSAP menulis ke `transform`.
    // Keduanya menumpuk (CSS translate + transform, bukan saling menggantikan),
    // jadi elemen akan tertahan di posisi tersembunyi selamanya walau GSAP
    // sudah selesai animasi ke 0 — persis bug "teks DWI STUDIO tidak terlihat".
    // opacity-0 tetap dipakai sebagai fallback SSR karena opacity satu
    // properti tunggal; GSAP autoAlpha menimpanya langsung, tidak menumpuk.
    root.style.display = "";
    gsap.set(spinner, { autoAlpha: 1, scale: 1 });
    gsap.set(emblem, { autoAlpha: 0, scale: 0.4 });
    gsap.set([dwi, studio], { xPercent: -105, autoAlpha: 0 });
    gsap.set(divider, { scaleY: 0, autoAlpha: 0 });
    gsap.set(tagline, { autoAlpha: 0, y: 8 });
    gsap.set(stage, { autoAlpha: 1, scale: 1 });
    gsap.set(panels, { scaleY: 1 });

    // Fase 7 disusun sebagai tiga gerak independen, bukan satu <main> yang
    // di-scale sekaligus: background zoom, navbar slide, headline slide.
    // <main> hanya disembunyikan sampai sesaat SEBELUM tirai membuka, bukan
    // sampai sesudahnya — lihat tl.set() di bawah.
    gsap.set(main, { autoAlpha: 0 });
    gsap.set(header, { autoAlpha: 0, y: -15 });
    if (heroBg) gsap.set(heroBg, { scale: 1.18 });
    if (headline) gsap.set(headline, { y: 30 });

    /**
     * Geser panggung supaya emblem tepat di tengah layar selama teks masih
     * tersembunyi. Diukur saat dipakai, jadi ikut lebar teks dan font yang
     * benar-benar termuat.
     */
    const centerOffset = () => {
      if (!stage || !logo) return 0;
      const stageBox = stage.getBoundingClientRect();
      const logoBox = logo.getBoundingClientRect();
      return stageBox.width / 2 - (logoBox.left - stageBox.left + logoBox.width / 2);
    };

    gsap.set(stage, { x: centerOffset });

    // Posisi dan durasi disamakan persis dengan referensi. Angkanya dikurangi
    // 1 detik dari waktu absolut referensi, karena detik pertama sudah dipakai
    // gerbang "ring berputar sampai font siap".
    tl.to(spinner, { autoAlpha: 0, scale: 0.4, duration: 0.4, ease: FLUID }, 0)
      .to(emblem, { autoAlpha: 1, scale: 1, duration: 0.5, ease: FLUID }, 0)
      .to(dwi, { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: FLUID }, 0.6)
      .to(divider, { scaleY: 1, autoAlpha: 1, duration: 0.5, ease: FLUID }, 1.2)
      .to(studio, { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: FLUID }, 1.7)
      .to(tagline, { autoAlpha: 1, y: 0, duration: 0.6, ease: FLUID }, 2.0)
      // Panggung kembali ke tengah sepanjang teks tersingkap, jadi lockup
      // terasa tumbuh tanpa satu pun animasi properti layout.
      .to(stage, { x: 0, duration: 1.6, ease: FLUID }, 0.6)
      .to(stage, { autoAlpha: 0, scale: 0.96, duration: 0.8, ease: FLUID }, 2.8)
      // Fase 6 — shutter: tiga kolom membuka bergantian arah (top/bottom/top
      // lewat transform-origin di JSX), delay 0 / 0.1 / 0.2s, bukan menyusut
      // seragam ke tengah.
      .to(panels[0]!, { scaleY: 0, duration: 1.2, ease: SHUTTER }, 3.3)
      .to(panels[1]!, { scaleY: 0, duration: 1.2, ease: SHUTTER }, 3.4)
      .to(panels[2]!, { scaleY: 0, duration: 1.2, ease: SHUTTER }, 3.5)
      // Halaman dinyalakan di 3.2, saat tirai MASIH tertutup rapat. Wajib
      // sebelum 3.3: kalau <main> baru muncul setelah panel pergi, yang
      // tersingkap cuma latar body yang kini sewarna panel bg-cream — tirainya
      // bergerak tapi tidak terlihat sama sekali. Foto harus sudah menunggu di
      // belakang tirai, persis seperti referensi yang tidak pernah
      // menyembunyikan #main-hero. set(), bukan to(): fade di sini tak ada
      // gunanya karena penontonnya masih tertutup panel.
      .set(main, { autoAlpha: 1 }, 3.2)
      // Fase 7 — hero reveal: background zoom-out 1.18 -> 1 (2,2 detik, mulai
      // bersamaan tirai), navbar turun dari -15px, headline naik dari 30px.
      .to(heroBg, { scale: 1, duration: 2.2, ease: FLUID }, 3.3)
      .to(header, { autoAlpha: 1, y: 0, duration: 1, ease: FLUID }, 3.7)
      .to(headline, { y: 0, duration: 1, ease: FLUID }, 3.8);

    // Ring berputar sampai font benar-benar siap: menyingkap wordmark sebelum
    // font termuat akan terlihat berganti bentuk, dan offset tengahnya meleset.
    Promise.all([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, MIN_SPIN_MS)),
    ]).then(() => tl.play());

    return () => {
      cancelled = true;
      if (timer.id !== undefined) window.clearTimeout(timer.id);
      tl.kill();
      document.documentElement.style.overflow = "";
      if (revealTargets.length) gsap.set(revealTargets, { clearProps: "all" });
    };
  }, [runId]);

  if (skip) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      // overflow-hidden menahan teks yang meluncur supaya tidak pernah
      // menimbulkan scrollbar horizontal di layar sempit.
      //
      // SENGAJA tanpa bg-*: yang menutup layar HANYA ketiga panel di bawah.
      // Background di root ini adalah lapisan hitam opaque seukuran viewport
      // yang duduk di belakang panel, jadi tirai yang menyusut tidak menyingkap
      // apa pun sampai root-nya di-display:none — tirainya jadi tak terlihat.
      className="intro-failsafe fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
    >
      {/* Tiga panel tirai arsitektural. Bergantian arah, bukan menyusut ke
          tengah: kolom 1 & 3 origin-top (ditarik ke atas), kolom 2 origin-bottom
          (ditarik ke bawah) — origin diatur lewat transform-origin CSS biasa,
          properti yang tidak disentuh xPercent/scale GSAP, jadi aman digabung.
          Tanpa garis jahitan: sekarang yang tersingkap adalah foto hero, bukan
          halaman hitam, jadi tepi tiap panel sudah terbaca dari kontrasnya
          sendiri. -mx-px pada panel tengah menutup celah sub-pixel yang bisa
          muncul saat lebar viewport ganjil. */}
      <div className="absolute inset-0 flex">
        <span data-panel className="bg-charcoal h-full flex-1 origin-top will-change-transform" />
        <span
          data-panel
          className="bg-charcoal -mx-px h-full flex-1 origin-bottom will-change-transform"
        />
        <span data-panel className="bg-charcoal h-full flex-1 origin-top will-change-transform" />
      </div>

      <div data-stage className="relative z-10 flex items-center will-change-transform">
        {/* Kotaknya kini LANDSCAPE 3:2, mengikuti proporsi logo.svg (1264x843).
            Kalau dipaksa persegi seperti emblem lama, logonya gepeng atau
            terpotong. centerOffset() mengukur kotak ini apa adanya, jadi
            perubahan ukuran tidak perlu penyesuaian di timeline. */}
        <span
          data-logo
          className="relative flex h-9 w-[3.375rem] shrink-0 items-center justify-center md:h-12 md:w-[4.5rem]"
        >
          {/* Putaran dipegang CSS di elemen dalam; GSAP memakai transform di
              pembungkusnya. Kalau ditumpuk di elemen yang sama, animasi CSS
              menang atas inline style dan skala GSAP hilang. */}
          <span data-spinner className="absolute will-change-transform">
            <span className="intro-ring border-cream/15 border-t-cream block h-8 w-8 rounded-full border-2 md:h-10 md:w-10" />
          </span>

          {/* logo.svg, bukan Emblem lagi. Berkasnya adalah plat putih penuh
              dengan mark digunting di dalamnya, jadi di atas tirai charcoal ia
              terbaca sebagai KARTU putih — kebetulan itu justru menyambung ke
              bahasa kertas situs ini. rounded-card supaya sudutnya sama dengan
              permukaan lain; plat aslinya bersudut siku.
              Catatan: navbar masih memakai Emblem, jadi serah terima intro ke
              header tidak lagi memakai mark yang identik. */}
          <span data-emblem className="opacity-0 will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
            <img
              src="/logo.svg"
              alt=""
              className="rounded-card block h-9 w-[3.375rem] object-contain md:h-12 md:w-[4.5rem]"
            />
          </span>
        </span>

        <span data-word="dwi" className="ml-4 overflow-hidden md:ml-5">
          <span className="text-cream block text-[17px] font-semibold tracking-[0.35em] whitespace-nowrap uppercase opacity-0 will-change-transform md:text-[26px]">
            Dwi
          </span>
        </span>

        <span
          data-divider
          className="bg-cream/40 mx-4 h-5 w-px origin-center opacity-0 will-change-transform md:mx-5 md:h-7"
        />

        <span data-word="studio" className="overflow-hidden">
          <span className="text-cream/90 block text-[17px] font-medium tracking-[0.35em] whitespace-nowrap uppercase opacity-0 will-change-transform md:text-[26px]">
            Studio
          </span>
        </span>

        {/* absolute + top-full: tidak ikut lebar stage, jadi centerOffset()
            yang mengukur lockup logo+teks tidak terpengaruh baris ini.
            Tracking diturunkan 0.5em -> 0.3em saat ukurannya dinaikkan: pada
            13px, "ONE STUDIO. FIVE MEDIUMS." dengan tracking 0.5em lebih lebar
            dari layar ponsel dan akan terpotong overflow-hidden root. */}
        <span
          data-tagline
          className="text-cream/45 absolute top-full left-1/2 mt-4 -translate-x-1/2 text-[10px] font-semibold tracking-[0.3em] whitespace-nowrap uppercase opacity-0 will-change-transform md:mt-6 md:text-[13px]"
        >
          {hero("line1")} {hero("line2")} {hero("line3")}
        </span>
      </div>
    </div>
  );
}
