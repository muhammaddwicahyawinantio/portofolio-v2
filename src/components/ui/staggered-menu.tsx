"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { Link, usePathname } from "@/i18n/navigation";
import { gsap } from "@/lib/gsap";
import "./staggered-menu.css";

export type StaggeredMenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

/**
 * StaggeredMenu dari ReactBits (reactbits.dev), diadaptasi jadi menu mobile.
 *
 * Penyimpangan dari sumbernya:
 *
 * 1. Header + logo bawaannya dibuang. Sumber merender bar navigasinya sendiri
 *    lengkap dengan <img> logo; di sini tombolnya duduk di dalam PillNav yang
 *    sudah punya emblem dan bar. Panel dan prelayer dibungkus .sm-surface yang
 *    `position: fixed`, karena tanpa wrapper sendiri `absolute` akan menempel
 *    ke navbar.
 * 2. Item memakai <Link> next-intl, bukan <a href>. localePrefix "as-needed"
 *    berarti tautan mentah kehilangan awalan /id, dan navigasi keras memuat
 *    ulang halaman sehingga intro terputar lagi.
 * 3. Panel ditutup saat rute berubah. Sumbernya tidak melakukan ini — dengan
 *    navigasi client-side, panelnya akan tetap terbuka menutupi halaman baru.
 * 4. useLayoutEffect diganti useEffect: komponen ini tetap dirender di server,
 *    dan useLayoutEffect memicu peringatan React di sana.
 * 5. Tambahan yang tidak ada di sumber: Escape untuk menutup, kunci scroll
 *    (overflow + lenis.stop, pola yang sama dipakai Intro), dan `inert` saat
 *    tertutup — sumber hanya memasang aria-hidden, padahal tautannya masih bisa
 *    di-Tab sehingga fokus keyboard hilang ke panel yang tak terlihat.
 */
export default function StaggeredMenu({
  items,
  openLabel,
  closeLabel,
  // Kosong: lapisan penyapu itu persegi warna solid yang duduk tepat di balik
  // panel. Dengan panel yang kini tanpa latar, merekalah yang akan jadi latar
  // teksnya — persis yang dibuang. Stagger label tetap ada, itu gerakan
  // utamanya.
  colors = [],
  accentColor = "var(--color-gold-ink)",
  displayItemNumbering = true,
}: {
  items: StaggeredMenuItem[];
  openLabel: string;
  closeLabel: string;
  colors?: string[];
  accentColor?: string;
  displayItemNumbering?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [textLines, setTextLines] = useState<string[]>([openLabel, closeLabel]);

  const openRef = useRef(false);
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);
  const plusHRef = useRef<HTMLSpanElement>(null);
  const plusVRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const textInnerRef = useRef<HTMLSpanElement>(null);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const textTweenRef = useRef<gsap.core.Tween | null>(null);
  const busyRef = useRef(false);

  const pathname = usePathname();
  const lenis = useLenis();

  // Keadaan awal: panel dan tiap lapisan diparkir di luar layar kanan.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !icon || !textInner) return;

      const layers = preLayersRef.current
        ? Array.from(preLayersRef.current.querySelectorAll<HTMLElement>(".sm-prelayer"))
        : [];
      preLayerElsRef.current = layers;

      // x: 0 wajib. CSS memarkir panel & lapisan dengan transform:
      // translateX(100%) sebagai penjaga sebelum hidrasi, dan GSAP membaca
      // transform yang sudah ada itu sebagai basis x = lebar panel dalam px.
      // xPercent menumpuk di atas basis itu, jadi tanpa reset ini "terbuka"
      // (xPercent 0) tetap menyisakan geseran satu layar penuh — panelnya
      // beranimasi, label-labelnya beranimasi, tapi tak ada yang terlihat.
      gsap.set([panel, ...layers], { xPercent: 100, x: 0 });
      gsap.set(plusHRef.current, { transformOrigin: "50% 50%", rotate: 0 });
      gsap.set(plusVRef.current, { transformOrigin: "50% 50%", rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(textInner, { yPercent: 0 });
    });
    return () => ctx.revert();
  }, []);

  const playOpen = useCallback(() => {
    const panel = panelRef.current;
    if (!panel || busyRef.current) return;
    busyRef.current = true;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;

    const layers = preLayerElsRef.current;
    const labels = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"));
    const numbered = Array.from(
      panel.querySelectorAll<HTMLElement>(".sm-panel-list[data-numbering] .sm-panel-item"),
    );

    if (labels.length) gsap.set(labels, { yPercent: 140, rotate: 10 });
    if (numbered.length) gsap.set(numbered, { "--sm-num-opacity": 0 });

    const tl = gsap.timeline({ paused: true });

    layers.forEach((el, i) => {
      tl.fromTo(
        el,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        i * 0.07,
      );
    });

    const panelAt = layers.length ? (layers.length - 1) * 0.07 + 0.08 : 0;
    const panelDuration = 0.65;
    tl.fromTo(
      panel,
      { xPercent: 100 },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelAt,
    );

    if (labels.length) {
      const itemsAt = panelAt + panelDuration * 0.15;
      tl.to(
        labels,
        { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: { each: 0.1 } },
        itemsAt,
      );
      if (numbered.length) {
        tl.to(
          numbered,
          {
            "--sm-num-opacity": 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: { each: 0.08 },
          },
          itemsAt + 0.1,
        );
      }
    }

    tl.eventCallback("onComplete", () => {
      busyRef.current = false;
    });
    openTlRef.current = tl;
    tl.play(0);
  }, []);

  const playClose = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    openTlRef.current?.kill();
    openTlRef.current = null;
    closeTweenRef.current?.kill();

    closeTweenRef.current = gsap.to([...preLayerElsRef.current, panel], {
      xPercent: 100,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const labels = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"));
        if (labels.length) gsap.set(labels, { yPercent: 140, rotate: 10 });
        const numbered = Array.from(
          panel.querySelectorAll<HTMLElement>(".sm-panel-list[data-numbering] .sm-panel-item"),
        );
        if (numbered.length) gsap.set(numbered, { "--sm-num-opacity": 0 });
        busyRef.current = false;
      },
    });
  }, []);

  /** Ikon plus berputar 225 derajat jadi silang saat terbuka. */
  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    spinTweenRef.current = opening
      ? gsap.to(icon, { rotate: 225, duration: 0.8, ease: "power4.out", overwrite: "auto" })
      : gsap.to(icon, { rotate: 0, duration: 0.35, ease: "power3.inOut", overwrite: "auto" });
  }, []);

  /** Label bergulir melewati beberapa siklus Menu/Close sebelum berhenti. */
  const animateText = useCallback(
    (opening: boolean) => {
      const inner = textInnerRef.current;
      if (!inner) return;
      textTweenRef.current?.kill();

      const from = opening ? openLabel : closeLabel;
      const to = opening ? closeLabel : openLabel;
      const seq = [from];
      let last = from;
      for (let i = 0; i < 3; i++) {
        last = last === openLabel ? closeLabel : openLabel;
        seq.push(last);
      }
      if (last !== to) seq.push(to);
      seq.push(to);
      setTextLines(seq);

      gsap.set(inner, { yPercent: 0 });
      const shift = ((seq.length - 1) / seq.length) * 100;
      textTweenRef.current = gsap.to(inner, {
        yPercent: -shift,
        duration: 0.5 + seq.length * 0.07,
        ease: "power4.out",
      });
    },
    [openLabel, closeLabel],
  );

  const setOpenState = useCallback(
    (next: boolean) => {
      if (openRef.current === next) return;
      openRef.current = next;
      setOpen(next);
      if (next) playOpen();
      else playClose();
      animateIcon(next);
      animateText(next);
    },
    [playOpen, playClose, animateIcon, animateText],
  );

  // Rute berganti = tutup. Tanpa ini panel tetap menutupi halaman tujuan,
  // karena navigasi di sini client-side dan komponennya tidak pernah unmount.
  useEffect(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    playClose();
    animateIcon(false);
    animateText(false);
  }, [pathname, playClose, animateIcon, animateText]);

  // Kunci scroll dua lapis, pola yang sama dipakai Intro: overflow saja tidak
  // cukup karena Lenis menggulir secara programatik.
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.documentElement.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenState(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpenState]);

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
            {textLines.map((line, i) => (
              <span className="sm-toggle-line" key={`${line}-${i}`}>
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

      <div className="sm-surface">
        <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
          {colors.slice(0, 3).map((color, i) => (
            <div key={i} className="sm-prelayer" style={{ background: color }} />
          ))}
        </div>

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel"
          style={{ "--sm-accent": accentColor } as React.CSSProperties}
          aria-hidden={!open}
          // aria-hidden saja menyembunyikan panel dari pembaca layar tapi
          // tautannya tetap bisa di-Tab; inert mencabutnya dari urutan fokus juga.
          inert={!open}
        >
          <div className="sm-panel-inner">
            <ul className="sm-panel-list" data-numbering={displayItemNumbering || undefined}>
              {items.map((item) => (
                <li className="sm-panel-itemWrap" key={item.href}>
                  <Link
                    className="sm-panel-item"
                    href={item.href}
                    aria-label={item.ariaLabel ?? item.label}
                    onClick={() => setOpenState(false)}
                  >
                    <span className="sm-panel-itemLabel">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
