"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitMessage, type ContactState } from "@/lib/contact";
import CatSubmitButton from "@/components/ui/CatSubmitButton";

// Hairline border (bukan ink-soft yang tebal), radius proporsional dengan card
// 14px, dan fokus keyboard yang jelas: ring sand + border ink menggantikan
// outline default yang dimatikan.
const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 w-full rounded-card border bg-transparent px-4 py-3 text-[15px] text-ink outline-none transition-colors";

const LABEL =
  "text-ink-soft font-mono mb-1.5 block text-[11px] font-medium tracking-[0.12em] uppercase";

// Satu baris tiga kolom (bukan whatsapp jadi baris sendiri): menambah baris
// baru mendorong ulang tinggi form melewati tinggi kartu foto di sebelahnya
// (lihat h-full/mt-auto di bawah, dituning pas untuk itu di /contact).
const IDENTITY_FIELDS = [
  { name: "name", type: "text", autoComplete: "name" },
  { name: "email", type: "email", autoComplete: "email" },
  { name: "whatsapp", type: "tel", autoComplete: "tel" },
] as const;

/**
 * Satu-satunya pemakai adalah /contact, yang mendampingkan formulir ini dengan
 * kartu foto di grid dua kolom — jadi padding rapat + QR di kaki kartu adalah
 * SATU-SATUNYA tampilan yang ada. Prop `compact` dulu memilih antara ini dan
 * versi berpadding lebar untuk beranda; beranda sekarang merender
 * ShareYourStoryForm (lihat ContactPanel.tsx), jadi cabang lebarnya tidak
 * pernah terpakai lagi dan ikut dihapus bersama prop-nya.
 *
 * Tinggi input TIDAK ikut mengecil — itu sasaran sentuh, bukan hiasan.
 */
export default function ContactForm({
  privacy,
  qrImage,
  qrLabel,
}: {
  privacy: string;
  /** Settings → Contact di CMS. Kosong/null menyembunyikan seluruh blok QR. */
  qrImage?: string | null;
  qrLabel?: string;
}) {
  const t = useTranslations("contactForm");
  const [state, formAction, pending] = useActionState<ContactState, FormData>(submitMessage, null);

  const shell = "border-line bg-card rounded-card shadow-card border p-4";

  if (state?.ok) {
    return (
      <div className={shell}>
        <p role="status" className="text-ink-soft text-base leading-[1.65]">
          {t("success")}
        </p>
      </div>
    );
  }

  return (
    // h-full: kalau grid induk (lihat /contact/page.tsx) menjadikan kartu ini
    // yang lebih pendek dari kolom foto, form akan diregangkan grid untuk
    // mengisi tinggi kolom itu. Dulu QR (mt-auto) menyerap sisa ruang itu
    // supaya batas bawah kedua kartu sejajar — dibuang: tombol Rive sendiri
    // membuat form ini pada praktiknya SELALU lebih tinggi dari kolom foto
    // (diukur via CDP: form 903px vs kolom foto 732px pada 1440px), jadi
    // mt-auto tidak pernah punya ruang sisa untuk diserap. Kalau kelak foto
    // CMS berganti jadi lebih tinggi dari form, sisa ruangnya sekarang jatuh
    // sebagai kelonggaran di BAWAH kartu (h-full saja yang menanganinya) —
    // jauh kurang mencolok daripada satu celah besar di tengah form.
    <form action={formAction} className={`${shell} flex h-full flex-col gap-1.5`}>
      <div className="grid gap-2 sm:grid-cols-3">
        {IDENTITY_FIELDS.map((field) => (
          <label key={field.name}>
            <span className={LABEL}>{t(field.name)}</span>
            <input
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              className={INPUT}
            />
          </label>
        ))}
      </div>

      <label>
        <span className={LABEL}>{t("subject")}</span>
        <input name="subject" type="text" autoComplete="off" className={INPUT} />
      </label>

      <label>
        <span className={LABEL}>{t("message")}</span>
        {/* rows=3, bukan 1: ini kolom PESAN, isi utama formulir. Dengan satu
            baris terlihat, kalimat kedua langsung menggulir keluar pandangan
            saat diketik. */}
        <textarea name="message" rows={3} className={`${INPUT} resize-none`} />
      </label>

      {state?.errorKey ? (
        <p role="alert" className="text-danger text-[13px] leading-[1.5]">
          {t(state.errorKey)}
        </p>
      ) : null}

      <div>
        <CatSubmitButton pending={pending} ariaLabel={pending ? t("sending") : t("send")} />
      </div>

      <p className="text-ink-soft text-xs leading-[1.6]">{privacy}</p>

      {qrImage ? (
        // mt-auto DIBUANG (lihat komentar h-full di atas): pada praktiknya
        // tidak pernah punya ruang sisa untuk diserap, jadi hanya menjaga
        // konsistensi visual — bukan mekanisme yang benar-benar aktif.
        <div className="border-line flex flex-col items-center gap-1.5 border-t pt-1.5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase (local public/ URLs only) */}
          <img
            src={qrImage}
            alt={qrLabel ?? ""}
            // object-contain, BUKAN object-cover: kode QR yang tidak persis
            // persegi akan DIPOTONG oleh cover, dan QR yang terpotong tidak
            // bisa dipindai sama sekali. contain menjaga seluruh kode tetap
            // utuh di dalam kotak, seburuk apa pun rasio berkas yang diunggah.
            className="border-line aspect-square w-full max-w-[150px] rounded-lg border bg-white object-contain sm:max-w-[170px]"
          />
          {qrLabel ? (
            <p className="text-ink-soft text-xs leading-[1.5] font-medium">{qrLabel}</p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
