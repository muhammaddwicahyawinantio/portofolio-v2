import assert from "node:assert/strict";
import { rateLimited } from "@/lib/rate-limit";

// Penjaga satu-satunya untuk dua server action publik tanpa autentikasi
// (form kontak + testimonial) dan rute /api/track. Kalau logika jendelanya
// melenceng, ketiganya diam-diam terbuka lagi — jadi ia diuji, bukan dipercaya.

const WINDOW = 1000;

// Di bawah batas: lolos terus.
const a = "check-a";
for (let i = 0; i < 5; i += 1) {
  assert.equal(rateLimited(a, 5, WINDOW), false, `panggilan ke-${i + 1} harusnya lolos`);
}
// Panggilan ke-6 dalam jendela yang sama: ditolak.
assert.equal(rateLimited(a, 5, WINDOW), true, "panggilan melebihi batas harus ditolak");
assert.equal(rateLimited(a, 5, WINDOW), true, "tetap ditolak selama masih di jendela");

// Kunci berbeda punya jatah sendiri — ini yang menjaga awalan "contact:" /
// "testimonial:" / "track:" tidak saling menghabiskan kuota.
assert.equal(rateLimited("check-b", 5, WINDOW), false, "kunci lain tidak ikut terkena");

// Jendela geser: entri yang lebih tua dari windowMs tidak lagi dihitung.
// windowMs 0 berarti setiap entri lama langsung kedaluwarsa.
assert.equal(rateLimited(a, 5, 0), false, "entri kedaluwarsa harus dilupakan");

// Batas 0 menolak semuanya, termasuk panggilan pertama.
assert.equal(rateLimited("check-c", 0, WINDOW), true, "limit 0 menolak panggilan pertama");

console.log("rate-limit: semua cek lolos");
