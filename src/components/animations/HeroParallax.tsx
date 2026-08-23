"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Parallax kedalaman untuk hero. Dua laju berbeda saat tirai cream naik
 * menutupi foto sticky: foto (background) mendorong-masuk pelan (scale), teks
 * (foreground) keluar ke atas lebih cepat sambil memudar. Kesan kedalaman —
 * latar mendorong maju, judul lewat lebih dekat lalu pergi.
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
 * hero itu position:sticky, dan pengukuran start/end ScrollTrigger dari elemen
 * sticky sering meleset. Satu layar pertama = persis durasi tirai menutup hero.
 */
export default function HeroParallax() {
  useEffect(() => {
    const photo = document.querySelector<HTMLElement>("[data-hero-photo]");
    const text = document.querySelector<HTMLElement>("[data-hero-text]");
    if (!photo || !text) return;

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

    return () => mm.revert();
  }, []);

  return null;
}
