"use client";

import { Plus } from "lucide-react";
import { FloatingButton, FloatingButtonItem } from "@/components/ui/floating-button";
import { SocialIcon, type SocialLinkItem } from "@/components/ui/footer-section-1-utils/social-cloud";

/**
 * Kiri-bawah di semua halaman (lihat pemasangannya di layout), simetris
 * dengan DwiAiTrigger yang menempati kanan-bawah. Datanya dari CMS yang sama
 * dengan baris ikon di footer (lib/social-links.ts) — entri baru di
 * Settings → Social Links otomatis muncul di sini juga, ikon dipetakan lewat
 * SocialIcon (slug dikenal -> glyph brand, tidak dikenal -> Globe).
 */
export function SocialFab({ socials }: { socials: SocialLinkItem[] }) {
  if (socials.length === 0) return null;

  return (
    // Posisi di sini, BUKAN lewat prop className FloatingButton: className-nya
    // digabung dengan `relative` (jangkar popup) lewat cn(), dan Tailwind
    // mengurutkan utilitas position-nya .fixed sebelum .relative di
    // stylesheet — jadi `fixed` yang dikirim lewat sana selalu kalah
    // spesifisitas-sama-tapi-belakangan dari `relative` bawaannya. Wrapper
    // terpisah ini tidak punya konflik position sama sekali.
    <div className="fixed bottom-3 left-3 z-50 sm:bottom-6 sm:left-6">
      <FloatingButton
        triggerContent={
          <button
            type="button"
            aria-label="Social media"
            className="border-line bg-charcoal text-cream shadow-card flex h-12 w-12 items-center justify-center rounded-full border"
          >
            <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        }
      >
        {socials.map((link) => (
          <FloatingButtonItem key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={link.platform}
              className="border-line bg-card text-ink hover:bg-cream-deep shadow-card flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
            >
              <SocialIcon icon={link.icon} className="h-5 w-5" />
            </a>
          </FloatingButtonItem>
        ))}
      </FloatingButton>
    </div>
  );
}
