# Projects Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Projects Gallery" section directly below the Hero on the homepage — an Argent Loop-style vertical infinite slider, reading live from the existing `Project` CMS, that never locks page scroll.

**Architecture:** A pure, framework-free circular-index math module (`gallery-loop.ts`) backs a `"use client"` slider primitive (`argent-loop-infinite-slider.tsx`) whose only React state is `activeIndex` — drag/lerp/parallax animation runs in a `requestAnimationFrame` loop writing directly to slide DOM nodes via refs. A server component (`ProjectsGallery.tsx`) fetches `prisma.project` rows the same way the existing `ProjectShowcase` does and hands plain data down as props. Wheel/touch never call `preventDefault` on the page's own scroll gesture — only on a slider-internal, horizontal-only swipe.

**Tech Stack:** Next.js 15 (App Router) + TypeScript strict + Prisma/MySQL + next-intl + Tailwind v4. No new dependency.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-30-projects-gallery-design.md` — read it first for the "why" behind every decision below.
- No test framework in this repo — verification for pure logic uses the existing `assert`-based check-script convention (`src/lib/admin/resources.check.ts` is the reference example), run via `npx tsx`, not jest/vitest. React components with no equivalent existing pattern (this repo's precedent: `ResourceForm.tsx`, `expanding-cards.tsx`) are verified via `npm run typecheck` + `npm run lint` + a manual pass in the running app — do not invent a component test harness.
- Palette is `ink`/`ink-soft` (text), `charcoal`/`charcoal-soft` (solid dark objects — buttons, filled ticks), `gold`/`sand-deep`/`gold-ink` (decorative/non-text accent), `line` (hairline border), `cream`/`cream-deep` (paper backgrounds) — from `src/styles/globals.css`. No new colors.
- `cn`/`clsx` usage: `import clsx from "clsx"` (default import), never named `{ clsx }`.
- Locale-aware navigation always uses `Link`/`useRouter` from `@/i18n/navigation`, never `next/link` or `next/navigation`.
- Bilingual i18n fields follow `_en`/`_id` suffixes in Prisma; UI strings live in `src/i18n/messages/en.json` + `id.json` and must stay in key-parity (enforced by `src/i18n/messages/parity.ts` at `npm run typecheck`).
- Every `<img>` needs the existing `eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase` comment.
- Reused as-is, never modified: `Container`, `Section`, `Button` (`src/components/ui/`), `toStringArray`/`isVideoUrl` (`src/lib/media.ts`), `prisma` client (`src/lib/prisma.ts`), the `Project` Prisma model, `src/lib/admin/resources.ts`, `ProjectDetail.tsx`/`ProjectList.tsx`/`Hero.tsx`/`SmoothScroll.tsx` (Lenis root).
- Run `npm run typecheck` and `npm run lint` after every task; both must be clean before moving on. Run `npm run build` at the end (Task 4).

---

### Task 1: `gallery-loop.ts` — circular index math + check

**Files:**
- Create: `src/lib/gallery-loop.ts`
- Create: `src/lib/gallery-loop.check.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `wrapIndex(i: number, n: number): number` and `circularDelta(from: number, to: number, n: number): number`. Task 2's `argent-loop-infinite-slider.tsx` imports both by exact name.

- [ ] **Step 1: Write the failing check**

Create `src/lib/gallery-loop.check.ts`:

```ts
/**
 * Cek untuk math indeks sirkular slider Projects Gallery — kalau delta-nya
 * salah arah, "berikutnya" akan terasa meloncat mundur pas melewati ujung
 * loop (dari proyek terakhir balik ke pertama).
 *
 * Jalankan: npx tsx src/lib/gallery-loop.check.ts
 */
import assert from "node:assert/strict";
import { circularDelta, wrapIndex } from "./gallery-loop";

// 1. wrapIndex selalu jatuh di [0, n).
assert.equal(wrapIndex(0, 5), 0);
assert.equal(wrapIndex(4, 5), 4);
assert.equal(wrapIndex(5, 5), 0, "pas satu putaran harus kembali ke 0");
assert.equal(wrapIndex(-1, 5), 4, "mundur dari 0 harus jadi elemen terakhir");
assert.equal(wrapIndex(-6, 5), 4);

// 2. circularDelta mengambil jalan terpendek di lingkaran, termasuk lewat ujung.
assert.equal(circularDelta(0, 4, 5), -1, "maju dari elemen pertama ke terakhir = mundur satu langkah");
assert.equal(circularDelta(4, 0, 5), 1, "maju dari elemen terakhir ke pertama = maju satu langkah, bukan mundur empat");
assert.equal(circularDelta(1, 3, 5), 2);
assert.equal(circularDelta(3, 1, 5), -2);
assert.equal(circularDelta(2, 2, 5), 0);

// 3. Bekerja juga untuk progress kontinu (float) saat animasi sedang lerp.
assert.ok(
  Math.abs(circularDelta(4.8, 0, 5) - 0.2) < 1e-9,
  "progress float harus tetap mengambil jalan terpendek",
);

// 4. n = 1 (satu proyek saja): tidak ada arah untuk berpindah.
assert.equal(circularDelta(0, 0, 1), 0);
assert.equal(wrapIndex(0, 1), 0);

console.log("gallery-loop: 12 cek lolos");
```

- [ ] **Step 2: Run the check to see it fail**

Run: `npx tsx src/lib/gallery-loop.check.ts`
Expected: fails with a module-not-found error for `./gallery-loop` (file doesn't exist yet).

- [ ] **Step 3: Create `src/lib/gallery-loop.ts`**

```ts
/**
 * Math indeks sirkular untuk slider Projects Gallery — satu definisi "jalan
 * terpendek di lingkaran", bukan diimplementasikan ulang ad hoc di komponen.
 */
export function wrapIndex(i: number, n: number): number {
  return ((i % n) + n) % n;
}

export function circularDelta(from: number, to: number, n: number): number {
  const raw = wrapIndex(to - from, n);
  return raw > n / 2 ? raw - n : raw;
}
```

- [ ] **Step 4: Run the check to see it pass**

Run: `npx tsx src/lib/gallery-loop.check.ts`
Expected: `gallery-loop: 12 cek lolos`

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: clean (no consumers yet, confirms the file itself is valid TS).

- [ ] **Step 6: Commit**

```bash
git add src/lib/gallery-loop.ts src/lib/gallery-loop.check.ts
git commit -m "$(cat <<'EOF'
feat: add circular index math for the Projects Gallery slider

wrapIndex/circularDelta give the slider's virtual-looping and snapping
logic a single, checked definition of "shortest path around the loop".
EOF
)"
```

---

### Task 2: `argent-loop-infinite-slider.tsx` — the slider primitive

**Files:**
- Create: `src/components/ui/argent-loop-infinite-slider.tsx`

**Interfaces:**
- Consumes: `wrapIndex`/`circularDelta` (Task 1); `Button` from `@/components/ui/Button`; `useRouter` from `@/i18n/navigation`.
- Produces: `ArgentLoopInfiniteSlider` (named export, client component) and `GalleryProject` (named export, type: `{ slug: string; title: string; category: string; year: string; description: string; image: string }`). Task 3's `ProjectsGallery.tsx` imports both by exact name.
- Precondition: `projects` must be non-empty — this component does not render an empty state itself (it indexes `projects[activeIndex]` unconditionally). The empty-array / "nothing to show" guard is the caller's job — Task 3's `ProjectsGallery.tsx` returns `null` before ever rendering this component when there are zero rows, the same convention `ProjectShowcase.tsx` already uses.

No automatable check — this is a visual/interactive component with no existing component-test convention in this repo (same precedent as `ResourceForm.tsx`/`expanding-cards.tsx`). Verified via `npm run typecheck` + `npm run lint` here, and visually in Task 4 once it has real data on the running page.

- [ ] **Step 1: Create the file**

```tsx
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
  const dragRef = useRef<DragState | null>(null);

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
      dragRef.current = { startX: t.clientX, startY: t.clientY, horizontal: false };
    }

    function handleMove(e: TouchEvent) {
      const drag = dragRef.current;
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
      const drag = dragRef.current;
      dragRef.current = null;
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
    dragRef.current = { startX: e.clientX, startY: e.clientY, horizontal: true };
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || e.pointerType !== "mouse") return;
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
              {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
              <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
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
            <h3 className="font-display mt-4 text-2xl leading-tight font-medium tracking-[-0.01em] text-balance md:text-3xl">
              {active.title}
            </h3>
            <p className="text-ink-soft mt-4 line-clamp-4 text-sm leading-[1.7] text-pretty md:text-base">
              {active.description}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <Button href={`/projects/${active.slug}`} variant="charcoal" size="sm">
                {exploreLabel}
              </Button>

              {count > 1 ? (
                <>
                  <div className="text-ink-soft flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase md:hidden">
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
```

- [ ] **Step 2: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/argent-loop-infinite-slider.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add Argent Loop-style infinite slider, adapted to ink/charcoal tokens

Vertical slider with rAF-driven lerp/parallax (activeIndex is the only
React state — everything else lives in refs), circular virtual looping via
gallery-loop's index math, and a wheel/touch interaction model that never
calls preventDefault on the page's own scroll gesture: wheel only reads
deltaY, and touchmove only intercepts once horizontal swipe intent is
confirmed (backed by touch-action: pan-y on the stage).
EOF
)"
```

---

### Task 3: `ProjectsGallery.tsx` — server component + i18n key

**Files:**
- Create: `src/components/sections/ProjectsGallery.tsx`
- Modify: `src/i18n/messages/en.json` (the `"projects"` block)
- Modify: `src/i18n/messages/id.json` (the `"projects"` block)

**Interfaces:**
- Consumes: `ArgentLoopInfiniteSlider`/`GalleryProject` (Task 2); `prisma.project` shape (existing, unchanged); `toStringArray`/`isVideoUrl` from `@/lib/media` (existing).
- Produces: `<ProjectsGallery locale={string} />`, a default-exported async server component. Renders `null` when there are zero `featured && !archived` rows — same empty-state convention as `ProjectShowcase`. Task 4 imports this by exact name.

- [ ] **Step 1: Add the `exploreProject` key to `src/i18n/messages/en.json`**

Find this block (the existing `"projects"` namespace):

```json
    "openHint": "Double click / double tap a panel to open its case study",
    "readMore": "Read more"
  },
```

Replace with:

```json
    "openHint": "Double click / double tap a panel to open its case study",
    "readMore": "Read more",
    "exploreProject": "Explore Project"
  },
```

- [ ] **Step 2: Add the matching key to `src/i18n/messages/id.json`**

Find this block:

```json
    "openHint": "Double click / double tap panel untuk membuka studi kasusnya",
    "readMore": "Lihat proyek"
  },
```

Replace with:

```json
    "openHint": "Double click / double tap panel untuk membuka studi kasusnya",
    "readMore": "Lihat proyek",
    "exploreProject": "Jelajahi Proyek"
  },
```

- [ ] **Step 3: Typecheck (parity check)**

Run: `npm run typecheck`
Expected: clean — `src/i18n/messages/parity.ts` fails the build if `id.json` doesn't match `en.json`'s keys exactly, so this confirms both files stayed in parity.

- [ ] **Step 4: Create `src/components/sections/ProjectsGallery.tsx`**

```tsx
import "server-only";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { isVideoUrl, toStringArray } from "@/lib/media";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { ArgentLoopInfiniteSlider, type GalleryProject } from "@/components/ui/argent-loop-infinite-slider";

/**
 * Sama seperti ProjectShowcase: featured && !archived, order asc. Sengaja
 * TIDAK mengubah data atau menambah baris — kalau tabelnya kosong, section
 * ini tidak pernah dirender (lihat guard di bawah).
 */
export default async function ProjectsGallery({ locale }: { locale: string }) {
  const [rows, t] = await Promise.all([
    prisma.project.findMany({
      where: { featured: true, archived: false },
      orderBy: { order: "asc" },
    }),
    getTranslations({ locale, namespace: "projects" }),
  ]);
  if (rows.length === 0) return null;

  const id = locale === "id";
  const projects: GalleryProject[] = rows.map((row) => {
    const gallery = toStringArray(row.images).filter((url) => !isVideoUrl(url));
    const image =
      (row.coverImage && !isVideoUrl(row.coverImage) ? row.coverImage : null) ??
      gallery[0] ??
      "/images/placeholder-1.jpg";

    return {
      slug: row.slug,
      title: id ? row.title_id : row.title_en,
      category: row.category,
      year: row.year,
      description: id ? row.description_id : row.description_en,
      image,
    };
  });

  return (
    <Section className="border-line border-t">
      <Container>
        <p className="eyebrow mb-4">{t("eyebrow")}</p>
        <h2 className="font-rampart-one font-display mb-10 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] font-medium tracking-[-0.01em] text-balance">
          {t("title")}
        </h2>
        <ArgentLoopInfiniteSlider
          projects={projects}
          exploreLabel={t("exploreProject")}
          openHintLabel={t("openHint")}
        />
      </Container>
    </Section>
  );
}
```

- [ ] **Step 5: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/ProjectsGallery.tsx src/i18n/messages/en.json src/i18n/messages/id.json
git commit -m "$(cat <<'EOF'
feat(home): add ProjectsGallery server component

Fetches featured, non-archived Project rows (same filter as
ProjectShowcase) and feeds them to ArgentLoopInfiniteSlider. Adds one new
bilingual i18n key (projects.exploreProject); openHint/eyebrow/title were
already present and unused/reused as-is.
EOF
)"
```

---

### Task 4: Wire into the homepage + verify

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `ProjectsGallery` (Task 3).
- Produces: nothing further consumes this — final integration point.

- [ ] **Step 1: Add the import**

In `src/app/[locale]/page.tsx`, add alongside the other section imports:

```ts
import ProjectsGallery from "@/components/sections/ProjectsGallery";
```

- [ ] **Step 2: Render it as the first thing inside `homepage-paper`**

Find:

```tsx
      <div className="homepage-paper relative z-10">
        {/* Dipaku saat digulir: satu layar per langkah, lalu halaman lanjut.
```

Change to:

```tsx
      <div className="homepage-paper relative z-10">
        <ProjectsGallery locale={locale} />

        {/* Dipaku saat digulir: satu layar per langkah, lalu halaman lanjut.
```

Do not touch anything else in this file — `Hero`, the existing `Section id="projects"`/`ExpandingCards` "Work" panel, `Section#benefits`, `Section#services`, and `ReadyPanel` all stay exactly as they are.

- [ ] **Step 3: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds with no TypeScript or build errors.

- [ ] **Step 5: Manual verification in the dev server**

Run: `npm run dev` (per the Prisma/dev-server note in project memory: if the schema hasn't changed this session, this is safe; do not run a Prisma migrate/generate while dev is running).

In a browser, check:
- Homepage: the new section renders directly under Hero, above the existing "Dwi Studio" work panel.
- Desktop (≥1024px width): wheel over the slider advances slides without ever preventing the page itself from scrolling past the section; double-clicking the main image navigates to `/projects/[slug]`; clicking a minimap tick jumps to that project; the "Explore Project" button navigates to the same slug currently shown.
- Mobile viewport widths 375px, 390px, 430px (browser devtools device toolbar): image is the dominant element, category + year sit on one row, the compact "0N / 0N" counter + dot strip replace the desktop tick-rail, "Explore Project" is easily tappable, a horizontal swipe on the image changes slides, no horizontal page overflow, and normal vertical page scrolling (Hero → Gallery → next section) is never blocked.
- Confirm no console errors/warnings (React hydration mismatch, passive-event-listener preventDefault warnings, or otherwise).

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/page.tsx"
git commit -m "$(cat <<'EOF'
feat(home): wire ProjectsGallery in directly below Hero
EOF
)"
```
