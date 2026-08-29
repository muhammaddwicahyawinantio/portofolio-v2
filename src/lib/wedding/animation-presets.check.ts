/**
 * Cek trust-boundary parseAnimationSettings. Nilai tak dikenal harus jatuh ke
 * default classic-elegant, tidak pernah lolos apa adanya.
 * Jalankan: npm run check
 */
import assert from "node:assert/strict";
import { parseAnimationSettings, DEFAULT_SETTINGS, SECTION_KEYS } from "./animation-presets";

// 1. Kosong / null → default penuh.
assert.deepEqual(parseAnimationSettings(null), DEFAULT_SETTINGS, "null → default");
assert.deepEqual(parseAnimationSettings(undefined), DEFAULT_SETTINGS, "undefined → default");
assert.deepEqual(parseAnimationSettings("not json"), DEFAULT_SETTINGS, "string → default");

// 2. Nilai valid dipertahankan.
const valid = parseAnimationSettings({
  global: { smoothScroll: false, profile: "luxury", intensity: "high", background: "shimmer" },
  sections: { gallery: "horizontal-scroll" },
});
assert.equal(valid.global.smoothScroll, false);
assert.equal(valid.global.profile, "luxury");
assert.equal(valid.global.intensity, "high");
assert.equal(valid.global.background, "shimmer");
assert.equal(valid.sections.gallery, "horizontal-scroll");

// 3. Nilai section ilegal → default section itu (bukan diteruskan).
const bad = parseAnimationSettings({
  global: { profile: "neon-blast", intensity: "ultra" },
  sections: { cover: "explode", gift: "copy-pulse" },
});
assert.equal(bad.global.profile, DEFAULT_SETTINGS.global.profile, "profile ilegal → default");
assert.equal(bad.global.intensity, DEFAULT_SETTINGS.global.intensity, "intensity ilegal → default");
assert.equal(bad.sections.cover, DEFAULT_SETTINGS.sections.cover, "cover ilegal → default");
assert.equal(bad.sections.gift, "copy-pulse", "nilai section valid tetap dipakai");

// 4. Semua section selalu ada (tidak pernah undefined).
const partial = parseAnimationSettings({ sections: { cover: "zoom-reveal" } });
for (const k of SECTION_KEYS) {
  assert.equal(typeof partial.sections[k], "string", `section ${k} harus terisi`);
}
assert.equal(partial.sections.cover, "zoom-reveal");

console.log("animation-presets: semua cek lolos");
