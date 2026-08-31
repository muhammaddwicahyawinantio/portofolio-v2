"use client";
import { useActionState } from "react";
import { submitRsvp, type PublicFormState } from "@/lib/wedding/actions";
import { ATTENDANCE } from "@/lib/wedding/validation";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

const INPUT =
  "w-full rounded-lg border border-[var(--w-accent)]/40 bg-white/70 px-4 py-2.5 text-sm text-[#2E2A26] outline-none backdrop-blur-sm transition-colors focus:border-[var(--w-primary)]";

const ATTENDANCE_LABELS: Record<string, string> = {
  attending: "Hadir",
  not_attending: "Tidak hadir",
  maybe: "Mungkin",
};

export default function RsvpSlide({
  invitationId,
  defaultName,
}: {
  invitationId: string;
  defaultName: string | null;
}) {
  const [state, formAction, pending] = useActionState<PublicFormState, FormData>(submitRsvp, null);

  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>RSVP</Eyebrow>
        {state?.success ? (
          <p className="text-center font-[family-name:var(--w-font-display)] text-2xl text-[var(--w-primary)]">
            Terima kasih atas konfirmasinya 🤍
          </p>
        ) : (
          <>
            <p className="mb-8 text-center text-sm leading-relaxed opacity-80">Mohon konfirmasi kehadiran Anda.</p>
            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="invitationId" value={invitationId} />
              <input name="guestName" defaultValue={defaultName ?? ""} placeholder="Nama Anda" className={INPUT} />
              <select name="attendanceStatus" defaultValue="attending" className={INPUT}>
                {ATTENDANCE.map((a) => (
                  <option key={a} value={a}>
                    {ATTENDANCE_LABELS[a]}
                  </option>
                ))}
              </select>
              <input name="guestCount" type="number" min={1} max={20} defaultValue={1} className={INPUT} />
              <textarea name="message" rows={3} placeholder="Pesan (opsional)" className={INPUT} />
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
                {pending ? "Mengirim…" : "Kirim RSVP"}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
