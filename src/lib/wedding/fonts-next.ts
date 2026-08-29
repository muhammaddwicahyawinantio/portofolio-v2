// next/font loaders for the curated wedding fonts, in one place so both the
// public /undangan layout and the admin preview expose the same --wf-* CSS
// variables. Server-only (next/font can't run in a client module). The plain
// key→var mapping lives in ./fonts (client-safe); this only loads the fonts.
import { Cormorant_Garamond, Playfair_Display, Cinzel, Jost, Lato } from "next/font/google";

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

/** Space-joined className exposing every --wf-* variable. Put on an ancestor of
 *  any wedding template render (public <html> or admin preview wrapper). */
export const weddingFontVars = `${cormorant.variable} ${playfair.variable} ${cinzel.variable} ${jost.variable} ${lato.variable}`;
