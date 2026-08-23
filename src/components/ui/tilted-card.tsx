"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring, type SpringOptions } from "motion/react";

/** Nilai spring asli dari ReactBits — berat dan lambat, bukan pegas cepat. */
const SPRING: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };

/**
 * Tilt 3D mengikuti kursor, diadaptasi dari TiltedCard milik ReactBits
 * (reactbits.dev/r/TiltedCard-TS-TW).
 *
 * Aslinya komponen khusus gambar: <img> berukuran tetap, tooltip yang mengekor
 * kursor, dan teks peringatan "not optimized for mobile" berbahasa Inggris yang
 * ikut ter-render. Yang dipertahankan di sini hanya mekanismenya — perspective,
 * spring rotateX/rotateY, dan scale saat hover — supaya bisa membungkus konten
 * apa pun, bukan cuma gambar.
 *
 * Amplitudo default diturunkan dari 14 ke 9 derajat dan scale dari 1.1 ke 1.03:
 * angka aslinya dipasang untuk kartu gambar 300px, dan pada kartu berisi teks
 * harga serta daftar fitur, kemiringan sebesar itu bikin susah dibaca.
 */
export default function TiltedCard({
  children,
  rotateAmplitude = 9,
  scaleOnHover = 1.03,
}: {
  children: ReactNode;
  rotateAmplitude?: number;
  scaleOnHover?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const scale = useSpring(1, SPRING);
  // Situs ini menghormati reduced-motion di Reveal, Lenis, dan Intro; tilt
  // ikut aturan yang sama. Hook tetap dipanggil tanpa syarat, cuma efeknya
  // yang dimatikan.
  const still = useReducedMotion();

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return (
    <div
      ref={ref}
      className="h-full [perspective:800px]"
      // Tidak ada handler sentuh: di layar sentuh kartu diam saja, jadi tidak
      // perlu banner peringatan seperti versi aslinya.
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el || still) return;
        const rect = el.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;
        rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
        rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
      }}
      onMouseEnter={() => {
        if (!still) scale.set(scaleOnHover);
      }}
      onMouseLeave={reset}
    >
      <motion.div
        className="h-full will-change-transform [transform-style:preserve-3d]"
        style={{ rotateX, rotateY, scale }}
      >
        {children}
      </motion.div>
    </div>
  );
}
