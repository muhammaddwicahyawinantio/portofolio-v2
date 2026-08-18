"use client";

import { useEffect, useRef, useState } from "react";
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
 *   1.0  ring mengecil-memudar, emblem lingkaran putih solid masuk
 *   1.6  "DWI" meluncur keluar dari balik emblem, di balik mask
 *   2.2  garis pemisah memanjang (scaleY)
 *   2.7  "STUDIO" meluncur keluar di kanan garis
 *   3.8  seluruh lockup fade-out + micro scale-down
 *   4.3  tirai 3 panel membuka dari tengah, stagger 120ms
 *        halaman menyusul: zoom-out 1.1 -> 1.0, header, lalu Value Rail
 *
 * Semua gerak memakai transform/opacity saja supaya tetap di GPU. Lockup sudah
 * berada pada lebar akhirnya sejak awal; yang bergeser adalah panggungnya,
 * jadi emblem tetap terlihat di tengah tanpa satu pun animasi properti layout.
 */
export default function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [runId, setRunId] = useState(0);

  // Dibaca saat render supaya panel tidak sempat terlihat satu frame saat
  // berpindah halaman. Return-nya di bawah, setelah semua hook dipanggil.
  const skip = hasPlayed;

  useEffect(() => {
    const onReplay = () => {
      hasPlayed = false;
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
    const rails = Array.from(document.querySelectorAll("[data-rail]"));
    const revealTargets = [main, header, ...rails].filter(Boolean) as Element[];

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
      // Wajib: kalau failsafe menyela di tengah, elemen-elemen ini bisa
      // tertinggal pada opacity 0 dan seluruh halaman jadi tak terlihat.
      if (revealTargets.length) gsap.set(revealTargets, { clearProps: "all" });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hide();
      return;
    }

    timer.id = window.setTimeout(hide, 9000);
    tl.eventCallback("onComplete", hide);

    hasPlayed = true;
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);
    const spinner = q("[data-spinner]");
    const emblem = q("[data-emblem]");
    const stage = q("[data-stage]");
    const logo = q("[data-logo]");
    const divider = q("[data-divider]");
    const dwi = q("[data-word='dwi'] > span");
    const studio = q("[data-word='studio'] > span");
    const panels = root.querySelectorAll("[data-panel]");

    // Reset eksplisit ke keadaan awal. Wajib untuk replay: setelah satu putaran
    // semua elemen tertinggal di keadaan akhir, jadi tween berikutnya tidak
    // punya jarak untuk bergerak. Kelas Tailwind tetap dipakai sebagai keadaan
    // awal SSR supaya tidak ada kedipan sebelum efek jalan.
    root.style.display = "";
    gsap.set(spinner, { autoAlpha: 1, scale: 1 });
    gsap.set(emblem, { autoAlpha: 0, scale: 0.4 });
    gsap.set([dwi, studio], { xPercent: -105, autoAlpha: 0 });
    gsap.set(divider, { scaleY: 0, autoAlpha: 0 });
    gsap.set(stage, { autoAlpha: 1, scale: 1 });
    gsap.set(panels, { scaleY: 1 });

    gsap.set(main, { autoAlpha: 0, scale: 1.1 });
    gsap.set(header, { autoAlpha: 0, y: -10 });
    gsap.set(rails, { autoAlpha: 0 });

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

    tl.to(spinner, { autoAlpha: 0, scale: 0.4, duration: 0.45, ease: FLUID }, 0)
      .to(emblem, { autoAlpha: 1, scale: 1, duration: 0.55, ease: FLUID }, 0.05)
      .to(dwi, { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: FLUID }, 0.6)
      .to(divider, { scaleY: 1, autoAlpha: 1, duration: 0.5, ease: FLUID }, 1.2)
      .to(studio, { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: FLUID }, 1.7)
      // Panggung kembali ke tengah sepanjang teks tersingkap, jadi lockup
      // terasa tumbuh tanpa satu pun animasi properti layout.
      .to(stage, { x: 0, duration: 1.6, ease: FLUID }, 0.6)
      .to(stage, { autoAlpha: 0, scale: 0.96, duration: 0.8, ease: FLUID }, 2.8)
      .to(panels, { scaleY: 0, duration: 1.2, stagger: 0.12, ease: SHUTTER }, 3.3)
      .to(header, { autoAlpha: 1, y: 0, duration: 1, ease: FLUID }, 3.7)
      .to(main, { autoAlpha: 1, scale: 1, duration: 1.6, ease: FLUID }, 3.7)
      .to(rails, { autoAlpha: 1, duration: 1, ease: FLUID }, 4.2);

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
      className="intro-failsafe fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Tiga panel tirai. Jahitan hairline wajib: panel hitam yang membuka di
          atas halaman yang juga hitam tidak akan terlihat tanpa garis pemisah
          yang ikut menyusut bersamanya. */}
      <div className="absolute inset-0 flex divide-x divide-white/10">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            data-panel
            className="h-full flex-1 origin-center bg-black will-change-transform"
          />
        ))}
      </div>

      <div data-stage className="relative z-10 flex items-center will-change-transform">
        <span data-logo className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          {/* Putaran dipegang CSS di elemen dalam; GSAP memakai transform di
              pembungkusnya. Kalau ditumpuk di elemen yang sama, animasi CSS
              menang atas inline style dan skala GSAP hilang. */}
          <span data-spinner className="absolute will-change-transform">
            <span className="intro-ring block h-7 w-7 rounded-full border-2 border-white/15 border-t-white" />
          </span>

          <span
            data-emblem
            className="flex h-8 w-8 scale-[0.4] items-center justify-center rounded-full bg-white opacity-0 will-change-transform"
          >
            {/* Tiga batang menaik: gema dari tiga panel tirai dan tangga nilai
                situs. Geometris murni supaya tetap tajam di 18px. */}
            <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" fill="#000000" aria-hidden>
              <rect x="3" y="9" width="3" height="6" rx="0.5" />
              <rect x="7.5" y="6" width="3" height="9" rx="0.5" />
              <rect x="12" y="3" width="3" height="12" rx="0.5" />
            </svg>
          </span>
        </span>

        <span data-word="dwi" className="ml-3.5 overflow-hidden">
          <span className="block translate-x-[-105%] text-[13px] font-semibold tracking-[0.35em] whitespace-nowrap text-white uppercase opacity-0 will-change-transform">
            Dwi
          </span>
        </span>

        <span
          data-divider
          className="mx-4 h-4 w-px origin-center scale-y-0 bg-white/40 opacity-0 will-change-transform"
        />

        <span data-word="studio" className="overflow-hidden">
          <span className="block translate-x-[-105%] text-[13px] font-medium tracking-[0.35em] whitespace-nowrap text-white/90 uppercase opacity-0 will-change-transform">
            Studio
          </span>
        </span>
      </div>
    </div>
  );
}
