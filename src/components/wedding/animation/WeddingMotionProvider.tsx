"use client";
import { type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { ScrollTrigger } from "@/lib/gsap";
import "lenis/dist/lenis.css";

// Feeds Lenis' scroll position to ScrollTrigger each frame (mirrors the site's
// SmoothScroll bridge) so parallax reads the smoothed position, not native.
function Bridge() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

/**
 * Wraps the public invitation in Lenis smooth scroll when enabled. Disabled in
 * the admin preview (no smooth scroll / ScrollTrigger inside the device frame —
 * that nested-scroller setup is the one architecture we deliberately avoid) and
 * when the invitation opts out. Lenis respects reduced-motion by default.
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
  if (preview || !smoothScroll) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.09 }}>
      <Bridge />
      {children}
    </ReactLenis>
  );
}
