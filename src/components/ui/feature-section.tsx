"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type FeatureStep = {
  slug: string;
  title: string;
  content: string;
  image: string | null;
  /** Dari CMS. Kosong -> /features/{slug}, halaman detail bawaan. */
  link: string | null;
};

/**
 * Daftar langkah yang maju mengikuti scroll, bukan timer.
 *
 * Referensi 21st.dev memutar sendiri lewat setInterval setiap 3 detik. Di sini
 * seksinya dipaku (ScrollTrigger pin) dan progres scroll-lah yang memilih
 * langkah aktif: halaman berhenti di seksi ini, lalu langkah 1 → 2 → 3 …
 * sebanyak datanya, baru halaman lanjut. Panjang paku ikut jumlah data, jadi
 * menambah feature lewat CMS otomatis menambah jarak scroll-nya.
 *
 * ScrollTrigger dipilih karena sudah terpasang dan sudah dijembatani ke Lenis
 * di SmoothScroll — memakai scroll listener sendiri akan meleset dari posisi
 * smooth-scroll.
 */
export function FeatureSteps({
  features,
  title,
  exploreLabel,
}: {
  features: FeatureStep[];
  title: string;
  exploreLabel: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  // Tanpa gerak: paku tidak dipasang sama sekali, jadi halaman menggulir biasa.
  // Semua langkah dirender terang penuh supaya tidak ada teks yang tersembunyi
  // permanen di balik animasi yang tidak pernah jalan.
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || features.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Selama pakunya aktif panel ini `fixed`: apa pun yang menjulur di bawah
      // tepi layar tidak bisa digulir untuk dilihat — ia hilang, bukan cuma
      // tergeser. Itu yang dulu memotong langkah terakhir di ponsel. Jadi
      // pakunya cuma dipasang kalau isinya memang muat, dan itu DIUKUR: yang
      // menentukan tinggi layar berbanding tinggi isi, bukan lebar layar.
      // Kalau tidak muat, seksinya menggulir biasa dengan semua langkah terang
      // penuh — persis jalur reduced-motion.
      //
      // ponytail: diukur sekali saat dipasang. Memutar ponsel ke lanskap tidak
      // menghitung ulang; tambahkan listener resize kalau itu jadi masalah.
      if (el.getBoundingClientRect().height > window.innerHeight) return;

      setPinned(true);
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        // Jarak paku diperpendek: ~0,6 layar per langkah (dulu 1 layar penuh),
        // jadi seksi ini menahan halaman jauh lebih singkat / terasa lebih ringkas.
        end: () => `+=${features.length * 60}%`,
        pin: true,
        // Lenis menggulir programatik; tanpa ini pakunya telat sepersekian detik.
        anticipatePin: 1,
        onUpdate: (self) => {
          const index = Math.floor(self.progress * features.length);
          setCurrent(Math.min(features.length - 1, Math.max(0, index)));
        },
      });
      return () => setPinned(false);
    });

    return () => mm.revert();
  }, [features.length]);

  if (features.length === 0) return null;

  // min-h-svh, bukan min-h-screen: 100vh di ponsel = tinggi saat bilah URL
  // TERSEMBUNYI, jadi panel yang dipaku selalu ~100px lebih tinggi daripada
  // yang benar-benar terlihat, dan dasarnya terpotong selama pakunya aktif.
  // svh = tinggi saat bilahnya terlihat, dan nilainya tidak berubah saat
  // digulir.
  //
  // Semua penyempitan `md:` di bawah ini punya satu tujuan: memangkas isinya
  // supaya muat dalam satu layar ponsel (~690px di 360px, dari 859px), karena
  // di bawah ambang itu pakunya tidak dipasang sama sekali — lihat penjaga di
  // efeknya. Dari md ke atas semuanya kembali ke nilai lama; tampilan desktop
  // tidak berubah sedikit pun.
  return (
    <div ref={rootRef} className="flex min-h-svh flex-col justify-center py-3 md:py-6">
      <h2 className="font-display mb-4 text-center text-[clamp(1.25rem,3vw,2rem)] leading-[1.05] font-medium tracking-[-0.01em] text-balance md:mb-6">
        {title}
      </h2>

      <div className="grid items-stretch gap-4 md:grid-cols-2 md:gap-8">
        {/* Di ponsel daftar ini dibaca sebagai TABEL: baris-baris dengan
            hairline pemisah, penanda langkah rata atas di kolom kirinya. Tanpa
            itu empat blok teks 3 baris cuma menempel satu sama lain tanpa tepi,
            dan bulatan langkahnya — yang dulu `items-center` — mengambang di
            tengah baris, jauh dari judul yang seharusnya ia tandai.

            `gap-0` + `divide-y`, lalu tiap baris memberi paddingnya sendiri
            dengan `first:pt-0 last:pb-0`: hasilnya setinggi `gap-4` yang lama,
            jadi garisnya gratis. Dari md ke atas kembali persis seperti semula.
            Tampilan desktop memang tidak diubah sama sekali. */}
        <ol className="divide-line order-2 flex flex-col justify-center gap-0 divide-y md:order-1 md:gap-4 md:divide-y-0">
          {features.map((feature, index) => {
            const active = !pinned || index === current;
            const done = !pinned || index <= current;

            return (
              <motion.li
                key={feature.slug}
                className="py-2 first:pt-0 last:pb-0 md:py-0"
                initial={false}
                animate={{ opacity: active ? 1 : 0.3 }}
                transition={{ duration: 0.5 }}
              >
                {/* Dulu SELURUH baris ini satu <Link>. Diubah jadi <div> karena
                    tombol Explore di bawah juga sebuah tautan, dan <a> di dalam
                    <a> bukan HTML yang valid. Kelasnya dipertahankan apa adanya
                    supaya `group-hover:` pada judul tetap bekerja — hover-nya
                    kini dipicu div yang sama persis. */}
                <div className="group flex items-start gap-3 md:items-center md:gap-4">
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-500 md:mt-0 md:size-7",
                      done
                        ? "bg-charcoal border-charcoal text-cream scale-110"
                        : "bg-card border-line text-ink-soft",
                    )}
                  >
                    {done ? (
                      <Check aria-hidden className="size-3 md:size-3.5" />
                    ) : (
                      <span className="text-xs font-semibold md:text-sm">{index + 1}</span>
                    )}
                  </span>

                  <span className="flex-1">
                    <span className="font-display group-hover:text-ink-soft block text-sm font-medium tracking-[-0.01em] transition-colors md:text-base">
                      {feature.title}
                    </span>
                    <span className="text-ink-soft mt-1 block text-[0.6875rem] leading-[1.5] md:text-xs md:leading-[1.55]">
                      {feature.content}
                    </span>
                    {/* ghost: empat langkah = empat CTA yang berulang. Solid
                        charcoal di sini menaruh empat titik gelap sekaligus di
                        satu layar, berebut dengan empat bulatan langkah yang
                        juga charcoal. Yang solid tinggal penanda langkah. */}
                    <Button
                      href={feature.link ?? `/features/${feature.slug}`}
                      size="sm"
                      variant="ghost"
                      className="mt-1.5 md:mt-2"
                    >
                      {exploreLabel}
                    </Button>
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ol>

        {/* Tinggi tidak dipatok lagi: sebagai grid item ia ikut meregang
            setinggi kolom daftar langkah di sebelahnya (md ke atas). Di layar
            sempit kolomnya bertumpuk, jadi di sana tetap perlu tinggi tetap. */}
        <FeatureLink
          href={features[current].link ?? `/features/${features[current].slug}`}
          className="border-line rounded-card relative order-1 block h-[96px] overflow-hidden border transition-opacity duration-300 hover:opacity-90 md:order-2 md:h-auto"
        >
          <AnimatePresence mode="wait">
            {features.map((feature, index) =>
              index === current ? (
                <motion.div
                  key={feature.slug}
                  className="absolute inset-0"
                  initial={{ y: 100, opacity: 0, rotateX: -20 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -100, opacity: 0, rotateX: 20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {feature.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-cream-deep h-full w-full" />
                  )}
                  <div className="from-cream absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t via-transparent to-transparent" />
                </motion.div>
              ) : null,
            )}
          </AnimatePresence>
        </FeatureLink>
      </div>
    </div>
  );
}

/** Sama seperti Button: next-intl menempeli awalan locale, jadi URL luar
    harus lewat <a> biasa supaya tidak jadi "/id/https://…". */
function FeatureLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
