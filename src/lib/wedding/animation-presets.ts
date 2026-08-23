// Curated animation presets for wedding templates. Pure data + validators, no
// imports — safe in client (admin form, motion components) and server (save
// action, public read). Security is here: only whitelisted preset values ever
// reach the template; admin never supplies raw JS/CSS.

export const SECTION_KEYS = [
  "cover",
  "couple",
  "countdown",
  "events",
  "story",
  "gallery",
  "gift",
  "rsvp",
  "guestbook",
  "closing",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const PROFILES = ["elegant", "romantic", "luxury", "minimal"] as const;
export const INTENSITIES = ["low", "medium", "high"] as const;
export const BACKGROUND_EFFECTS = [
  "none",
  "parallax-soft",
  "floating-petals",
  "light-particles",
  "shimmer",
] as const;

export type Profile = (typeof PROFILES)[number];
export type Intensity = (typeof INTENSITIES)[number];
export type BackgroundEffect = (typeof BACKGROUND_EFFECTS)[number];

type Option = { value: string; label: string };

// One curated select per section (the doc's admin UI). Values mix entrance and
// scroll effects; the renderer dispatches by SCROLL_PRESETS / INTERACTION_PRESETS.
export const SECTION_CONFIG: Record<SectionKey, { label: string; options: Option[] }> = {
  cover: {
    label: "Cover",
    options: [
      { value: "none", label: "None" },
      { value: "fade-up", label: "Fade Up" },
      { value: "cinematic-opening", label: "Cinematic Opening" },
      { value: "zoom-reveal", label: "Zoom Reveal" },
      { value: "image-parallax", label: "Image Parallax" },
    ],
  },
  couple: {
    label: "Couple",
    options: [
      { value: "none", label: "None" },
      { value: "fade-up-stagger", label: "Fade Up Stagger" },
      { value: "split-reveal", label: "Split Reveal" },
      { value: "portrait-parallax", label: "Portrait Parallax" },
    ],
  },
  countdown: {
    label: "Countdown",
    options: [
      { value: "none", label: "None" },
      { value: "number-rise", label: "Number Rise" },
      { value: "soft-reveal", label: "Soft Reveal" },
    ],
  },
  events: {
    label: "Events",
    options: [
      { value: "none", label: "None" },
      { value: "card-reveal", label: "Card Reveal" },
      { value: "timeline-reveal", label: "Timeline Reveal" },
    ],
  },
  story: {
    label: "Story",
    options: [
      { value: "none", label: "None" },
      { value: "timeline-reveal", label: "Timeline Reveal" },
      { value: "parallax-soft", label: "Parallax Soft" },
    ],
  },
  gallery: {
    label: "Gallery",
    options: [
      { value: "none", label: "None" },
      { value: "gallery-reveal", label: "Gallery Reveal" },
      { value: "soft-zoom", label: "Soft Zoom" },
      { value: "horizontal-scroll", label: "Horizontal Scroll" },
    ],
  },
  gift: {
    label: "Gift",
    options: [
      { value: "none", label: "None" },
      { value: "soft-rise", label: "Soft Rise" },
      { value: "card-flip", label: "Card Flip" },
      { value: "copy-pulse", label: "Copy Pulse" },
    ],
  },
  rsvp: {
    label: "RSVP",
    options: [
      { value: "none", label: "None" },
      { value: "form-reveal", label: "Form Reveal" },
    ],
  },
  guestbook: {
    label: "Guestbook",
    options: [
      { value: "none", label: "None" },
      { value: "message-cascade", label: "Message Cascade" },
    ],
  },
  closing: {
    label: "Closing",
    options: [
      { value: "none", label: "None" },
      { value: "fade-up", label: "Fade Up" },
      { value: "soft-bloom", label: "Soft Bloom" },
    ],
  },
};

/** Values the renderer treats as scroll-driven (GSAP, public page only). */
export const SCROLL_PRESETS = new Set([
  "image-parallax",
  "portrait-parallax",
  "parallax-soft",
  "horizontal-scroll",
]);

/** Values the renderer treats as interaction effects rather than entrance. */
export const INTERACTION_PRESETS = new Set(["copy-pulse"]);

export type AnimationSettings = {
  global: {
    smoothScroll: boolean;
    profile: Profile;
    intensity: Intensity;
    background: BackgroundEffect;
  };
  sections: Record<SectionKey, string>;
};

// Beautiful defaults for classic-elegant (doc "Default animation profile").
export const DEFAULT_SETTINGS: AnimationSettings = {
  global: { smoothScroll: true, profile: "elegant", intensity: "medium", background: "parallax-soft" },
  sections: {
    cover: "cinematic-opening",
    couple: "fade-up-stagger",
    countdown: "number-rise",
    events: "card-reveal",
    story: "timeline-reveal",
    gallery: "gallery-reveal",
    gift: "soft-rise",
    rsvp: "form-reveal",
    guestbook: "message-cascade",
    closing: "fade-up",
  },
};

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/**
 * Trust boundary: turn any stored/submitted value into a safe AnimationSettings.
 * Unknown or malformed values fall back to the classic-elegant default, so the
 * template can render settings straight from the DB without guarding each field.
 */
export function parseAnimationSettings(raw: unknown): AnimationSettings {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const g = (obj.global && typeof obj.global === "object" ? obj.global : {}) as Record<string, unknown>;
  const s = (obj.sections && typeof obj.sections === "object" ? obj.sections : {}) as Record<
    string,
    unknown
  >;

  const sections = {} as Record<SectionKey, string>;
  for (const key of SECTION_KEYS) {
    const allowed = SECTION_CONFIG[key].options.map((o) => o.value);
    sections[key] = pick(s[key], allowed, DEFAULT_SETTINGS.sections[key]);
  }

  return {
    global: {
      smoothScroll: typeof g.smoothScroll === "boolean" ? g.smoothScroll : DEFAULT_SETTINGS.global.smoothScroll,
      profile: pick(g.profile, PROFILES, DEFAULT_SETTINGS.global.profile),
      intensity: pick(g.intensity, INTENSITIES, DEFAULT_SETTINGS.global.intensity),
      background: pick(g.background, BACKGROUND_EFFECTS, DEFAULT_SETTINGS.global.background),
    },
    sections,
  };
}
