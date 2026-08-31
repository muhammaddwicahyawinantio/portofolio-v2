"use client";
import { useState } from "react";

/**
 * <img> wrapper that never shows a broken-image icon. Falls back to a
 * gradient placeholder (built from the invitation's own --w-* palette) when
 * `src` is empty or fails to load — e.g. seed/demo data with dead local paths.
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
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
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
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
