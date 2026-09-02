"use client";

import { useActionState, useEffect, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Send, Sparkles, Upload } from "lucide-react";
import { submitPublicTestimonial, type PublicTestimonialState } from "@/lib/testimonials/actions";
import { MAX_TESTIMONIAL_AVATAR_BYTES, MAX_TESTIMONIAL_AVATAR_MB } from "@/lib/testimonials/constants";

const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors";

export default function ShareYourStoryForm({ locale }: { locale: string }) {
  const id = locale === "id";
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [fileName, setFileName] = useState("");
  const [clientError, setClientError] = useState("");
  const [state, formAction, pending] = useActionState<PublicTestimonialState, FormData>(
    submitPublicTestimonial,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state?.ok) return;

    formRef.current?.reset();
    setRating(5);
    setFileName("");
    setClientError("");
  }, [state]);

  function validateFile(file: File) {
    if (!file.type.startsWith("image/"))
      return id ? "File harus berupa gambar." : "File must be an image.";
    if (file.size > MAX_TESTIMONIAL_AVATAR_BYTES) {
      return id
        ? `Ukuran gambar maksimal ${MAX_TESTIMONIAL_AVATAR_MB}MB.`
        : `Image size must be ${MAX_TESTIMONIAL_AVATAR_MB}MB or less.`;
    }
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
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="border-line bg-card/85 text-ink hover:bg-cream group rounded-card shadow-card flex w-full items-center justify-between gap-4 border px-5 py-4 text-left transition-colors active:scale-[0.99] md:px-6"
      >
        <span>
          <span className="font-display block text-xl leading-none font-medium tracking-[-0.01em] md:text-2xl">
            {id ? "Bagikan ceritamu" : "Share your story"}
          </span>
          <span className="text-ink-soft mt-2 block text-sm leading-[1.6]">
            {id
              ? "Tulis pengalamanmu bersama Dwi Studio. Semua cerita direview dulu sebelum tampil."
              : "Tell visitors how working with Dwi Studio felt. Every story is reviewed before it appears."}
          </span>
        </span>
        <Plus
          aria-hidden
          className={`size-5 shrink-0 transition-transform duration-500 ${open ? "rotate-45" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <form
              ref={formRef}
              action={formAction}
              className="border-line bg-card/70 rounded-card shadow-card mt-4 border p-5 md:p-6"
            >
              <AnimatePresence>
                {state?.ok ? (
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="border-line bg-cream-deep mb-5 rounded-lg border px-4 py-3 text-sm"
                  >
                    {state.message}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                    {id ? "Nama" : "Name"} <span className="text-gold-ink">*</span>
                  </span>
                  <input name="name" minLength={3} required className={INPUT} />
                </label>

                <label>
                  <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                    {id ? "Posisi / brand" : "Position / brand"}
                  </span>
                  <input name="position" className={INPUT} />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                  {id ? "Cerita" : "Story"} <span className="text-gold-ink">*</span>
                </span>
                <textarea name="content" minLength={10} required rows={5} className={INPUT} />
              </label>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
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
                    {fileName || (id ? "Unggah avatar opsional" : "Optional avatar upload")}
                  </span>
                  <span className="text-ink-soft mt-1 text-xs">
                    Image only, max {MAX_TESTIMONIAL_AVATAR_MB}MB
                  </span>
                  <input
                    ref={fileRef}
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(event) => syncFile(event.target.files?.[0])}
                    className="sr-only"
                  />
                </label>
              </div>

              {clientError || state?.error ? (
                <p role="alert" className="text-danger mt-4 text-[13px]">
                  {clientError || state?.error}
                </p>
              ) : null}

              <div className="mt-6">
                <div className="group relative inline-flex">
                  <span className="bg-gold absolute inset-0 translate-x-1 translate-y-1 rounded-full transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
                  <button
                    type="submit"
                    disabled={pending || Boolean(clientError)}
                    className="bg-ink text-cream border-ink relative inline-flex items-center gap-3 rounded-full border px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-all hover:invert active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {pending
                      ? id
                        ? "Mengirim..."
                        : "Sending..."
                      : id
                        ? "Kirim cerita"
                        : "Send story"}
                    {pending ? (
                      <Sparkles aria-hidden className="size-4 animate-pulse" />
                    ) : (
                      <Send aria-hidden className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
