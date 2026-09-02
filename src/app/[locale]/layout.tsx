import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import {
  DM_Mono,
  DM_Sans,
  IBM_Plex_Mono,
  Rampart_One,
  Space_Grotesk,
} from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SocialFab } from "@/components/layout/SocialFab";
import SmoothScroll from "@/components/animations/SmoothScroll";
import CustomCursor from "@/components/animations/CustomCursor";
import Intro from "@/components/animations/Intro";
import { DwiAiTrigger } from "@/components/dwiai/DwiAiTrigger";
import VisitorTracker from "@/components/analytics/VisitorTracker";
import { routing } from "@/i18n/routing";
import { SITE_URL, alternates, localePath } from "@/lib/seo";
import { getSocialLinks } from "@/lib/social-links";
import "@/styles/globals.css";

/** DM Sans untuk body dan isi deskripsi di seluruh halaman publik. */
const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-family",
  display: "swap",
});

/** Space Grotesk untuk judul item/kartu seperti "ChatGPT Plus". */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-family",
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

/** Rampart One untuk judul section pilihan yang butuh aksen lebih display. */
const rampartOne = Rampart_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-rampart-one-family",
  display: "swap",
});

/** DM Mono untuk label kecil seperti "OPENAI". */
const label = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-label-family",
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
    title: { default: t("title"), template: "%s — DwiStudio" },
    description: t("description"),
    alternates: alternates(locale),
    openGraph: {
      type: "website",
      siteName: "DwiStudio",
      title: t("title"),
      description: t("description"),
      locale: locale === "id" ? "id_ID" : "en_US",
      url: localePath(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

/** JSON-LD Organization + WebSite — hanya field yang benar-benar ada datanya. */
function organizationJsonLd(locale: string, title: string, description: string, sameAs: string[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "DwiStudio",
        url: SITE_URL,
        description,
        sameAs,
      },
      {
        "@type": "WebSite",
        name: "DwiStudio",
        url: `${SITE_URL}${localePath(locale)}`,
        inLanguage: locale === "id" ? "id-ID" : "en-US",
      },
    ],
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
  const [messages, socials, t] = await Promise.all([
    getMessages(),
    getSocialLinks(),
    getTranslations({ locale, namespace: "meta" }),
  ]);
  const jsonLd = organizationJsonLd(
    locale,
    t("title"),
    t("description"),
    socials.map((s) => s.url),
  );

  return (
    <html
      lang={locale}
      className={`${body.variable} ${display.variable} ${mono.variable} ${rampartOne.variable} ${label.variable}`}
    >
      {/* Tanpa bg-*: gradasi cream didefinisikan di globals.css, dan utility
            background apa pun di sini akan menimpanya. */}
      {/* Tanpa text-*: warna teks dipegang `body` di globals.css. Utility di sini
            menang atas @layer base, dan akan memaksa seluruh teks jadi satu warna. */}
      <body className="font-body">
        {/* JSON.stringify tidak meng-escape "</script>", yang secara literal
            akan menutup tag ini lebih awal kalau muncul di dalam string mana
            pun (mis. deskripsi CMS). Ganti "<" jadi escape unicode menutup
            celah itu tanpa mengubah data JSON-nya. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <NextIntlClientProvider messages={messages}>
          <CustomCursor />
          {/* Intro wajib di dalam SmoothScroll: ia memanggil useLenis() untuk
              menghentikan smooth-scroll selama tirai masih tertutup, dan hook
              itu hanya mengembalikan instance di dalam context ReactLenis. */}
          <SmoothScroll>
            <Intro />
            <Header />
            <main className="relative">{children}</main>
            <Footer />
          </SmoothScroll>
          <DwiAiTrigger />
          <SocialFab socials={socials} />
          <VisitorTracker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
