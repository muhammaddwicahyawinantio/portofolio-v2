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

    el.classList.add("wm", `wm-${cls}`);
    let io: IntersectionObserver | null = null;
    let raf = 0;

    if (preview) {
      raf = requestAnimationFrame(() => el.classList.add("is-visible"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              el.classList.add("is-visible");
              io?.unobserve(el);
            }
          }
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
      );
      io.observe(el);
    }

    return () => {
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
