"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Horizontal gallery. Desktop (≥768px, motion allowed, public page): the track
 * is pinned and scrolls sideways as you scroll down. Mobile / reduced-motion /
 * admin preview: a plain touch-swipeable horizontal row — never traps scroll.
 * Children should be shrink-0 cards.
 */
export default function HorizontalScrollSection({
  preview = false,
  children,
}: {
  preview?: boolean;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preview) return;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      // Recalculate once images have loaded (widths change layout).
      const imgs = Array.from(track.querySelectorAll("img"));
      let left = imgs.length;
      const onLoad = () => {
        if (--left <= 0) ScrollTrigger.refresh();
      };
      imgs.forEach((img) => {
        if (img.complete) onLoad();
        else img.addEventListener("load", onLoad, { once: true });
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [preview]);

  // Mobile / preview default: horizontal swipe. Desktop pin overrides via GSAP.
  return (
    <div ref={wrapRef} className="overflow-x-auto md:overflow-x-hidden">
      <div
        ref={trackRef}
        className="flex gap-3 pb-2 md:flex-nowrap"
        style={{ willChange: "transform" }}
      >
        {children}
      </div>
    </div>
  );
}
