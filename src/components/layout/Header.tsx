import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitch from "@/components/layout/LocaleSwitch";
import Emblem from "@/components/ui/Emblem";
import PillNav from "@/components/ui/pill-nav";
import { NAV } from "@/lib/nav";

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

  const toItem = (item: (typeof NAV)[number]) => ({ label: t(item.key), href: item.href });

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex w-full max-w-[80rem] flex-col items-center gap-3 px-5 py-4 md:flex-row md:justify-between md:gap-6 md:px-8 md:py-5 lg:px-12">
        <div className="pointer-events-auto">
          <PillNav
            logo={<Emblem className="h-full w-full" />}
            logoAriaLabel="Dwi Studio"
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

        <div className="pointer-events-auto flex items-center gap-4 md:gap-6">
          <LocaleSwitch />
          <CtaLink href="/contact">{t("getInTouch")}</CtaLink>
        </div>
      </div>
    </header>
  );
}

/**
 * CTA terpisah dari navbar: pill berbingkai yang isinya disapu dari kiri
 * (origin-left scale-x) lalu panahnya bergeser sedikit ke kanan.
 */
function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group border-line hover:border-charcoal hover:text-cream relative isolate inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-semibold tracking-[0.2em] whitespace-nowrap uppercase transition-colors duration-300 md:px-5 md:text-[11px]"
    >
      <span
        aria-hidden
        className="bg-charcoal absolute inset-0 -z-10 origin-left scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 ease-out group-hover:translate-x-1"
      >
        &#8594;
      </span>
    </Link>
  );
}
