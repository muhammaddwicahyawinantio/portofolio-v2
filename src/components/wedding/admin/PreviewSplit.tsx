"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import MobilePreview from "./MobilePreview";
import type { WeddingPreviewData } from "@/components/wedding/types";
import {
  parseAnimationSettings,
  SECTION_KEYS,
  type AnimationSettings,
} from "@/lib/wedding/animation-presets";

/**
 * Parent/settings fields the preview reflects live (doc Phase 6). A whitelist
 * because child-collection forms reuse generic input names ("title", "order",
 * "caption"…) that must NOT leak into the parent draft.
 */
const LIVE_FIELDS = new Set([
  "title",
  "slug",
  "brideName",
  "groomName",
  "brideFullName",
  "groomFullName",
  "brideParents",
  "groomParents",
  "openingText",
  "quoteText",
  "storyTitle",
  "storyText",
  "coverImage",
  "bridePhoto",
  "groomPhoto",
  "musicUrl",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "backgroundColor",
  "fontDisplay",
  "fontBody",
  "isMusicEnabled",
  "isRsvpEnabled",
  "isGuestbookEnabled",
  "templateSlug",
]);

/**
 * Split editor layout: existing (server-rendered) editor on the left as
 * `children`, a live mobile-device preview on the right. Unsaved edits to
 * parent/settings fields reach the preview via bubbled change events — no
 * rewrite of the existing forms, no iframe. Child collections stay save-based
 * (they re-render from server data after their action). Desktop = side by side;
 * mobile = Edit/Preview toggle.
 */
export default function PreviewSplit({
  record,
  fontClass,
  children,
}: {
  record: WeddingPreviewData;
  fontClass: string;
  children: ReactNode;
}) {
  const [draft, setDraft] = useState<Record<string, string | boolean>>({});
  const [animDraft, setAnimDraft] = useState<AnimationSettings | null>(null);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const editorRef = useRef<HTMLDivElement>(null);

  // Rebuild the whole animation settings object from the Animations-tab form so
  // preset changes replay in the preview (nested shape can't ride the flat draft).
  function rebuildAnim() {
    const el = editorRef.current;
    if (!el) return;
    const field = (name: string) =>
      el.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`);
    const smooth = el.querySelector<HTMLInputElement>('[name="anim_smoothScroll"]');
    setAnimDraft(
      parseAnimationSettings({
        global: {
          smoothScroll: smooth ? smooth.checked : true,
          profile: field("anim_profile")?.value,
          intensity: field("anim_intensity")?.value,
          background: field("anim_background")?.value,
        },
        sections: Object.fromEntries(
          SECTION_KEYS.map((k) => [k, field(`anim_section_${k}`)?.value]),
        ),
      }),
    );
  }

  function sync(e: FormEvent) {
    const t = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!t.name) return;
    if (t.name.startsWith("anim_")) {
      rebuildAnim();
      return;
    }
    if (!LIVE_FIELDS.has(t.name)) return;
    const value = t instanceof HTMLInputElement && t.type === "checkbox" ? t.checked : t.value;
    setDraft((d) => ({ ...d, [t.name]: value }));
  }

  // Uploads (ImageControl) can't bubble a normal change event for the new URL,
  // so they emit a custom "wedding:field-change" — this catches it so cover /
  // bride / groom photos update in the preview the moment they finish uploading.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    function onFieldChange(e: Event) {
      const detail = (e as CustomEvent<{ name?: string; value?: string }>).detail;
      if (detail?.name && LIVE_FIELDS.has(detail.name)) {
        setDraft((d) => ({ ...d, [detail.name as string]: detail.value ?? "" }));
      }
    }
    el.addEventListener("wedding:field-change", onFieldChange as EventListener);
    return () => el.removeEventListener("wedding:field-change", onFieldChange as EventListener);
  }, []);

  const preview = {
    ...record,
    ...draft,
    animationSettings: animDraft ?? record.animationSettings,
    messages: record.messages.filter((m) => m.isVisible),
  } as WeddingPreviewData;

  return (
    <div>
      <div className="mb-4 flex gap-2 lg:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-full px-5 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors ${
              view === v ? "bg-ink text-cream" : "border-line text-ink-soft border"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div
          ref={editorRef}
          onChange={sync}
          className={`min-w-0 flex-1 ${view === "preview" ? "hidden lg:block" : ""}`}
        >
          {children}
        </div>
        <div
          className={`shrink-0 lg:sticky lg:top-6 ${fontClass} ${
            view === "edit" ? "hidden lg:block" : ""
          }`}
        >
          <MobilePreview
            invitation={preview}
            slug={record.slug}
            published={record.status === "published"}
          />
        </div>
      </div>
    </div>
  );
}
