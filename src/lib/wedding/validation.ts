// Shared input rules for wedding public submissions and admin saves.
// No server-only / node imports: imported by client forms and by the tsx check.

export const ATTENDANCE = ["attending", "not_attending", "maybe"] as const;
export type Attendance = (typeof ATTENDANCE)[number];

export const GIFT_TYPES = ["bank", "ewallet", "address", "qris"] as const;
export type GiftType = (typeof GIFT_TYPES)[number];

export const WEDDING_STATUSES = ["draft", "published", "archived"] as const;
export type WeddingStatusValue = (typeof WEDDING_STATUSES)[number];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export function isSafeUrl(value: string): boolean {
  return /^(https?:\/\/|\/)/.test(value);
}

/** Trim then hard-cap length. Non-strings become "". */
export function cleanText(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

export type RsvpInput = {
  guestName: string;
  attendanceStatus: Attendance;
  guestCount: number;
  message: string | null;
};

export function parseRsvp(input: {
  guestName: unknown;
  attendanceStatus: unknown;
  guestCount: unknown;
  message: unknown;
}): { ok: true; value: RsvpInput } | { ok: false; error: string } {
  const guestName = cleanText(input.guestName, 100);
  if (!guestName) return { ok: false, error: "Nama wajib diisi." };

  const status = String(input.attendanceStatus ?? "");
  if (!ATTENDANCE.includes(status as Attendance)) {
    return { ok: false, error: "Status kehadiran tidak valid." };
  }

  const n = Number(input.guestCount);
  const guestCount = Number.isFinite(n) ? Math.min(20, Math.max(1, Math.trunc(n))) : 1;

  const message = cleanText(input.message, 500) || null;

  return {
    ok: true,
    value: { guestName, attendanceStatus: status as Attendance, guestCount, message },
  };
}

export type MessageInput = { guestName: string; message: string };

export function parseMessage(input: {
  guestName: unknown;
  message: unknown;
}): { ok: true; value: MessageInput } | { ok: false; error: string } {
  const guestName = cleanText(input.guestName, 100);
  const message = cleanText(input.message, 500);
  if (!guestName) return { ok: false, error: "Nama wajib diisi." };
  if (!message) return { ok: false, error: "Ucapan wajib diisi." };
  return { ok: true, value: { guestName, message } };
}
