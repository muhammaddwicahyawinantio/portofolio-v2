"use client";

import { motion } from "motion/react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

/** Satu baris tabel SocialLink di CMS. */
export type SocialLinkItem = {
  id: string;
  platform: string;
  url: string;
  icon: string;
};

/**
 * Brand mark digambar inline: lucide v1 sudah membuang ikon brand, dan menarik
 * satu paket ikon penuh demi lima path tidak sepadan.
 *
 * Kunci = isi kolom `icon` di CMS (dinormalkan ke huruf kecil). Kolomnya teks
 * bebas, jadi nilai yang tidak dikenal jatuh ke ikon globe — entri tetap
 * tampil dan bisa diperbaiki dari CMS, bukan hilang diam-diam.
 */
const ICON_PATHS: Record<string, string> = {
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.86.07s-3.6 0-4.86-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.2 8.8 2.2 12 2.2Zm0 3.05a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5Zm0 11.13a4.38 4.38 0 1 1 0-8.76 4.38 4.38 0 0 1 0 8.76Zm6.98-11.4a1.58 1.58 0 1 1-3.15 0 1.58 1.58 0 0 1 3.15 0Z",
  x: "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.67l7.73-8.83L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64Z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.4 21.5h5.16V9.25H2.4V21.5Zm7.4-12.25h4.95v1.68h.07c.69-1.24 2.37-2.05 4.06-2.05 4.34 0 5.14 2.71 5.14 6.24V21.5h-5.15v-5.55c0-1.32-.02-3.02-1.9-3.02-1.9 0-2.2 1.44-2.2 2.93V21.5H9.8V9.25Z",
  dribbble:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.6 4.61a8.4 8.4 0 0 1 1.92 5.25 20.3 20.3 0 0 0-5.9-.28 25 25 0 0 0-.79-1.76c2.2-.9 3.85-2.16 4.77-3.21ZM12 3.47c2.06 0 3.94.76 5.38 2.01-.79.93-2.3 2.1-4.4 2.92a32 32 0 0 0-3.2-4.7c.71-.15 1.45-.23 2.22-.23ZM8.13 4.24a38 38 0 0 1 3.2 4.65 25.4 25.4 0 0 1-7.7 1.02 8.56 8.56 0 0 1 4.5-5.67ZM3.45 12v-.26c1.36.02 5.32-.15 8.6-1.14.26.5.5 1.01.72 1.53-3.5 1-6.63 3.68-8.03 5.44A8.44 8.44 0 0 1 3.45 12Zm2.4 6.72c.95-1.29 3.62-3.79 7.3-4.83a35 35 0 0 1 1.8 6.4 8.5 8.5 0 0 1-9.1-1.57Zm10.6.8a36 36 0 0 0-1.65-6.05c1.98-.3 3.79-.05 5.16.26a8.53 8.53 0 0 1-3.51 5.8Z",
  github:
    "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
};

// Alias supaya nama lama di CMS tidak perlu diedit satu per satu.
const ICON_ALIASES: Record<string, string> = {
  twitter: "x",
  ig: "instagram",
  "linked-in": "linkedin",
};

function iconPath(icon: string): string | undefined {
  const key = icon.trim().toLowerCase();
  return ICON_PATHS[ICON_ALIASES[key] ?? key];
}

export function SocialCloud({ links, className }: { links: SocialLinkItem[]; className?: string }) {
  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", className)}>
      {links.map((link) => {
        const path = iconPath(link.icon);
        return (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={link.platform}
            // p-2.5 = 10px di sekeliling ikon 24px, jadi target sentuhnya pas
            // 44x44 — ambang minimum, bukan angka bebas. Jangan diturunkan lagi
            // tanpa mengecilkan seluruh baris ini dengan cara lain.
            className="hover:bg-card rounded-full p-2.5 transition-colors"
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            {path ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6">
                <path d={path} />
              </svg>
            ) : (
              <Globe aria-hidden="true" className="h-6 w-6" />
            )}
          </motion.a>
        );
      })}
    </div>
  );
}
