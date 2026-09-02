import "server-only";
import { prisma } from "@/lib/prisma";

export type ContactSettingsData = {
  qrImage: string | null;
  qrLabel_en: string | null;
  qrLabel_id: string | null;
} | null;

/**
 * Dikelola dari CMS: Settings → Contact. Singleton (id="contact"), sama pola
 * dengan getFooterContent — kegagalan/kosong ditelan jadi null, halaman
 * /contact cukup menyembunyikan blok QR kalau ini null.
 */
export async function getContactSettings(): Promise<ContactSettingsData> {
  try {
    return await prisma.contactSettings.findUnique({ where: { id: "contact" } });
  } catch (err) {
    console.error("[contact-settings] gagal memuat:", err);
    return null;
  }
}
