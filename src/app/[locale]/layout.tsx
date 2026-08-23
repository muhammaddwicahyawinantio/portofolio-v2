import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Spectral, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/animations/SmoothScroll";
import CustomCursor from "@/components/animations/CustomCursor";
import Intro from "@/components/animations/Intro";
import GutterRule from "@/components/ui/GutterRule";
import { routing } from "@/i18n/routing";
import { SITE_URL, alternates, localePath } from "@/lib/seo";
import "@/styles/globals.css";

/**
 * Spectral untuk display (design.md §3): serif editorial yang bobot 500–600-nya
 * memang digambar, bukan disintesis browser — dan italic-nya ikut dimuat karena
 * §3 memakainya untuk satu-dua kata penekanan di dalam judul, bukan sebagai
 * miring palsu.
 *
 * Plus Jakarta Sans untuk teks: seluruh subtitle, label, dan eyebrow di situs
 * ini kecil (10–14px) dan banyak yang uppercase ber-tracking lebar. Ia tetap
 * terbaca di ukuran itu, dan huruf-huruf terbukanya menyeimbangkan Spectral
 * yang jauh lebih berkarakter.
 */
const display = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-family",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-family",
  display: "swap",
});

/**
 * IBM Plex Mono untuk utility: eyebrow, label, caption, angka/data, dan tanda
 * "drafting" (koordinat, indeks section, dimensi). Ia yang membawa identitas
 * teknis/blueprint studio ini — sekaligus memutus kesan "serif editorial"
 * generik. Cukup 400/500/600; mono tidak butuh bobot berat.
 */
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-family",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: "%s — Dwi Studio" },
    description: t("description"),
    alternates: alternates(locale),
    openGraph: {
      type: "website",
      siteName: "Dwi Studio",
      title: t("title"),
      description: t("description"),
      locale: locale === "id" ? "id_ID" : "en_US",
      url: localePath(locale),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Wajib sebelum render supaya halaman tetap bisa di-prerender statis.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      {/* Tanpa bg-*: gradasi cream didefinisikan di globals.css, dan utility
            background apa pun di sini akan menimpanya. */}
      {/* Tanpa text-*: warna teks dipegang `body` di globals.css. Utility di sini
            menang atas @layer base, dan akan memaksa seluruh teks jadi satu warna. */}
      <body className="font-body">
        <NextIntlClientProvider messages={messages}>
          <CustomCursor />
          {/* Intro wajib di dalam SmoothScroll: ia memanggil useLenis() untuk
              menghentikan smooth-scroll selama tirai masih tertutup, dan hook
              itu hanya mengembalikan instance di dalam context ReactLenis. */}
          <SmoothScroll>
            <Intro />
            <Header />
            {/* relative: GutterRule diukur terhadap <main>, jadi garisnya
                berhenti tepat di mana footer mulai. */}
            <main className="relative">
              <GutterRule />
              {children}
            </main>
            <Footer />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
