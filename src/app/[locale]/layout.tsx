import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Roboto_Slab, Open_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ValueRail from "@/components/layout/ValueRail";
import SmoothScroll from "@/components/animations/SmoothScroll";
import { routing } from "@/i18n/routing";
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

  return { title: t("title"), description: t("description") };
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
          <ValueRail />
          <SmoothScroll>
            <div className="md:pl-[var(--spacing-rail)]">
              <Header />
              <main>{children}</main>
              <Footer />
            </div>
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
