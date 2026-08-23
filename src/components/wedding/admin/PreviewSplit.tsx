"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import MobilePreview from "./MobilePreview";
import type { WeddingPreviewData } from "@/components/wedding/types";

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
  const [view, setView] = useState<"edit" | "preview">("edit");

  function sync(e: FormEvent) {
    const t = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!t.name || !LIVE_FIELDS.has(t.name)) return;
    const value = t instanceof HTMLInputElement && t.type === "checkbox" ? t.checked : t.value;
    setDraft((d) => ({ ...d, [t.name]: value }));
  }

  const preview = {
    ...record,
    ...draft,
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
