"use client";
import { useRef, useState, type ChangeEvent } from "react";
import { INPUT } from "./fields";

/**
 * Background-music upload for the wedding Settings tab. Uploads an MP3 through
 * the shared /api/admin/upload endpoint (kind=audio → MP3-only + 10MB server
 * check) and stores the resulting path in the existing `musicUrl` field, so no
 * schema change and old remote URLs keep working. Emits the same
 * wedding:field-change event as image uploads for the live preview.
 * Never autoplays: the <audio> preview is user-controlled.
 */
export default function MusicControl({ record }: { record?: Record<string, unknown> | null }) {
  const initial = typeof record?.musicUrl === "string" ? record.musicUrl : "";
  const [url, setUrl] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const hiddenRef = useRef<HTMLInputElement>(null);

  function emit(value: string) {
    hiddenRef.current?.dispatchEvent(
      new CustomEvent("wedding:field-change", {
        bubbles: true,
        detail: { name: "musicUrl", value },
      }),
    );
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "audio/mpeg") {
      setError("Only MP3 files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Audio file too large (max 10MB).");
      return;
    }
    setUploading(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    body.set("kind", "audio");
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };
    setUploading(false);
    e.target.value = "";
    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    setUrl(data.url ?? "");
    emit(data.url ?? "");
  }

  function remove() {
    setUrl("");
    setError("");
    emit("");
  }

  const filename = url ? url.split("/").pop() : "";
  const isExternal = Boolean(url) && !url.startsWith("/uploads/");

  return (
    <div className="flex flex-col gap-3">
      <input ref={hiddenRef} type="hidden" name="musicUrl" value={url} readOnly />
      {url ? (
        <div className="border-line bg-cream-deep/40 flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-soft truncate font-mono text-xs">{filename}</span>
            <button
              type="button"
              onClick={remove}
              className="text-danger/80 hover:text-danger shrink-0 text-xs"
            >
              Remove
            </button>
          </div>
          <audio src={url} controls preload="none" className="w-full" />
          {isExternal ? (
            <p className="text-ink-soft text-[11px]">
              External audio — upload an MP3 to replace it.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-ink-soft text-[10px] uppercase">No music uploaded</p>
      )}
      <input type="file" accept="audio/mpeg,.mp3" onChange={onFileChange} className={INPUT} />
      {uploading ? <p className="text-ink-soft text-xs">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="text-danger text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
