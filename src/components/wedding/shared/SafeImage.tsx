"use client";
import { useState } from "react";

/**
 * <img> wrapper that never shows a broken-image icon. Falls back to a
 * gradient placeholder (built from the invitation's own --w-* palette) when
 * `src` is empty or fails to load — e.g. seed/demo data with dead local paths.
 * Tracks WHICH src failed (not just a boolean) so a prop update to a new,
 * different src gets a fresh load attempt instead of staying stuck on the
 * placeholder — this matters because the admin's live preview swaps `src` in
 * place (no remount) as photos are uploaded.
 */
export default function SafeImage({
  src,
  alt,
  className = "",
  placeholderClassName,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null | undefined>(null);
  const failed = !src || failedSrc === src;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-[var(--w-secondary)]/35 to-[var(--w-primary)]/25 ${
          placeholderClassName ?? className
        }`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local public/ URLs only, needs onError fallback
    <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />
  );
}
