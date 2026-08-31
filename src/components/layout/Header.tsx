"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitch from "@/components/layout/LocaleSwitch";
import PillNav from "@/components/ui/pill-nav";
import { ShinyContent, shinyButtonAnimation, shinyButtonClassName } from "@/components/ui/shiny-button";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Link next-intl dianimasikan langsung — CTA ini harus tetap tautan (navigasi
// ke /contact), bukan <button> tanpa aksi seperti ShinyButton generiknya.
const MotionLink = motion.create(Link);

/**
 * Melayang tanpa background maupun border. Navigasinya PillNav dari ReactBits:
 * lambang bulat di kiri, lalu deretan pil yang tersapu lingkaran saat hover.
 *
 * PillNav sendiri hanya berisi lambang dan pil. LocaleSwitch dan CTA "Get in
 * touch" tetap berdiri di kanan sebagai elemen terpisah, seperti sebelumnya —
 * keduanya bukan tautan navigasi dan tidak ada tempatnya di dalam pil.
 */
export default function Header() {
  const t = useTranslations("nav");
  const tMenu = useTranslations("menu");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 50);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const toItem = (item: (typeof NAV)[number]) => ({ label: t(item.key), href: item.href });

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        data-scrolled={isScrolled ? "true" : "false"}
        className="site-header-shell mx-auto flex flex-row items-center justify-between gap-2 px-2.5 py-2 md:gap-6 md:px-3 md:py-2.5"
      >
        <div className="pointer-events-auto">
          <PillNav
            logo={
              // eslint-disable-next-line @next/next/no-img-element -- logo.svg is a static brand asset already used in this codebase.
              <img src="/logo.svg" alt="" className="nav-logo-image" />
            }
            logoClassName="pill-logo-image"
            logoAriaLabel="DwiStudio"
            animateLogoOnHover={false}
            menuLabel={tMenu("open")}
            closeMenuLabel={tMenu("close")}
            items={NAV.map(toItem)}
            // Contact tidak jadi pil di desktop: CTA "Get in touch" di kanan
            // navbar sudah menuju halaman yang sama, jadi pilnya cuma tautan
            // kedua ke tujuan yang sama. Di mobile CTA itu tertutup panel saat
            // menu terbuka, jadi di sana Contact tetap ada.
            desktopItems={NAV.filter((item) => item.key !== "contact").map(toItem)}
            baseColor="var(--color-charcoal)"
            pillColor="var(--color-card)"
            pillTextColor="var(--color-ink)"
            hoveredPillTextColor="var(--color-cream)"
          />
        </div>

        {/* Ditandai, bukan diberi warna di sini: dua anak ini satu-satunya isi
            header yang mewarisi ink dari body — PillNav membawa pil ber-fill
            sendiri, jadi ia terbaca di atas apa pun. Di atas hero video mereka
            beralih ke cream lewat `.over-hero` (globals.css). Penanda ini
            juga yang menjaga PillNav TIDAK ikut dibalik: pil-nya ber-fill terang
            dengan teks ink, dan membalikkannya jadi cream-di-atas-cream. */}
        <div data-header-actions className="pointer-events-auto flex items-center gap-2.5 md:gap-6">
          <LocaleSwitch />
          <CtaLink href="/contact">{t("getInTouch")}</CtaLink>
        </div>
      </div>
    </header>
  );
}

/**
 * CTA terpisah dari navbar: pill "shiny button" — sama persis efeknya dengan
 * ShinyButton, cuma akarnya <a> (lewat motion.create) supaya tetap tautan.
 *
 * Disembunyikan di bawah `md:`: digabung dengan logo+wordmark+tombol menu di
 * kiri dan LocaleSwitch di kanan, lebar gabungannya melebihi lebar shell di
 * setiap breakpoint mobile (360–430px, diukur lewat CDP) — pil ini yang paling
 * lebar (~108px) dan yang terpotong viewport. Tidak hilang fungsinya: item nav
 * "Contact" sudah ada di panel StaggeredMenu mobile (lihat komentar Header di
 * atas), jadi CTA ini murni duplikat di mobile, sama seperti pil Contact yang
 * juga sudah tidak dobel di desktop.
 */
function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <MotionLink
      href={href}
      {...shinyButtonAnimation}
      className={cn("hidden md:inline", shinyButtonClassName)}
    >
      <ShinyContent>{children}</ShinyContent>
    </MotionLink>
  );
}
