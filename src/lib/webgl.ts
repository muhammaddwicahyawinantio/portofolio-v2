/**
 * Gerbang tunggal untuk semua efek WebGL. Dipanggil sebelum modul Three.js
 * di-import, jadi perangkat yang tidak lolos tidak pernah mengunduh bundle-nya
 * sama sekali — bukan sekadar tidak merendernya.
 */
export function canRunHeavyEffects(): boolean {
  if (typeof window === "undefined") return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // Layar sentuh: baterai dan GPU-nya tidak sebanding dengan hasilnya.
  if (window.matchMedia("(pointer: coarse)").matches) return false;

  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.deviceMemory ?? 8) < 4) return false;
  if ((navigator.hardwareConcurrency ?? 8) < 4) return false;

  return hasWebGL();
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Dibatasi 2: di layar 3x, piksel ketiga tidak terlihat tapi biayanya nyata. */
export function renderScale(): number {
  return Math.min(window.devicePixelRatio || 1, 2);
}
