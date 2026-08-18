"use client";

import { type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { ScrollTrigger } from "@/lib/gsap";
import "lenis/dist/lenis.css";

/**
 * Harus komponen anak: useLenis baru mengembalikan instance kalau dipanggil
 * di dalam context ReactLenis. Callback-nya jalan tiap frame scroll, jadi
 * ScrollTrigger membaca posisi Lenis, bukan posisi scroll native yang telat.
 */
function ScrollTriggerBridge() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  // respectReducedMotion default true di Lenis, jadi tidak ditangani manual.
  return (
    <ReactLenis root options={{ lerp: 0.09 }}>
      <ScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
