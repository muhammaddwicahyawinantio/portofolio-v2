"use client";
import { useActionState } from "react";
import { submitMessage, type PublicFormState } from "@/lib/wedding/actions";
import type { WeddingPreviewData } from "@/components/wedding/types";
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

const INPUT =
  "w-full rounded-lg border border-[var(--w-accent)]/40 bg-white/60 px-4 py-2.5 text-sm text-[#2E2A26] outline-none transition-colors focus:border-[var(--w-primary)]";

export default function Guestbook({
  invitationId,
  messages,
}: {
  invitationId: string;
  messages: WeddingPreviewData["messages"];
}) {
  const [state, formAction, pending] = useActionState<PublicFormState, FormData>(
    submitMessage,
    null,
  );

  return (
    <Section>
      <Eyebrow>Ucapan &amp; Doa</Eyebrow>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="invitationId" value={invitationId} />
        <input name="guestName" placeholder="Nama Anda" className={INPUT} />
        <textarea name="message" rows={3} placeholder="Tulis ucapan & doa" className={INPUT} />
        {state?.success ? (
          <p className="text-sm text-[var(--w-primary)]">Ucapan terkirim 🤍</p>
        ) : null}
        {state?.error ? (
          <p role="alert" className="text-sm text-red-700">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--w-primary)] px-6 py-3 text-xs tracking-[0.2em] text-white uppercase transition-opacity disabled:opacity-50"
        >
          {pending ? "Mengirim…" : "Kirim Ucapan"}
        </button>
      </form>

      <div className="mt-10 flex flex-col gap-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm opacity-60">Jadilah yang pertama memberi ucapan.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-[var(--w-accent)]/25 bg-white/40 p-4">
              <p className="font-[family-name:var(--w-font-display)] text-lg text-[var(--w-primary)]">
                {m.guestName}
              </p>
              <p className="mt-1 text-sm leading-relaxed opacity-85">{m.message}</p>
              <p className="mt-2 text-[11px] opacity-50">
                {new Date(m.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </Section>
  );
}
