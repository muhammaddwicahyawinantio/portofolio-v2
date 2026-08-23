"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { entranceClass } from "@/lib/wedding/animation-presets";

/**
 * Whole-section entrance reveal driven by the section's chosen preset. Adds the
 * hidden `.wm-*` state via JS ONLY when motion is allowed (so no-JS and
 * reduced-motion always show final content), then reveals:
 * - public page: when the section scrolls into view (IntersectionObserver).
 * - admin preview: immediately on mount, replaying when the preset changes.
 *
 * Never-stuck guarantee without killing the scroll effect: the safety timer
 * only reveals a section that is actually on screen (an observer hiccup) —
 * off-screen sections are left to scroll-reveal so the entrance still plays.
 */
export default function SectionMotion({
  preset,
  preview = false,
  className,
  children,
}: {
  preset: string;
  preview?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cls = entranceClass(preset);
    if (!cls) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = () => el.classList.add("is-visible");
    const cleanupClasses = () => el.classList.remove("wm", `wm-${cls}`, "is-visible");
    el.classList.add("wm", `wm-${cls}`);

    if (preview) {
      const raf = requestAnimationFrame(reveal);
      return () => {
        cancelAnimationFrame(raf);
        cleanupClasses();
      };
    }

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return cleanupClasses;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal();
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);

    // Safety net: if a section that is ON SCREEN hasn't revealed (observer
    // hiccup), reveal it. Off-screen sections are left alone so their entrance
    // still plays when scrolled to.
    const failsafe = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) reveal();
    }, 2500);

    return () => {
      window.clearTimeout(failsafe);
      io.disconnect();
      cleanupClasses();
    };
  }, [preset, preview]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
