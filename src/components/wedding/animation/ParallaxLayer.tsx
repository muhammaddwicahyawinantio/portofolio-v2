"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Subtle vertical parallax drift as the element passes through the viewport.
 * Public page only (skipped in `preview`, and under reduced-motion via
 * gsap.matchMedia). Scrubbed to the (Lenis-smoothed) scroll position.
 */
export default function ParallaxLayer({
  amount = 8,
  preview = false,
  className,
  children,
}: {
  amount?: number;
  preview?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preview) return;
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.fromTo(
        el,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [preview, amount]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
