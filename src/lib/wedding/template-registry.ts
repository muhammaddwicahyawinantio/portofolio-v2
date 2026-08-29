import type { ComponentType } from "react";
import type { WeddingPreviewData } from "@/components/wedding/types";
import ClassicElegant from "@/components/wedding/templates/classic-elegant";

export type TemplateProps = {
  invitation: WeddingPreviewData;
  guestName: string | null;
  /** Admin preview: render the cover inline (no fixed overlay / scroll-lock),
   *  never autoplay music. Off (public route) = full-screen gated cover. */
  preview?: boolean;
};

type TemplateEntry = { label: string; thumbnail: string; component: ComponentType<TemplateProps> };

export const TEMPLATES: Record<string, TemplateEntry> = {
  "classic-elegant": {
    label: "Classic Elegant",
    thumbnail: "/images/placeholder-1.jpg",
    component: ClassicElegant,
  },
};

export const DEFAULT_TEMPLATE = "classic-elegant";

export function getTemplate(slug: string): TemplateEntry {
  return TEMPLATES[slug] ?? TEMPLATES[DEFAULT_TEMPLATE]!;
}

export const TEMPLATE_OPTIONS = Object.entries(TEMPLATES).map(([slug, t]) => ({
  slug,
  label: t.label,
}));
