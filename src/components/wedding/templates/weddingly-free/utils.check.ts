/**
 * Cek photoBackgroundStyle: background CSS harus selalu punya fallback
 * (color + gradient) yang tidak bergantung pada URL foto berhasil dimuat.
 * Jalankan: npm run check
 */
import assert from "node:assert/strict";
import { photoBackgroundStyle } from "./utils";

const withPhoto = photoBackgroundStyle("/uploads/cover.jpg");
assert.equal(withPhoto.backgroundColor, "var(--w-bg)", "selalu punya backgroundColor");
assert.ok(String(withPhoto.backgroundImage).includes("url(/uploads/cover.jpg)"), "foto ikut dilapis");
assert.ok(String(withPhoto.backgroundImage).includes("linear-gradient"), "gradient tetap ada di atas foto");

const noPhoto = photoBackgroundStyle(null);
assert.equal(noPhoto.backgroundColor, "var(--w-bg)");
assert.ok(!String(noPhoto.backgroundImage).includes("url("), "tanpa foto -> tidak ada layer url()");
assert.ok(String(noPhoto.backgroundImage).includes("linear-gradient"), "gradient tetap tampil tanpa foto");

const empty = photoBackgroundStyle("");
assert.ok(!String(empty.backgroundImage).includes("url("), "string kosong diperlakukan sama seperti null");

const undef = photoBackgroundStyle(undefined);
assert.ok(!String(undef.backgroundImage).includes("url("), "undefined diperlakukan sama seperti null");

console.log("weddingly-free utils: semua cek lolos");
