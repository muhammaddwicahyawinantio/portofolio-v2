"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Gerak hero: parallax kedalaman dan transisi header.
 *
 * Dua laju berbeda saat tirai cream naik menutupi latar sticky: latar
 * (background) mendorong-masuk pelan (scale), teks (foreground) keluar ke atas
 * lebih cepat sambil memudar. Kesan kedalaman — latar mendorong maju, judul
 * lewat lebih dekat lalu pergi.
 *
 * Headless (return null), pola sama seperti Intro: menemukan elemennya lewat
 * data-attribute alih-alih membungkus, jadi Hero tetap server component.
 *
 * Target SENGAJA bukan elemen yang disentuh Intro ([data-hero-bg] scale,
 * [data-headline] y): laju scroll ini menulis transform di WADAH terpisah
 * ([data-hero-photo], [data-hero-text]) supaya dua sistem tidak berebut properti
 * transform yang sama.
 *
 * Rentang scroll dipatok angka (0 → tinggi viewport), bukan trigger element:
 *  itu position:sticky, dan pengukuran start/end ScrollTrigger dari elemen
 * sticky sering meleset. Satu layar pertama = persis durasi tirai menutup hero.
 */
export default function HeroParallax() {
  useEffect(() => {
    const photo = document.querySelector<HTMLElement>("[data-hero-photo]");
    const text = document.querySelector<HTMLElement>("[data-hero-text]");
    if (!photo || !text) return;

    // Header beralih ke cream selama hero masih di layar. Ini bukan gerak,
    // melainkan keterbacaan, jadi tetap berlaku untuk reduced-motion.
    const headerTint = ScrollTrigger.create({
      // start:-1, BUKAN 0. ScrollTrigger menghitung aktif sebagai
      // `scroll > start`, jadi pada scrollY tepat 0 — keadaan halaman saat
      // dibuka — trigger ber-start 0 justru TIDAK aktif dan kelasnya tak pernah
      // menempel. Diverifikasi: dengan start 0, header tetap ink di atas hero.
      start: -1,
      // Dikurangi tinggi bilah header: yang harus berganti warna itu pita paling
      // atas layar, dan lembar `.paper` sudah lewat di bawah header sekitar 72px
      // sebelum ia menutup hero sepenuhnya.
      end: () => window.innerHeight - 72,
      invalidateOnRefresh: true,
      toggleClass: { targets: document.documentElement, className: "over-hero" },
    });

    const mm = gsap.matchMedia();
    // Hanya jalan kalau pengguna tidak meminta reduced motion — jadi tidak ada
    // fallback manual yang perlu ditulis: tanpa preferensi ini, transform tak
    // pernah disetel dan hero diam total.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          start: 0,
          end: () => window.innerHeight,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      // ease:"none" wajib untuk scrub — progres scroll yang jadi kurvanya.
      tl.to(photo, { scale: 1.06, ease: "none" }, 0).to(
        text,
        { yPercent: -18, autoAlpha: 0.15, ease: "none" },
        0,
      );
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => {
      headerTint.kill();
      // kill() tidak selalu melepas kelas yang sedang menempel; kalau tertinggal,
      // header jadi cream di atas halaman kertas setelah navigasi klien.
      document.documentElement.classList.remove("over-hero");
      mm.revert();
    };
  }, []);

  return null;
}
