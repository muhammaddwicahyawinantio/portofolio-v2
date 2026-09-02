"use client";

import { useRef } from "react";
import { X } from "lucide-react";

/**
 * Pratinjau/detail generik: klik "View" -> modal terbuka. Sama pola dengan
 * PdfPreview (<dialog> + showModal() bawaan browser, bukan div + state
 * sendiri) — backdrop, Esc, dan jebakan fokus didapat gratis. Dipakai untuk
 * Messages dan Testimonials: kontennya (children) dirender oleh pemanggil
 * (server component), komponen ini cuma trigger + shell dialog.
 */
export default function DetailDialog({
  triggerLabel = "View",
  title,
  children,
}: {
  triggerLabel?: string;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-ink-soft hover:text-ink text-xs"
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        className="bg-card text-ink border-line backdrop:bg-charcoal/50 pointer-events-auto m-auto hidden max-h-[85vh] w-[min(92vw,560px)] flex-col overflow-hidden rounded-lg border p-0 open:flex"
      >
        <div className="border-line flex items-center justify-between gap-4 border-b px-5 py-4">
          <p className="eyebrow">{title}</p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="text-ink-soft hover:text-ink transition-colors"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </dialog>
    </>
  );
}
