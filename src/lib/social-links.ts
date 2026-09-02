import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { SocialLinkItem } from "@/components/ui/footer-section-1-utils/social-cloud";

/**
 * Dikelola dari CMS: Settings → Social Links. Urutannya ikut kolom `order`.
 * Dipakai Footer (baris ikon) dan SocialFab (tombol mengambang) — satu sumber,
 * supaya tidak ada dua query yang bisa melenceng.
 *
 * Kegagalan ditelan jadi array kosong, bukan dilempar: kedua pemakainya hidup
 * di layout, jadi query yang gagal di sini menjatuhkan SELURUH halaman kalau
 * tidak ditangkap.
 *
 * cache(): [locale]/layout.tsx (JSON-LD + SocialFab) DAN Footer memanggilnya
 * dalam satu render yang sama, jadi tanpa ini setiap halaman menembak query
 * identik dua kali.
 */
export const getSocialLinks = cache(async (): Promise<SocialLinkItem[]> => {
  try {
    return await prisma.socialLink.findMany({
      orderBy: { order: "asc" },
      select: { id: true, platform: true, url: true, icon: true },
    });
  } catch (err) {
    console.error("[social-links] gagal memuat:", err);
    return [];
  }
});
