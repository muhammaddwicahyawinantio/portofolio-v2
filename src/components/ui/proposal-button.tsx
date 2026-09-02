"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import PdfPreview, { type PdfPreviewHandle } from "@/components/ui/pdf-preview";

/**
 * Tombol proposal hero: trigger -> (kalau dua bahasa tersedia) pemilih bahasa
 * -> PdfPreview membuka file yang sesuai. Kalau cuma satu bahasa yang
 * diunggah admin, pemilihnya dilewati — tidak ada gunanya menyuruh memilih
 * dari satu opsi.
 *
 * `key={chosenUrl}` pada PdfPreview: setiap ganti bahasa harus jadi instance
 * BARU (bukan url prop yang berubah di instance lama), supaya cache
 * blob/status "ready" milik bahasa sebelumnya tidak ikut terbawa dan
 * menampilkan file yang salah. PdfPreview sendiri tidak diubah untuk
 * menangani pergantian url — sudah cukup lewat remount di sini.
 */
export default function ProposalButton({
  label,
  urlId,
  urlEn,
  triggerIcon,
  triggerClassName,
  chooseLanguageLabel,
  chooseCloseLabel,
  languageIdLabel,
  languageEnLabel,
  downloadLabel,
  loadingLabel,
  errorLabel,
  closeLabel,
}: {
  label: string;
  urlId?: string | null;
  urlEn?: string | null;
  triggerIcon?: ReactNode;
  triggerClassName?: string;
  chooseLanguageLabel: string;
  chooseCloseLabel: string;
  languageIdLabel: string;
  languageEnLabel: string;
  downloadLabel: string;
  loadingLabel: string;
  errorLabel: string;
  closeLabel: string;
}) {
  const chooserRef = useRef<HTMLDialogElement>(null);
  const pdfRef = useRef<PdfPreviewHandle>(null);
  const [chosenUrl, setChosenUrl] = useState<string | null>(null);

  // Membuka instance PdfPreview yang BARU saja dipasang (lihat key di JSX) —
  // showModal() di sini baru bisa berhasil setelah ref-nya terpasang ke
  // elemen <dialog> yang benar, jadi harus lewat effect, bukan langsung di
  // pick().
  useEffect(() => {
    if (chosenUrl) pdfRef.current?.open();
  }, [chosenUrl]);

  function pick(url: string) {
    chooserRef.current?.close();
    if (chosenUrl === url) {
      // Instance PdfPreview yang sama masih terpasang (bahasa tidak
      // berganti) — buka lagi langsung, effect di atas tidak akan
      // terpicu ulang karena `chosenUrl` tidak berubah.
      pdfRef.current?.open();
      return;
    }
    setChosenUrl(url);
  }

  function handleTriggerClick() {
    if (urlId && urlEn) {
      chooserRef.current?.showModal();
    } else if (urlId) {
      pick(urlId);
    } else if (urlEn) {
      pick(urlEn);
    }
  }

  if (!urlId && !urlEn) return null;

  return (
    <>
      <button type="button" onClick={handleTriggerClick} className={triggerClassName}>
        {triggerIcon}
        {label}
      </button>

      {urlId && urlEn ? (
        // pointer-events-auto: trigger-nya duduk di dalam pembungkus
        // pointer-events-none milik Hero (lihat komentar di Hero.tsx), dan
        // dialog ini adalah keturunan DOM yang sama — showModal() cuma
        // mempromosikan pengecatannya ke top layer, pointer-events tetap
        // diwarisi lewat DOM tree, jadi harus dinyalakan lagi di sini juga.
        <dialog
          ref={chooserRef}
          className="bg-card text-ink border-line backdrop:bg-charcoal/50 pointer-events-auto m-auto w-[min(92vw,340px)] border p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="eyebrow">{chooseLanguageLabel}</p>
            <button
              type="button"
              onClick={() => chooserRef.current?.close()}
              aria-label={chooseCloseLabel}
              className="hover:text-gold-ink transition-colors"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => pick(urlId)}
              className={buttonClassName({ variant: "ghost", className: "w-full justify-center" })}
            >
              {languageIdLabel}
            </button>
            <button
              type="button"
              onClick={() => pick(urlEn)}
              className={buttonClassName({ variant: "ghost", className: "w-full justify-center" })}
            >
              {languageEnLabel}
            </button>
          </div>
        </dialog>
      ) : null}

      {chosenUrl ? (
        <PdfPreview
          key={chosenUrl}
          ref={pdfRef}
          url={chosenUrl}
          previewLabel={label}
          downloadLabel={downloadLabel}
          loadingLabel={loadingLabel}
          errorLabel={errorLabel}
          closeLabel={closeLabel}
          hideTrigger
        />
      ) : null}
    </>
  );
}
