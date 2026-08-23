"use client";
import { useState } from "react";
import WeddingTemplateRenderer from "@/components/wedding/template-renderer";
import type { WeddingPreviewData } from "@/components/wedding/types";

/**
 * iPhone-style device mockup around the shared template renderer (preview mode).
 * Fed live draft data by the editor shell — no re-fetch, no iframe — so unsaved
 * edits appear instantly. Music never autoplays here (preview mode handles it).
 * The dark bezel reads as a phone against both light and dark wedding templates;
 * the screen shows the template's own background.
 */
export default function MobilePreview({
  invitation,
  slug,
  published,
}: {
  invitation: WeddingPreviewData;
  slug: string;
  published: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const publicPath = `/undangan/${slug}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* toolbar */}
      <div className="flex w-full max-w-[360px] items-center justify-between px-1">
        <span className="text-ink-soft font-mono text-[11px] tracking-[0.12em] uppercase">
          Preview
        </span>
        <div className="flex items-center gap-3">
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            title={published ? "Open public page" : "Draft — not public yet"}
            className={
              published
                ? "text-ink-soft hover:text-ink text-xs"
                : "text-ink-soft/40 pointer-events-none text-xs"
            }
            aria-disabled={!published}
          >
            Open public
          </a>
          <button type="button" onClick={copyLink} className="text-ink-soft hover:text-ink text-xs">
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </div>

      {/* iphone shell */}
      <div className="relative">
        {/* side buttons */}
        <span
          aria-hidden
          className="absolute top-[104px] -left-[2px] h-7 w-[3px] rounded-l bg-neutral-700"
        />
        <span
          aria-hidden
          className="absolute top-[150px] -left-[2px] h-11 w-[3px] rounded-l bg-neutral-700"
        />
        <span
          aria-hidden
          className="absolute top-[204px] -left-[2px] h-11 w-[3px] rounded-l bg-neutral-700"
        />
        <span
          aria-hidden
          className="absolute top-[170px] -right-[2px] h-16 w-[3px] rounded-r bg-neutral-700"
        />

        {/* bezel */}
        <div className="rounded-[3.2rem] bg-neutral-900 p-[10px] shadow-[0_28px_55px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/50">
          {/* screen */}
          <div className="relative h-[760px] max-h-[80vh] w-[360px] max-w-full overflow-hidden rounded-[2.6rem] bg-white">
            {/* dynamic island */}
            <div
              aria-hidden
              className="absolute top-[10px] left-1/2 z-20 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black"
            />
            {/* scrollable screen content */}
            <div className="h-full w-full overflow-x-hidden overflow-y-auto">
              <WeddingTemplateRenderer invitation={invitation} guestName={null} preview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
