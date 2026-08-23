"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import AccordionGallery from "@/components/ui/accordion-gallery";

/** Ringkasan yang dirender di panel — sudah dilokalkan di server. */
export type ProjectPanel = {
  slug: string;
  title: string;
  category: string;
  image: string;
};

/**
 * Panel yang sudah terbuka diklik = pindah ke halaman studi kasusnya.
 *
 * Sebelumnya klik membuka <dialog> yang menarik detail proyek lewat AJAX dan
 * merender pratinjaunya di tempat, lengkap dengan tautan "buka halaman penuh"
 * di dasarnya — dua jalan menuju isi yang sama. Sekarang panelnya langsung
 * menuju /projects/[slug].
 *
 * useRouter dari @/i18n/navigation, bukan <a href> biasa yang sudah didukung
 * AccordionGallery lewat item.link: localePrefix "as-needed" berarti URL ID
 * butuh awalan /id, dan navigasi keras akan memuat ulang halaman sehingga
 * `hasPlayed` di Intro ter-reset dan intro terputar ulang tiap buka proyek.
 */
export default function ProjectAccordion({ panels }: { panels: ProjectPanel[] }) {
  const t = useTranslations("projects");
  const router = useRouter();

  return (
    <>
      {/* height + expandRatio yang menentukan besar gambarnya: tinggi barisnya,
          dan berapa bagian lebar yang diambil panel yang terbuka. Keduanya
          dinaikkan bersamaan supaya panel terbuka tetap mendatar — menaikkan
          tingginya saja bikin sampul (yang lanskap) makin terpotong kiri-kanan. */}
      <AccordionGallery
        items={panels.map((p) => ({ image: p.image, label: p.title, alt: p.title }))}
        defaultIndex={Math.min(2, panels.length - 1)}
        accentColor="var(--color-gold)"
        overlayColor="var(--color-ink)"
        textColor="var(--color-cream)"
        radius={20}
        gap={6}
        height={520}
        expandRatio={0.58}
        onSelect={(index) => {
          const panel = panels[index];
          if (panel) router.push(`/projects/${panel.slug}`);
        }}
      />

      <p className="text-ink-soft mt-6 text-[11px] tracking-[0.2em] uppercase">{t("openHint")}</p>
    </>
  );
}
