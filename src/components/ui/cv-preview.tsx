"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Eye, Loader2, X } from "lucide-react";

type State = "idle" | "loading" | "ready" | "error";

/**
 * Pratinjau CV: klik -> modal terbuka -> PDF-nya dimuat di dalamnya.
 *
 * Dua hal sengaja tidak ditulis sendiri:
 *
 * 1. Modalnya <dialog> + showModal() bawaan browser, bukan div + state sendiri.
 *    Backdrop, tutup dengan Esc, dan jebakan fokus sudah didapat gratis.
 * 2. Berkasnya baru diambil saat tombol ditekan, lalu dirender dari blob. PDF
 *    bisa bermegabyte - memuatnya lewat <object src> sejak awal berarti setiap
 *    pengunjung halaman About membayar ongkosnya walau tidak pernah membukanya.
 *
 * Modalnya dibuka LEBIH DULU, baru berkasnya diambil: dengan begitu jeda unduh
 * punya tempat untuk ditampilkan (indikator memuat di dalam modal), bukan klik
 * yang terasa mati beberapa detik.
 *
 * Tombol unduh menunjuk ke berkas aslinya, bukan ke blob: tautan biasa selalu
 * bisa diunduh, sementara blob URL ikut mati begitu komponen dilepas.
 */
export default function CvPreview({
  url,
  previewLabel,
  downloadLabel,
  loadingLabel,
  errorLabel,
  closeLabel,
}: {
  url: string;
  previewLabel: string;
  downloadLabel: string;
  loadingLabel: string;
  errorLabel: string;
  closeLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<State>("idle");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Wajib: tanpa revoke, blob-nya menetap di memori sampai tab ditutup.
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  async function open() {
    dialogRef.current?.showModal();
    // Sekali ambil saja: modal yang dibuka lagi memakai blob yang sudah ada.
    if (blobUrl || state === "loading") return;

    setState("loading");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setBlobUrl(URL.createObjectURL(await res.blob()));
      setState("ready");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="text-ink hover:text-gold-ink inline-flex items-center gap-2 text-sm transition-colors"
      >
        <Eye aria-hidden className="size-4" />
        {previewLabel}
      </button>

      <dialog
        ref={dialogRef}
        className="bg-card text-ink border-line backdrop:bg-charcoal/50 m-auto w-[min(92vw,900px)] border p-0"
      >
        <div className="border-line flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b px-5 py-4">
          <p className="eyebrow">{previewLabel}</p>

          <div className="flex items-center gap-6">
            <a
              href={url}
              download
              className="hover:text-gold-ink inline-flex items-center gap-2 text-sm transition-colors"
            >
              <Download aria-hidden className="size-4" />
              {downloadLabel}
            </a>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={closeLabel}
              className="hover:text-gold-ink transition-colors"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex h-[75vh] items-center justify-center">
          {state === "ready" && blobUrl ? (
            <object
              data={blobUrl}
              type="application/pdf"
              className="h-full w-full"
              aria-label={previewLabel}
            >
              {/* Fallback browser tanpa penampil PDF bawaan. */}
              <a href={url} download className="text-ink underline">
                {downloadLabel}
              </a>
            </object>
          ) : state === "error" ? (
            <p role="alert" className="text-danger text-sm">
              {errorLabel}
            </p>
          ) : (
            <p className="text-ink-soft inline-flex items-center gap-3 text-sm">
              <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" />
              {loadingLabel}
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
