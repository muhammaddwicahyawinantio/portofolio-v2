import { Link } from "@/i18n/navigation";
import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * `border` ada di BASE, bukan cuma di varian ghost: kalau hanya ghost yang
 * berbingkai, tingginya beda 2px dari varian solid dan dua tombol bersebelahan
 * jadi tidak sejajar. Warna bingkainya yang dibedakan per varian.
 */
const BASE =
  "inline-flex items-center gap-3 rounded-full border whitespace-nowrap font-body font-semibold uppercase tracking-[0.2em] transition-colors duration-300";

/**
 * Padding dan ukuran huruf sengaja dipisah dari BASE, bukan ditimpa lewat
 * `className`: helper kelasnya clsx, bukan tailwind-merge, jadi `px-7` dan
 * `px-4` akan sama-sama ikut terkirim dan yang menang tergantung urutan di
 * stylesheet. Varian dipilih lewat prop supaya cuma satu yang pernah keluar.
 */
const SIZES = {
  md: "px-7 py-4 text-xs",
  /** Untuk kartu sempit — grid layanan sampai empat kolom. */
  sm: "px-4 py-2.5 text-[10px]",
  /**
   * Tombol ikon: persegi, TANPA padding mendatar. 44px bukan angka estetis —
   * itu target sentuh minimum, dan tombol ini duduk berulang di daftar kartu
   * yang sering dipakai dengan ibu jari. `justify-center` wajib karena BASE
   * memakai inline-flex yang rata kiri.
   *
   * Pemakainya WAJIB mengoper `aria-label`: isinya cuma ikon, dan ikon tidak
   * punya nama yang bisa dibacakan pembaca layar.
   */
  icon: "size-11 justify-center",
};

/**
 * Warna ikut aturan yang sama, dan untuk alasan yang sama: `bg-*` ada di dua
 * varian, jadi menimpanya lewat className akan mengirim keduanya sekaligus.
 * `cream` khusus untuk tombol yang duduk DI ATAS foto gelap — hero. Di atas
 * latar cream biasa ia tidak terbaca, jadi jangan dipakai di luar sana.
 *
 * `charcoal`, bukan `ink`: tombol adalah benda solid, dan sejak rev. B warna
 * benda gelap punya tokennya sendiri terpisah dari warna teks. Hover turun ke
 * charcoal-soft — dulu ia memakai `ink-soft`, yaitu token TEKS SEKUNDER dipakai
 * sebagai latar, persis kebocoran yang aturan 4 brief larang.
 */
const VARIANTS = {
  charcoal:
    "border-charcoal bg-charcoal text-cream hover:border-ink hover:bg-cream hover:text-ink",
  cream:
    "border-cream bg-cream text-ink hover:border-charcoal hover:bg-charcoal hover:text-cream",
  /**
   * Untuk CTA yang BERULANG di dalam kartu. Lima pil charcoal identik dalam satu
   * layar (halaman Services) bikin porsi gelap tersebar rata: lima titik fokus,
   * yang sama saja dengan nol — aturan 1 dan 6 sekaligus. Ghost mengembalikan
   * hierarki: satu-satunya benda solid gelap di layar itu kembali jadi CTA di
   * navbar, dan kartu-kartunya menghangat satu per satu saat disentuh.
   *
   * Hover memakai sand-deep, bukan sand: ini tepi + teks kecil, dan sand-deep
   * yang lolos ambang kontras non-teks 3:1. Bukan untuk CTA tunggal sebuah
   * halaman — itu tetap `charcoal`.
   */
  ghost: "border-line text-ink hover:border-charcoal hover:bg-charcoal hover:text-cream",
};

export default function Button({
  children,
  href,
  className,
  size = "md",
  variant = "charcoal",
  type = "button",
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  size?: keyof typeof SIZES;
  variant?: keyof typeof VARIANTS;
  type?: "button" | "submit";
  /** Wajib untuk `size="icon"` — tombol tanpa teks tidak punya nama. */
  "aria-label"?: string;
}) {
  const cls = clsx(BASE, SIZES[size], VARIANTS[variant], className);

  if (href) {
    // Link next-intl menambahkan awalan locale ke apa pun yang diberikan, jadi
    // URL absolut lewat sini akan jadi "/id/https://…". Tautan keluar dipisah
    // ke <a> biasa — pola yang sama sudah dipakai ProjectDetail dan
    // MediaShowcase untuk tautan ke luar situs.
    if (/^https?:\/\//.test(href)) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={cls} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
