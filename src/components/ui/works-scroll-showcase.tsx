"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface WorkProject {
  slug: string;
  title: string;
  description: string;
  category: string;
  year: string;
  image: string | null;
}

type LayoutSpec = {
  width: string;
  x: string;
  y: string;
  startX: string;
  startY: string;
  parallax: number;
  scaleFrom: number;
  aspect: string;
};

/**
 * Presentation-only config — posisi/ukuran di kanvas desktop, bukan data
 * project. 8 slot untuk sampai 8 project (lihat MAX_PROJECTS di
 * WorksShowcase.tsx); dipotong via slice kalau project lebih sedikit.
 *
 * Setiap entri di-clamp supaya `x + width + max(0, startX)` (tepi kanan
 * terjauh yang pernah dicapai node ini, termasuk saat offset masuk) tidak
 * pernah lewat ~92vw. `vw` dihitung dari window.innerWidth (TERMASUK alur
 * scrollbar), bukan clientWidth — begitu scrollbar vertikal muncul (halaman
 * jadi tinggi karena pin-spacer ScrollTrigger), node yang mepet 98-100vw
 * jadi sungguhan overflow horizontal ~15px. Diverifikasi via CDP: baseline
 * tanpa margin ini scrollWidth > clientWidth begitu scrollbar muncul.
 */
const DESKTOP_LAYOUT: LayoutSpec[] = [
  { width: "34vw", x: "8vw", y: "18vh", startX: "-12vw", startY: "30vh", parallax: 1.0, scaleFrom: 0.92, aspect: "4/3" },
  { width: "22vw", x: "58vw", y: "10vh", startX: "10vw", startY: "18vh", parallax: 1.25, scaleFrom: 0.88, aspect: "3/4" },
  { width: "26vw", x: "14vw", y: "60vh", startX: "-8vw", startY: "25vh", parallax: 0.8, scaleFrom: 0.94, aspect: "4/3" },
  { width: "36vw", x: "44vw", y: "52vh", startX: "12vw", startY: "30vh", parallax: 1.15, scaleFrom: 0.9, aspect: "16/10" },
  { width: "20vw", x: "4vw", y: "34vh", startX: "-10vw", startY: "15vh", parallax: 1.35, scaleFrom: 0.9, aspect: "3/4" },
  { width: "24vw", x: "60vw", y: "66vh", startX: "8vw", startY: "18vh", parallax: 0.9, scaleFrom: 0.95, aspect: "4/3" },
  { width: "18vw", x: "40vw", y: "8vh", startX: "6vw", startY: "20vh", parallax: 1.2, scaleFrom: 0.9, aspect: "3/4" },
  { width: "28vw", x: "60vw", y: "36vh", startX: "-6vw", startY: "22vh", parallax: 1.05, scaleFrom: 0.92, aspect: "4/3" },
];

type Mode = "desktop" | "mobile" | "static";

function ProjectImage({ project }: { project: WorkProject }) {
  return (
    <div className="project-inner border-line rounded-card h-full w-full overflow-hidden border transition-transform duration-300 ease-out hover:scale-[1.015]">
      {project.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
        <img src={project.image} alt={project.title} draggable={false} className="h-full w-full object-cover" />
      ) : (
        <div className="bg-cream-deep h-full w-full" />
      )}
    </div>
  );
}

/**
 * Kanvas editorial ala showreel referensi: project besar/sedang/kecil
 * tersebar asimetris, masuk-linger-keluar viewport lewat satu GSAP timeline
 * yang di-scrub oleh scroll (ScrollTrigger, pin: true) — bukan grid, bukan
 * carousel, bukan slider infinite.
 *
 * `mode` menentukan JSX yang dirender — desktop (kanvas absolute + pin) vs
 * stacked (mobile ATAU reduced-motion, layout dokumen normal). Keduanya
 * tidak pernah aktif bersamaan: hanya satu cabang JSX yang benar-benar ada
 * di DOM pada satu waktu, jadi tidak ada gambar/DOM ganda dan tidak ada dua
 * ScrollTrigger yang berebut elemen yang sama.
 */
export function WorksScrollShowcase({ projects }: { projects: WorkProject[] }) {
  const [mode, setMode] = useState<Mode>("mobile");
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasNodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stackedCardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    function sync() {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      setMode(reduced ? "static" : desktop ? "desktop" : "mobile");
    }
    sync();
    const mqs = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(min-width: 1024px)"),
    ];
    mqs.forEach((mq) => mq.addEventListener("change", sync));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", sync));
  }, []);

  // Timeline pin desktop. gsap.context men-scope semua ScrollTrigger/tween
  // yang dibuat di sini supaya ctx.revert() membersihkannya total setiap
  // `mode` berganti (mis. resize melewati breakpoint 1024px) — tanpa ini,
  // ScrollTrigger lama akan menumpuk dan berebut pin dengan yang baru.
  useEffect(() => {
    if (mode !== "desktop") return;
    const stage = stageRef.current;
    if (!stage) return;

    const ctx = gsap.context(() => {
      const nodes = canvasNodeRefs.current.filter((el): el is HTMLDivElement => !!el);
      if (nodes.length === 0) return;

      const tl = gsap.timeline();
      const STAGGER = 0.11;
      const IN_DURATION = 0.12;
      const LINGER = 0.16;
      const EXIT_GAP = 0.06;
      const EXIT_DURATION = 0.12;

      nodes.forEach((node, i) => {
        const layout = DESKTOP_LAYOUT[i % DESKTOP_LAYOUT.length]!;
        const start = i * STAGGER;
        const visible = start + IN_DURATION;
        const lingerEnd = visible + LINGER;
        const exitStart = lingerEnd + EXIT_GAP;
        const exitEnd = exitStart + EXIT_DURATION;
        const isLast = i === nodes.length - 1;

        tl.fromTo(
          node,
          { autoAlpha: 0, scale: layout.scaleFrom, x: layout.startX, y: layout.startY },
          { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: visible - start, ease: "power2.out" },
          start,
        );

        if (!isLast) {
          tl.to(
            node,
            {
              autoAlpha: 0,
              y: `-=${(15 * layout.parallax).toFixed(1)}vh`,
              scale: 1 - (1 - layout.scaleFrom) * 0.4,
              duration: exitEnd - exitStart,
              ease: "power1.in",
            },
            exitStart,
          );
        }
      });

      // 300-500vh tergantung jumlah project — makin banyak project, makin
      // panjang jarak scroll supaya tiap fase (masuk/linger/keluar) tidak
      // terasa buru-buru.
      const scrollLength = Math.min(500, 300 + Math.max(0, projects.length - 4) * 40);

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: `+=${scrollLength}%`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        animation: tl,
      });

      // Re-measure trigger start/end once the browser has finished its
      // first layout pass (fonts/images can still shift offsets right
      // after mount). NOTE: this does NOT fix scrollbar-driven width bugs —
      // GSAP's pin: true locks the pinned element's width/height as literal
      // inline px at pin-setup time, and refresh() does not re-run that
      // lock. The actual fix for that (this section's own tall pin-spacer
      // triggers a vertical scrollbar, which GSAP's already-locked width
      // doesn't account for) is `scrollbar-gutter: stable` in globals.css.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, stage);

    return () => ctx.revert();
  }, [mode, projects.length]);

  // Reveal ringan per kartu di mobile — scrub ke posisi kartu sendiri,
  // BUKAN pin, BUKAN timeline tunggal untuk semua kartu.
  useEffect(() => {
    if (mode !== "mobile") return;
    const cards = stackedCardRefs.current.filter((el): el is HTMLDivElement => !!el);
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 60, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top 85%", end: "top 55%", scrub: true },
          },
        );
      });
    });

    return () => ctx.revert();
  }, [mode]);

  if (mode === "desktop") {
    return (
      <div ref={stageRef} className="relative min-h-svh overflow-hidden">
        {/* top-24: cukup untuk lolos dari bawah tepi nav pill mengambang yang
            fixed sepanjang scroll (diukur ~67px via CDP), plus jarak napas. */}
        <div className="pointer-events-none absolute top-24 left-10 z-20">
          <p className="text-ink-soft font-mono text-[11px] tracking-[0.2em]">
            ({String(projects.length).padStart(2, "0")})
          </p>
          <h2 className="font-rampart-one font-display text-ink mt-2 text-[clamp(2.5rem,6vw,5rem)] leading-none font-medium tracking-[-0.02em]">
            WORKS
          </h2>
        </div>

        {projects.map((project, i) => {
          const layout = DESKTOP_LAYOUT[i % DESKTOP_LAYOUT.length]!;
          return (
            <div
              key={project.slug}
              ref={(el) => {
                canvasNodeRefs.current[i] = el;
              }}
              className="will-change-transform absolute"
              style={{ width: layout.width, left: layout.x, top: layout.y, zIndex: i + 1 }}
            >
              <Link href={`/projects/${project.slug}`} className="block cursor-pointer">
                {/* aspectRatio inline, bukan class Tailwind aspect-[...] dinamis:
                    string dirakit dari data runtime (layout.aspect), dan Tailwind
                    hanya men-generate class dari literal yang benar-benar muncul
                    di source — arbitrary value yang dirakit lewat template
                    literal tidak pernah terdeteksi scanner-nya. */}
                <div style={{ aspectRatio: layout.aspect }}>
                  <ProjectImage project={project} />
                </div>
              </Link>
              <div className="mt-3">
                <p className="text-ink-soft font-mono text-[11px] tracking-[0.15em]">
                  ({String(i + 1).padStart(2, "0")})
                </p>
                <p className="font-display text-ink mt-1 text-sm font-medium tracking-[-0.005em] text-balance">
                  {project.title}
                </p>
                <p className="text-ink-soft mt-0.5 font-mono text-[10px] tracking-[0.1em] uppercase">
                  {project.category} · {project.year}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-3 py-8 sm:p-4 md:p-8 md:py-12">
      <h2 className="font-rampart-one font-display text-ink mb-8 text-[clamp(2rem,10vw,3rem)] leading-none font-medium tracking-[-0.02em] md:mb-12">
        WORKS
      </h2>

      <div className="flex flex-col gap-10 md:gap-14">
        {projects.map((project, i) => {
          const odd = (i + 1) % 2 === 1;
          return (
            <div
              key={project.slug}
              ref={(el) => {
                stackedCardRefs.current[i] = el;
              }}
              className={odd ? "w-[92%]" : "ml-auto w-[80%]"}
            >
              <Link href={`/projects/${project.slug}`} className="block cursor-pointer">
                <div className="aspect-[4/3]">
                  <ProjectImage project={project} />
                </div>
              </Link>
              <div className="mt-3">
                <p className="text-ink-soft font-mono text-[11px] tracking-[0.15em]">
                  ({String(i + 1).padStart(2, "0")})
                </p>
                <p className="font-display text-ink mt-1 text-lg font-medium tracking-[-0.005em] text-balance">
                  {project.title}
                </p>
                <p className="text-ink-soft mt-0.5 font-mono text-[10px] tracking-[0.1em] uppercase">
                  {project.category} · {project.year}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
