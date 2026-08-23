// Curated font choices for wedding templates. Keys are stored on the invitation;
// the CSS variables here are defined by next/font in src/app/undangan/layout.tsx.
// Plain data only (no next/font import) so client components can read it too.

export const DISPLAY_FONTS = [
  { key: "cormorant", label: "Cormorant Garamond", var: "--wf-cormorant" },
  { key: "playfair", label: "Playfair Display", var: "--wf-playfair" },
  { key: "cinzel", label: "Cinzel", var: "--wf-cinzel" },
] as const;

export const BODY_FONTS = [
  { key: "jost", label: "Jost", var: "--wf-jost" },
  { key: "lato", label: "Lato", var: "--wf-lato" },
] as const;

export function displayFontVar(key: string): string {
  return (DISPLAY_FONTS.find((f) => f.key === key) ?? DISPLAY_FONTS[0]).var;
}

export function bodyFontVar(key: string): string {
  return (BODY_FONTS.find((f) => f.key === key) ?? BODY_FONTS[0]).var;
}
