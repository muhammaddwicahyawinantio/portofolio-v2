"use client";

import { motion, MotionConfig } from "motion/react";
import type { Variants } from "motion/react";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import ScrollScrub from "@/components/animations/ScrollScrub";
import Shuffle from "@/components/ui/shuffle";
import {
  SocialCloud,
  type SocialLinkItem,
} from "@/components/ui/footer-section-1-utils/social-cloud";

export type FooterNavLink = { href: string; label: string };

/** Wordmark latar footer. */
const WORDMARK = ["DwiStudio"];

/**
 * Tumpukan teknologi yang benar-benar dipakai situs ini — cocokkan dengan
 * package.json kalau berubah. Sengaja TIDAK lewat i18n: ini nama produk, dan
 * nama produk tidak diterjemahkan. Hanya labelnya ("Built with") yang lewat
 * i18n, karena itu memang kalimat.
 */
const STACK = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma"];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

/**
 * Failsafe no-JS. motion merender state `initial` ke HTML, jadi tanpa JS
 * seluruh isi footer tertinggal di opacity 0 — pola yang sama dijaga Reveal
 * dan tirai Intro. Hanya elemen reveal yang dipaksa tampil; pil hover di
 * navigasi sengaja dilewati supaya tidak ikut menyala permanen.
 */
const NO_JS_FALLBACK =
  "[data-footer-reveal]{opacity:1!important;transform:none!important}" +
  // Shuffle lahir visibility:hidden dan baru tampil setelah JS siap.
  ".shuffle-parent{visibility:visible!important}";

/** Baris utilitas di dasar footer: mono, satu ukuran, dipakai kiri dan kanan. */
const UTILITY = "font-mono text-[13px] leading-[1.7] tracking-[0.06em]";

export default function Footer1({
  navLinks,
  socials,
  statement,
  rights,
  builtWithLabel,
  termsLabel,
  privacyLabel,
}: {
  navLinks: FooterNavLink[];
  socials: SocialLinkItem[];
  statement: string;
  rights: string;
  builtWithLabel: string;
  termsLabel: string;
  privacyLabel: string;
}) {
  return (
    // reducedMotion="user" membuat motion melewati animasi transform untuk
    // yang memilih reduced motion, sejalan dengan aturan global di globals.css.
    <MotionConfig reducedMotion="user">
      {/* border-t: section penutup di atasnya kini juga cream-1, jadi tanpa
          hairline ini sambungannya tak terlihat sama sekali.
          Yang dipangkas untuk memendekkan footer HANYA ruang — padding, gap,
          dan jarak ke pembatas. Ukuran teks dan ikon sengaja dibiarkan besar:
          itu permintaannya, dan memang di situ perbaikannya. */}
      <footer className="monochrome-dark paper-deep text-ink border-line relative w-full overflow-hidden border-t pt-10 pb-6 md:pt-12 md:pb-7">
        <noscript>
          <style>{NO_JS_FALLBACK}</style>
        </noscript>

        {/* Wordmark sebagai LATAR, bukan elemen dalam alur: melayang naik pelan
            sepanjang footer digulir (ScrollScrub), huruf-hurufnya tersusun
            sendiri saat footer masuk layar (Shuffle). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 select-none"
        >
          {/* flex-col memblokifikasi kedua baris: .shuffle-parent memakai
              display:inline-block dari CSS tanpa layer, yang menang atas
              utility `block` milik Tailwind di @layer utilities. */}
          <ScrollScrub to={{ yPercent: -14 }} className="flex flex-col">
            {WORDMARK.map((line) => (
              <Shuffle
                key={line}
                text={line}
                tag="span"
                triggerOnHover={false}
                shuffleDirection="up"
                duration={0.5}
                shuffleTimes={2}
                stagger={0.05}
                // Wordmark ini duduk di dasar dokumen, jadi default Shuffle
                // (start "top 90%-=100px") tak terjangkau: baris kedua berhenti
                // di top 725 padahal ambangnya 710 dan scroll sudah habis —
                // ia tertinggal visibility:hidden selamanya. threshold 0 +
                // rootMargin 0 memicunya begitu masuk layar.
                threshold={0}
                rootMargin="0px"
                className="font-rampart-one font-display text-ink/[0.07] w-full text-center text-[clamp(2.5rem,13vw,15rem)] leading-[1.05] font-medium tracking-[-0.01em] uppercase"
              />
            ))}
          </ScrollScrub>
        </div>

        <Container>
          <motion.div
            data-footer-reveal
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            variants={containerVariants}
            className="relative z-10 flex flex-col items-center gap-5"
          >
            <motion.div data-footer-reveal variants={itemVariants}>
              <SocialCloud links={socials} className="text-ink" />
            </motion.div>

            {/* Kalimat penutup studio. Naik dari text-lg/xl: ini satu-satunya
                kalimat di footer, dan sebelumnya ia lebih kecil dari tautan
                navigasi di bawahnya. */}
            <motion.p
              data-footer-reveal
              variants={itemVariants}
              className="font-display max-w-2xl text-center text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.02em] text-balance"
            >
              {statement}
            </motion.p>

            {/* Navigasi — sumbernya sama dengan header (lib/nav.ts), supaya
                keduanya tidak pernah berbeda isi. */}
            <motion.nav
              data-footer-reveal
              variants={itemVariants}
              className="relative z-10 flex flex-wrap justify-center gap-x-7 gap-y-3 text-base font-medium md:text-lg"
            >
              {navLinks.map((item) => (
                <motion.div key={item.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href={item.href} className="group relative block px-2.5 py-1.5">
                    <span className="group-hover:text-ink relative z-10 transition-colors duration-300">
                      {item.label}
                    </span>
                    <motion.span
                      className="bg-card rounded-card absolute inset-0 -z-0 origin-center"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        </Container>

        {/* Pita silang beropacity 10% yang dulu di sini dibuang: ia tekstur, dan
            tekstur di situs ini tinggal satu (serat kertas di globals.css).
            Pembatas biasa selalu hairline — aturan 5. */}
        <div aria-hidden className="border-line relative z-10 mt-7 border-t md:mt-8" />

        <Container>
          <motion.div
            data-footer-reveal
            className="relative z-10 mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
          >
            {/* KIRI: tumpukan teknologi, lalu hak cipta di bawahnya. */}
            <div className={`text-ink-soft ${UTILITY}`}>
              <p>
                {builtWithLabel}{" "}
                {STACK.map((tool, index) => (
                  <span key={tool}>
                    {index > 0 ? <span aria-hidden> &middot; </span> : null}
                    <span className="text-ink">{tool}</span>
                  </span>
                ))}
              </p>
              <p className="mt-1.5">
                &copy; {new Date().getFullYear()} DwiStudio. {rights}
              </p>
            </div>

            {/* KANAN: dua halaman legal. Tautan sungguhan, bukan penanda —
                keduanya punya halamannya sendiri di /terms dan /privacy. */}
            <nav className={`flex flex-wrap items-center gap-x-7 gap-y-2 ${UTILITY}`}>
              <Link
                href="/terms"
                className="text-ink-soft hover:text-ink underline-offset-4 transition-colors hover:underline"
              >
                {termsLabel}
              </Link>
              <Link
                href="/privacy"
                className="text-ink-soft hover:text-ink underline-offset-4 transition-colors hover:underline"
              >
                {privacyLabel}
              </Link>
            </nav>
          </motion.div>
        </Container>
      </footer>
    </MotionConfig>
  );
}
