/**
 * Cek validasi input undangan. Sengaja tanpa framework tes; gagal keras.
 * Jalankan: npm run check
 */
import assert from "node:assert/strict";
import { isValidSlug, isSafeUrl, cleanText, parseRsvp, parseMessage } from "./validation";

// Slug
assert.ok(isValidSlug("rizky-dinda"), "slug normal valid");
assert.ok(!isValidSlug("Rizky Dinda"), "spasi & kapital ditolak");
assert.ok(!isValidSlug("-lead"), "tanda hubung di tepi ditolak");

// URL
assert.ok(isSafeUrl("https://maps.google.com"), "https valid");
assert.ok(isSafeUrl("/uploads/a.jpg"), "path relatif valid");
assert.ok(!isSafeUrl("javascript:alert(1)"), "skema javascript ditolak");

// cleanText
assert.equal(cleanText("  hi  ", 10), "hi", "trim");
assert.equal(cleanText("x".repeat(20), 5), "xxxxx", "cap panjang");
assert.equal(cleanText(123, 5), "", "non-string jadi ''");

// RSVP
const okR = parseRsvp({ guestName: " Andi ", attendanceStatus: "attending", guestCount: "3", message: "" });
assert.ok(okR.ok && okR.value.guestName === "Andi" && okR.value.guestCount === 3 && okR.value.message === null);
const badStatus = parseRsvp({ guestName: "A", attendanceStatus: "yes", guestCount: "1", message: "" });
assert.ok(!badStatus.ok, "status di luar enum ditolak");
const clamp = parseRsvp({ guestName: "A", attendanceStatus: "maybe", guestCount: "999", message: "" });
assert.ok(clamp.ok && clamp.value.guestCount === 20, "guestCount di-clamp ke 20");
const noName = parseRsvp({ guestName: "  ", attendanceStatus: "attending", guestCount: "1", message: "" });
assert.ok(!noName.ok, "nama kosong ditolak");

// Guestbook
const okM = parseMessage({ guestName: "Budi", message: "Selamat!" });
assert.ok(okM.ok && okM.value.message === "Selamat!");
assert.ok(!parseMessage({ guestName: "", message: "hi" }).ok, "nama wajib");
assert.ok(!parseMessage({ guestName: "Budi", message: "  " }).ok, "ucapan wajib");

console.log("wedding validation: semua cek lolos");
