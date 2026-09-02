"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { CustomEase } from "gsap/CustomEase";
import { INTRO_REPLAY_EVENT, replayIntro, waitForIntroGate } from "@/lib/intro";

gsap.registerPlugin(CustomEase);

// Easing khas Apple/Awwwards, persis cubic-bezier(0.16, 1, 0.3, 1).
const FLUID = CustomEase.create("dwiFluid", "0.16, 1, 0.3, 1");
// Untuk tirai: masuk dan keluar sama beratnya.
const SHUTTER = CustomEase.create("dwiShutter", "0.77, 0, 0.175, 1");


let hasPlayed = false;

export default function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [runId, setRunId] = useState(0);
  const [playing, setPlaying] = useState(false);
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
    const startedAt = performance.now();

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

    timer.id = window.setTimeout(hide, 6500);
    tl.eventCallback("onComplete", hide);

    hasPlayed = true;
    document.documentElement.style.overflow = "hidden";
    setPlaying(true);
    window.scrollTo(0, 0);

    const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);
    const emblem = q("[data-emblem]");
    const stage = q("[data-stage]");
    const logo = q("[data-logo]");
    const divider = q("[data-divider]");
    const dwi = q("[data-word='dwi'] > span");
    const studio = q("[data-word='studio'] > span");
    const pulse = q("[data-pulse]");
    const meter = q("[data-meter]");
    const micro = q("[data-micro]");
    const percent = q("[data-percent]");
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
    gsap.set(emblem, { autoAlpha: 0, scale: 0.72 });
    gsap.set([dwi, studio], { xPercent: -105, autoAlpha: 0 });
    gsap.set(divider, { scaleY: 0, autoAlpha: 0 });
    gsap.set([micro, percent], { autoAlpha: 0, y: 5 });
    gsap.set(pulse, { autoAlpha: 0.35, scale: 0.82 });
    gsap.set(meter, { scaleX: 0, transformOrigin: "left center" });
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

    // Timeline dipadatkan: intro terasa niat, tapi tidak menahan pengunjung
    // terlalu lama. Gate asset di bawah yang menentukan kapan shutter boleh
    // membuka; animasi lockup berjalan sambil aset awal halaman dipanaskan.
    tl.to(
        meter,
        {
          scaleX: 1,
          duration: 2.35,
          ease: "none",
          // Angka persen dibaca dari progress tween INI sendiri (`this`,
          // makanya function biasa bukan arrow) — bukan penghitung waktu
          // terpisah — supaya angkanya selalu persis sinkron dengan lebar
          // bar, bukan cuma kebetulan terlihat mirip. Bar ini sendiri yang
          // dipakai sebagai satu-satunya sumber progres (lihat komentar di
          // atas: tidak ada sinyal loading aset yang sungguhan granular),
          // jadi tween-nya sudah pasti mencapai progress 1 = 100% sebelum
          // addPause di bawah menahan reveal.
          onUpdate: function (this: gsap.core.Tween) {
            if (percent) percent.textContent = `${Math.round(this.progress() * 100)}%`;
          },
        },
        0,
      )
      .to(pulse, { autoAlpha: 1, scale: 1.12, duration: 1.15, ease: FLUID }, 0)
      .to(emblem, { autoAlpha: 1, scale: 1, duration: 0.45, ease: FLUID }, 0.12)
      .to(dwi, { xPercent: 0, autoAlpha: 1, duration: 0.58, ease: FLUID }, 0.48)
      .to(divider, { scaleY: 1, autoAlpha: 1, duration: 0.38, ease: FLUID }, 0.9)
      .to(studio, { xPercent: 0, autoAlpha: 1, duration: 0.58, ease: FLUID }, 1.08)
      .to([micro, percent], { autoAlpha: 1, y: 0, duration: 0.36, ease: FLUID }, 1.52)
      .to(stage, { x: 0, duration: 1.12, ease: FLUID }, 0.48)
      .to(stage, { autoAlpha: 0, scale: 0.97, duration: 0.38, ease: FLUID }, 2.05)
      .addPause(2.36)
      // Fase 6 — shutter: tiga kolom membuka bergantian arah (top/bottom/top
      // lewat transform-origin di JSX), delay 0 / 0.1 / 0.2s, bukan menyusut
      // seragam ke tengah.
      .to(panels[0]!, { scaleY: 0, duration: 0.82, ease: SHUTTER }, ">")
      .to(panels[1]!, { scaleY: 0, duration: 0.82, ease: SHUTTER }, "<0.06")
      .to(panels[2]!, { scaleY: 0, duration: 0.82, ease: SHUTTER }, "<0.06")
      // Halaman dinyalakan di 3.2, saat tirai MASIH tertutup rapat. Wajib
      // sebelum 3.3: kalau <main> baru muncul setelah panel pergi, yang
      // tersingkap cuma latar body yang kini sewarna panel bg-cream — tirainya
      // bergerak tapi tidak terlihat sama sekali. Foto harus sudah menunggu di
      // belakang tirai, persis seperti referensi yang tidak pernah
      // menyembunyikan #main-hero. set(), bukan to(): fade di sini tak ada
      // gunanya karena penontonnya masih tertutup panel.
      .set(main, { autoAlpha: 1 }, "<")
      // Fase 7 — hero reveal: background zoom-out 1.18 -> 1 (2,2 detik, mulai
      // bersamaan tirai), navbar turun dari -15px, headline naik dari 30px.
      .to(heroBg, { scale: 1, duration: 1.35, ease: FLUID }, "<")
      .to(header, { autoAlpha: 1, y: 0, duration: 0.72, ease: FLUID }, "<0.24")
      .to(headline, { y: 0, duration: 0.72, ease: FLUID }, "<0.08");

    tl.play(0);
    waitForIntroGate(startedAt).then(() => {
      if (!cancelled) tl.play();
    });

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
      // Root memakai permukaan sistem yang sama dengan halaman supaya intro
      // pertama terasa bersih, bukan bidang gelap terpisah.
      className="intro-failsafe bg-cream fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
    >
      {/* Tiga panel tirai arsitektural. Bergantian arah, bukan menyusut ke
          tengah: kolom 1 & 3 origin-top (ditarik ke atas), kolom 2 origin-bottom
          (ditarik ke bawah) — origin diatur lewat transform-origin CSS biasa,
          properti yang tidak disentuh xPercent/scale GSAP, jadi aman digabung.
          Tanpa garis jahitan: sekarang yang tersingkap adalah foto hero, bukan
          halaman gelap, jadi tepi tiap panel sudah terbaca dari kontrasnya
          sendiri. -mx-px pada panel tengah menutup celah sub-pixel yang bisa
          muncul saat lebar viewport ganjil. */}
      <div className="absolute inset-0 flex">
        <span data-panel className="bg-cream h-full flex-1 origin-top will-change-transform" />
        <span
          data-panel
          className="bg-cream -mx-px h-full flex-1 origin-bottom will-change-transform"
        />
        <span data-panel className="bg-cream h-full flex-1 origin-top will-change-transform" />
      </div>

      <div data-stage className="relative z-10 flex items-center will-change-transform">
        <span
          data-pulse
          className="border-line absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border md:h-36 md:w-36"
        />
        {/* Kotaknya kini LANDSCAPE 3:2, mengikuti proporsi logo.svg (1264x843).
            Kalau dipaksa persegi seperti emblem lama, logonya gepeng atau
            terpotong. centerOffset() mengukur kotak ini apa adanya, jadi
            perubahan ukuran tidak perlu penyesuaian di timeline. */}
        <span
          data-logo
          className="relative flex h-9 w-[3.375rem] shrink-0 items-center justify-center md:h-12 md:w-[4.5rem]"
        >
          {/* logo.svg, bukan Emblem lagi. Berkasnya adalah plat putih penuh
              dengan mark digunting di dalamnya, jadi di atas permukaan kertas
              ia terbaca sebagai kartu putih yang tetap menyambung ke bahasa
              visual situs ini. rounded-card supaya sudutnya sama dengan
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
          <span className="text-ink block text-[17px] font-semibold tracking-[0.35em] whitespace-nowrap uppercase opacity-0 will-change-transform md:text-[26px]">
            Dwi
          </span>
        </span>

        <span
          data-divider
          className="bg-line mx-4 h-5 w-px origin-center opacity-0 will-change-transform md:mx-5 md:h-7"
        />

        <span data-word="studio" className="overflow-hidden">
          <span className="text-ink/90 block text-[17px] font-medium tracking-[0.35em] whitespace-nowrap uppercase opacity-0 will-change-transform md:text-[26px]">
            Studio
          </span>
        </span>
      </div>

      {/* Label + persen langsung di atas bar, bar di bawahnya — satu blok
          bottom-anchored, bukan lagi digantung di bawah lockup logo (dulu
          `data-micro` ada di dalam data-stage lewat absolute+top-full).
          Dipindah keluar sekalian membebaskannya dari alasan absolute yang
          lama: tidak ada lagi risiko ikut terukur centerOffset().

          w-fit, bukan max-w-52: lebar blok (dan makanya lebar bar, w-full
          di dalamnya) sekarang murni mengikuti lebar baris label+persen di
          atasnya, bukan angka tebakan tetap yang bisa lebih lebar atau lebih
          sempit dari teksnya sendiri — sama di desktop maupun mobile karena
          ini lebar intrinsik teks, bukan breakpoint. justify-between sengaja
          dilepas (diganti gap-3 biasa) supaya persennya menempel rapat di
          ujung label, bukan direntangkan sampai tepi kontainer. */}
      <div className="absolute inset-x-6 bottom-8 z-10 mx-auto flex w-fit flex-col gap-2 md:bottom-10">
        <div className="flex items-center gap-3">
          <span
            data-micro
            className="text-ink-soft/75 font-mono text-[9px] tracking-[0.22em] whitespace-nowrap uppercase opacity-0"
          >
            Preparing the first frame
          </span>
          {/* tabular-nums: lebar digit seragam, jadi angka yang naik dari
              0% ke 100% tidak menggeser posisi teks di sebelahnya tiap frame. */}
          <span
            data-percent
            className="text-ink-soft/75 font-mono text-[9px] tracking-[0.1em] tabular-nums opacity-0"
          >
            0%
          </span>
        </div>
        <div className="bg-line h-px w-full overflow-hidden">
          <span data-meter className="bg-ink block h-full w-full origin-left scale-x-0" />
        </div>
      </div>
    </div>
  );
}
