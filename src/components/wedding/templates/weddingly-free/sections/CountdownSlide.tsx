"use client";
import { useEffect, useState } from "react";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

export default function CountdownSlide({ date }: { date: string | Date | null }) {
  const target = date ? new Date(date).getTime() : null;
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (target === null) return;
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (target === null) return null;

  const cells: [number, string][] = [
    [t.d, "Hari"],
    [t.h, "Jam"],
    [t.m, "Menit"],
    [t.s, "Detik"],
  ];

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center bg-[var(--w-bg)] px-6 py-16 text-center">
      <Eyebrow>Counting Down</Eyebrow>
      <div className="flex gap-3">
        {cells.map(([n, label]) => (
          <div
            key={label}
            className="min-w-16 rounded-xl border border-[var(--w-accent)]/30 bg-white/40 px-3 py-4 backdrop-blur-sm"
          >
            <div className="font-[family-name:var(--w-font-display)] text-3xl text-[var(--w-primary)]">{n}</div>
            <div className="mt-1 text-[10px] tracking-[0.15em] uppercase opacity-60">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
