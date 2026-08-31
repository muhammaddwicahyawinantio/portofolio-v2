"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface AccordionFeatureItem {
  id: string | number;
  title: string;
  image: string | null;
  description: string;
}

/**
 * Adaptasi Feature197: accordion kiri + gambar kanan di desktop, gambar di
 * atas + accordion di bawah pada mobile — satu elemen gambar yang sama,
 * diposisikan ulang lewat `order-*` responsif, bukan dua salinan DOM.
 *
 * Radix Accordion (type="single" collapsible={false}) adalah SATU-SATUNYA
 * sumber "fitur aktif": tidak ada state kedua yang bisa berbeda dari item
 * accordion yang benar-benar terbuka.
 *
 * Tinggi accordion dibatasi (overflow-y-auto) di kedua breakpoint, bukan
 * cuma desktop: komponen ini dirender sebagai panel kedua HorizontalScroll,
 * yang men-pin section pada satu layar penuh (h-svh) — kalau tumpukannya
 * boleh tumbuh bebas saat sebuah item dibuka, isinya bisa terpotong tanpa
 * cara untuk di-scroll selama pin aktif (masalah yang sama yang membuat
 * FeatureSteps mengukur tinggi sebelum memutuskan pin). Di desktop batas ini
 * datang otomatis dari grid (kolom accordion `h-full` mengikuti tinggi baris
 * yang ditentukan gambar), bukan angka tetap.
 */
export function AccordionFeatureSection({ features }: { features: AccordionFeatureItem[] }) {
  const [value, setValue] = useState(String(features[0]?.id ?? ""));
  const active = features.find((feature) => String(feature.id) === value) ?? features[0];

  return (
    // Padding sendiri, sama seperti ColorChangeCards di slot panel yang sama:
    // HorizontalScroll tidak membungkus panelnya dengan Container.
    //
    // Desktop: min-height + items-center supaya section terasa penuh dalam
    // panggung h-svh HorizontalScroll alih-alih blok kecil mengambang di
    // tengah banyak ruang kosong. py dipangkas (bukan py-12) karena tinggi
    // datang dari min-h ini, bukan dari padding.
    <div className="p-3 py-8 sm:p-4 md:flex md:min-h-[clamp(620px,78vh,820px)] md:items-center md:px-8 md:py-6 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:grid md:max-w-[1500px] md:grid-cols-[0.85fr_1.15fr] md:items-stretch md:gap-10 lg:gap-14">
        <div className="border-line rounded-card relative order-1 aspect-[4/3] w-full shrink-0 overflow-hidden border md:order-2 md:aspect-auto md:h-[clamp(480px,58vh,640px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active?.id ?? "empty"}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {active?.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
                <img src={active.image} alt={active.title} className="h-full w-full object-cover" />
              ) : (
                <div className="bg-cream-deep h-full w-full" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <Accordion
          type="single"
          collapsible={false}
          value={value}
          onValueChange={(next) => next && setValue(next)}
          className="border-line order-2 max-h-[50vh] overflow-y-auto border-t md:order-1 md:h-full md:max-h-none md:border-t-0"
        >
          {features.map((feature) => (
            <AccordionItem key={feature.id} value={String(feature.id)}>
              <AccordionTrigger className="font-display text-ink text-base font-medium tracking-[-0.005em] md:py-5 md:text-[clamp(1.35rem,1.8vw,1.8rem)] md:data-[state=closed]:text-ink-soft md:data-[state=open]:text-ink md:data-[state=open]:font-semibold lg:py-6">
                {feature.title}
              </AccordionTrigger>
              <AccordionContent className="text-ink-soft text-sm leading-[1.7] text-pretty md:text-base md:leading-[1.65] lg:text-lg">
                {feature.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
