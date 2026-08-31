"use client";

import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABEL: Record<string, string> = {
  en: "EN",
  id: "ID",
};

const FLAG: Record<string, string> = {
  en: "/images/icons8-us-flag-48.png",
  id: "/images/icons8-indonesia-48.png",
};

/**
 * Route-aware: usePathname dari next-intl mengembalikan path tanpa prefix locale,
 * jadi /en/about -> "/about" dan tombol ID mengarah ke /about, EN ke /en/about.
 */
export default function LocaleSwitch() {
  const pathname = usePathname();
  const active = useLocale();
  const t = useTranslations("locale");

  return (
    <div aria-label={t("switchLabel")} className="locale-switch flex items-center gap-1.5">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          aria-label={t(locale)}
          aria-current={locale === active ? "true" : undefined}
          className={clsx(
            "border-line bg-card/70 text-ink-soft inline-flex h-8 min-w-[3.95rem] items-center justify-center gap-1.5 rounded-full border px-2 font-mono text-[10px] leading-none font-semibold tracking-[0.12em] uppercase transition duration-300 hover:text-ink hover:opacity-100 md:h-9 md:min-w-[4.4rem] md:px-2.5 md:text-[11px]",
            locale === active
              ? "border-ink/20 text-ink bg-card opacity-100 shadow-sm"
              : "opacity-65",
          )}
        >
          <img src={FLAG[locale]} alt="" className="locale-flag shrink-0" />
          <span>{LABEL[locale]}</span>
        </Link>
      ))}
    </div>
  );
}
