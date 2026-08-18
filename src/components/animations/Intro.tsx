"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const MIN_SPIN_MS = 1000; // ring berputar sendiri dulu, sebelum berubah jadi emblem

/**
 * Scope modul, bukan sessionStorage: nilainya bertahan selama navigasi
 * client-side dan hilang saat hard reload — persis perilaku yang diinginkan.
 * Tanpa ini intro terputar ulang tiap ganti bahasa, karena layout [locale]
 * remount saat segmen locale berubah. Di server selalu false (efek tidak
 * pernah jalan di sana), jadi markup SSR dan hidrasi pertama tetap cocok.
 */
let hasPlayed = false;

/**
 * Intro cinematic, hitam-putih. Urutannya mengikuti referensi:
 *
 *   0.0  ring arc berputar
 *   1.0  ring memudar membesar, emblem lingkaran solid masuk mengecil ke ukuran
 *   1.6  "DWI" tersingkap lewat width wipe, seolah keluar dari balik emblem
 *   2.2  garis pembatas vertikal memanjang
 *   2.7  "STUDIO" tersingkap
 *   3.8  seluruh lockup memudar dan mengecil
 *   4.3  tirai tiga panel membuka vertikal dari tengah, berurutan
 *        halaman menyusul: header, konten, lalu Value Rail sebagai beat terakhir
 */
export default function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Dibaca saat render supaya panel tidak sempat terlihat satu frame saat
  // berpindah halaman. Return-nya di bawah, setelah semua hook dipanggil.
  const skip = hasPlayed;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const main = document.querySelector("main");
    const header = document.querySelector("header");
    const rails = Array.from(document.querySelectorAll("[data-rail]"));
    // Semua elemen halaman yang disembunyikan sementara oleh intro.
    const revealTargets = [main, header, ...rails].filter(Boolean) as Element[];

    const tl = gsap.timeline({ paused: true });

    const hide = () => {
      tl.kill();
      root.style.display = "none";
      document.documentElement.style.overflow = "";
      // Wajib: kalau failsafe menyela di tengah, elemen-elemen ini bisa
      // tertinggal pada opacity 0 dan seluruh halaman jadi tak terlihat.
      if (revealTargets.length) gsap.set(revealTargets, { clearProps: "all" });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hide();
      return;
    }

    // Failsafe: apa pun yang macet — font tidak pernah siap, timeline tersendat
    // di perangkat lambat — intro tetap menyingkir DAN kunci scroll dilepas.
    const failsafe = window.setTimeout(hide, 9000);
    tl.eventCallback("onComplete", hide);

    hasPlayed = true;
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);
    const spinner = q("[data-spinner]");
    const emblem = q("[data-emblem]");
    const dwi = q("[data-dwi]");
    const divider = q("[data-divider]");
    const studio = q("[data-studio]");
    const stage = q("[data-stage]");
    const panels = root.querySelectorAll("[data-panel]");

    // Disembunyikan sebelum timeline mulai; tirai sudah menutupi layar,
    // jadi tidak ada kedipan.
    gsap.set(main, { autoAlpha: 0, y: 20 });
    gsap.set(header, { autoAlpha: 0, y: -10 });
    gsap.set(rails, { autoAlpha: 0 });

    // Posisi absolut dipakai supaya beat-nya persis seperti referensi.
    // Angkanya relatif terhadap referensi dikurangi 1 detik, karena satu detik
    // pertama sudah dipakai gerbang "ring berputar".
    tl.to(spinner, { autoAlpha: 0, scale: 1.3, duration: 0.4, ease: "power2.out" }, 0)
      .to(emblem, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" }, 0)
      // width wipe: lebar alaminya diukur saat tween mulai, jadi tidak ada
      // angka piksel keras yang bakal meleset kalau font atau teks berubah.
      .to(
        dwi,
        {
          width: () => (dwi ? dwi.scrollWidth : 0),
          marginLeft: 14,
          autoAlpha: 1,
          duration: 0.7,
          ease: "expo.out",
        },
        0.6,
      )
      .to(
        divider,
        {
          height: 16,
          marginLeft: 16,
          marginRight: 16,
          autoAlpha: 1,
          duration: 0.5,
          ease: "expo.out",
        },
        1.2,
      )
      .to(
        studio,
        {
          width: () => (studio ? studio.scrollWidth : 0),
          autoAlpha: 0.9,
          duration: 0.7,
          ease: "expo.out",
        },
        1.7,
      )
      .to(stage, { autoAlpha: 0, scale: 0.96, duration: 0.8, ease: "power2.inOut" }, 2.8)
      // Tirai membuka dari tengah ke atas dan bawah, berurutan kiri ke kanan.
      .to(panels, { scaleY: 0, duration: 1.2, stagger: 0.12, ease: "power4.inOut" }, 3.3)
      .to(header, { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out" }, 3.7)
      .to(main, { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out" }, 3.9)
      // Value Rail masuk paling akhir: elemen tanda tangan situs jadi penutup.
      .to(rails, { autoAlpha: 1, duration: 1, ease: "power2.out" }, 4.2);

    // Ring berputar sampai font benar-benar siap — progres nyata, bukan hiasan.
    // Menyingkap wordmark sebelum font termuat akan terlihat berganti bentuk,
    // dan width wipe-nya akan salah ukur.
    Promise.all([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, MIN_SPIN_MS)),
    ]).then(() => tl.play());

    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
      document.documentElement.style.overflow = "";
      if (revealTargets.length) gsap.set(revealTargets, { clearProps: "all" });
    };
  }, []);

  if (skip) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="intro-failsafe fixed inset-0 z-[70] flex items-center justify-center"
    >
      {/* Tiga panel tirai. Sengaja span kosong: murni permukaan, bukan konten.
          Jahitan hairline di antaranya wajib ada — panel hitam yang membuka di
          atas halaman yang juga hitam tidak akan terlihat sama sekali tanpa
          garis pemisah yang ikut menyusut. */}
      <div className="divide-paper/10 absolute inset-0 flex divide-x">
        <span data-panel className="bg-ink h-full flex-1 origin-center" />
        <span data-panel className="bg-ink h-full flex-1 origin-center" />
        <span data-panel className="bg-ink h-full flex-1 origin-center" />
      </div>

      <div data-stage className="relative z-10 flex items-center">
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          {/* Putarannya dipegang CSS di elemen dalam, sementara GSAP memakai
              transform di pembungkusnya — kalau ditumpuk di elemen yang sama,
              animasi CSS menang atas inline style dan skala GSAP hilang. */}
          <span data-spinner className="absolute flex items-center justify-center">
            <span className="intro-ring border-paper/15 border-t-paper block h-7 w-7 rounded-full border-2" />
          </span>

          <span
            data-emblem
            className="bg-paper flex h-8 w-8 scale-[0.4] items-center justify-center rounded-full opacity-0"
          >
            <span className="font-display text-ink text-sm leading-none font-extrabold">D</span>
          </span>
        </span>

        <span
          data-dwi
          className="text-paper w-0 overflow-hidden text-[13px] font-semibold tracking-[0.35em] whitespace-nowrap uppercase opacity-0"
        >
          Dwi
        </span>

        <span data-divider className="bg-paper/40 h-0 w-px opacity-0" />

        <span
          data-studio
          className="text-paper/90 w-0 overflow-hidden text-[13px] font-medium tracking-[0.35em] whitespace-nowrap uppercase opacity-0"
        >
          Studio
        </span>
      </div>
    </div>
  );
}
