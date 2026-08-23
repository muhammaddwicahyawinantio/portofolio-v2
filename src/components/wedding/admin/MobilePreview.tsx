"use client";
import { useState } from "react";
import WeddingTemplateRenderer from "@/components/wedding/template-renderer";
import type { WeddingPreviewData } from "@/components/wedding/types";

/**
 * A phone-frame wrapper around the shared template renderer (in preview mode).
 * Fed live draft data by the editor shell — no re-fetch, no iframe — so unsaved
 * edits appear instantly. Music never autoplays here (preview mode handles it).
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
      <div className="flex w-full max-w-[390px] items-center justify-between px-1">
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

      <div className="border-line bg-card rounded-[2.25rem] border p-2 shadow-card">
        <div className="h-[720px] max-h-[76vh] w-[366px] max-w-full overflow-y-auto overflow-x-hidden rounded-[1.75rem] bg-white">
          <WeddingTemplateRenderer invitation={invitation} guestName={null} preview />
        </div>
      </div>
    </div>
  );
}
