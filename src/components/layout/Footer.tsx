import "server-only";
import { getLocale, getTranslations } from "next-intl/server";
import { getNavigationLinks } from "@/lib/navigation";
import { getFooterContent } from "@/lib/footer-content";
import { getSocialLinks } from "@/lib/social-links";
import Footer1 from "@/components/ui/footer-section-1";

export default async function Footer() {
  const [t, locale, socials, footerContent] = await Promise.all([
    getTranslations("footer"),
    getLocale(),
    getSocialLinks(),
    getFooterContent(),
  ]);
  const navLinks = await getNavigationLinks(locale);

  // CMS (Settings → Footer) menang kalau terisi; teks i18n statis adalah
  // fallback aman untuk DB kosong/gagal — sama pola dengan navigasi.
  const statement = (locale === "id" ? footerContent?.text_id : footerContent?.text_en) || t("statement");
  const copyrightText = footerContent?.copyrightText || "© DwiStudio";

  return (
    <Footer1
      navLinks={navLinks}
      socials={socials}
      statement={statement}
      copyrightText={copyrightText}
      rights={t("rights")}
      builtWithLabel={t("builtWith")}
      termsLabel={t("terms")}
      privacyLabel={t("privacy")}
    />
  );
}
