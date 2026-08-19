// Kontrak tipe media yang dibagi server dan client. Tidak boleh mengimpor
// apa pun yang khusus Node (mis. node:crypto) — modul ini dipakai langsung
// oleh client component (ResourceForm) selain oleh server (upload route).

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const VIDEO_EXTENSIONS = new Set(
  Object.entries(ALLOWED_TYPES)
    .filter(([mime]) => mime.startsWith("video/"))
    .map(([, ext]) => ext),
);

const VIDEO_URL_PATTERN = new RegExp(`\\.(${[...VIDEO_EXTENSIONS].join("|")})$`, "i");

/**
 * Diturunkan dari ALLOWED_TYPES supaya tidak ada whitelist ekstensi video
 * kedua yang bisa diam-diam melenceng dari yang pertama.
 */
export function isVideoUrl(url: string): boolean {
  return VIDEO_URL_PATTERN.test(url);
}
