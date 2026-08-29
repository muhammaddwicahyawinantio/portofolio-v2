"use client";

import React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Diadaptasi dari resep "shiny button" yang umum beredar (mis. magicui):
 * `hsl(var(--primary))` diganti token repo ini (`--color-ink`/`--color-charcoal`,
 * lewat `color-mix` karena keduanya hex, bukan triplet HSL) dan varian `dark:`
 * dibuang — situs ini satu tema terang saja, tidak ada mode gelap.
 */
export const shinyButtonAnimation = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as const;

export const shinyButtonClassName = cn(
  "relative rounded-full px-3.5 py-2 text-[10px] font-semibold tracking-[0.15em] whitespace-nowrap uppercase transition-shadow duration-300 ease-in-out md:px-6 md:py-2.5 md:text-[12px] md:tracking-[0.2em]",
  "bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--color-charcoal)_10%,transparent)_0%,transparent_60%)]",
  "hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-charcoal)_10%,transparent)]",
);

/** Isi bersama: teks yang diseka highlight, plus cincin tepi yang berkilau. */
export function ShinyContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        className="text-ink/65 relative block size-full"
        style={{
          maskImage:
            "linear-gradient(-75deg,var(--color-ink) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--color-ink) calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        aria-hidden
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          maskComposite: "exclude",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,color-mix(in_srgb,var(--color-charcoal)_10%,transparent)_calc(var(--x)+20%),color-mix(in_srgb,var(--color-charcoal)_50%,transparent)_calc(var(--x)+25%),color-mix(in_srgb,var(--color-charcoal)_10%,transparent)_calc(var(--x)+100%))] p-px"
      />
    </>
  );
}

type ShinyButtonProps = React.ComponentProps<typeof motion.button>;

export const ShinyButton: React.FC<ShinyButtonProps> = ({ children, className, ...props }) => {
  return (
    <motion.button
      {...shinyButtonAnimation}
      {...props}
      className={cn(shinyButtonClassName, className)}
    >
      <ShinyContent>{children as React.ReactNode}</ShinyContent>
    </motion.button>
  );
};
