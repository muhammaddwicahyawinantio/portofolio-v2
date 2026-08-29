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
  // Trek musik di halaman About. Sama seperti PDF di bawah: isVideoUrl()
  // diturunkan dari entri video/* saja, jadi ini tidak menggeser deteksi video.
  "audio/mpeg": "mp3",
  // Untuk CV/resume di halaman About.
  "application/pdf": "pdf",
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

/**
 * Kolom `images` di Prisma bertipe Json, jadi bentuknya tidak dijamin. Satu
 * penyaring dipakai bersama oleh semua pembaca supaya tidak ada versi kedua
 * yang diam-diam beda.
 */
export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}
