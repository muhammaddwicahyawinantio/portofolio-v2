/**
 * Cek untuk validasi upload gambar — batas kepercayaan: ekstensi file yang
 * ditulis ke disk berasal dari whitelist MIME type, bukan dari nama file yang
 * dikirim klien, supaya klien tidak bisa menulis file dengan ekstensi sembarang.
 *
 * Jalankan: npm run check
 */
import assert from "node:assert/strict";
import { MAX_UPLOAD_BYTES, randomUploadName } from "./upload";

// 1. MIME type yang didukung menghasilkan nama file dengan ekstensi yang benar.
const jpgName = randomUploadName("image/jpeg");
assert.ok(jpgName?.endsWith(".jpg"), "image/jpeg harus jadi .jpg");
assert.match(jpgName!, /^[0-9a-f-]+\.jpg$/, "nama file harus uuid + ekstensi, tanpa input klien");

assert.ok(randomUploadName("image/png")?.endsWith(".png"));
assert.ok(randomUploadName("image/webp")?.endsWith(".webp"));

// 2. MIME type di luar whitelist ditolak (mis. text/html yang menyamar jadi upload).
assert.equal(randomUploadName("text/html"), null, "MIME type tak dikenal harus ditolak");
assert.equal(randomUploadName("application/octet-stream"), null);

// 3. Dua panggilan tidak pernah menghasilkan nama yang sama (uuid v4).
assert.notEqual(randomUploadName("image/png"), randomUploadName("image/png"));

// 4. Batas ukuran wajar untuk foto profil/kartu, bukan file besar sembarang.
assert.equal(MAX_UPLOAD_BYTES, 5 * 1024 * 1024, "batas 5MB");

console.log("upload: 5 cek lolos");
