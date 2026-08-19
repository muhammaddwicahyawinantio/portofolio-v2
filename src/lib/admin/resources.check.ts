/**
 * Cek untuk parseFields — batas kepercayaan CMS. Kalau lapisan ini bocor,
 * nama kolom sembarangan dari form bisa sampai ke Prisma.
 *
 * Jalankan: npm run check
 * Sengaja tanpa framework tes; ini satu file yang gagal keras kalau salah.
 */
import assert from "node:assert/strict";
import { getResource, parseFields } from "./resources";

const projects = getResource("projects");
assert.ok(projects, "resource projects harus ada");

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

const valid = {
  title: "  Judul  ",
  slug: "judul",
  description_en: "EN copy",
  description_id: "Teks ID",
  images: " /a.jpg \n\n /b.jpg \n",
  category: "Web Design",
  order: "7",
};

// 1. Nilai dipangkas dan tipenya dipaksa benar.
const parsed = parseFields(projects, form(valid));
assert.equal(parsed.title, "Judul", "spasi di tepi harus dibuang");
assert.equal(parsed.order, 7, "order harus jadi number");
assert.deepEqual(parsed.images, ["/a.jpg", "/b.jpg"], "list dipisah per baris, baris kosong dibuang");

// 2. Field yang tidak dideklarasikan resource tidak boleh lolos.
const injected = parseFields(projects, form({ ...valid, passwordHash: "x", id: "spoofed" }));
assert.ok(!("passwordHash" in injected), "kolom tak dikenal tidak boleh diteruskan");
assert.ok(!("id" in injected), "id tidak boleh bisa ditimpa lewat form");

// 3. Field wajib yang kosong ditolak, bukan disimpan sebagai string kosong.
assert.throws(
  () => parseFields(projects, form({ ...valid, title: "   " })),
  /Title is required/,
  "field wajib yang kosong harus melempar",
);

// 4. Field opsional yang dikosongkan jadi null, bukan "".
const testimonials = getResource("testimonials");
assert.ok(testimonials);
const optional = parseFields(
  testimonials,
  form({
    clientName: "A",
    position: "B",
    content_en: "C",
    content_id: "D",
    photo: "",
    order: "0",
  }),
);
assert.equal(optional.photo, null, "opsional yang kosong harus null");

// 5. Select hanya menerima opsi yang terdaftar.
const media = getResource("media-gallery");
assert.ok(media);
const mediaForm = {
  fileUrl: "/a.jpg",
  fileType: "IMAGE",
  caption_en: "a",
  caption_id: "a",
  order: "0",
};
assert.equal(parseFields(media, form(mediaForm)).fileType, "IMAGE");
assert.throws(
  () => parseFields(media, form({ ...mediaForm, fileType: "AUDIO" })),
  /must be one of/,
  "nilai select di luar daftar harus ditolak",
);

// 6. Angka yang bukan angka jatuh ke 0, tidak pernah NaN masuk database.
assert.equal(parseFields(projects, form({ ...valid, order: "abc" })).order, 0);

console.log("parseFields: 6 cek lolos");
