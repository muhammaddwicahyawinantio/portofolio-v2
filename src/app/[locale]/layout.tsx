import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Roboto_Slab, Open_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/animations/SmoothScroll";
import CustomCursor from "@/components/animations/CustomCursor";
import Intro from "@/components/animations/Intro";
import { routing } from "@/i18n/routing";
import { SITE_URL, alternates, localePath } from "@/lib/seo";
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
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body className="bg-ink text-paper font-body">
        <NextIntlClientProvider messages={messages}>
          <CustomCursor />
          {/* Intro wajib di dalam SmoothScroll: ia memanggil useLenis() untuk
              menghentikan smooth-scroll selama tirai masih tertutup, dan hook
              itu hanya mengembalikan instance di dalam context ReactLenis. */}
          <SmoothScroll>
            <Intro />
            <Header />
            <main>{children}</main>
            <Footer />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
