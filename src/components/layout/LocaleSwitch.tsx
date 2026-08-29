"use client";

import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

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
    <div aria-label={t("switchLabel")} className="locale-switch flex items-center gap-3">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          aria-label={t(locale)}
          aria-current={locale === active ? "true" : undefined}
          className={clsx(
            "block transition-opacity duration-300 hover:opacity-100",
            locale === active ? "opacity-100" : "opacity-55",
          )}
        >
          <img
            src={FLAG[locale]}
            alt=""
            aria-hidden
            className="locale-flag h-5 w-5 rounded-sm object-cover md:h-6 md:w-6"
          />
        </Link>
      ))}
    </div>
  );
}
