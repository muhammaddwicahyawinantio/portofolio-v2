"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { saveRecord, type FormState } from "@/lib/admin/actions";
import type { Field, Resource } from "@/lib/admin/resources";
import { isVideoUrl } from "@/lib/media";

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

  if (field.type === "image") {
    return <ImageControl field={field} record={record} />;
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
        className="border-graphite/60 bg-ink h-5 w-5 border accent-paper"
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

function ImageControl({ field, record }: { field: Field; record?: Record<string, unknown> | null }) {
  const initial = typeof record?.[field.name] === "string" ? (record[field.name] as string) : "";
  const [url, setUrl] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={field.name} value={url} readOnly />
      {url ? (
        isVideoUrl(url) ? (
          <video src={url} className="border-graphite/60 h-32 w-32 border object-cover" muted />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase (local public/ URLs only)
          <img src={url} alt="" className="border-graphite/60 h-32 w-32 border object-cover" />
        )
      ) : (
        <div className="border-graphite/60 text-graphite flex h-32 w-32 items-center justify-center border border-dashed text-[10px] uppercase">
          No image
        </div>
      )}
      <input type="file" accept="image/*,video/mp4,video/webm" onChange={onFileChange} className={INPUT} />
      {uploading ? <p className="text-ash text-xs">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GalleryControl({ field, record }: { field: Field; record?: Record<string, unknown> | null }) {
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
                <video src={url} className="border-graphite/60 h-24 w-full border object-cover" muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase (local public/ URLs only)
                <img src={url} alt="" className="border-graphite/60 h-24 w-full border object-cover" />
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="bg-ink/80 text-paper absolute top-1 right-1 px-1.5 py-0.5 text-[10px] uppercase"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-graphite/60 text-graphite order-1 flex h-24 w-full items-center justify-center border border-dashed text-[10px] uppercase">
          No media
        </div>
      )}
      {uploading ? <p className="text-ash order-3 text-xs">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="order-3 text-sm text-red-400">
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
