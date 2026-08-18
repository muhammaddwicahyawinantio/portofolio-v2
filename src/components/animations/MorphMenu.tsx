"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import { Link, usePathname } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import Magnetic from "@/components/animations/Magnetic";
import { NAV } from "@/lib/nav";

const LINE =
  "bg-paper absolute left-1/2 h-px w-7 -translate-x-1/2 transition-all duration-500 ease-out";

export default function MorphMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const t = useTranslations("menu");
  const nav = useTranslations("nav");
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Tutup sendiri saat rute berubah, supaya overlay tidak menutupi halaman baru.
  useEffect(() => setOpen(false), [pathname]);

  // ponytail: Escape + pemindahan fokus saja, belum focus trap penuh — Tab masih
  // bisa keluar ke elemen di belakang overlay. Dijadwalkan di Fase 9 (audit a11y).
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    // Kunci scroll dua lapis: Lenis menangani wheel, overflow menangani keyboard.
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) {
      lenis?.stop();
      firstLinkRef.current?.focus();
    } else {
      lenis?.start();
    }

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open, lenis]);

  const overlay = (
    <div
      id="menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t("open")}
      // Rail dibiarkan terlihat di desktop — overlay mulai setelahnya.
      className={clsx(
        "bg-ink fixed inset-0 z-40 flex flex-col justify-center transition-[opacity,visibility] duration-500 md:left-[var(--spacing-rail)]",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <Container>
        <nav>
          <ul className="border-graphite/40 border-t">
            {NAV.map((item, i) => (
              <li key={item.key} className="border-graphite/40 border-b">
                {/* inline-block: magnet menarik katanya, bukan seluruh baris. */}
                <Magnetic className="inline-block" strength={0.16}>
                  <Link
                    href={item.href}
                    ref={i === 0 ? firstLinkRef : undefined}
                    onClick={() => setOpen(false)}
                    // Stagger lewat transition-delay: masuk berurutan, keluar serempak.
                    style={{ transitionDelay: open ? `${140 + i * 70}ms` : "0ms" }}
                    className={clsx(
                      "font-display hover:text-ash block py-6 text-[clamp(2.5rem,9vw,6.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] uppercase transition-all duration-500 ease-out md:py-8",
                      open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                    )}
                  >
                    {nav(item.key)}
                  </Link>
                </Magnetic>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  );

  return (
    <>
      <Magnetic className="relative z-50 -m-3 p-3" strength={0.4}>
        <button
          ref={buttonRef}
          type="button"
          data-open={open}
          aria-expanded={open}
          aria-controls="menu-overlay"
          aria-label={open ? t("close") : t("open")}
          onClick={() => setOpen((v) => !v)}
          className="group relative h-8 w-8"
        >
          {/* Dua garis default; garis tengah muncul saat hover, lalu keduanya
            bertemu di tengah dan menyilang saat terbuka. Semua transisi CSS. */}
          <span
            className={clsx(
              LINE,
              "top-[calc(50%-4px)] group-data-[open=true]:top-1/2 group-data-[open=true]:rotate-45",
            )}
          />
          <span
            className={clsx(
              LINE,
              "top-1/2 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 group-data-[open=true]:scale-x-0 group-data-[open=true]:opacity-0",
            )}
          />
          <span
            className={clsx(
              LINE,
              "top-[calc(50%+4px)] group-data-[open=true]:top-1/2 group-data-[open=true]:-rotate-45",
            )}
          />
        </button>
      </Magnetic>

      {/* Portal wajib: backdrop-filter di header bikin header jadi containing
          block untuk descendant position:fixed, jadi overlay akan terkurung. */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
