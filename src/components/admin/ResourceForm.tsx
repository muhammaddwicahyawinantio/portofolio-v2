"use client";

import { useActionState } from "react";
import { saveRecord, type FormState } from "@/lib/admin/actions";
import type { Field, Resource } from "@/lib/admin/resources";

const INPUT =
  "border-graphite/60 focus:border-paper bg-ink text-paper w-full border px-4 py-2.5 text-sm outline-none transition-colors";

function initialValue(field: Field, record?: Record<string, unknown> | null) {
  const value = record?.[field.name];
  if (value === undefined || value === null) return "";
  // Field list disimpan sebagai Json array, ditampilkan satu URL per baris.
  if (field.type === "list") return Array.isArray(value) ? value.join("\n") : String(value);
  return String(value);
}

function Control({ field, record }: { field: Field; record?: Record<string, unknown> | null }) {
  const defaultValue = initialValue(field, record);

  if (field.type === "select") {
    return (
      <select name={field.name} defaultValue={defaultValue || field.options?.[0]} className={INPUT}>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea" || field.type === "list") {
    return (
      <textarea
        name={field.name}
        defaultValue={defaultValue}
        rows={field.type === "list" ? 4 : 3}
        className={INPUT}
      />
    );
  }

  return (
    <input
      name={field.name}
      type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
      defaultValue={defaultValue}
      className={INPUT}
    />
  );
}

export default function ResourceForm({
  resource,
  record,
}: {
  resource: Resource;
  record?: Record<string, unknown> | null;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveRecord, null);
  const editingId = typeof record?.id === "string" ? record.id : "";

  return (
    // key memaksa React membangun ulang form saat pindah record, kalau tidak
    // defaultValue lama akan bertahan di input yang sama.
    <form key={editingId || "new"} action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="__resource" value={resource.key} />
      <input type="hidden" name="__id" value={editingId} />

      <div className="grid gap-5 md:grid-cols-2">
        {resource.fields.map((field) => (
          <label
            key={field.name}
            className={field.type === "textarea" || field.type === "list" ? "md:col-span-2" : ""}
          >
            <span className="text-ash mb-2 block text-[11px] font-semibold tracking-[0.2em] uppercase">
              {field.label}
              {field.required ? <span aria-hidden> *</span> : null}
            </span>
            <Control field={field} record={record} />
          </label>
        ))}
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-paper text-ink hover:bg-silver px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:opacity-50"
        >
          {pending ? "Saving…" : editingId ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
