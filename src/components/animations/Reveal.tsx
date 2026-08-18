"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Naik + fade saat masuk viewport, sekali jalan.
 * `targets` opsional: selector anak yang dianimasikan berurutan (mis. "li"),
 * supaya markup daftar tetap valid tanpa membungkus tiap baris.
 *
 * Tanpa preferensi reduced motion, matchMedia tidak menjalankan apa pun dan
 * elemen tetap pada keadaan akhirnya — jadi konten tidak pernah tersembunyi.
 */
export default function Reveal({
  children,
  targets,
  delay = 0,
  className,
}: {
  children: ReactNode;
  targets?: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const items = targets ? el.querySelectorAll(targets) : el;

      gsap.fromTo(
        items,
        { y: 36, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          delay,
          ease: "power3.out",
          stagger: targets ? 0.08 : 0,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    });

    return () => mm.revert();
  }, [targets, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
