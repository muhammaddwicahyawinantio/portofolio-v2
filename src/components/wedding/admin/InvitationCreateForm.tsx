"use client";
import { useActionState } from "react";
import { saveInvitation, type FormState } from "@/lib/wedding/actions";

const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors";
const LABEL =
  "text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase";

export default function InvitationCreateForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveInvitation, null);
  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <input type="hidden" name="__section" value="main" />
      <input type="hidden" name="__id" value="" />
      <input type="hidden" name="status" value="draft" />
      <input type="hidden" name="templateSlug" value="classic-elegant" />
      <label>
        <span className={LABEL}>Title *</span>
        <input name="title" className={INPUT} placeholder="Rizky & Dinda" />
      </label>
      <label>
        <span className={LABEL}>Slug *</span>
        <input name="slug" className={INPUT} placeholder="rizky-dinda" />
      </label>
      <label>
        <span className={LABEL}>Bride name *</span>
        <input name="brideName" className={INPUT} />
      </label>
      <label>
        <span className={LABEL}>Groom name *</span>
        <input name="groomName" className={INPUT} />
      </label>
      {state?.error ? (
        <p role="alert" className="text-danger text-[13px]">
          {state.error}
        </p>
      ) : null}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-cream hover:bg-ink-soft rounded-full px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create draft"}
        </button>
      </div>
    </form>
  );
}
