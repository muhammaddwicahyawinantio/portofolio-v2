"use client";

import { useActionState, useRef, useState, type ChangeEvent } from "react";
import { saveRecord, type FormState } from "@/lib/admin/actions";
import type { Field, Resource } from "@/lib/admin/resources";
import { isVideoUrl } from "@/lib/media";

const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors";

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

  if (field.type === "image") {
    return <ImageControl field={field} record={record} />;
  }

  if (field.type === "file") {
    return <FileControl field={field} record={record} />;
  }

  if (field.type === "gallery") {
    return <GalleryControl field={field} record={record} />;
  }

  if (field.type === "boolean") {
    const checked = record?.[field.name] === true;
    return (
      <input
        name={field.name}
        type="checkbox"
        defaultChecked={checked}
        className="border-line bg-card accent-ink h-5 w-5 rounded border"
      />
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

export function ImageControl({
  field,
  record,
}: {
  field: Field;
  record?: Record<string, unknown> | null;
}) {
  const initial = typeof record?.[field.name] === "string" ? (record[field.name] as string) : "";
  const [url, setUrl] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const hiddenRef = useRef<HTMLInputElement>(null);

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };

    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    setUrl(data.url ?? "");
    // Bubbling event so listeners (wedding live preview) see the new URL — a
    // programmatic hidden-input value change fires none on its own. Ignored
    // where nothing listens.
    hiddenRef.current?.dispatchEvent(
      new CustomEvent("wedding:field-change", {
        bubbles: true,
        detail: { name: field.name, value: data.url ?? "" },
      }),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input ref={hiddenRef} type="hidden" name={field.name} value={url} readOnly />
      {url ? (
        isVideoUrl(url) ? (
          <video src={url} className="border-line h-32 w-32 border object-cover" muted />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase (local public/ URLs only)
          <img src={url} alt="" className="border-line h-32 w-32 border object-cover" />
        )
      ) : (
        <div className="border-line text-ink-soft flex h-32 w-32 items-center justify-center border border-dashed text-[10px] uppercase">
          No image
        </div>
      )}
      <input
        type="file"
        accept="image/*,video/mp4,video/webm"
        onChange={onFileChange}
        className={INPUT}
      />
      {uploading ? <p className="text-ink-soft text-xs">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="text-danger text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Sama seperti ImageControl tapi tanpa pratinjau <img>: dipakai untuk berkas
 * yang tidak bisa dirender sebagai gambar — PDF (CV/resume) dan MP3 (trek
 * musik). Yang ditampilkan tautan ke berkas tersimpan, supaya admin bisa
 * memastikan unggahannya benar sebelum menyimpan.
 *
 * `accept` datang dari definisi field, bukan dipatok di sini: satu kontrol
 * melayani beberapa jenis berkas tanpa perlu komponen kedua.
 */
function FileControl({ field, record }: { field: Field; record?: Record<string, unknown> | null }) {
  const initial = typeof record?.[field.name] === "string" ? (record[field.name] as string) : "";
  const [url, setUrl] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const hiddenRef = useRef<HTMLInputElement>(null);

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };

    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    setUrl(data.url ?? "");
    // Bubbling event so listeners (wedding live preview) see the new URL — a
    // programmatic hidden-input value change fires none on its own. Ignored
    // where nothing listens.
    hiddenRef.current?.dispatchEvent(
      new CustomEvent("wedding:field-change", {
        bubbles: true,
        detail: { name: field.name, value: data.url ?? "" },
      }),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input ref={hiddenRef} type="hidden" name={field.name} value={url} readOnly />
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-ink hover:text-ink-soft text-sm underline"
        >
          {url}
        </a>
      ) : (
        <p className="text-ink-soft text-[10px] uppercase">No file</p>
      )}
      <input type="file" accept={field.accept} onChange={onFileChange} className={INPUT} />
      {uploading ? <p className="text-ink-soft text-xs">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="text-danger text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GalleryControl({
  field,
  record,
}: {
  field: Field;
  record?: Record<string, unknown> | null;
}) {
  const raw = record?.[field.name];
  const initial = Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : [];
  const [urls, setUrls] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFilesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        continue;
      }
      if (data.url) uploaded.push(data.url);
    }

    setUploading(false);
    setUrls((prev) => [...prev, ...uploaded]);
    e.target.value = "";
  }

  function remove(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={field.name} value={JSON.stringify(urls)} readOnly />
      {/*
        Input file ditaruh sebelum grid preview di DOM supaya dia jadi
        labelable descendant PERTAMA dalam <label> pembungkus field ini —
        kalau tidak, klik teks label akan jatuh ke <button>Remove</button>
        item pertama alih-alih membuka file picker. Urutan visual tetap sama
        (preview dulu, input di bawahnya) lewat utility `order`.
      */}
      <input
        type="file"
        accept="image/*,video/mp4,video/webm"
        multiple
        onChange={onFilesChange}
        className={`${INPUT} order-2`}
      />
      {urls.length > 0 ? (
        <div className="order-1 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((url) => (
            <div key={url} className="group relative">
              {isVideoUrl(url) ? (
                <video src={url} className="border-line h-24 w-full border object-cover" muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase (local public/ URLs only)
                <img src={url} alt="" className="border-line h-24 w-full border object-cover" />
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="bg-ink/80 text-cream absolute top-1 right-1 px-1.5 py-0.5 text-[10px] uppercase"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-line text-ink-soft order-1 flex h-24 w-full items-center justify-center border border-dashed text-[10px] uppercase">
          No media
        </div>
      )}
      {uploading ? <p className="text-ink-soft order-3 text-xs">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="text-danger order-3 text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
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
            className={
              field.type === "textarea" || field.type === "list" || field.type === "gallery"
                ? "md:col-span-2"
                : ""
            }
          >
            <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
              {field.label}
              {field.required ? (
                <span className="text-gold-ink" aria-hidden>
                  {" "}
                  *
                </span>
              ) : null}
            </span>
            <Control field={field} record={record} />
          </label>
        ))}
      </div>

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
          {pending ? "Saving…" : editingId ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
