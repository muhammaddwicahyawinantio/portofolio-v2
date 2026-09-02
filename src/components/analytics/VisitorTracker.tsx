"use client";

import { useEffect } from "react";

/**
 * Beacon sekali per hari kalender (UTC) per browser ke /api/track, dipasang
 * di [locale]/layout.tsx sehingga /admin, /api, dan aset statis (di luar
 * segmen locale) otomatis tidak pernah memicunya.
 *
 * ponytail: dedupe pakai localStorage — tidak mencegah hitungan ganda dari
 * incognito/browser lain atau bot sederhana. Upgrade path kalau akurasi jadi
 * penting: pindah dedupe ke cookie ber-signature atau IP+UA hashing di server.
 */
export default function VisitorTracker() {
  useEffect(() => {
    const key = `dwistudio_visited_${new Date().toISOString().slice(0, 10)}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // Private mode/storage diblokir: lanjut tanpa dedupe, bukan gagal diam total.
    }
    fetch("/api/track", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
