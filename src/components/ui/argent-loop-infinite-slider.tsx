"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from "react";
import clsx from "clsx";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import { circularDelta, wrapIndex } from "@/lib/gallery-loop";

export interface GalleryProject {
  slug: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image: string;
}

type DragState = { startX: number; startY: number; horizontal: boolean };

const LERP_FACTOR = 0.14;
const SETTLE_EPSILON = 0.002;
const WHEEL_THRESHOLD = 140;
const SWIPE_THRESHOLD = 48;

/**
 * Vertical infinite slider adapted from the Argent Loop reference (21st.dev).
 * `activeIndex` is the only React state; the lerp/parallax animation runs in
 * a rAF loop that writes transforms straight to the slide DOM nodes via
 * refs, so dragging/scrolling never triggers a React re-render mid-frame.
 *
 * Wheel and touch never call preventDefault on the page's own scroll: wheel
 * only ever reads `deltaY` (React makes onWheel passive by default, which is
 * exactly what's wanted here — it never blocks the page), and touchmove only
 * intercepts once horizontal drag intent is confirmed. `touch-action: pan-y`
 * on the stage backs that up natively: the browser never treats a vertical
 * drag on this element as belonging to us in the first place.
 *
 * ponytail: no live-follow-under-cursor drag preview — drag/swipe only
 * commits a snap-to-next/prev past SWIPE_THRESHOLD on release. Add a
 * translateY-while-dragging preview if product wants the image to visibly
 * track the finger/cursor mid-gesture.
 */
export function ArgentLoopInfiniteSlider({
  projects,
  exploreLabel,
  openHintLabel,
}: {
  projects: GalleryProject[];
  exploreLabel: string;
  openHintLabel: string;
}) {
  const count = projects.length;
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const targetRef = useRef(0);
  const wheelAccumRef = useRef(0);
  // Refs SEPARATE per input type, deliberately: a touch gesture also fires
  // compatibility Pointer Events (pointerdown/pointerup) on real browsers, and
  // sharing one ref meant onPointerUp nulled it out before the native
  // touchend listener below ever got to read it — swipes silently did nothing.
  const touchDragRef = useRef<DragState | null>(null);
  const mouseDragRef = useRef<DragState | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const applyTransforms = useCallback(() => {
    const progress = progressRef.current;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const delta = circularDelta(progress, i, count);
      const abs = Math.abs(delta);
      el.style.transform = `translate3d(0, ${delta * 100}%, 0) scale(${1 - Math.min(abs, 1) * 0.06})`;
      el.style.opacity = abs < 1.5 ? String(Math.max(0, 1 - abs)) : "0";
      el.style.pointerEvents = abs < 0.5 ? "auto" : "none";
      el.style.zIndex = String(Math.round((1 - Math.min(abs, 1)) * 10));
    });
  }, [count]);

  const tick = useCallback(() => {
    const target = targetRef.current;
    const diff = target - progressRef.current;

    if (Math.abs(diff) < SETTLE_EPSILON) {
      const settled = wrapIndex(Math.round(target), count);
      progressRef.current = settled;
      targetRef.current = settled;
      applyTransforms();
      setActiveIndex(settled);
      rafRef.current = null;
      return;
    }

    progressRef.current += diff * LERP_FACTOR;
    applyTransforms();
    rafRef.current = requestAnimationFrame(tick);
  }, [applyTransforms, count]);

  const startLoop = useCallback(() => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (count <= 1) return;
      const wrapped = wrapIndex(nextIndex, count);

      if (reducedMotion) {
        progressRef.current = wrapped;
        targetRef.current = wrapped;
        applyTransforms();
        setActiveIndex(wrapped);
        return;
      }

      const delta = circularDelta(progressRef.current, wrapped, count);
      targetRef.current = progressRef.current + delta;
      startLoop();
    },
    [applyTransforms, count, reducedMotion, startLoop],
  );

  // Posisi awal, dan bersih-bersih rAF kalau komponen unmount di tengah animasi.
  useEffect(() => {
    applyTransforms();
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [applyTransforms]);

  // Swipe horizontal via touch — didaftarkan manual (bukan prop onTouchMove
  // React) karena React membuat listener touchmove pasif secara default
  // sejak v17, dan preventDefault kondisional (hanya saat gerak horizontal
  // dominan) butuh listener { passive: false }. touch-action: pan-y di JSX
  // stage adalah lapis pertama: browser sendiri tidak pernah menganggap drag
  // VERTIKAL di elemen ini miliknya sendiri untuk sumbu X, jadi scroll
  // vertikal halaman lolos apa adanya tanpa pernah masuk ke logic ini.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || count <= 1) return;

    function handleStart(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      touchDragRef.current = { startX: t.clientX, startY: t.clientY, horizontal: false };
    }

    function handleMove(e: TouchEvent) {
      const drag = touchDragRef.current;
      const t = e.touches[0];
      if (!drag || !t) return;
      const dx = t.clientX - drag.startX;
      const dy = t.clientY - drag.startY;
      if (!drag.horizontal && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        drag.horizontal = true;
      }
      if (drag.horizontal) e.preventDefault();
    }

    function handleEnd(e: TouchEvent) {
      const drag = touchDragRef.current;
      touchDragRef.current = null;
      if (!drag?.horizontal) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - drag.startX;
      if (dx <= -SWIPE_THRESHOLD) goToIndex(Math.round(progressRef.current) + 1);
      else if (dx >= SWIPE_THRESHOLD) goToIndex(Math.round(progressRef.current) - 1);
    }

    el.addEventListener("touchstart", handleStart, { passive: true });
    el.addEventListener("touchmove", handleMove, { passive: false });
    el.addEventListener("touchend", handleEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleStart);
      el.removeEventListener("touchmove", handleMove);
      el.removeEventListener("touchend", handleEnd);
    };
  }, [count, goToIndex]);

  function onWheel(e: WheelEvent<HTMLDivElement>) {
    if (count <= 1) return;
    wheelAccumRef.current += e.deltaY;
    if (wheelAccumRef.current > WHEEL_THRESHOLD) {
      wheelAccumRef.current = 0;
      goToIndex(Math.round(progressRef.current) + 1);
    } else if (wheelAccumRef.current < -WHEEL_THRESHOLD) {
      wheelAccumRef.current = 0;
      goToIndex(Math.round(progressRef.current) - 1);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (count <= 1) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      goToIndex(Math.round(progressRef.current) + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      goToIndex(Math.round(progressRef.current) - 1);
    }
  }

  // Drag mouse (desktop): pointer event, bukan touch, jadi tidak bentrok
  // dengan listener touch di atas, dan aman langsung dipakai — drag mouse
  // tidak pernah dianggap gestur scroll halaman oleh browser manapun.
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (count <= 1 || e.pointerType !== "mouse") return;
    mouseDragRef.current = { startX: e.clientX, startY: e.clientY, horizontal: true };
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    // pointerType check FIRST: a touch gesture also fires a compatibility
    // pointerup, and this must never touch mouseDragRef's touch counterpart.
    if (e.pointerType !== "mouse") return;
    const drag = mouseDragRef.current;
    mouseDragRef.current = null;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (dx <= -SWIPE_THRESHOLD) goToIndex(Math.round(progressRef.current) + 1);
    else if (dx >= SWIPE_THRESHOLD) goToIndex(Math.round(progressRef.current) - 1);
  }

  function onDoubleClick() {
    const project = projects[wrapIndex(Math.round(progressRef.current), count)];
    if (project) router.push(`/projects/${project.slug}`);
  }

  const active = projects[activeIndex];

  return (
    <div ref={containerRef} tabIndex={0} onWheel={onWheel} onKeyDown={onKeyDown} className="outline-none">
      <div className="flex flex-col gap-6 md:h-[34rem] md:flex-row md:gap-10">
        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onDoubleClick={onDoubleClick}
          className="border-line rounded-card relative aspect-[4/5] w-full shrink-0 touch-pan-y overflow-hidden border md:aspect-auto md:h-full md:w-[58%]"
        >
          {projects.map((project, i) => (
            <div
              key={project.slug}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="absolute inset-0 will-change-transform"
            >
              {/* draggable=false: <img> is natively draggable, and without this a
                  sustained mouse-drag starts the browser's own HTML5 image drag
                  instead of firing pointerup — the custom drag-to-navigate gesture
                  below silently never commits (confirmed via CDP: dragstart/drag/
                  dragend fired with no pointerup at all). */}
              {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
              <img src={project.image} alt={project.title} draggable={false} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-8 md:h-full md:py-2">
          <div>
            <p className="text-ink-soft flex items-center gap-3 font-mono text-[11px] tracking-[0.12em] uppercase">
              <span>{active.category}</span>
              <span aria-hidden>·</span>
              <span>{active.year}</span>
            </p>
            <h3 className="font-display line-clamp-2 mt-4 text-2xl leading-tight font-medium tracking-[-0.01em] text-balance md:text-3xl">
              {active.title}
            </h3>
            <p className="text-ink-soft mt-4 line-clamp-3 text-sm leading-[1.7] text-pretty md:line-clamp-4 md:text-base">
              {active.description}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Button
                href={`/projects/${active.slug}`}
                variant="charcoal"
                size="sm"
                className="w-full justify-center md:w-auto"
              >
                {exploreLabel}
              </Button>

              {count > 1 ? (
                <>
                  <div className="text-ink-soft flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase md:justify-start md:hidden">
                    <span>{String(activeIndex + 1).padStart(2, "0")}</span>
                    <span aria-hidden className="flex gap-1">
                      {projects.map((project, i) => (
                        <span
                          key={project.slug}
                          className={clsx(
                            "h-1.5 w-1.5 rounded-full",
                            i === activeIndex ? "bg-charcoal" : "bg-line",
                          )}
                        />
                      ))}
                    </span>
                    <span>{String(count).padStart(2, "0")}</span>
                  </div>

                  <div className="hidden items-center gap-3 md:flex">
                    {projects.map((project, i) => (
                      <button
                        key={project.slug}
                        type="button"
                        onClick={() => goToIndex(i)}
                        aria-label={project.title}
                        aria-current={i === activeIndex}
                        className={clsx(
                          "h-6 w-px transition-colors",
                          i === activeIndex ? "bg-charcoal" : "bg-line hover:bg-gold-ink",
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            {count > 1 ? (
              <p className="text-ink-soft hidden text-[11px] tracking-[0.08em] uppercase md:block">
                {openHintLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
