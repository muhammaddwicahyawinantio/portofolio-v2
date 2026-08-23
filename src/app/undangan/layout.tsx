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
      {/* suppressHydrationWarning: browser extensions (Grammarly, password
          managers, etc.) inject attributes into <body> before React hydrates,
          which React reports as a hydration mismatch. This silences that
          false positive only for <body>'s own attributes — real mismatches in
          the template components are still reported. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
