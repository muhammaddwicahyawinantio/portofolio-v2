/**
 * Cek untuk validasi upload gambar/video — batas kepercayaan: ekstensi file
 * yang ditulis ke disk berasal dari whitelist MIME type, bukan dari nama
 * file yang dikirim klien, supaya klien tidak bisa menulis file dengan
 * ekstensi sembarang.
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

// 2. Video didukung untuk cover/gallery project.
assert.ok(randomUploadName("video/mp4")?.endsWith(".mp4"), "video/mp4 harus jadi .mp4");
assert.ok(randomUploadName("video/webm")?.endsWith(".webm"), "video/webm harus jadi .webm");

// 3. MIME type di luar whitelist ditolak (mis. text/html yang menyamar jadi upload).
assert.equal(randomUploadName("text/html"), null, "MIME type tak dikenal harus ditolak");
assert.equal(randomUploadName("application/octet-stream"), null);

// 4. Dua panggilan tidak pernah menghasilkan nama yang sama (uuid v4).
assert.notEqual(randomUploadName("image/png"), randomUploadName("image/png"));

// 5. Batas ukuran cukup untuk klip video case-study pendek, bukan file besar sembarang.
assert.equal(MAX_UPLOAD_BYTES, 20 * 1024 * 1024, "batas 20MB");

console.log("upload: 6 cek lolos");
