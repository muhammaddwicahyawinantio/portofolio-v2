import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitch from "@/components/layout/LocaleSwitch";
import { NAV } from "@/lib/nav";

/**
 * Melayang tanpa background maupun border — tidak ada state scroll, tidak ada
 * backdrop-blur. Wordmark di kiri, navigasi di tengah, dan seluruh tautan
 * terlihat di semua ukuran layar (tidak ada hamburger).
 */
export default function Header() {
  const t = useTranslations("nav");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col items-center gap-3 px-6 py-5 md:flex-row md:justify-between md:gap-6 md:px-12 md:py-7 lg:px-20">
        <Link
          href="/"
          className="pointer-events-auto text-[11px] font-semibold tracking-[0.3em] whitespace-nowrap uppercase md:text-xs"
        >
          Dwi Studio
        </Link>

        {/* Di desktop benar-benar di tengah viewport, bukan sekadar di tengah
            sisa ruang: absolute + translate membuat posisinya tidak bergeser
            saat lebar wordmark berubah karena bahasa. */}
        <nav className="pointer-events-auto md:absolute md:left-1/2 md:-translate-x-1/2">
          <ul className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:gap-x-2">
            <li>
              <LocaleSwitch />
            </li>
            {NAV.map((item) => (
              <li key={item.key}>
                <NavLink href={item.href}>{t(item.key)}</NavLink>
              </li>
            ))}
            <li>
              <NavLink href="/contact">{t("getInTouch")}</NavLink>
            </li>
          </ul>
        </nav>

        {/* Penyeimbang lebar wordmark supaya nav yang absolute tidak pernah
            bertabrakan dengannya di layar sedang. */}
        <span aria-hidden className="hidden text-[11px] tracking-[0.3em] uppercase md:invisible md:block md:text-xs">
          Dwi Studio
        </span>
      </div>
    </header>
  );
}

/**
 * Fill on hover: blok solid menyapu naik dari dasar (scale-y-0 -> 100 dengan
 * origin-bottom) dan teks membalik jadi gelap. Blok di belakang teks lewat
 * -z-10 pada elemen absolute, jadi tidak perlu mengubah urutan DOM.
 */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group hover:text-ink relative isolate inline-block px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.2em] whitespace-nowrap uppercase transition-colors duration-300 md:px-3 md:text-[11px]"
    >
      <span
        aria-hidden
        className="bg-paper absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100"
      />
      {children}
    </Link>
  );
}
