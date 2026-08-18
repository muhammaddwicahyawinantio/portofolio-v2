"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { gsap } from "@/lib/gsap";
import { MEDIUMS } from "@/lib/mediums";

const WORDMARK = ["Dwi", "Studio"];
/**
 * Scope modul, bukan sessionStorage: nilainya bertahan selama navigasi
 * client-side dan hilang saat hard reload — persis perilaku yang diinginkan.
 * Tanpa ini intro terputar ulang tiap ganti bahasa, karena layout [locale]
 * remount saat segmen locale berubah. Di server selalu false (efek tidak
 * pernah jalan di sana), jadi markup SSR dan hidrasi pertama tetap cocok.
 */
let hasPlayed = false;
const MIN_SPIN_MS = 900; // supaya ring tidak sekadar berkedip di koneksi cepat

/**
 * Intro cinematic dalam tiga babak: ring berputar di layar ink, wordmark
 * tersingkap, lalu tangga nilai menyapu masuk dan ditarik kembali ke kiri
 * sampai tepat selebar Value Rail. Jadi tirainya tidak sekadar hilang —
 * ia mengendap menjadi elemen tetap situs.
 *
 * Wordmark sengaja tampil di atas ink polos, bukan di atas band: difference
 * blending nyaris tanpa kontras di atas abu-abu tengah tangga nilai.
 */
export default function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Dibaca saat render supaya panel tidak sempat terlihat satu frame saat
  // berpindah halaman. Return-nya di bawah, setelah semua hook dipanggil.
  const skip = hasPlayed;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const tl = gsap.timeline({ paused: true });

    const hide = () => {
      tl.kill();
      root.style.display = "none";
      document.documentElement.style.overflow = "";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hide();
      return;
    }

    // Failsafe: apa pun yang macet — font tidak pernah siap, timeline tersendat
    // di perangkat lambat — intro tetap menyingkir DAN kunci scroll dilepas.
    // Menyembunyikannya lewat CSS saja tidak cukup: halaman akan terlihat tapi
    // tidak bisa digulir.
    const failsafe = window.setTimeout(hide, 6500);
    tl.eventCallback("onComplete", hide);

    hasPlayed = true;
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const bands = root.querySelectorAll<HTMLElement>("[data-band]");
    const ring = root.querySelector<HTMLElement>("[data-ring]");
    const words = root.querySelectorAll<HTMLElement>("[data-word] > span");
    // Di mobile rail berupa strip bawah, jadi band ditarik habis ke kiri.
    const railPx = window.matchMedia("(min-width: 768px)").matches ? 28 : 0;

    tl.to(ring, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: "power2.in" })
      .to(words, { yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" })
      .to(words, { yPercent: -110, duration: 0.5, stagger: 0.06, ease: "power3.in" }, "+=0.4")
      // Tangga nilai menyapu masuk menutupi ink...
      .to(bands, { scaleX: 1, duration: 0.55, stagger: 0.05, ease: "power3.inOut" }, "-=0.2")
      // ...ink dilepas mumpung tertutup penuh, lalu band ditarik ke lebar rail.
      .set(root, { backgroundColor: "transparent" })
      .to(bands, {
        scaleX: railPx / window.innerWidth,
        duration: 0.85,
        stagger: 0.05,
        ease: "power4.inOut",
      });

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
    };
  }, []);

  if (skip) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="intro-failsafe bg-ink fixed inset-0 z-[70] overflow-hidden"
    >
      <div className="absolute inset-0">
        {MEDIUMS.map((m) => (
          <div
            key={m.key}
            data-band
            className={clsx("h-1/5 w-full origin-left scale-x-0", m.tone)}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <svg data-ring viewBox="0 0 48 48" className="intro-ring h-12 w-12">
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="#edeff2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="30 102"
          />
        </svg>

        {/* Ukuran teks dipasang di sini supaya gap antar kata ikut skala display. */}
        <div className="text-paper absolute flex gap-[0.22em] text-[clamp(2.25rem,9vw,7rem)]">
          {WORDMARK.map((word) => (
            <span key={word} data-word className="block overflow-hidden">
              <span className="font-display block translate-y-[110%] leading-[0.95] font-extrabold tracking-[-0.045em] uppercase">
                {word}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
