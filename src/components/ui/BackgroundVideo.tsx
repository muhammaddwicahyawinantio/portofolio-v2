"use client";

import { useEffect, useRef } from "react";

/**
 * Video latar dekoratif: menutupi induknya, tanpa suara, tanpa kontrol.
 *
 * TANPA atribut `autoPlay`, dan itu inti komponen ini. Pemutarannya diminta dari
 * effect supaya tiga hal bisa dijamin sekaligus, yang tak satu pun bisa dicapai
 * lewat atribut di markup:
 *
 *  1. `muted` benar-benar menempel sebelum play(). React TIDAK merender atribut
 *     `muted` ke HTML SSR — ia hanya menyetel propertinya saat hidrasi. Video
 *     yang terbaca ber-audio akan ditolak kebijakan autoplay browser; yang
 *     di-mute selalu diizinkan.
 *  2. Reduced-motion mengurangi PENGULANGANNYA, bukan menghapus videonya. Klip
 *     tetap diputar sekali lalu berhenti di frame terakhir. Yang jadi keluhan
 *     preferensi itu gerak yang berputar tanpa henti, bukan gerak yang selesai.
 *  3. Tanpa JS, tak ada yang diunduh sama sekali (`preload="none"`) dan yang
 *     tampil poster-nya — bukan kotak kosong.
 *
 * ponytail: Hero.tsx masih memutar videonya sendiri lewat HeroParallax karena
 * elemen <video>-nya dipakai bersama parallax dan Intro lewat data-attribute.
 * Kalau nanti ketiganya perlu disentuh lagi, satukan ke komponen ini.
 */
export default function BackgroundVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.loop = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Ditolak = tidak apa-apa (mis. mode hemat daya menolak autoplay): poster
    // tetap terpampang. Tanpa .catch() penolakan itu jadi unhandled rejection.
    void video.play().catch(() => {});

    return () => video.pause();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={className}
    />
  );
}
