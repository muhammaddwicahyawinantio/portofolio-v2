import type { Metadata } from "next";
import { Roboto_Slab, Open_Sans } from "next/font/google";
import "@/styles/globals.css";

// Root layout kedua. Admin berada di luar segmen [locale] karena CMS-nya
// satu bahasa, jadi ia butuh <html>/<body> sendiri.
const display = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-display-family",
  display: "swap",
});

const body = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
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
      <body className="bg-ink text-paper font-body">{children}</body>
    </html>
  );
}
