import type { CSSProperties } from "react";

/**
 * Full-bleed photo background with a guaranteed-visible fallback: a dark
 * scrim + mood gradient (built from the invitation's own palette) always
 * renders; the photo URL is layered UNDERNEATH it, only when supplied. CSS
 * paints multi-layer background-image independently per layer, so a 404'd
 * photo (dead seed path, etc.) never blanks the gradient above it.
 */
export function photoBackgroundStyle(url: string | null | undefined): CSSProperties {
  const scrim =
    "linear-gradient(180deg, rgba(10,9,8,0.25) 0%, rgba(10,9,8,0.45) 55%, rgba(10,9,8,0.7) 100%)";
  const mood =
    "radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--w-accent) 28%, transparent) 0%, transparent 70%), " +
    "linear-gradient(160deg, var(--w-secondary) 0%, var(--w-primary) 100%)";
  return {
    backgroundColor: "var(--w-bg)",
    backgroundImage: url ? `${scrim}, ${mood}, url(${url})` : `${scrim}, ${mood}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
