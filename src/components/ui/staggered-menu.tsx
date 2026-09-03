"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { gsap } from "@/lib/gsap";
import "./staggered-menu.css";

export type StaggeredMenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

/**
 * Mobile menu ala React Bits CardNav, disesuaikan dengan navbar existing.
 *
 * Komponen ini tetap bernama StaggeredMenu supaya integrasi PillNav tidak perlu
 * berubah, tetapi perilakunya sekarang bukan fullscreen drawer: tombol BUKA
 * membuka panel kartu kecil di bawah header, memakai route i18n existing, dan
 * menutup otomatis saat navigasi.
 */
export default function StaggeredMenu({
  items,
  openLabel,
  closeLabel,
}: {
  items: StaggeredMenuItem[];
  openLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [textLines, setTextLines] = useState<string[]>([openLabel, closeLabel]);
  // Portal target: .sm-surface is position:fixed, meant to sit relative to
  // the VIEWPORT. It used to just render inline inside .pill-nav, which was
  // harmless only because no ancestor ever had a `transform`. Header scroll-
  // shrink now wants transform:scale() on an ancestor (.site-header-shell) —
  // any transformed ancestor becomes the containing block for ALL of its
  // fixed/absolute descendants, so without this portal the dropdown panel
  // would shrink and mis-position itself the moment it's opened while
  // scrolled. Gated on mount (document doesn't exist during SSR): server and
  // the first client render both render nothing here, so this introduces no
  // hydration mismatch — the portal's content simply appears one tick later,
  // same as any other client-only effect. setOpenState's existing
  // `menuTlRef.current ?? createTimeline()` fallback already covers the case
  // where the mount-triggered effect below fires before this flips true.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const openRef = useRef(false);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLLIElement | null>>([]);
  const plusHRef = useRef<HTMLSpanElement>(null);
  const plusVRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const textInnerRef = useRef<HTMLSpanElement>(null);

  const menuTlRef = useRef<gsap.core.Timeline | null>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const textTweenRef = useRef<gsap.core.Tween | null>(null);

  const pathname = usePathname();
  const itemCount = items.length;

  const getExpandedHeight = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return 0;
    return panel.scrollHeight;
  }, []);

  const createTimeline = useCallback(() => {
    const surface = surfaceRef.current;
    const panel = panelRef.current;
    const cards = cardRefs.current.filter((card): card is HTMLLIElement => Boolean(card));

    if (!surface || !panel) return null;

    gsap.set(surface, { height: 0, autoAlpha: 0, overflow: "hidden" });
    gsap.set(panel, { y: -10 });
    gsap.set(cards, { y: 22, autoAlpha: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(surface, {
      height: getExpandedHeight,
      autoAlpha: 1,
      duration: 0.38,
      ease: "power3.out",
    });

    tl.to(panel, { y: 0, duration: 0.38, ease: "power3.out" }, 0);

    if (cards.length) {
      tl.to(
        cards,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.38,
          ease: "power3.out",
          stagger: 0.055,
        },
        0.08,
      );
    }

    return tl;
  }, [getExpandedHeight]);

  useEffect(() => {
    const tl = createTimeline();
    menuTlRef.current = tl;

    return () => {
      tl?.kill();
      menuTlRef.current = null;
    };
  }, [createTimeline, itemCount]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    if (!icon) return;

    spinTweenRef.current?.kill();
    spinTweenRef.current = gsap.to(icon, {
      rotate: opening ? 225 : 0,
      duration: opening ? 0.55 : 0.28,
      ease: opening ? "power4.out" : "power3.inOut",
      overwrite: "auto",
    });
  }, []);

  const animateText = useCallback(
    (opening: boolean) => {
      const inner = textInnerRef.current;
      if (!inner) return;

      textTweenRef.current?.kill();

      const from = opening ? openLabel : closeLabel;
      const to = opening ? closeLabel : openLabel;
      const seq = [from, to, to];

      setTextLines(seq);
      gsap.set(inner, { yPercent: 0 });

      textTweenRef.current = gsap.to(inner, {
        yPercent: -((seq.length - 1) / seq.length) * 100,
        duration: 0.34,
        ease: "power3.out",
      });
    },
    [openLabel, closeLabel],
  );

  const setOpenState = useCallback(
    (next: boolean) => {
      if (openRef.current === next) return;

      const tl = menuTlRef.current ?? createTimeline();
      if (!tl) return;

      menuTlRef.current = tl;
      openRef.current = next;
      setOpen(next);
      animateIcon(next);
      animateText(next);

      if (next) {
        tl.invalidate().play(0);
      } else {
        tl.reverse();
      }
    },
    [animateIcon, animateText, createTimeline],
  );

  useEffect(() => {
    if (!openRef.current) return;
    setOpenState(false);
  }, [pathname, setOpenState]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenState(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpenState]);

  useEffect(() => {
    const onResize = () => {
      const tl = menuTlRef.current;
      const surface = surfaceRef.current;
      if (!tl || !surface) return;

      tl.kill();
      const nextTl = createTimeline();
      menuTlRef.current = nextTl;

      if (openRef.current && nextTl) {
        nextTl.progress(1);
        gsap.set(surface, { height: getExpandedHeight(), autoAlpha: 1 });
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [createTimeline, getExpandedHeight]);

  return (
    <>
      <button
        type="button"
        className="sm-toggle"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls="staggered-menu-panel"
        onClick={() => setOpenState(!openRef.current)}
      >
        <span className="sm-toggle-textWrap" aria-hidden="true">
          <span ref={textInnerRef} className="sm-toggle-textInner">
            {textLines.map((line, index) => (
              <span className="sm-toggle-line" key={`${line}-${index}`}>
                {line}
              </span>
            ))}
          </span>
        </span>

        <span ref={iconRef} className="sm-icon" aria-hidden="true">
          <span ref={plusHRef} className="sm-icon-line" />
          <span ref={plusVRef} className="sm-icon-line" />
        </span>
      </button>

      {mounted &&
        createPortal(
          <div ref={surfaceRef} className="sm-surface">
            <aside
              id="staggered-menu-panel"
              ref={panelRef}
              className="staggered-menu-panel"
              aria-hidden={!open}
              inert={!open}
            >
              <ul className="sm-card-list">
                {items.map((item, index) => (
                  <li
                    className="sm-nav-card"
                    key={item.href}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                  >
                    <Link
                      className="sm-card-link"
                      href={item.href}
                      aria-label={item.ariaLabel ?? item.label}
                      onClick={() => setOpenState(false)}
                    >
                      <span className="sm-card-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="sm-card-label">{item.label}</span>
                      <ArrowUpRight className="sm-card-icon" aria-hidden="true" strokeWidth={1.8} />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
