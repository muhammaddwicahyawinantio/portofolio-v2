import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type NavigationLink = { href: string; label: string };

/**
 * Jaring pengaman kalau tabel NavigationItem kosong atau query-nya gagal.
 * Tanpa ini situs tampil TANPA navigasi sama sekali — bukan cuma di navbar,
 * tapi juga di footer, karena keduanya minum dari fungsi yang sama.
 *
 * Labelnya ditulis di sini alih-alih diambil dari pesan i18n karena fungsi ini
 * dipanggil dari Header/Footer yang sudah punya locale-nya sendiri, dan
 * menambah dependensi getTranslations di jalur fallback berarti jalur
 * daruratnya sendiri bisa ikut gagal. Ini cerminan seed (prisma/seed.ts).
 */
const FALLBACK: { href: string; en: string; id: string }[] = [
  { href: "/about", en: "About", id: "Tentang" },
  { href: "/projects", en: "Projects", id: "Proyek" },
  { href: "/services", en: "Services", id: "Layanan" },
  { href: "/products", en: "Products", id: "Produk" },
  { href: "/contact", en: "Contact", id: "Kontak" },
];

/**
 * Dikelola dari CMS: Settings → Navbar. Urutannya ikut kolom `order`, dan
 * label ambil `label_en`/`label_id` sesuai locale aktif — dipakai Header
 * (lewat wrapper server) dan Footer, satu sumber sama seperti getSocialLinks.
 *
 * Kegagalan/kosong jatuh ke FALLBACK di atas, bukan dilempar: kedua pemakainya
 * hidup di layout, jadi query yang gagal di sini menjatuhkan SELURUH halaman
 * kalau tidak ditangkap.
 *
 * cache(): Header DAN Footer memanggilnya dalam satu render yang sama, jadi
 * tanpa ini setiap halaman menembak query identik dua kali.
 */
export const getNavigationLinks = cache(
  async (locale: string): Promise<NavigationLink[]> => {
    try {
      const items = await prisma.navigationItem.findMany({ orderBy: { order: "asc" } });
      if (items.length > 0) {
        return items.map((item) => ({
          href: item.url,
          label:
            (locale === "id" ? item.label_id : item.label_en) ||
            item.label_en ||
            item.label_id ||
            item.url,
        }));
      }
    } catch (err) {
      console.error("[navigation] gagal memuat:", err);
    }

    return FALLBACK.map((item) => ({
      href: item.href,
      label: locale === "id" ? item.id : item.en,
    }));
  },
);
