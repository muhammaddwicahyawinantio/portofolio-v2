"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitMessage, type ContactState } from "@/lib/contact";

// Hairline border (bukan ink-soft yang tebal), radius proporsional dengan card
// 14px, dan fokus keyboard yang jelas: ring sand + border ink menggantikan
// outline default yang dimatikan.
const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 w-full rounded-card border bg-transparent px-4 py-3 text-[15px] text-ink outline-none transition-colors";

const LABEL =
  "text-ink-soft font-mono mb-2 block text-[11px] font-medium tracking-[0.12em] uppercase";

/** Nama dan email berdampingan; subjek dan pesan selebar kartu. */
const PAIRED = [
  { name: "name", type: "text", autoComplete: "name" },
  { name: "email", type: "email", autoComplete: "email" },
] as const;

/**
 * `compact` merapatkan padding, jarak antar-field, dan tinggi textarea — dipakai
 * di beranda, tempat formulirnya berdampingan dengan kartu QR seukurannya.
 * Halaman /contact tetap memakai ukuran penuh: di sana formulir adalah isi
 * utama halaman, bukan salah satu dari dua kolom.
 *
 * Tinggi input TIDAK ikut mengecil — itu sasaran sentuh, bukan hiasan.
 */
export default function ContactForm({
  privacy,
  compact = false,
}: {
  privacy: string;
  compact?: boolean;
}) {
  const t = useTranslations("contactForm");
  const [state, formAction, pending] = useActionState<ContactState, FormData>(submitMessage, null);

  const shell = compact
    ? "border-line bg-card rounded-card shadow-card border p-6"
    : "border-line bg-card rounded-card shadow-card border p-8 md:p-10";

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
    <form action={formAction} className={`${shell} flex flex-col ${compact ? "gap-4" : "gap-6"}`}>
      <div className={`grid ${compact ? "gap-4" : "gap-6"} sm:grid-cols-2`}>
        {PAIRED.map((field) => (
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
        <textarea name="message" rows={compact ? 3 : 5} className={`${INPUT} resize-none`} />
      </label>

      {state?.errorKey ? (
        <p role="alert" className="text-danger text-[13px] leading-[1.5]">
          {t(state.errorKey)}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-charcoal text-cream hover:bg-charcoal-soft inline-flex items-center rounded-full px-7 py-4 text-xs font-semibold tracking-[0.2em] whitespace-nowrap uppercase transition-colors disabled:opacity-50"
        >
          {pending ? t("sending") : t("send")}
        </button>
      </div>

      <p className="text-ink-soft text-xs leading-[1.6]">{privacy}</p>
    </form>
  );
}
