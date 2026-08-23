"use client";
import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
      className="rounded-full border border-[var(--w-accent)]/50 px-4 py-1.5 text-[11px] tracking-[0.15em] text-[var(--w-primary)] uppercase"
    >
      {copied ? "Tersalin ✓" : "Salin"}
    </button>
  );
}
