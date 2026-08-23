import type { Metadata } from "next";
import { Spectral, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";

// Root layout kedua. Admin berada di luar segmen [locale] karena CMS-nya
// satu bahasa, jadi ia butuh <html>/<body> sendiri.
const display = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display-family",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dwi CMS",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-cream text-ink font-body">{children}</body>
    </html>
  );
}
