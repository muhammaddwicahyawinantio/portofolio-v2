"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import Container from "@/components/ui/Container";
import Lottie from "@/components/ui/lottie";

/**
 * SATU section penutup beranda: judul "Ready to begin?", formulir kontak, dan
 * "What clients say" — semuanya di sini, di atas satu latar yang tersingkap.
 *
 * TIRAI. Mekanisme dari CinematicFooter 21st.dev: `clip-path` pada section, dan
 * lapisan latar `position: fixed` di dalamnya. clip-path memotong keturunan
 * fixed tanpa menjadikan dirinya containing block, jadi latarnya terpaku ke
 * viewport tapi cuma terlihat di dalam kotak section. Saat section naik ke
 * layar, latarnya tidak ikut menggulir — ia TERSINGKAP dari bawah.
 *
 * Yang di-fixed HANYA latar. Percobaan pertama menaruh judul di dalam panel
 * fixed, dan "Ready to begin?" teriris separuh oleh section berikutnya yang
 * lewat di atasnya. Di sini seluruh isi mengalir normal, jadi setinggi apa pun
 * ia tak pernah terpotong.
 *
 * Yang tersingkap adalah LEMBAR HANGAT — `.paper-warm-flat`, yaitu warna AKHIR
 * sapuan `.paper-warm` milik section Services tepat di atasnya. Latar ini fixed,
 * jadi ia tak bisa melanjutkan rampa; yang bisa ia lakukan adalah menyamai warna
 * tempat rampa itu berhenti, sehingga sambungannya tak berpita.
 */
export default function ReadyPanel({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  /** Formulir kontak + testimoni. Dirender di server, disisipkan sebagai anak. */
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const head = headRef.current;
    if (!section || !head) return;

    const mm = gsap.matchMedia();
    let cancelled = false;

    // SplitText memotong berdasarkan posisi baris yang SUDAH dirender. Kalau
    // dipanggil sebelum Spectral selesai dimuat, ia memotong pada patahan baris
    // font fallback, lalu font aslinya masuk dan potongannya tinggal salah.
    document.fonts.ready.then(() => {
      if (cancelled) return;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // "lines,words": barisnya jadi kotak masker (overflow-hidden lewat
        // .ready-line di globals.css), katanya yang naik dari bawah kotak itu.
        // Itu yang membuat gerakannya terbaca sebagai teks yang MUNCUL, bukan
        // sekadar memudar — versi sebelumnya cuma geser 44px + opacity, dan
        // memang nyaris tak terasa.
        const split = new SplitText(head, {
          type: "lines,words",
          linesClass: "ready-line",
          wordsClass: "ready-word",
        });

        // Tanpa ScrollTrigger.refresh() global di sini: ScrollTrigger yang baru
        // dibuat selalu mengukur start/end-nya sendiri saat lahir, jadi posisi
        // global yang basi tidak berpengaruh — sementara refresh global akan
        // ikut menghitung ulang pin milik FeatureShowcase di tengah halaman.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: "top 72%", once: true },
        });

        tl.from(eyebrowRef.current, { autoAlpha: 0, y: 16, duration: 0.5, ease: "power2.out" })
          .from(
            split.words,
            { yPercent: 130, duration: 1, ease: "power4.out", stagger: 0.075 },
            0.12,
          )
          // Isinya menyusul saat judulnya masih separuh jalan, jadi keduanya
          // terbaca sebagai satu gerakan — bukan dua antrean terpisah.
          .from(bodyRef.current, { autoAlpha: 0, y: 56, duration: 0.9, ease: "power3.out" }, 0.55);

        return () => {
          split.revert();
        };
      });
    });

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="ready-curtain relative isolate">
      {/* `isolate` di section: -z-10 di bawah ini berhenti tepat di belakang isi
          section, tidak tenggelam ke belakang <body>. clip-path sebenarnya sudah
          membuat stacking context sendiri, tapi itu efek samping — kalau suatu
          saat tirainya dilepas, `isolate` yang tetap menjaga urutannya. */}
      <div aria-hidden className="ready-backdrop paper-warm-flat pointer-events-none -z-10">
        {/* Satu-satunya kolam hangat di seluruh beranda, di sudut tempat halaman
            meminta pengunjung bertindak. Ikut terpaku bersama latarnya, jadi ia
            diam di sudut layar sementara isi section lewat di atasnya. */}
        <div className="sand-pool absolute inset-0" />
      </div>

      <Lottie
        src="/lottie/html-web-development/data.json"
        className="pointer-events-none absolute top-6 left-3 z-0 aspect-square w-[clamp(6rem,18vw,15rem)] opacity-70 mix-blend-multiply sm:top-8 sm:left-8 lg:left-12"
      />
      <Lottie
        src="/lottie/dynamic-coding/data.json"
        className="pointer-events-none absolute top-6 right-3 z-0 aspect-square w-[clamp(6rem,18vw,15rem)] opacity-70 mix-blend-multiply sm:top-8 sm:right-8 lg:right-12"
      />

      <Container className="relative z-10 py-20 md:py-28">
        {/* Kepala section di tengah, isinya di bawah tetap rata kiri: formulir
            rata tengah tidak bisa dibaca sebagai formulir. `text-center` di
            pembungkus sekaligus menengahkan .eyebrow, yang inline-flex — `mx-auto`
            tidak akan menengahkannya. */}
        <div className="text-center">
          <p ref={eyebrowRef} className="eyebrow mb-8">
            {eyebrow}
          </p>

          {/* Judul section ini — menggantikan "Have something to make?", bukan
              menambahinya. Dua judul dan dua eyebrow untuk satu ajakan adalah
              pengulangan, bukan penekanan.
              Ukuran dan perataan dipegang utility, BUKAN .ready-heading: kelas
              itu CSS tanpa @layer dan akan menang atas utility apa pun yang
              menabraknya — pelajaran dari `margin: 0` yang dulu membatalkan
              `mb-20` di sini. */}
          <h2
            ref={headRef}
            className="ready-heading home-contact-heading ready-heading-lowered font-rampart-one font-display mx-auto max-w-[15ch]"
          >
            {heading}
          </h2>
        </div>

        <div ref={bodyRef} className="mt-16 md:mt-24">
          {children}
        </div>
      </Container>
    </section>
  );
}
