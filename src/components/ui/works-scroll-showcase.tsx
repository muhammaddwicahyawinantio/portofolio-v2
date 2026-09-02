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
 * Posisi presentation-only.
 *
 * Dibuat sengaja lebih "editorial":
 * - beberapa project besar
 * - beberapa project portrait
 * - beberapa elemen keluar sedikit dari viewport
 * - tidak semuanya rapi di dalam grid
 *
 * Data project tetap berasal dari CMS.
 *
 * `width` untuk kartu potret (aspect "3/4") harus dijaga kecil: tinggi
 * render = width / aspect, jadi potret lebar 50vw beraspek 3/4 jadi setinggi
 * ~67vw — di layar 16:9 itu >100vh, meluber jauh keluar viewport dan
 * bertabrakan dengan kartu lain (#05 dan #07 pernah begini, sudah diperkecil).
 * Aman: width portrait ≈ setengah width kartu lanskap beraspek serupa.
 */
const DESKTOP_LAYOUT: LayoutSpec[] = [
  // 01 — opening hero
  {
    width: "46vw",
    x: "3vw",y: "13vh",
    startX: "-18vw", startY: "32vh",
    parallax: 0.72,scaleFrom: 0.9,aspect: "4/3",
  },

  // 02 — portrait kanan
  {
    width: "25vw",
    x: "72vw",
    y: "12vh",
    startX: "16vw",
    startY: "22vh",
    parallax: 1.22,
    scaleFrom: 0.88,
    aspect: "3/4",
  },

  // 03 — cropped kiri bawah
  {
    width: "35vw", x: "-5vw",
    y: "55vh",
    startX: "-15vw",
    startY: "28vh",
    parallax: 0.88,
    scaleFrom: 0.93,
    aspect: "4/3",
  },

  // 04 — visual besar kanan
  {
    width: "55vw",
    x: "53vw",
    y: "43vh",
    startX: "17vw",
    startY: "34vh",
    parallax: 1.08,
    scaleFrom: 0.88,
    aspect: "16/10",
  },

  // 05 — portrait kiri
  {
    width: "24vw",
    x: "5vw",
    y: "18vh",
    startX: "-12vw",
    startY: "19vh",
    parallax: 1.32,
    scaleFrom: 0.9,
    aspect: "3/4",
  },

  // 06 — lower right
  {
    width: "40vw",
    x: "70vw",
    y: "59vh",
    startX: "14vw",
    startY: "27vh",
    parallax: 0.82,
    scaleFrom: 0.94,
    aspect: "4/3",
  },

  // 07 — upper center, sengaja sedikit terpotong
  {
    width: "27vw",
    x: "38vw",
    y: "-8vh",
    startX: "5vw",
    startY: "-18vh",
    parallax: 1.18,
    scaleFrom: 0.89,
    aspect: "3/4",
  },

  // 08 — closing hero
  {
    width: "42vw",
    x: "55vw",
    y: "29vh",
    startX: "18vw",
    startY: "32vh",
    parallax: 0.96,
    scaleFrom: 0.9,
    aspect: "4/3",
  },
];

type ProjectTiming = {
  enter: number;
  visible: number;
  hold: number;
  exit: number;
};

/**
 * Timeline dalam unit 0 → 1.
 *
 * Tujuannya bukan menampilkan semua project sekaligus.
 * Project masuk bertahap dan saling mengambil alih composition.
 */
const PROJECT_TIMINGS: ProjectTiming[] = [
  { enter: 0.0, visible: 0.09, hold: 0.24, exit: 0.36 },
  { enter: 0.08, visible: 0.17, hold: 0.31, exit: 0.43 },
  { enter: 0.19, visible: 0.28, hold: 0.42, exit: 0.55 },
  { enter: 0.29, visible: 0.39, hold: 0.54, exit: 0.67 },
  { enter: 0.41, visible: 0.5, hold: 0.63, exit: 0.74 },
  { enter: 0.51, visible: 0.61, hold: 0.74, exit: 0.84 },
  { enter: 0.62, visible: 0.72, hold: 0.84, exit: 0.93 },
  { enter: 0.72, visible: 0.82, hold: 0.93, exit: 1.0 },
];

type Mode = "desktop" | "mobile" | "static";

function ProjectImage({ project }: { project: WorkProject }) {
  return (
    <div className="project-inner border-line rounded-card h-full w-full overflow-hidden border transition-transform duration-500 ease-out hover:scale-[1.015]">
      {project.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
        <img
          src={project.image}
          alt={project.title}
          draggable={false}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="bg-cream-deep h-full w-full" />
      )}
    </div>
  );
}

export function WorksScrollShowcase({
  projects,
}: {
  projects: WorkProject[];
}) {
  const [mode, setMode] = useState<Mode>("mobile");

  const stageRef = useRef<HTMLDivElement>(null);

  const canvasNodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stackedCardRefs = useRef<Array<HTMLElement | null>>([]);

  /**
   * Desktop / mobile / reduced-motion mode.
   */
  useEffect(() => {
    const reducedMq = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const desktopMq = window.matchMedia("(min-width: 1024px)");

    function sync() {
      if (reducedMq.matches) {
        setMode("static");
        return;
      }

      setMode(desktopMq.matches ? "desktop" : "mobile");
    }

    sync();

    reducedMq.addEventListener("change", sync);
    desktopMq.addEventListener("change", sync);

    return () => {
      reducedMq.removeEventListener("change", sync);
      desktopMq.removeEventListener("change", sync);
    };
  }, []);

  /**
   * DESKTOP
   *
   * Satu canvas dipin.
   * Setiap project:
   *
   * ENTER
   * ↓
   * HOLD + subtle parallax
   * ↓
   * EXIT melewati viewport
   *
   * Jadi bukan sekadar fade in / fade out.
   */
  useEffect(() => {
    if (mode !== "desktop") return;

    const stage = stageRef.current;

    if (!stage) return;

    const ctx = gsap.context(() => {
      const nodes = canvasNodeRefs.current.filter(
        (el): el is HTMLDivElement => Boolean(el),
      );

      if (nodes.length === 0) return;

      const tl = gsap.timeline();

      nodes.forEach((node, index) => {
        const layout =
          DESKTOP_LAYOUT[index % DESKTOP_LAYOUT.length]!;

        const timing =
          PROJECT_TIMINGS[index % PROJECT_TIMINGS.length]!;

        const enterDuration = Math.max(
          0.01,
          timing.visible - timing.enter,
        );

        const holdDuration = Math.max(
          0.01,
          timing.hold - timing.visible,
        );

        const exitDuration = Math.max(
          0.01,
          timing.exit - timing.hold,
        );

        const direction = index % 2 === 0 ? -1 : 1;

        /*
         * Initial entrance.
         */
        tl.fromTo(
          node,
          {
            autoAlpha: 0,
            scale: layout.scaleFrom,
            x: layout.startX,
            y: layout.startY,
            rotate: direction * 1.2,
          },
          {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            y: 0,
            rotate: 0,
            duration: enterDuration,
            ease: "power3.out",
          },
          timing.enter,
        );

        /*
         * Saat project sedang dibaca, ia tetap bergerak sedikit.
         *
         * Setiap project mempunyai depth berbeda melalui parallax.
         */
        tl.to(
          node,
          {
            y: `${-5 * layout.parallax}vh`,
            x: `${direction * 1.5 * layout.parallax}vw`,
            scale: 1.012,
            duration: holdDuration,
            ease: "none",
          },
          timing.visible,
        );

        /*
         * Exit tidak berhenti di tempat lalu fade.
         * Node terus bergerak melewati canvas seperti referensi.
         */
        tl.to(
          node,
          {
            autoAlpha: 0,
            y: `${-30 * layout.parallax}vh`,
            x: `${direction * 7}vw`,
            scale: 1.04,
            rotate: direction * -1.3,
            duration: exitDuration,
            ease: "power2.in",
          },
          timing.hold,
        );
      });

      /**
       * Semakin banyak project, semakin lama section ditahan.
       *
       * 8 project ≈ 480% viewport scroll.
       */
      const scrollLength = Math.min(
        520,
        Math.max(340, 320 + projects.length * 20),
      );

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: `+=${scrollLength}%`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        animation: tl,
        invalidateOnRefresh: true,
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, stage);

    return () => ctx.revert();
  }, [mode, projects.length]);

  /**
   * MOBILE
   *
   * Tidak menggunakan pinned/freeform canvas.
   * Normal flow + reveal ringan.
   */
  useEffect(() => {
    if (mode !== "mobile") return;

    const cards = stackedCardRefs.current.filter(
      (el): el is HTMLElement => Boolean(el),
    );

    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      cards.forEach((card, index) => {
        const direction = index % 2 === 0 ? -1 : 1;

        gsap.fromTo(
          card,
          {
            y: 65,
            x: direction * 12,
            autoAlpha: 0,
          },
          {
            y: 0,
            x: 0,
            autoAlpha: 1,
            ease: "none",

            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 58%",
              scrub: true,
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, [mode]);

  /**
   * DESKTOP EDITORIAL CANVAS
   */
  if (mode === "desktop") {
    return (
      <div
        ref={stageRef}
        className="relative min-h-svh overflow-hidden"
      >
        {/* WORKS label */}
        <div className="pointer-events-none absolute top-24 left-10 z-30">
          <p className="text-ink-soft font-mono text-[11px] tracking-[0.2em]">
            ({String(projects.length).padStart(2, "0")})
          </p>

          <h2 className="font-rampart-one font-display text-ink mt-2 text-[clamp(2.8rem,6vw,5.5rem)] leading-none font-medium tracking-[-0.025em]">
            WORKS
          </h2>
        </div>

        {projects.map((project, index) => {
          const layout =
            DESKTOP_LAYOUT[index % DESKTOP_LAYOUT.length]!;

          return (
            <div
              key={project.slug}
              ref={(el) => {
                canvasNodeRefs.current[index] = el;
              }}
              className="absolute will-change-transform"
              style={{
                width: layout.width,
                left: layout.x,
                top: layout.y,
                zIndex: index + 1,
              }}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="group block cursor-pointer"
                aria-label={project.title}
              >
                <div
                  style={{
                    aspectRatio: layout.aspect,
                  }}
                >
                  <ProjectImage project={project} />
                </div>
              </Link>

              {/* Editorial caption */}
              <div className="mt-3 max-w-[90%]">
                <p className="text-ink-soft font-mono text-[10px] tracking-[0.16em]">
                  ({String(index + 1).padStart(2, "0")})
                </p>

                <p className="font-display text-ink mt-1 text-[clamp(0.85rem,1.05vw,1rem)] leading-tight font-medium tracking-[-0.005em] text-balance">
                  {project.title}
                </p>

                <p className="text-ink-soft mt-1 font-mono text-[9px] tracking-[0.11em] uppercase">
                  {project.category} · {project.year}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * MOBILE + REDUCED MOTION
   *
   * Image dibuat bergantian lebar/posisinya agar tetap punya rasa editorial,
   * tetapi sepenuhnya mengikuti document flow.
   */
  return (
    <div className="overflow-hidden px-3 py-10 sm:px-4 md:px-8 md:py-14">
      <div className="mb-10 flex items-end justify-between gap-4 md:mb-14">
        <h2 className="font-rampart-one font-display text-ink text-[clamp(2.4rem,12vw,4rem)] leading-[0.85] font-medium tracking-[-0.025em]">
          WORKS
        </h2>

        <p className="text-ink-soft pb-1 font-mono text-[10px] tracking-[0.16em]">
          ({String(projects.length).padStart(2, "0")})
        </p>
      </div>

      <div className="flex flex-col gap-12 md:gap-16">
        {projects.map((project, index) => {
          const odd = (index + 1) % 2 === 1;

          return (
            <article
              key={project.slug}
              ref={(el) => {
                stackedCardRefs.current[index] = el;
              }}
              className={
                odd
                  ? "w-[94%]"
                  : "ml-auto w-[82%]"
              }
            >
              <Link
                href={`/projects/${project.slug}`}
                className="block cursor-pointer"
                aria-label={project.title}
              >
                <div
                  className={
                    index % 3 === 1
                      ? "aspect-[3/4]"
                      : "aspect-[4/3]"
                  }
                >
                  <ProjectImage project={project} />
                </div>
              </Link>

              <div className="mt-3">
                <p className="text-ink-soft font-mono text-[10px] tracking-[0.16em]">
                  ({String(index + 1).padStart(2, "0")})
                </p>

                <p className="font-display text-ink mt-1 text-lg leading-tight font-medium tracking-[-0.01em] text-balance sm:text-xl">
                  {project.title}
                </p>

                <p className="text-ink-soft mt-1 font-mono text-[9px] leading-relaxed tracking-[0.1em] uppercase">
                  {project.category} · {project.year}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
