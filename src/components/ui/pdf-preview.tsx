"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Download, Eye, Loader2, X } from "lucide-react";

const DEFAULT_TRIGGER_ICON = <Eye aria-hidden className="size-4" />;

type State = "idle" | "loading" | "ready" | "error";

/** Dioper ke `ref` supaya pemanggil eksternal (mis. ProposalButton, yang
    dulu memilih bahasa dulu) bisa membuka modalnya sendiri tanpa lewat
    tombol trigger bawaan — lihat prop `hideTrigger`. */
export type PdfPreviewHandle = { open: () => void };

/**
 * Pratinjau PDF generik: klik -> modal terbuka -> PDF-nya dimuat di dalamnya.
 * Dipakai untuk CV/resume (About) maupun proposal (Hero) — logikanya sama,
 * cuma trigger-nya (ikon + gaya tombol) yang beda per pemakai.
 *
 * Dua hal sengaja tidak ditulis sendiri:
 *
 * 1. Modalnya <dialog> + showModal() bawaan browser, bukan div + state sendiri.
 *    Backdrop, tutup dengan Esc, dan jebakan fokus sudah didapat gratis.
 * 2. Berkasnya baru diambil saat tombol ditekan, lalu dirender dari blob. PDF
 *    bisa bermegabyte - memuatnya lewat <object src> sejak awal berarti setiap
 *    pengunjung halaman membayar ongkosnya walau tidak pernah membukanya.
 *
 * Modalnya dibuka LEBIH DULU, baru berkasnya diambil: dengan begitu jeda unduh
 * punya tempat untuk ditampilkan (indikator memuat di dalam modal), bukan klik
 * yang terasa mati beberapa detik.
 *
 * Tombol unduh menunjuk ke berkas aslinya, bukan ke blob: tautan biasa selalu
 * bisa diunduh, sementara blob URL ikut mati begitu komponen dilepas.
 */
const PdfPreview = forwardRef<
  PdfPreviewHandle,
  {
    url: string;
    previewLabel: string;
    downloadLabel: string;
    loadingLabel: string;
    errorLabel: string;
    closeLabel: string;
    /** Ikon trigger, SUDAH dirender (mis. `<Download aria-hidden className="size-4" />`),
        bukan referensi komponennya — komponen ini dipanggil dari Server Component
        (Hero.tsx), dan React tidak bisa mengirim function/component reference
        melewati batas server->client, cuma elemen JSX yang sudah jadi (plain
        object). Default: Eye (dipakai About/CV). */
    triggerIcon?: ReactNode;
    /** Gaya tombol trigger. Default: tautan teks kecil (About). Hero mengoper
        `buttonClassName({ variant: "cream" })` supaya terlihat sama seperti CTA lain. */
    triggerClassName?: string;
    /** Sembunyikan tombol trigger bawaan — dipakai ProposalButton, yang
        pemicunya sendiri adalah tombol pilihan bahasa, bukan trigger ini.
        Pemanggil membuka modalnya lewat `ref.current.open()`. */
    hideTrigger?: boolean;
  }
>(function PdfPreview(
  {
    url,
    previewLabel,
    downloadLabel,
    loadingLabel,
    errorLabel,
    closeLabel,
    triggerIcon = DEFAULT_TRIGGER_ICON,
    triggerClassName = "text-ink hover:text-gold-ink inline-flex items-center gap-2 py-1 text-sm transition-colors",
    hideTrigger = false,
  },
  forwardedRef,
) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<State>("idle");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  // Terpisah dari `state`: `state` melacak status FETCH (dipertahankan "ready"
  // setelah ditutup supaya buka-lagi tidak fetch ulang), sedangkan ini
  // melacak apakah dialognya SEDANG TAMPIL — <object type="application/pdf">
  // dirender hanya saat keduanya true.
  const [isOpen, setIsOpen] = useState(false);

  // Wajib: tanpa revoke, blob-nya menetap di memori sampai tab ditutup.
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  // Event "close" bawaan <dialog> — bukan cuma diikat ke tombol X — supaya
  // menutup lewat Esc atau cara lain tetap membongkar <object>-nya. Plugin
  // PDF Chromium/Edge kadang meninggalkan bekas frame terakhirnya di layar
  // kalau elemennya cuma disembunyikan (dialog di-close tapi <object> masih
  // ada di DOM); melepas elemennya dari DOM saat dialog tertutup memaksa
  // browser membongkar layer plugin itu sepenuhnya, bukan cuma
  // menyembunyikannya. blobUrl TETAP disimpan (tidak direvoke di sini) —
  // reopen berikutnya langsung dari cache, tidak fetch ulang.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setIsOpen(false);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  async function open() {
    dialogRef.current?.showModal();
    setIsOpen(true);
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

  useImperativeHandle(forwardedRef, () => ({ open }));

  return (
    <>
      {hideTrigger ? null : (
        <button type="button" onClick={open} className={triggerClassName}>
          {triggerIcon}
          {previewLabel}
        </button>
      )}

      {/* flex flex-col + max-h-[90vh]: sebelumnya dialog tidak punya batas
          tinggi sama sekali, sementara area konten dipatok h-[75vh] tetap —
          header + 75vh gampang melebihi tinggi viewport pendek (atau di
          <dialog>, yang defaultnya TIDAK auto-scroll), dan sisanya cuma
          terpotong tanpa cara menggulirnya. Sekarang dialog dibatasi 90vh,
          header tetap alami tingginya, dan AREA KONTEN yang jadi flex-1 +
          overflow-y-auto — kalau PDF-nya (atau pesan error/loading) lebih
          tinggi dari sisa ruang, area itu sendiri yang scroll, bukan
          terpotong di tepi dialog. min-h-0 wajib: tanpa itu flex item tidak
          mau menyusut di bawah ukuran kontennya, jadi overflow-auto di
          atasnya tidak pernah aktif. */}
      {/* pointer-events-auto: dialog ini bisa dirender di dalam pembungkus
          pointer-events-none (mis. Hero, lihat proposal-button.tsx) —
          showModal() memang mempromosikannya ke top layer untuk pengecatan,
          tapi pointer-events tetap properti yang DIWARISI lewat DOM tree
          sungguhan, bukan lewat urutan tampilnya. Tanpa baris ini, dialognya
          terlihat tapi seluruh isinya (tombol, area scroll) mati.

          hidden open:flex, BUKAN flex begitu saja: browser menyembunyikan
          <dialog> yang tertutup lewat `dialog:not([open]) { display: none }`
          di UA stylesheet, tapi itu prioritas NORMAL — kelas `flex` yang
          berlaku tanpa syarat adalah CSS penulis (author), dan CSS penulis
          selalu menang atas UA stylesheet pada prioritas yang sama, terlepas
          dari spesifisitas. Hasilnya: begitu ada kelas `flex` polos di sini,
          dialog yang sudah close() (atribut open sudah hilang) tetap
          ter-render display:flex — persis bug "tampilan tertinggal saat
          close" yang terlihat lagi walau <object> di dalamnya sudah
          dibongkar. `hidden` menjadikan default-nya display:none dari CSS
          penulis sendiri, dan varian `open:` (menyasar `&[open]`) baru
          menyalakan flex saat atribut open benar-benar ada. */}
      <dialog
        ref={dialogRef}
        className="bg-card text-ink border-line backdrop:bg-charcoal/50 pointer-events-auto m-auto hidden max-h-[90vh] w-[min(92vw,900px)] flex-col overflow-hidden border p-0 open:flex"
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

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
          {isOpen && state === "ready" && blobUrl ? (
            // <iframe>, bukan <object type="application/pdf">: object/embed
            // mengandalkan plugin PDF milik browser, dan mobile Safari/Chrome
            // (iOS maupun Android) tidak punya plugin itu sama sekali — hasilnya
            // area kosong tanpa fallback yang pernah terpicu (resource-nya
            // berhasil dimuat, cuma tidak ada apa pun yang merendernya). iframe
            // memakai jalur navigasi biasa, yang tempat browser mobile
            // benar-benar menyalakan penampil PDF bawaannya.
            <iframe src={blobUrl} className="h-full min-h-[75vh] w-full border-0" title={previewLabel} />
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
});

export default PdfPreview;
