"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import LocaleSwitch from "@/components/layout/LocaleSwitch";
import MorphMenu from "@/components/animations/MorphMenu";

export default function Header() {
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
        <Link
          href="/"
          className="font-display relative z-50 text-sm font-extrabold tracking-[-0.02em] uppercase md:text-base"
        >
          Dwi Studio
        </Link>

        <div className="relative z-50 flex items-center gap-6 md:gap-8">
          <LocaleSwitch />
          <MorphMenu />
        </div>
      </Container>
    </header>
  );
}
