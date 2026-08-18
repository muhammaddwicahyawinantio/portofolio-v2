"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const MIN_SPIN_MS = 1200; // ring berputar sendiri dulu, sebelum wordmark masuk

/**
 * Scope modul, bukan sessionStorage: nilainya bertahan selama navigasi
 * client-side dan hilang saat hard reload — persis perilaku yang diinginkan.
 * Tanpa ini intro terputar ulang tiap ganti bahasa, karena layout [locale]
 * remount saat segmen locale berubah. Di server selalu false (efek tidak
 * pernah jalan di sana), jadi markup SSR dan hidrasi pertama tetap cocok.
 */
let hasPlayed = false;

/**
 * Intro cinematic: ring berputar di layar hitam, lalu wordmark "DWI STUDIO"
 * masuk dari kiri bersama garis pembatas, lalu overlay membesar sambil memudar
 * sementara halaman ikut membesar dari 0.95 ke 1 — pandangan seolah menembus
 * tirai, bukan tirainya yang digeser.
 *
 * Hitam-putih saja, tanpa nada abu-abu.
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

    const tl = gsap.timeline({ paused: true });

    const hide = () => {
      tl.kill();
      root.style.display = "none";
      document.documentElement.style.overflow = "";
      // Wajib: kalau failsafe menyela di tengah zoom, <main> bisa tertinggal
      // pada opacity 0 dan seluruh halaman jadi tak terlihat.
      if (main) gsap.set(main, { clearProps: "all" });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hide();
      return;
    }

    // Failsafe: apa pun yang macet — font tidak pernah siap, timeline tersendat
    // di perangkat lambat — intro tetap menyingkir DAN kunci scroll dilepas.
    const failsafe = window.setTimeout(hide, 6500);
    tl.eventCallback("onComplete", hide);

    hasPlayed = true;
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const ring = root.querySelector<HTMLElement>("[data-ring]");
    const word = root.querySelector<HTMLElement>("[data-word]");
    const divider = root.querySelector<HTMLElement>("[data-divider]");

    tl.set(word, { autoAlpha: 0, x: -10 })
      .set(divider, { autoAlpha: 0 })
      .set(main, { autoAlpha: 0, scale: 0.95 })
      // Ring mundur ke latar, wordmark dan garis masuk bersamaan.
      .to(ring, { opacity: 0.3, duration: 0.5, ease: "power2.out" })
      .to(word, { autoAlpha: 1, x: 0, duration: 0.8, ease: "power2.out" }, "<")
      .to(divider, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "<")
      // Tirai membesar sambil memudar; halaman membesar ke ukuran penuh.
      .to(root, { autoAlpha: 0, scale: 1.15, duration: 1, ease: "power4.inOut" }, "+=0.7")
      .to(main, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "expo.out" }, "<");

    // Ring berputar sampai font benar-benar siap — progres nyata, bukan hiasan.
    // Menyingkap wordmark sebelum font termuat akan terlihat berganti bentuk.
    Promise.all([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, MIN_SPIN_MS)),
    ]).then(() => tl.play());

    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
      document.documentElement.style.overflow = "";
      if (main) gsap.set(main, { clearProps: "all" });
    };
  }, []);

  if (skip) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="intro-failsafe bg-ink fixed inset-0 z-[70] flex items-center justify-center"
    >
      <div className="flex items-center gap-4">
        {/* Putaran ring dipegang CSS, jadi GSAP bebas memakai opacity tanpa
            berebut properti transform dengan animasinya. */}
        <span
          data-ring
          className="intro-ring border-paper/15 border-t-paper h-8 w-8 rounded-full border-2"
        />
        <span
          data-word
          className="text-paper font-display text-base font-semibold tracking-[0.35em] whitespace-nowrap uppercase opacity-0 md:text-lg"
        >
          Dwi Studio
        </span>
        <span data-divider className="bg-paper/40 h-4 w-px opacity-0" />
      </div>
    </div>
  );
}
