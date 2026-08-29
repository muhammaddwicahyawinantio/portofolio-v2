"use client";
import type { ReactNode } from "react";
export { ImageControl } from "@/components/admin/ResourceForm";

export const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors";
export const LABEL =
  "text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase";

export function Field({
  label,
  required,
  children,
  wide,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className={LABEL}>
        {label}
        {required ? (
          <span className="text-gold-ink" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function TextInput({
  name,
  defaultValue,
  type = "text",
}: {
  name: string;
  defaultValue?: string;
  type?: "text" | "url" | "number";
}) {
  return <input name={name} type={type} defaultValue={defaultValue} className={INPUT} />;
}

export function TextArea({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return <textarea name={name} defaultValue={defaultValue} rows={3} className={INPUT} />;
}

export function SelectInput({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select name={name} defaultValue={defaultValue} className={INPUT}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ColorInput({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <input
      name={name}
      type="color"
      defaultValue={defaultValue}
      className="border-line bg-card h-11 w-full cursor-pointer rounded-lg border px-1.5 py-1"
    />
  );
}

export function Checkbox({ name, defaultChecked }: { name: string; defaultChecked?: boolean }) {
  return (
    <input
      name={name}
      type="checkbox"
      defaultChecked={defaultChecked}
      className="border-line bg-card accent-ink h-5 w-5 rounded border"
    />
  );
}
