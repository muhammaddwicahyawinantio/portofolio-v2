import "server-only";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { NAV } from "@/lib/nav";
import Footer1 from "@/components/ui/footer-section-1";

export default async function Footer() {
  const [t, tNav, socials] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    // Dikelola dari CMS: Settings → Social Links. Urutannya ikut kolom `order`.
    prisma.socialLink
      .findMany({
        orderBy: { order: "asc" },
        select: { id: true, platform: true, url: true, icon: true },
      })
      // Footer hidup di layout, jadi query yang gagal menjatuhkan SELURUH
      // halaman — termasuk intro. Social link cuma pelengkap: kalau DB tidak
      // terjangkau, situsnya tetap tampil tanpa baris ini.
      .catch((err) => {
        console.error("[footer] gagal memuat social links:", err);
        return [];
      }),
  ]);

  return (
    <Footer1
      navLinks={NAV.map((item) => ({ href: item.href, label: tNav(item.key) }))}
      socials={socials}
      statement={t("statement")}
      rights={t("rights")}
      builtWithLabel={t("builtWith")}
      termsLabel={t("terms")}
      privacyLabel={t("privacy")}
    />
  );
}
