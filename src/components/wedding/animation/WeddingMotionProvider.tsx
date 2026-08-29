"use client";
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import "lenis/dist/lenis.css";

/**
 * Smooth scroll for the public invitation — DESKTOP ONLY. Lenis is initialized
 * imperatively in an effect (renders no wrapper, so SSR and first client render
 * are identical) and is skipped on:
 *  - the admin preview (nested scroller),
 *  - invitations that opt out,
 *  - touch devices (coarse pointer) — Lenis hijacks native touch scrolling on
 *    mobile, which left the page unable to scroll and hid everything below the
 *    cover. Native scroll must win on mobile; entrance/parallax animations use
 *    GSAP/IntersectionObserver and work fine on native scroll.
 */
export default function WeddingMotionProvider({
  smoothScroll,
  preview,
  children,
}: {
  smoothScroll: boolean;
  preview: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    if (preview || !smoothScroll) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [smoothScroll, preview]);

  return <>{children}</>;
}
