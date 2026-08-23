"use client";

import { Fragment } from "react";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Route-aware: usePathname dari next-intl mengembalikan path tanpa prefix locale,
 * jadi /id/about -> "/about" dan tombol EN mengarah ke /about, ID ke /id/about.
 */
export default function LocaleSwitch() {
  const pathname = usePathname();
  const active = useLocale();
  const t = useTranslations("locale");

  return (
    <div
      aria-label={t("switchLabel")}
      className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase"
    >
      {routing.locales.map((locale, i) => (
        <Fragment key={locale}>
          {i > 0 && (
            <span aria-hidden className="text-ink-soft">
              /
            </span>
          )}
          <Link
            href={pathname}
            locale={locale}
            aria-current={locale === active ? "true" : undefined}
            className={clsx(
              "hover:text-ink transition-colors duration-300",
              locale === active ? "text-ink" : "text-ink-soft",
            )}
          >
            {t(locale)}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}
