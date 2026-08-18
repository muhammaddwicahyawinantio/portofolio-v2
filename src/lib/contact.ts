"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Kunci pesan i18n, bukan teks jadi — komponen yang menerjemahkannya.
 * Union, bukan string: typed messages menolak kunci yang tidak ada di en.json.
 */
export type ContactErrorKey = "errorRequired" | "errorEmail" | "errorRate" | "errorGeneric";
export type ContactState = { ok?: true; errorKey?: ContactErrorKey } | null;

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

/**
 * ponytail: rate limit in-memory, cukup untuk satu instance. Kalau nanti
 * di-deploy multi-instance atau serverless, pindahkan hitungannya ke Redis
 * atau ke tabel sendiri — Map ini tidak dibagi antar proses.
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Buang entri mati sesekali supaya Map tidak tumbuh selamanya.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return false;
}

export async function submitMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return { errorKey: "errorRate" };

  const read = (key: string, max: number) => {
    const raw = form.get(key);
    return typeof raw === "string" ? raw.trim().slice(0, max) : "";
  };

  const name = read("name", 120);
  const email = read("email", 200);
  const subject = read("subject", 200);
  const message = read("message", 4000);

  if (!name || !email || !subject || !message) return { errorKey: "errorRequired" };
  // Cek bentuk seadanya: satu @, ada titik setelahnya, tanpa spasi.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { errorKey: "errorEmail" };

  try {
    await prisma.message.create({ data: { name, email, subject, message } });
  } catch {
    return { errorKey: "errorGeneric" };
  }

  return { ok: true };
}
