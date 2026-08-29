"use client";

import { useActionState, useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { saveAdminTestimonial, type AdminTestimonialState } from "@/lib/testimonials/actions";
import { MAX_TESTIMONIAL_AVATAR_BYTES } from "@/lib/testimonials/constants";

type TestimonialRecord = {
  id: string;
  name: string;
  position: string | null;
  content: string;
  rating: number;
  avatar: string | null;
  isActive: boolean;
};

const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors";

export default function TestimonialAdminForm({ record }: { record?: TestimonialRecord | null }) {
  const [state, formAction, pending] = useActionState<AdminTestimonialState, FormData>(
    saveAdminTestimonial,
    null,
  );
  const [rating, setRating] = useState(record?.rating ?? 5);
  const [fileName, setFileName] = useState("");
  const [clientError, setClientError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const editingId = record?.id ?? "";

  function validateFile(file: File) {
    if (!file.type.startsWith("image/")) return "Avatar must be an image file.";
    if (file.size > MAX_TESTIMONIAL_AVATAR_BYTES) return "Avatar must be 1MB or less.";
    return "";
  }

  function syncFile(file?: File) {
    if (!file) {
      setFileName("");
      setClientError("");
      return;
    }

    const error = validateFile(file);
    setClientError(error);
    setFileName(error ? "" : file.name);
    if (error && fileRef.current) fileRef.current.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file || !fileRef.current) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileRef.current.files = transfer.files;
    syncFile(file);
  }

  return (
    <form key={editingId || "new"} action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="__id" value={editingId} />
      <input type="hidden" name="__avatar" value={record?.avatar ?? ""} />

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            Name <span className="text-gold-ink">*</span>
          </span>
          <input
            name="name"
            defaultValue={record?.name ?? ""}
            minLength={3}
            required
            className={INPUT}
          />
        </label>

        <label>
          <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            Position <span className="text-gold-ink">*</span>
          </span>
          <input name="position" defaultValue={record?.position ?? ""} required className={INPUT} />
        </label>

        <label className="md:col-span-2">
          <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            Content <span className="text-gold-ink">*</span>
          </span>
          <textarea
            name="content"
            defaultValue={record?.content ?? ""}
            minLength={10}
            required
            rows={5}
            className={INPUT}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_1.2fr_0.7fr]">
        <div>
          <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            Rating
          </span>
          <input type="hidden" name="rating" value={rating} readOnly />
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`border-line flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                  value <= rating ? "bg-charcoal text-cream" : "bg-card text-ink-soft"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="border-line bg-cream/55 hover:bg-cream-deep/70 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors"
        >
          <Upload aria-hidden className="text-ink-soft mb-2 size-5" />
          <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            {fileName || record?.avatar || "Upload avatar"}
          </span>
          <span className="text-ink-soft mt-1 text-xs">Image only, max 1MB</span>
          <input
            ref={fileRef}
            name="avatar"
            type="file"
            accept="image/*"
            onChange={(event) => syncFile(event.target.files?.[0])}
            className="sr-only"
          />
        </label>

        <label className="border-line bg-card flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <span className="text-ink-soft font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            Active
          </span>
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={record?.isActive ?? true}
            className="border-line bg-card accent-ink h-5 w-5 rounded border"
          />
        </label>
      </div>

      {state?.error || clientError ? (
        <p role="alert" className="text-danger text-[13px]">
          {clientError || state?.error}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={pending || Boolean(clientError)}
          className="bg-ink text-cream hover:bg-ink-soft rounded-full px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:opacity-50"
        >
          {pending ? "Saving..." : editingId ? "Save changes" : "Create active testimonial"}
        </button>
      </div>
    </form>
  );
}
