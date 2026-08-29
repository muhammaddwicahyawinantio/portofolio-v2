"use client";
import { useActionState } from "react";
import type { FormState } from "@/lib/wedding/actions";

// Shared wrapper for the events/gallery/gifts add-edit forms: useActionState +
// hidden invitation/record ids + error + submit. The parent sets `key` on this
// component so switching the edited row remounts it and refreshes defaultValues.
export default function ChildForm({
  action,
  invitationId,
  recordId,
  submitLabel,
  children,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  invitationId: string;
  recordId: string;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);
  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="__invitationId" value={invitationId} />
      <input type="hidden" name="__id" value={recordId} />
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
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
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
