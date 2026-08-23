"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { entranceClass } from "@/lib/wedding/animation-presets";

/**
 * Whole-section entrance reveal driven by the section's chosen preset. Adds the
 * hidden `.wm-*` state via JS ONLY when motion is allowed (so no-JS and
 * reduced-motion always show final content), then reveals:
 * - public page: on scroll into view (IntersectionObserver, window).
 * - admin preview: immediately on mount, and replays when the preset changes,
 *   so picking a preset visibly does something without scroll gymnastics inside
 *   the device frame.
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
    el.classList.add("wm", `wm-${cls}`);

    let io: IntersectionObserver | null = null;
    let raf = 0;
    // Safety net: reveal no matter what after a short delay, so a section can
    // never stay hidden if the observer misfires on some mobile layout or the
    // browser lacks IntersectionObserver. Content is JS-gated hidden, so JS-off
    // already stays visible; this covers JS-runs-but-observer-fails.
    const failsafe = window.setTimeout(reveal, 1600);

    try {
      if (preview || typeof IntersectionObserver === "undefined") {
        raf = requestAnimationFrame(reveal);
      } else {
        io = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                reveal();
                io?.unobserve(el);
              }
            }
          },
          // Mobile-friendly: 10% visible, with a little bottom inset.
          { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
        );
        io.observe(el);
      }
    } catch {
      reveal();
    }

    return () => {
      window.clearTimeout(failsafe);
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
      el.classList.remove("wm", `wm-${cls}`, "is-visible");
    };
  }, [preset, preview]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
