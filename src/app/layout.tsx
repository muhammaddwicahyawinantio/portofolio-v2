import type { Metadata } from "next";
import { Roboto_Slab, Open_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ValueRail from "@/components/layout/ValueRail";
import "@/styles/globals.css";

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
  title: "Dwi Studio — One studio, five mediums",
  description: "Web, motion, 3D, sound, and film, designed and built by one hand.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-ink text-paper font-body">
        <ValueRail />
        <div className="md:pl-[var(--spacing-rail)]">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
