import { randomUUID } from "node:crypto";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/**
 * Ekstensi berasal dari whitelist MIME type yang divalidasi, bukan dari nama
 * file yang dikirim klien — supaya nama file hasil upload tidak pernah bisa
 * dikontrol klien (mencegah penulisan file dengan ekstensi sembarang).
 */
export function randomUploadName(mimeType: string): string | null {
  const ext = ALLOWED_TYPES[mimeType];
  return ext ? `${randomUUID()}.${ext}` : null;
}
