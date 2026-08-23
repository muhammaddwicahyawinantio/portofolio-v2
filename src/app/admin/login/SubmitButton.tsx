"use client";

import { useFormStatus } from "react-dom";

/**
 * Tombol submit login dengan status pending. Dipisah jadi client component
 * karena useFormStatus hanya membaca <form> induk dari sisi klien — halaman
 * login-nya sendiri tetap server component.
 */
export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="bg-ink text-cream hover:bg-ink-soft mt-2 flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <span
            className="intro-ring border-cream/40 border-t-cream inline-block h-3.5 w-3.5 rounded-full border-2"
            aria-hidden
          />
          Signing in…
        </>
      ) : (
        "Sign in"
      )}
    </button>
  );
}
