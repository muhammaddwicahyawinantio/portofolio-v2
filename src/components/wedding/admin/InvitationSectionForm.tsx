"use client";
import { useActionState } from "react";
import { saveInvitation, type FormState } from "@/lib/wedding/actions";

export default function InvitationSectionForm({
  section,
  id,
  children,
}: {
  section: string;
  id: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveInvitation, null);
  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="__section" value={section} />
      <input type="hidden" name="__id" value={id} />
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
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
