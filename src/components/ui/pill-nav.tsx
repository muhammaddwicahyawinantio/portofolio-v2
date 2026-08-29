"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import StaggeredMenu from "@/components/ui/staggered-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { gsap } from "@/lib/gsap";
import "./pill-nav.css";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

/**
 * PillNav dari ReactBits (reactbits.dev), diadaptasi ke repo ini.
 *
 * Empat penyimpangan dari sumbernya, semuanya karena tuntutan repo — bukan
 * selera:
 *
 * 1. `Link` react-router-dom diganti `Link` @/i18n/navigation. react-router-dom
 *    tidak terpasang dan tidak berlaku di App Router; lebih penting lagi,
 *    localePrefix "as-needed" berarti tautan mentah kehilangan awalan /id.
 *    Cabang `isRouterLink`/`<a>` di sumber ikut hilang: seluruh item nav di sini
 *    rute internal, jadi percabangan itu cabang mati.
 * 2. `activeHref` tidak lagi prop. Sumbernya menuntut pemanggil menghitung rute
 *    aktif; usePathname next-intl sudah mengembalikan path tanpa awalan locale,
 *    jadi komponen ini tahu sendiri dan Header tetap bisa jadi server component.
 * 3. `logo` bukan URL gambar melainkan ReactNode. Lambang studio ini komponen
 *    SVG inline (Emblem) yang dipakai bareng Intro, bukan berkas — memaksanya
 *    jadi <img src> berarti dua sumber lambang yang bisa melenceng.
 * 4. role="menubar"/"menuitem" dibuang. Role itu untuk menu aplikasi ala desktop
 *    dan mengubah cara pembaca layar menavigasinya; navigasi situs yang benar
 *    adalah <nav> berisi <ul> tautan biasa, yang memang sudah dipakai di sini.
 */
export default function PillNav({
  logo,
  logoClassName,
  logoAriaLabel = "Home",
  items,
  desktopItems = items,
  ease = "power3.easeOut",
  baseColor = "var(--color-ink)",
  pillColor = "var(--color-card)",
  hoveredPillTextColor = "var(--color-cream)",
  pillTextColor,
  initialLoadAnimation = false,
  animateLogoOnHover = true,
  menuLabel = "Menu",
  closeMenuLabel = "Close",
}: {
  logo: ReactNode;
  logoClassName?: string;
  logoAriaLabel?: string;
  /** Daftar lengkap; inilah yang muncul di panel menu mobile. */
  items: PillNavItem[];
  /** Bagian yang jadi pil di desktop. Default: sama dengan `items`. */
  desktopItems?: PillNavItem[];
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  initialLoadAnimation?: boolean;
  animateLogoOnHover?: boolean;
  menuLabel?: string;
  closeMenuLabel?: string;
}) {
  const pathname = usePathname();

  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const logoImgRef = useRef<HTMLSpanElement>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const { width: w, height: h } = pill.getBoundingClientRect();
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const hover = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hover, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    // Lebar pil berubah setelah font termuat, dan radius lingkaran hover
    // dihitung dari lebar itu — tanpa ini lingkarannya meleset di muat pertama.
    document.fonts?.ready.then(layout).catch(() => {});

    if (initialLoadAnimation) {
      if (logoRef.current) {
        gsap.set(logoRef.current, { scale: 0 });
        gsap.to(logoRef.current, { scale: 1, duration: 0.6, ease });
      }
      if (navItemsRef.current) {
        gsap.set(navItemsRef.current, { width: 0, overflow: "hidden" });
        gsap.to(navItemsRef.current, { width: "auto", duration: 0.6, ease });
      }
    }

    // Array-nya ditangkap di sini, bukan dibaca lewat .current saat cleanup:
    // isinya dimutasi di tempat, jadi acuannya sama, dan lint tidak lagi
    // mengeluh soal ref yang mungkin sudah berganti saat cleanup berjalan.
    const timelines = tlRefs.current;
    const activeTweens = activeTweenRefs.current;

    return () => {
      window.removeEventListener("resize", onResize);
      timelines.forEach((tl) => tl?.kill());
      activeTweens.forEach((tween) => tween?.kill());
      logoTweenRef.current?.kill();
    };
  }, [desktopItems, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: "auto" });
  };

  const handleLogoEnter = () => {
    if (!animateLogoOnHover) return;
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.4, ease, overwrite: "auto" });
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": pillTextColor ?? baseColor,
  } as React.CSSProperties;

  return (
    <div className="pill-nav-container" style={cssVars}>
      <nav className="pill-nav" aria-label="Primary">
        <Link
          ref={logoRef}
          href="/"
          className={clsx("pill-logo", logoClassName)}
          aria-label={logoAriaLabel}
          onMouseEnter={handleLogoEnter}
        >
          <span ref={logoImgRef}>{logo}</span>
        </Link>

        <div className="pill-nav-items pill-desktop-only" ref={navItemsRef}>
          <ul className="pill-list">
            {desktopItems.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx("pill", pathname === item.href && "is-active")}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Menu mobile: panel staggered, menggantikan hamburger + popover.
            Tombolnya ikut alur navbar; panelnya fixed setinggi layar. */}
        <div className="pill-mobile-only">
          <StaggeredMenu items={items} openLabel={menuLabel} closeLabel={closeMenuLabel} />
        </div>
      </nav>
    </div>
  );
}
