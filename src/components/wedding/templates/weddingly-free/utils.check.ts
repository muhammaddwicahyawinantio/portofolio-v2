/**
 * Cek photoBackgroundStyle: background CSS harus selalu punya fallback
 * (color + gradient) yang tidak bergantung pada URL foto berhasil dimuat,
 * DAN saat ada foto, layer mood-nya harus translucent (bukan opaque) supaya
 * foto benar-benar kelihatan di baliknya.
 * Jalankan: npm run check
 */
import assert from "node:assert/strict";
import { photoBackgroundStyle } from "./utils";

const withPhoto = photoBackgroundStyle("/uploads/cover.jpg");
assert.equal(withPhoto.backgroundColor, "var(--w-bg)", "selalu punya backgroundColor");
assert.ok(String(withPhoto.backgroundImage).includes('url("/uploads/cover.jpg")'), "foto ikut dilapis");
assert.ok(String(withPhoto.backgroundImage).includes("linear-gradient"), "gradient tetap ada di atas foto");
assert.ok(
  String(withPhoto.backgroundImage).includes("45%"),
  "saat ada foto, layer mood harus translucent (45%) supaya foto tidak tertutup total",
);

const noPhoto = photoBackgroundStyle(null);
assert.equal(noPhoto.backgroundColor, "var(--w-bg)");
assert.ok(!String(noPhoto.backgroundImage).includes("url("), "tanpa foto -> tidak ada layer url()");
assert.ok(String(noPhoto.backgroundImage).includes("linear-gradient"), "gradient tetap tampil tanpa foto");
assert.ok(
  String(noPhoto.backgroundImage).includes("100%"),
  "tanpa foto, layer mood harus solid (100%) untuk fallback premium",
);

const empty = photoBackgroundStyle("");
assert.ok(!String(empty.backgroundImage).includes("url("), "string kosong diperlakukan sama seperti null");

const undef = photoBackgroundStyle(undefined);
assert.ok(!String(undef.backgroundImage).includes("url("), "undefined diperlakukan sama seperti null");

console.log("weddingly-free utils: semua cek lolos");
