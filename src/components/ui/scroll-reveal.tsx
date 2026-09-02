"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function ScrollReveal({
  children,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  className = "",
}: {
  children: string;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const words = useMemo(
    () =>
      children.split(/(\s+)/).map((word, index) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span className="word inline-block" key={index}>
            {word}
          </span>
        ),
      ),
    [children],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 768px)" },
      (ctx) => {
        if (!ctx.conditions?.motion) return;

        // Blur itu filter, dan filter tidak bisa dikomposit GPU: tiap frame
        // scroll memaksa REPAINT setiap kata. Aslinya efek ini juga memakai
        // ScrollTrigger KEDUA khusus blur, jadi satu paragraf memasang dua
        // pemicu yang menghitung hal yang sama. Di ponsel itu terasa langsung
        // sebagai scroll yang berat — jadi blurnya digabung ke tween opacity
        // yang sama, dan hanya hidup di layar lebar.
        const blur = enableBlur && !!ctx.conditions.wide;

        gsap.fromTo(
          el,
          { transformOrigin: "0% 50%", rotate: baseRotation },
          {
            ease: "none",
            rotate: 0,
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true },
          },
        );

        const wordElements = el.querySelectorAll<HTMLElement>(".word");

        gsap.fromTo(
          wordElements,
          // `willChange: "opacity"` milik sumbernya dibuang: ia dipasang di
          // keadaan AWAL dan tidak pernah dicabut, jadi tiap kata meninggalkan
          // satu lapisan komposit permanen. Untuk tween opacity murni browser
          // tidak butuh petunjuk itu, dan di ponsel puluhan lapisan yatim itu
          // yang memakan memori GPU.
          { opacity: baseOpacity, ...(blur ? { filter: `blur(${blurStrength}px)` } : null) },
          {
            ease: "none",
            opacity: 1,
            ...(blur ? { filter: "blur(0px)" } : null),
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              start: "top bottom-=20%",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
      },
    );

    return () => mm.revert();
  }, [enableBlur, baseOpacity, baseRotation, blurStrength]);

  return (
    <div ref={ref} className={className}>
      <p className="text-ink-soft text-lg leading-[1.7] text-pretty md:text-xl">{words}</p>
    </div>
  );
}
