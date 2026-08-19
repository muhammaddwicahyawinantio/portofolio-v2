"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import LocaleSwitch from "@/components/layout/LocaleSwitch";
import MorphMenu from "@/components/animations/MorphMenu";
import Emblem from "@/components/ui/Emblem";

export default function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Lenis menggerakkan scroll window sungguhan, jadi scrollY tetap akurat
    // dan event scroll native tetap terpancar.
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 md:pl-[var(--spacing-rail)]",
        scrolled
          ? "border-graphite/60 bg-ink/55 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between md:h-20">
        {/* Lockup yang sama persis dengan penutup intro — emblem, lalu wordmark
            bertracking lebar. Intro tidak memotong ke logo berbeda; ia menyerah
            terima ke elemen yang sama. */}
        <Link href="/" className="relative z-50 flex items-center gap-3">
          <Emblem className="h-6 w-6" />
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase md:text-xs">
            Dwi Studio
          </span>
        </Link>

        <div className="relative z-50 flex items-center gap-5 md:gap-6">
          <LocaleSwitch />
          {/* Pil kontak seperti referensi. Disembunyikan di layar tersempit
              supaya emblem, bahasa, dan tombol menu tidak berdesakan. */}
          <Link
            href="/contact"
            className="hover:bg-paper hover:text-ink hidden rounded-full border border-white/40 bg-white/[0.03] px-5 py-2.5 text-[10px] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm transition-colors hover:border-white sm:inline-block"
          >
            {t("getInTouch")}
          </Link>
          <MorphMenu />
        </div>
      </Container>
    </header>
  );
}
