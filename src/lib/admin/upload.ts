import { randomUUID } from "node:crypto";
import { ALLOWED_TYPES } from "@/lib/media";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * Ekstensi berasal dari whitelist MIME type yang divalidasi, bukan dari nama
 * file yang dikirim klien — supaya nama file hasil upload tidak pernah bisa
 * dikontrol klien (mencegah penulisan file dengan ekstensi sembarang).
 */
export function randomUploadName(mimeType: string): string | null {
  const ext = ALLOWED_TYPES[mimeType];
  return ext ? `${randomUUID()}.${ext}` : null;
}
