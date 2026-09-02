"use server";

import { prisma } from "@/lib/prisma";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/**
 * Kunci pesan i18n, bukan teks jadi — komponen yang menerjemahkannya.
 * Union, bukan string: typed messages menolak kunci yang tidak ada di en.json.
 */
export type ContactErrorKey =
  | "errorRequired"
  | "errorEmail"
  | "errorWhatsapp"
  | "errorRate"
  | "errorGeneric";
export type ContactState = { ok?: true; errorKey?: ContactErrorKey } | null;

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

export async function submitMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Kunci diberi awalan per-form: tanpa itu satu IP yang mengirim pesan
  // kontak ikut menghabiskan jatah form testimonial publik, dan sebaliknya.
  if (rateLimited(`contact:${await clientIp()}`, LIMIT, WINDOW_MS)) {
    return { errorKey: "errorRate" };
  }

  const read = (key: string, max: number) => {
    const raw = form.get(key);
    return typeof raw === "string" ? raw.trim().slice(0, max) : "";
  };

  const name = read("name", 120);
  const email = read("email", 200);
  const whatsapp = read("whatsapp", 30);
  const subject = read("subject", 200);
  const message = read("message", 4000);

  if (!name || !email || !subject || !message) return { errorKey: "errorRequired" };
  // Cek bentuk seadanya: satu @, ada titik setelahnya, tanpa spasi.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { errorKey: "errorEmail" };
  // Opsional — hanya divalidasi kalau diisi. Longgar dengan sengaja: nomor
  // WhatsApp datang dalam banyak format (+62..., 08..., dengan spasi/strip).
  if (whatsapp && !/^[0-9+\-\s()]{8,20}$/.test(whatsapp)) return { errorKey: "errorWhatsapp" };

  try {
    await prisma.message.create({
      data: { name, email, whatsapp: whatsapp || null, subject, message },
    });
  } catch {
    return { errorKey: "errorGeneric" };
  }

  return { ok: true };
}
