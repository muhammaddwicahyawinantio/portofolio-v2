/**
 * Cek untuk math indeks sirkular slider Projects Gallery — kalau delta-nya
 * salah arah, "berikutnya" akan terasa meloncat mundur pas melewati ujung
 * loop (dari proyek terakhir balik ke pertama).
 *
 * Jalankan: npx tsx src/lib/gallery-loop.check.ts
 */
import assert from "node:assert/strict";
import { circularDelta, wrapIndex } from "./gallery-loop";

// 1. wrapIndex selalu jatuh di [0, n).
assert.equal(wrapIndex(0, 5), 0);
assert.equal(wrapIndex(4, 5), 4);
assert.equal(wrapIndex(5, 5), 0, "pas satu putaran harus kembali ke 0");
assert.equal(wrapIndex(-1, 5), 4, "mundur dari 0 harus jadi elemen terakhir");
assert.equal(wrapIndex(-6, 5), 4);

// 2. circularDelta mengambil jalan terpendek di lingkaran, termasuk lewat ujung.
assert.equal(circularDelta(0, 4, 5), -1, "maju dari elemen pertama ke terakhir = mundur satu langkah");
assert.equal(circularDelta(4, 0, 5), 1, "maju dari elemen terakhir ke pertama = maju satu langkah, bukan mundur empat");
assert.equal(circularDelta(1, 3, 5), 2);
assert.equal(circularDelta(3, 1, 5), -2);
assert.equal(circularDelta(2, 2, 5), 0);

// 3. Bekerja juga untuk progress kontinu (float) saat animasi sedang lerp.
assert.ok(
  Math.abs(circularDelta(4.8, 0, 5) - 0.2) < 1e-9,
  "progress float harus tetap mengambil jalan terpendek",
);

// 4. n = 1 (satu proyek saja): tidak ada arah untuk berpindah.
assert.equal(circularDelta(0, 0, 1), 0);
assert.equal(wrapIndex(0, 1), 0);

console.log("gallery-loop: 12 cek lolos");
