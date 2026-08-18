"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitMessage, type ContactState } from "@/lib/contact";

const INPUT =
  "border-graphite/60 focus:border-paper bg-transparent text-paper w-full border px-4 py-3 text-base outline-none transition-colors";

const FIELDS = [
  { name: "name", type: "text", autoComplete: "name" },
  { name: "email", type: "email", autoComplete: "email" },
  { name: "subject", type: "text", autoComplete: "off" },
] as const;

export default function ContactForm() {
  const t = useTranslations("contactForm");
  const [state, formAction, pending] = useActionState<ContactState, FormData>(submitMessage, null);

  if (state?.ok) {
    return (
      <p role="status" className="text-silver max-w-md text-base leading-[1.65]">
        {t("success")}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      {FIELDS.map((field) => (
        <label key={field.name}>
          <span className="text-ash mb-2 block text-[11px] font-semibold tracking-[0.2em] uppercase">
            {t(field.name)}
          </span>
          <input
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            className={INPUT}
          />
        </label>
      ))}

      <label>
        <span className="text-ash mb-2 block text-[11px] font-semibold tracking-[0.2em] uppercase">
          {t("message")}
        </span>
        <textarea name="message" rows={5} className={INPUT} />
      </label>

      {state?.errorKey ? (
        <p role="alert" className="text-sm text-red-400">
          {t(state.errorKey)}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-paper text-ink hover:bg-silver inline-flex items-center px-7 py-4 text-xs font-semibold tracking-[0.2em] whitespace-nowrap uppercase transition-colors disabled:opacity-50"
        >
          {pending ? t("sending") : t("send")}
        </button>
      </div>
    </form>
  );
}
