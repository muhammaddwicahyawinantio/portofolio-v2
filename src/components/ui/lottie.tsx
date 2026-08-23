"use client";

import { useEffect, useState } from "react";
import { LottieLight } from "lottie-react";

/**
 * Pembungkus tipis lottie-react. Ada karena dua hal:
 *
 * 1. Paketnya tidak membawa banner "use client", jadi komponennya tidak bisa
 *    dipanggil langsung dari server component seperti halaman beranda.
 * 2. Reduced-motion. Sisa situs ini menghormatinya (Reveal, Intro, Lenis,
 *    HorizontalScroll), jadi yang ini juga — tapi animasinya tetap DIMUAT dan
 *    digambar, hanya berhenti di frame pertama. Menghapusnya sama sekali cuma
 *    meninggalkan lubang di tata letak.
 *
 * `LottieLight`, bukan `Lottie`: renderer svg saja dan tanpa mesin ekspresi —
 * build terkecil dari tiga yang ada, dan ini cuma urutan PNG.
 *
 * `src` menunjuk ke JSON, bukan `.lottie`: arsip .lottie itu zip dan tidak ada
 * yang membongkarnya, baik di paket ini maupun di lottie-web. Aset di
 * public/lottie/* karenanya sudah diekstrak jadi data.json + PNG-nya, rata di
 * satu folder. Kalau nanti mengganti animasinya, ekstraksinya butuh DUA
 * penyesuaian yang tidak kelihatan sampai dijalankan:
 *
 * - `assets[].e` harus 0. Eksport dotLottie menandainya 1 ("embedded") karena
 *   player-nya menukar `p` jadi data-URI saat membongkar zip; lottie-web
 *   melihat e=1 lalu memakai `p` apa adanya dan MENGABAIKAN assetsPath —
 *   hasilnya <image href="image_0.png"> yang nyasar ke root situs.
 * - Layer solid latarnya dibuang. Animasi ini membawa "White Solid 1"
 *   3840x2160 yang mengecat bidang putih di belakang kucingnya; di atas kertas
 *   krem itu jadi kotak putih besar yang menabrak judulnya.
 */
export default function Lottie({ src, className }: { src: string; className?: string }) {
  // null = belum tahu preferensinya. Dirender setelah mount supaya `autoplay`
  // (yang load-time, bukan reaktif) sudah benar sejak animasinya dimuat.
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    // Ukurannya dipasang di pembungkus, BUKAN di <LottieLight>. Paketnya
    // menyuntik `@layer lottie-react { :where(.lottie-display){width:100%} }`
    // lewat <style> yang masuk setelah CSS Tailwind, dan urutan @layer menang
    // atas spesifisitas — jadi `w-[...]` di elemen itu selalu kalah. Di sini
    // .lottie-display tinggal memenuhi kotak yang kita tentukan.
    <div className={className} aria-hidden>
      {/* Kotak kosong sampai preferensinya diketahui: tanpa ini tata letak
          melompat saat mount. */}
      {reduced !== null && (
        <LottieLight
          // autoplay load-time, jadi pergantian preferensi harus memuat ulang.
          key={String(reduced)}
          src={src}
          // Wajib. Tanpa ini lottie-web menulis <image href="image_0.png"> apa
          // adanya dan browser meresolvenya ke URL HALAMAN, bukan ke folder
          // JSON-nya — animasinya termuat tapi kosong melompong.
          assetsPath={src.slice(0, src.lastIndexOf("/") + 1)}
          loop={!reduced}
          autoplay={!reduced}
        />
      )}
    </div>
  );
}
