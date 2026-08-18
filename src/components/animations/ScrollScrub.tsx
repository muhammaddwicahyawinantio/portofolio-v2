"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Menautkan satu tween GSAP ke progres scroll section terdekat.
 * Dipakai untuk parallax (yPercent) maupun peredupan lapisan (opacity/scale) —
 * mekanismenya sama, hanya properti tujuannya beda.
 *
 * start/end dibungkus clamp() supaya section paling atas halaman tidak lahir
 * dengan progress > 0; tanpa itu hero sudah tergeser sebelum user menggulir.
 */
export default function ScrollScrub({
  children,
  to,
  start = "clamp(top bottom)",
  end = "clamp(bottom top)",
  className,
}: {
  children: ReactNode;
  to: gsap.TweenVars;
  start?: string;
  end?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(el, {
        ...to,
        ease: "none",
        scrollTrigger: { trigger: el.closest("section") ?? el, start, end, scrub: true },
      });
    });

    return () => mm.revert();
    // `to` sengaja tidak di-deps: object literal baru tiap render akan
    // membangun ulang ScrollTrigger setiap kali.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
