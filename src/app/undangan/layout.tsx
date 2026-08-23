import type { Metadata } from "next";
import { weddingFontVars } from "@/lib/wedding/fonts-next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Undangan Pernikahan",
  robots: { index: false, follow: false },
};

export default function UndanganLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={weddingFontVars}>
      <body>{children}</body>
    </html>
  );
}
