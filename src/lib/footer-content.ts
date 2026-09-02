import "server-only";
import { prisma } from "@/lib/prisma";

export type FooterContentData = {
  text_en: string;
  text_id: string;
  copyrightText: string;
} | null;

/**
 * Dikelola dari CMS: Settings → Footer. Singleton (id="footer"), sama pola
 * dengan getSocialLinks/getNavigationLinks — kegagalan ditelan jadi null,
 * pemanggil (Footer.tsx) jatuh ke teks i18n statis kalau baris ini kosong.
 */
export async function getFooterContent(): Promise<FooterContentData> {
  try {
    return await prisma.footerContent.findUnique({ where: { id: "footer" } });
  } catch (err) {
    console.error("[footer-content] gagal memuat:", err);
    return null;
  }
}
