import type { Metadata } from "next";
import { Cormorant_Garamond, Playfair_Display, Cinzel, Jost, Lato } from "next/font/google";
import "@/styles/globals.css";

// Curated wedding fonts. Each exposes a CSS variable consumed by the template
// via --w-font-display / --w-font-body (see fonts.ts + template root).
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--wf-cormorant",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--wf-playfair",
  display: "swap",
});
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--wf-cinzel",
  display: "swap",
});
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--wf-jost",
  display: "swap",
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--wf-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Undangan Pernikahan",
  robots: { index: false, follow: false },
};

export default function UndanganLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${playfair.variable} ${cinzel.variable} ${jost.variable} ${lato.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
