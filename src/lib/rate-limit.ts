import { headers } from "next/headers";

/**
 * Jendela geser per-IP untuk form publik. Dipindah ke sini dari lib/contact.ts
 * supaya form testimonial publik memakai penjaga yang SAMA, bukan salinan
 * kedua yang bisa melenceng — keduanya sama-sama server action tanpa
 * autentikasi yang menulis baris ke database.
 *
 * (checkDwiAiRateLimit sengaja dibiarkan terpisah: kuncinya sessionId, bukan
 * IP, dan ia mengembalikan retryAfter untuk header HTTP — kontrak berbeda.)
 *
 * ponytail: in-memory, cukup untuk satu instance. Kalau nanti di-deploy
 * multi-instance atau serverless, pindahkan hitungannya ke Redis atau ke tabel
 * sendiri — Map ini tidak dibagi antar proses.
 */
const hits = new Map<string, number[]>();

export async function clientIp(): Promise<string> {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Buang entri mati sesekali supaya Map tidak tumbuh selamanya.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return false;
}
