import "server-only";
import { getTranslations } from "next-intl/server";
import { NAV } from "@/lib/nav";
import { getSocialLinks } from "@/lib/social-links";
import Footer1 from "@/components/ui/footer-section-1";

export default async function Footer() {
  const [t, tNav, socials] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    getSocialLinks(),
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
