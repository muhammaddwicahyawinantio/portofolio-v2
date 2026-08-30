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
 * FeatureSteps mengukur tinggi sebelum memutuskan pin).
 */
export function AccordionFeatureSection({ features }: { features: AccordionFeatureItem[] }) {
  const [value, setValue] = useState(String(features[0]?.id ?? ""));
  const active = features.find((feature) => String(feature.id) === value) ?? features[0];

  return (
    // Padding sendiri, sama seperti ColorChangeCards di slot panel yang sama:
    // HorizontalScroll tidak membungkus panelnya dengan Container.
    <div className="p-3 py-8 sm:p-4 md:p-8 md:py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:h-[28rem] md:flex-row md:items-stretch md:gap-12">
        <div className="border-line rounded-card relative order-1 aspect-[4/3] w-full shrink-0 overflow-hidden border md:order-2 md:aspect-auto md:h-full md:flex-1">
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
          className="border-line order-2 max-h-[50vh] overflow-y-auto border-t md:order-1 md:h-full md:max-h-none md:flex-1 md:border-t-0"
        >
          {features.map((feature) => (
            <AccordionItem key={feature.id} value={String(feature.id)}>
              <AccordionTrigger className="font-display text-ink text-base font-medium tracking-[-0.005em] md:text-lg">
                {feature.title}
              </AccordionTrigger>
              <AccordionContent className="text-ink-soft text-sm leading-[1.7] text-pretty md:text-base">
                {feature.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
