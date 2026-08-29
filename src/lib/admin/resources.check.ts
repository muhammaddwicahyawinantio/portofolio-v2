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
  title_en: "  Title  ",
  title_id: "  Judul  ",
  slug: "judul",
  description_en: "EN copy",
  description_id: "Teks ID",
  caseStudy_en: "EN case study",
  caseStudy_id: "Studi kasus ID",
  category: "Web Design",
  role: "Full Stack Developer",
  year: "2026",
  client: "",
  link: "",
  coverImage: "",
  images: " /a.jpg \n\n /b.jpg \n",
  order: "7",
};

// 1. Nilai dipangkas dan tipenya dipaksa benar.
const parsed = parseFields(projects, form(valid));
assert.equal(parsed.title_en, "Title", "spasi di tepi harus dibuang");
assert.equal(parsed.order, 7, "order harus jadi number");

// 2. Field yang tidak dideklarasikan resource tidak boleh lolos.
const injected = parseFields(projects, form({ ...valid, passwordHash: "x", id: "spoofed" }));
assert.ok(!("passwordHash" in injected), "kolom tak dikenal tidak boleh diteruskan");
assert.ok(!("id" in injected), "id tidak boleh bisa ditimpa lewat form");

// 3. Field wajib yang kosong ditolak, bukan disimpan sebagai string kosong.
assert.throws(
  () => parseFields(projects, form({ ...valid, title_en: "   " })),
  /Title \(EN\) is required/,
  "field wajib yang kosong harus melempar",
);

// 4. Field opsional yang dikosongkan jadi null, bukan "".
const testimonials = getResource("testimonials");
assert.ok(testimonials);
const optional = parseFields(
  testimonials,
  form({
    name: "A",
    position: "",
    content: "C",
    rating: "5",
    avatar: "",
  }),
);
assert.equal(optional.position, null, "position publik opsional harus konsisten");
assert.equal(optional.avatar, null, "opsional yang kosong harus null");

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

// 7. Field baru services: list dua-bahasa kepisah, image jadi string opsional.
const services = getResource("services");
assert.ok(services, "resource services harus ada");
const serviceForm = {
  name_en: "Landing Page",
  name_id: "Landing Page",
  description_en: "A focused page.",
  description_id: "Halaman fokus.",
  icon: "🚀",
  priceLabel: "Rp1.500.000 – Rp4.000.000",
  features_en: " 1 page \n\n Responsive \n",
  features_id: "1 halaman\nResponsive",
  benefits_en: "More leads",
  benefits_id: "Leads lebih banyak",
  image: "",
  order: "1",
};
const parsedService = parseFields(services, form(serviceForm));
assert.deepEqual(
  parsedService.features_en,
  ["1 page", "Responsive"],
  "list dua-bahasa dipisah per baris seperti field list lain",
);
assert.equal(parsedService.image, null, "image kosong harus null, bukan string kosong");

const withImage = parseFields(services, form({ ...serviceForm, image: "/uploads/a.jpg" }));
assert.equal(withImage.image, "/uploads/a.jpg", "image terisi disimpan apa adanya");

// 8. Boolean: checkbox hadir di FormData -> true, absen -> false (semantik native checkbox).
function formWithCheckbox(entries: Record<string, string>, checked: boolean) {
  const data = form(entries);
  if (checked) data.set("featured", "on");
  return data;
}
const checkedParsed = parseFields(projects, formWithCheckbox(valid, true));
assert.equal(checkedParsed.featured, true, "checkbox tercentang harus jadi true");
const uncheckedParsed = parseFields(projects, formWithCheckbox(valid, false));
assert.equal(uncheckedParsed.featured, false, "checkbox absen dari FormData harus jadi false");

// 9. Gallery: JSON array di hidden input diteruskan sebagai string[]; input rusak jadi [].
const galleryForm = form({ ...valid, images: JSON.stringify(["/a.jpg", "/b.mp4"]) });
assert.deepEqual(
  parseFields(projects, galleryForm).images,
  ["/a.jpg", "/b.mp4"],
  "gallery mem-parse JSON array, bukan split baris",
);
const brokenGalleryForm = form({ ...valid, images: "not json" });
assert.deepEqual(
  parseFields(projects, brokenGalleryForm).images,
  [],
  "JSON rusak di gallery harus jatuh ke array kosong, bukan melempar",
);

// 10. Field url divalidasi skemanya server-side — <input type="url"> hanya
// validasi di client, dan ProjectDetail merender field ini ke <a href> publik.
const validUrl = parseFields(projects, form({ ...valid, link: "https://example.com" }));
assert.equal(validUrl.link, "https://example.com", "https:// yang valid harus lolos apa adanya");
assert.throws(
  () => parseFields(projects, form({ ...valid, link: "javascript:alert(1)" })),
  /must start with http/,
  "skema di luar http(s)\\:\\/\\/ atau relatif harus ditolak",
);
assert.equal(
  parseFields(projects, form({ ...valid, link: "" })).link,
  null,
  "url opsional yang dikosongkan harus null, bukan string kosong",
);

// 11. Hero singleton: headline wajib, tapi subheadline/CTA boleh kosong —
// hero harus tetap tampil walau tombolnya belum diisi. Field opsional itu
// SENGAJA tidak lewat helper bilingual(), yang selalu menyetel required.
const hero = getResource("hero");
assert.ok(hero, "resource hero harus ada");
const heroForm = {
  backgroundImage: "",
  headline_en: "One studio.\nFive mediums.",
  headline_id: "Satu studio.\nLima medium.",
  subheadline_en: "",
  subheadline_id: "",
  ctaText_en: "",
  ctaText_id: "",
  ctaUrl: "",
};
const parsedHero = parseFields(hero, form(heroForm));
assert.equal(parsedHero.ctaUrl, null, "CTA URL kosong harus null, bukan string kosong");
assert.equal(parsedHero.subheadline_en, null, "subheadline kosong harus null");
assert.equal(
  parsedHero.headline_en,
  "One studio.\nFive mediums.",
  "newline di headline harus utuh — satu baris teks = satu baris judul",
);
assert.throws(
  () => parseFields(hero, form({ ...heroForm, headline_en: "  " })),
  /Headline \(EN\) is required/,
  "headline tetap wajib",
);

// 12. Benefits: icon emoji wajib, kalau kosong section-nya merender kartu buntung.
const benefits = getResource("benefits");
assert.ok(benefits, "resource benefits harus ada");
const benefitForm = {
  icon: "🛠️",
  title_en: "Built by a professional",
  title_id: "Dikerjakan profesional",
  description_en: "One developer, start to finish.",
  description_id: "Satu developer, dari awal sampai selesai.",
  order: "1",
};
assert.equal(parseFields(benefits, form(benefitForm)).icon, "🛠️");
assert.throws(
  () => parseFields(benefits, form({ ...benefitForm, icon: "" })),
  /Icon \(emoji\) is required/,
  "benefit tanpa icon harus ditolak",
);

// 13. Explore link di Features & Services lewat penjagaan skema url yang sama —
// nilainya dirender langsung ke <a href> publik lewat <Button>.
const features = getResource("features");
assert.ok(features, "resource features harus ada");
const featureForm = {
  title_en: "Research & Direction",
  title_id: "Riset & Arah",
  slug: "riset-dan-arah",
  link: "",
  description_en: "EN copy",
  description_id: "Teks ID",
  image: "",
  order: "1",
};
assert.equal(
  parseFields(features, form(featureForm)).link,
  null,
  "Explore Link kosong harus null — Hero/FeatureSteps yang menentukan fallback-nya",
);
assert.equal(parseFields(features, form({ ...featureForm, link: "/services" })).link, "/services");
assert.throws(
  () => parseFields(features, form({ ...featureForm, link: "javascript:alert(1)" })),
  /must start with http/,
  "Explore Link tidak boleh jadi jalan masuk stored XSS",
);

console.log("parseFields: 13 cek lolos");
