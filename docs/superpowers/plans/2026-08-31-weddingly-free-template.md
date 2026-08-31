# Weddingly Free Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second wedding invitation template, `weddingly-free`, selectable in the existing CMS dropdown, rendering the same `WeddingPreviewData` through a cinematic, dark, photo-led, full-screen-slide layout — without touching `classic-elegant`, routes, schema, or auth.

**Architecture:** A new isolated folder `src/components/wedding/templates/weddingly-free/` (index + 12 section components + a tiny `utils.ts`), registered as one entry in `template-registry.ts`. Reuses the existing `WeddingMotionProvider`/`SectionMotion`/`parseAnimationSettings` animation system, the existing `submitRsvp`/`submitMessage` server actions, and a new small cross-template `SafeImage` component (in `shared/`) that guarantees no broken `<img>` ever renders.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 (including its built-in `scroll-snap` utilities — no new library), existing GSAP/Lenis wrappers.

**Design spec:** `docs/superpowers/specs/2026-08-31-weddingly-free-template-design.md` — read it for the full rationale; this plan is its literal execution.

## Global Constraints

- No new npm dependencies (no `mongodb`, `mongoose`, `react-intersection-observer`, `react-type-animation`, `@next/font`).
- Do not modify any file under `src/components/wedding/templates/classic-elegant/`.
- Do not modify `prisma/schema.prisma` or `prisma/seed.ts`.
- Do not modify `src/app/undangan/[slug]/page.tsx`, `src/app/undangan/layout.tsx`, or any admin auth/upload code.
- Every template component signature is `{ invitation: WeddingPreviewData; guestName: string | null; preview?: boolean }` (the `TemplateProps` type from `@/lib/wedding/template-registry`) at the top (`index.tsx`) level. Section components take only the narrow props they need — never fetch data themselves.
- Every `<img>`-equivalent goes through `SafeImage` (never a raw `<img>` with an unguarded `src`). Every CSS `background-image` that includes a photo URL goes through `photoBackgroundStyle()` (always has a solid/gradient fallback layer).
- Colors/fonts always come from the invitation's own `--w-primary/secondary/accent/bg` and `--w-font-display/body` CSS variables — never hardcoded brand colors.
- `animationSettings` is one JSON blob per invitation (not per-template) — never add new keys to `SECTION_KEYS`/`SECTION_CONFIG` in `src/lib/wedding/animation-presets.ts`. Slides without a matching existing key (`OpeningGate`, `QuoteSlide`) use a plain/hardcoded entrance instead.
- Indonesian-only copy (locale-free), matching every other wedding template string in this codebase.

---

## Task 1: `SafeImage` shared component

**Files:**
- Create: `src/components/wedding/shared/SafeImage.tsx`

**Interfaces:**
- Produces: `export default function SafeImage(props: { src: string | null | undefined; alt: string; className?: string; placeholderClassName?: string }): JSX.Element` — renders an `<img>` with `onError` fallback, or a gradient placeholder `<div>` if `src` is falsy or the image failed to load.

- [ ] **Step 1: Write the component**

```tsx
"use client";
import { useState } from "react";

/**
 * <img> wrapper that never shows a broken-image icon. Falls back to a
 * gradient placeholder (built from the invitation's own --w-* palette) when
 * `src` is empty or fails to load — e.g. seed/demo data with dead local paths.
 */
export default function SafeImage({
  src,
  alt,
  className = "",
  placeholderClassName,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-[var(--w-secondary)]/35 to-[var(--w-primary)]/25 ${
          placeholderClassName ?? className
        }`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local public/ URLs only, needs onError fallback
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
```

- [ ] **Step 2: Typecheck and lint the new file**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `SafeImage.tsx`.

Run: `npx eslint src/components/wedding/shared/SafeImage.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wedding/shared/SafeImage.tsx
git commit -m "feat(wedding): add SafeImage fallback-safe image component"
```

---

## Task 2: `weddingly-free/utils.ts` (`photoBackgroundStyle`) + check script

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/utils.ts`
- Create: `src/components/wedding/templates/weddingly-free/utils.check.ts`
- Modify: `package.json` (the `"check"` script)

**Interfaces:**
- Produces: `export function photoBackgroundStyle(url: string | null | undefined): CSSProperties` — always returns `backgroundColor: "var(--w-bg)"` and a `backgroundImage` that includes a dark scrim + mood gradient (built from `--w-primary/secondary/accent`) with the photo URL layered on top **only when `url` is truthy**. Consumed by Task 3 (`OpeningGate`), Task 4 (`CoverSlide`), and Task 12 (`index.tsx`'s desktop sticky panel).

- [ ] **Step 1: Write the failing check first**

```ts
/**
 * Cek photoBackgroundStyle: background CSS harus selalu punya fallback
 * (color + gradient) yang tidak bergantung pada URL foto berhasil dimuat.
 * Jalankan: npm run check
 */
import assert from "node:assert/strict";
import { photoBackgroundStyle } from "./utils";

const withPhoto = photoBackgroundStyle("/uploads/cover.jpg");
assert.equal(withPhoto.backgroundColor, "var(--w-bg)", "selalu punya backgroundColor");
assert.ok(String(withPhoto.backgroundImage).includes("url(/uploads/cover.jpg)"), "foto ikut dilapis");
assert.ok(String(withPhoto.backgroundImage).includes("linear-gradient"), "gradient tetap ada di atas foto");

const noPhoto = photoBackgroundStyle(null);
assert.equal(noPhoto.backgroundColor, "var(--w-bg)");
assert.ok(!String(noPhoto.backgroundImage).includes("url("), "tanpa foto -> tidak ada layer url()");
assert.ok(String(noPhoto.backgroundImage).includes("linear-gradient"), "gradient tetap tampil tanpa foto");

const empty = photoBackgroundStyle("");
assert.ok(!String(empty.backgroundImage).includes("url("), "string kosong diperlakukan sama seperti null");

const undef = photoBackgroundStyle(undefined);
assert.ok(!String(undef.backgroundImage).includes("url("), "undefined diperlakukan sama seperti null");

console.log("weddingly-free utils: semua cek lolos");
```

Save this as `src/components/wedding/templates/weddingly-free/utils.check.ts`.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx src/components/wedding/templates/weddingly-free/utils.check.ts`
Expected: FAIL — `Cannot find module './utils'` (the file doesn't exist yet).

- [ ] **Step 3: Write `utils.ts`**

```ts
import type { CSSProperties } from "react";

/**
 * Full-bleed photo background with a guaranteed-visible fallback: a dark
 * scrim + mood gradient (built from the invitation's own palette) always
 * renders; the photo URL is layered UNDERNEATH it, only when supplied. CSS
 * paints multi-layer background-image independently per layer, so a 404'd
 * photo (dead seed path, etc.) never blanks the gradient above it.
 */
export function photoBackgroundStyle(url: string | null | undefined): CSSProperties {
  const scrim =
    "linear-gradient(180deg, rgba(10,9,8,0.25) 0%, rgba(10,9,8,0.45) 55%, rgba(10,9,8,0.7) 100%)";
  const mood =
    "radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--w-accent) 28%, transparent) 0%, transparent 70%), " +
    "linear-gradient(160deg, var(--w-secondary) 0%, var(--w-primary) 100%)";
  return {
    backgroundColor: "var(--w-bg)",
    backgroundImage: url ? `${scrim}, ${mood}, url(${url})` : `${scrim}, ${mood}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `npx tsx src/components/wedding/templates/weddingly-free/utils.check.ts`
Expected: prints `weddingly-free utils: semua cek lolos`, exit code 0.

- [ ] **Step 5: Wire the check into `npm run check`**

In `package.json`, find:
```json
"check": "tsx src/lib/admin/resources.check.ts && tsx src/lib/admin/upload.check.ts && tsx src/lib/wedding/validation.check.ts && tsx src/lib/wedding/animation-presets.check.ts"
```
Replace with:
```json
"check": "tsx src/lib/admin/resources.check.ts && tsx src/lib/admin/upload.check.ts && tsx src/lib/wedding/validation.check.ts && tsx src/lib/wedding/animation-presets.check.ts && tsx src/components/wedding/templates/weddingly-free/utils.check.ts"
```

- [ ] **Step 6: Run the full check suite**

Run: `npm run check`
Expected: all five check scripts print their "lolos" line, exit code 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/utils.ts src/components/wedding/templates/weddingly-free/utils.check.ts package.json
git commit -m "feat(wedding): add photoBackgroundStyle helper with fallback-safe check"
```

---

## Task 3: `OpeningGate.tsx`

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/sections/OpeningGate.tsx`

**Interfaces:**
- Consumes: `photoBackgroundStyle(url)` from `../utils` (Task 2).
- Produces: `export default function OpeningGate(props: { invitation: WeddingPreviewData; guestName: string | null; preview?: boolean }): JSX.Element`. Self-contained `opened` state, audio playback, body-scroll-lock, and (new, beyond classic-elegant's `Cover.tsx`) toggles `document.documentElement.style.scrollSnapType` for the mobile/public scroll-snap flow that Task 12 relies on.

- [ ] **Step 1: Write the component**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import type { WeddingPreviewData } from "@/components/wedding/types";
import { photoBackgroundStyle } from "../utils";

/**
 * Full-screen lock gate, shown before the guest opens the invitation. Public
 * mode only (preview always starts opened, no overlay, no scroll-lock, no
 * autoplay — matches classic-elegant's Cover.tsx preview branch). Also owns
 * the document-level `scroll-snap-type` toggle that the slide sections
 * (wrapped individually via SectionMotion in index.tsx) rely on for their
 * `snap-start` alignment — set here (not in the shared undangan layout) so
 * it never touches classic-elegant's rendering.
 */
export default function OpeningGate({
  invitation,
  guestName,
  preview = false,
}: {
  invitation: WeddingPreviewData;
  guestName: string | null;
  preview?: boolean;
}) {
  const [opened, setOpened] = useState(preview);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstEvent = invitation.events[0];

  useEffect(() => {
    if (preview) return;
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened, preview]);

  useEffect(() => {
    if (preview) return;
    document.documentElement.style.scrollSnapType = "y proximity";
    return () => {
      document.documentElement.style.scrollSnapType = "";
    };
  }, [preview]);

  function open() {
    setOpened(true);
    if (invitation.isMusicEnabled && audioRef.current) audioRef.current.play().catch(() => {});
  }

  const dateLabel = firstEvent
    ? new Date(firstEvent.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const bg = photoBackgroundStyle(invitation.coverImage);

  const inner = (
    <div className="flex flex-col items-center text-center text-white">
      <p className="text-[11px] tracking-[0.35em] text-white/75 uppercase">The Wedding Of</p>
      <h1 className="mt-5 font-[family-name:var(--w-font-display)] text-4xl sm:text-5xl">
        {invitation.brideName} &amp; {invitation.groomName}
      </h1>
      {dateLabel ? <p className="mt-4 text-sm text-white/85">{dateLabel}</p> : null}
      {guestName ? (
        <div className="mt-10">
          <p className="text-xs tracking-[0.2em] text-white/60 uppercase">Kepada Yth.</p>
          <p className="mt-2 font-[family-name:var(--w-font-display)] text-xl">{guestName}</p>
        </div>
      ) : null}
      {preview ? null : (
        <button
          type="button"
          onClick={open}
          className="mt-12 rounded-full border border-white/40 bg-white/10 px-9 py-3 text-xs tracking-[0.25em] text-white uppercase backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Buka Undangan
        </button>
      )}
    </div>
  );

  if (preview) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16" style={bg}>
        {inner}
      </div>
    );
  }

  return (
    <>
      {invitation.isMusicEnabled && invitation.musicUrl ? (
        <audio ref={audioRef} src={invitation.musicUrl} loop preload="auto" />
      ) : null}
      <div
        aria-hidden={opened}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 transition-opacity duration-700 ${
          opened ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={bg}
      >
        {inner}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `OpeningGate.tsx`.

Run: `npx eslint src/components/wedding/templates/weddingly-free/sections/OpeningGate.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/sections/OpeningGate.tsx
git commit -m "feat(wedding): add Weddingly Free OpeningGate section"
```

---

## Task 4: `CoverSlide.tsx` + `QuoteSlide.tsx`

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/sections/CoverSlide.tsx`
- Create: `src/components/wedding/templates/weddingly-free/sections/QuoteSlide.tsx`

**Interfaces:**
- Consumes: `photoBackgroundStyle(url)` from `../utils` (Task 2).
- Produces: `export default function CoverSlide(props: { invitation: WeddingPreviewData }): JSX.Element`. `export default function QuoteSlide(props: { quoteText: string | null }): JSX.Element`.

- [ ] **Step 1: Write `CoverSlide.tsx`**

```tsx
import type { WeddingPreviewData } from "@/components/wedding/types";
import { photoBackgroundStyle } from "../utils";

export default function CoverSlide({ invitation }: { invitation: WeddingPreviewData }) {
  const firstEvent = invitation.events[0];
  const photo = invitation.coverImage ?? invitation.bridePhoto ?? invitation.groomPhoto ?? null;
  const dateLabel = firstEvent
    ? new Date(firstEvent.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <section
      className="flex min-h-dvh flex-col items-center justify-center px-6 text-center text-white"
      style={photoBackgroundStyle(photo)}
    >
      <p className="text-[11px] tracking-[0.3em] text-white/70 uppercase">Wedding Invitation</p>
      <h2 className="mt-5 font-[family-name:var(--w-font-display)] text-4xl sm:text-5xl">
        {invitation.brideName} &amp; {invitation.groomName}
      </h2>
      {dateLabel ? <p className="mt-4 text-sm text-white/85">{dateLabel}</p> : null}
    </section>
  );
}
```

- [ ] **Step 2: Write `QuoteSlide.tsx`**

```tsx
export default function QuoteSlide({ quoteText }: { quoteText: string | null }) {
  const text = quoteText?.trim() || "Dua hati, satu janji, selamanya.";
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center bg-[var(--w-bg)] px-8 text-center">
      <p className="font-[family-name:var(--w-font-display)] text-2xl leading-relaxed text-[var(--w-primary)] italic sm:text-3xl">
        &ldquo;{text}&rdquo;
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `CoverSlide.tsx` or `QuoteSlide.tsx`.

Run: `npx eslint src/components/wedding/templates/weddingly-free/sections/CoverSlide.tsx src/components/wedding/templates/weddingly-free/sections/QuoteSlide.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/sections/CoverSlide.tsx src/components/wedding/templates/weddingly-free/sections/QuoteSlide.tsx
git commit -m "feat(wedding): add Weddingly Free Cover and Quote slides"
```

---

## Task 5: `CoupleSlide.tsx`

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/sections/CoupleSlide.tsx`

**Interfaces:**
- Consumes: `SafeImage` from `@/components/wedding/shared/SafeImage` (Task 1); `ParallaxLayer` from `@/components/wedding/animation/ParallaxLayer` (existing, unchanged); `Eyebrow` from `@/components/wedding/shared/Eyebrow` (existing, unchanged).
- Produces: `export default function CoupleSlide(props: { invitation: WeddingPreviewData; scroll?: string; preview?: boolean }): JSX.Element`.

- [ ] **Step 1: Write the component**

```tsx
import type { WeddingPreviewData } from "@/components/wedding/types";
import Eyebrow from "@/components/wedding/shared/Eyebrow";
import SafeImage from "@/components/wedding/shared/SafeImage";
import ParallaxLayer from "@/components/wedding/animation/ParallaxLayer";

function Person({
  name,
  fullName,
  parents,
  photo,
  parallax,
  preview,
}: {
  name: string;
  fullName: string | null;
  parents: string | null;
  photo: string | null;
  parallax: boolean;
  preview: boolean;
}) {
  const portraitClass = "mx-auto h-40 w-40 rounded-full object-cover ring-1 ring-[var(--w-accent)]/40";
  const portrait = <SafeImage src={photo} alt={name} className={portraitClass} placeholderClassName={portraitClass} />;

  return (
    <div className="text-center">
      <div className="mb-4">
        {parallax ? (
          <ParallaxLayer preview={preview} amount={7}>
            {portrait}
          </ParallaxLayer>
        ) : (
          portrait
        )}
      </div>
      <h3 className="font-[family-name:var(--w-font-display)] text-2xl text-[var(--w-primary)]">{name}</h3>
      {fullName ? <p className="mt-1 text-sm opacity-80">{fullName}</p> : null}
      {parents ? <p className="mt-2 text-xs leading-relaxed opacity-65">{parents}</p> : null}
    </div>
  );
}

export default function CoupleSlide({
  invitation,
  scroll,
  preview = false,
}: {
  invitation: WeddingPreviewData;
  scroll?: string;
  preview?: boolean;
}) {
  const parallax = scroll === "portrait-parallax";
  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>The Bride &amp; Groom</Eyebrow>
        <div className="grid gap-10 sm:grid-cols-2">
          <Person
            name={invitation.brideName}
            fullName={invitation.brideFullName}
            parents={invitation.brideParents}
            photo={invitation.bridePhoto}
            parallax={parallax}
            preview={preview}
          />
          <Person
            name={invitation.groomName}
            fullName={invitation.groomFullName}
            parents={invitation.groomParents}
            photo={invitation.groomPhoto}
            parallax={parallax}
            preview={preview}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `CoupleSlide.tsx`.

Run: `npx eslint src/components/wedding/templates/weddingly-free/sections/CoupleSlide.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/sections/CoupleSlide.tsx
git commit -m "feat(wedding): add Weddingly Free Couple slide"
```

---

## Task 6: `StorySlide.tsx` + `CountdownSlide.tsx`

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/sections/StorySlide.tsx`
- Create: `src/components/wedding/templates/weddingly-free/sections/CountdownSlide.tsx`

**Interfaces:**
- Produces: `export default function StorySlide(props: { title: string | null; text: string }): JSX.Element` — caller (Task 12) only renders this when `invitation.storyText` is truthy, so `text` here is guaranteed non-empty (matches classic-elegant's `LoveStory.tsx` contract — no internal empty-guard).
- Produces: `export default function CountdownSlide(props: { date: string | Date | null }): JSX.Element | null` — returns `null` when `date` is `null` (mirrors classic-elegant's `Countdown.tsx`).

- [ ] **Step 1: Write `StorySlide.tsx`**

```tsx
import Eyebrow from "@/components/wedding/shared/Eyebrow";

export default function StorySlide({ title, text }: { title: string | null; text: string }) {
  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-8 py-16">
      <div className="mx-auto w-full max-w-xl text-center">
        <Eyebrow>Our Story</Eyebrow>
        {title ? (
          <h2 className="mb-6 font-[family-name:var(--w-font-display)] text-3xl text-[var(--w-primary)]">{title}</h2>
        ) : null}
        <p className="text-sm leading-relaxed whitespace-pre-line opacity-85">{text}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `CountdownSlide.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

export default function CountdownSlide({ date }: { date: string | Date | null }) {
  const target = date ? new Date(date).getTime() : null;
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (target === null) return;
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (target === null) return null;

  const cells: [number, string][] = [
    [t.d, "Hari"],
    [t.h, "Jam"],
    [t.m, "Menit"],
    [t.s, "Detik"],
  ];

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center bg-[var(--w-bg)] px-6 py-16 text-center">
      <Eyebrow>Counting Down</Eyebrow>
      <div className="flex gap-3">
        {cells.map(([n, label]) => (
          <div
            key={label}
            className="min-w-16 rounded-xl border border-[var(--w-accent)]/30 bg-white/40 px-3 py-4 backdrop-blur-sm"
          >
            <div className="font-[family-name:var(--w-font-display)] text-3xl text-[var(--w-primary)]">{n}</div>
            <div className="mt-1 text-[10px] tracking-[0.15em] uppercase opacity-60">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `StorySlide.tsx` or `CountdownSlide.tsx`.

Run: `npx eslint src/components/wedding/templates/weddingly-free/sections/StorySlide.tsx src/components/wedding/templates/weddingly-free/sections/CountdownSlide.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/sections/StorySlide.tsx src/components/wedding/templates/weddingly-free/sections/CountdownSlide.tsx
git commit -m "feat(wedding): add Weddingly Free Story and Countdown slides"
```

---

## Task 7: `EventsSlide.tsx`

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/sections/EventsSlide.tsx`

**Interfaces:**
- Produces: `export default function EventsSlide(props: { events: WeddingPreviewData["events"] }): JSX.Element | null` — returns `null` when `events.length === 0`.

- [ ] **Step 1: Write the component**

```tsx
import type { WeddingPreviewData } from "@/components/wedding/types";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventsSlide({ events }: { events: WeddingPreviewData["events"] }) {
  if (events.length === 0) return null;
  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>Wedding Events</Eyebrow>
        <div className="flex flex-col gap-6">
          {events.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl border border-[var(--w-accent)]/30 bg-white/40 p-6 text-center backdrop-blur-sm"
            >
              <h3 className="font-[family-name:var(--w-font-display)] text-2xl text-[var(--w-primary)]">{e.title}</h3>
              <p className="mt-2 text-sm">{formatDate(e.date)}</p>
              {e.startTime ? (
                <p className="text-sm opacity-80">
                  {e.startTime}
                  {e.endTime ? ` – ${e.endTime}` : ""} WITA
                </p>
              ) : null}
              {e.venueName ? <p className="mt-3 font-medium">{e.venueName}</p> : null}
              {e.venueAddress ? <p className="text-xs leading-relaxed opacity-70">{e.venueAddress}</p> : null}
              {e.mapsUrl ? (
                <a
                  href={e.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block rounded-full bg-[var(--w-primary)] px-5 py-2 text-xs tracking-[0.15em] text-white uppercase"
                >
                  Buka Google Maps
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `EventsSlide.tsx`.

Run: `npx eslint src/components/wedding/templates/weddingly-free/sections/EventsSlide.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/sections/EventsSlide.tsx
git commit -m "feat(wedding): add Weddingly Free Events slide"
```

---

## Task 8: `GallerySlide.tsx`

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/sections/GallerySlide.tsx`

**Interfaces:**
- Consumes: `SafeImage` (Task 1); `HorizontalScrollSection` from `@/components/wedding/animation/HorizontalScrollSection` (existing, unchanged).
- Produces: `export default function GallerySlide(props: { invitation: WeddingPreviewData; scroll?: string; preview?: boolean }): JSX.Element` — **never returns `null`**: falls back `gallery` → `[coverImage, bridePhoto, groomPhoto]` → a gradient "coming soon" panel, per the design spec's broken-image requirement.

- [ ] **Step 1: Write the component**

```tsx
import type { WeddingPreviewData } from "@/components/wedding/types";
import Eyebrow from "@/components/wedding/shared/Eyebrow";
import SafeImage from "@/components/wedding/shared/SafeImage";
import HorizontalScrollSection from "@/components/wedding/animation/HorizontalScrollSection";

type GalleryPhoto = { id: string; imageUrl: string; caption: string | null };

function fallbackPhotos(invitation: WeddingPreviewData): GalleryPhoto[] {
  return [
    invitation.coverImage ? { id: "cover", imageUrl: invitation.coverImage, caption: null } : null,
    invitation.bridePhoto ? { id: "bride", imageUrl: invitation.bridePhoto, caption: invitation.brideName } : null,
    invitation.groomPhoto ? { id: "groom", imageUrl: invitation.groomPhoto, caption: invitation.groomName } : null,
  ].filter((p): p is GalleryPhoto => p !== null);
}

function renderPhoto(item: GalleryPhoto, figureClassName: string, imgClassName: string) {
  return (
    <figure key={item.id} className={figureClassName}>
      <SafeImage src={item.imageUrl} alt={item.caption ?? ""} className={imgClassName} placeholderClassName={imgClassName} />
      {item.caption ? <figcaption className="mt-1 text-center text-[11px] opacity-60">{item.caption}</figcaption> : null}
    </figure>
  );
}

export default function GallerySlide({
  invitation,
  scroll,
  preview = false,
}: {
  invitation: WeddingPreviewData;
  scroll?: string;
  preview?: boolean;
}) {
  const items: GalleryPhoto[] =
    invitation.gallery.length > 0
      ? invitation.gallery.map((g) => ({ id: g.id, imageUrl: g.imageUrl, caption: g.caption }))
      : fallbackPhotos(invitation);

  if (items.length === 0) {
    return (
      <section className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[var(--w-secondary)]/30 to-[var(--w-primary)]/20 px-6 py-16 text-center">
        <Eyebrow>Gallery</Eyebrow>
        <p className="text-sm opacity-70">Galeri foto akan segera hadir.</p>
      </section>
    );
  }

  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>Gallery</Eyebrow>
        {scroll === "horizontal-scroll" ? (
          <HorizontalScrollSection preview={preview}>
            {items.map((item) =>
              renderPhoto(
                item,
                "w-[68%] shrink-0 snap-start sm:w-[44%] md:w-[32%]",
                "aspect-[3/4] w-full rounded-lg object-cover",
              ),
            )}
          </HorizontalScrollSection>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => renderPhoto(item, "", "aspect-square w-full rounded-lg object-cover"))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `GallerySlide.tsx`.

Run: `npx eslint src/components/wedding/templates/weddingly-free/sections/GallerySlide.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/sections/GallerySlide.tsx
git commit -m "feat(wedding): add Weddingly Free Gallery slide with fallback chain"
```

---

## Task 9: `GiftSlide.tsx`

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/sections/GiftSlide.tsx`

**Interfaces:**
- Consumes: `SafeImage` (Task 1); `CopyButton` from `@/components/wedding/shared/CopyButton` (existing, unchanged).
- Produces: `export default function GiftSlide(props: { gifts: WeddingPreviewData["gifts"] }): JSX.Element | null` — returns `null` when `gifts.length === 0`.

- [ ] **Step 1: Write the component**

```tsx
import type { WeddingPreviewData } from "@/components/wedding/types";
import Eyebrow from "@/components/wedding/shared/Eyebrow";
import CopyButton from "@/components/wedding/shared/CopyButton";
import SafeImage from "@/components/wedding/shared/SafeImage";

export default function GiftSlide({ gifts }: { gifts: WeddingPreviewData["gifts"] }) {
  if (gifts.length === 0) return null;
  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>Wedding Gift</Eyebrow>
        <p className="mb-8 text-center text-sm leading-relaxed opacity-80">
          Doa restu Anda merupakan karunia yang sangat berarti. Jika memberi lebih, Anda dapat mengirim tanda kasih
          melalui:
        </p>
        <div className="flex flex-col gap-4">
          {gifts.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border border-[var(--w-accent)]/30 bg-white/40 p-6 text-center backdrop-blur-sm"
            >
              {g.providerName ? <p className="font-medium text-[var(--w-primary)]">{g.providerName}</p> : null}
              {g.accountNumber ? (
                <>
                  <p className="mt-2 font-[family-name:var(--w-font-display)] text-2xl tracking-wider">
                    {g.accountNumber}
                  </p>
                  {g.accountName ? <p className="text-xs opacity-70">a.n. {g.accountName}</p> : null}
                  <div className="mt-3 flex justify-center">
                    <CopyButton value={g.accountNumber} />
                  </div>
                </>
              ) : null}
              {g.address ? <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{g.address}</p> : null}
              {g.qrImage ? (
                <SafeImage src={g.qrImage} alt="QRIS" className="mx-auto mt-3 h-48 w-48 object-contain" />
              ) : null}
              {g.notes ? <p className="mt-3 text-xs opacity-60">{g.notes}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `GiftSlide.tsx`.

Run: `npx eslint src/components/wedding/templates/weddingly-free/sections/GiftSlide.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/sections/GiftSlide.tsx
git commit -m "feat(wedding): add Weddingly Free Gift slide"
```

---

## Task 10: `RsvpSlide.tsx` + `GuestbookSlide.tsx`

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/sections/RsvpSlide.tsx`
- Create: `src/components/wedding/templates/weddingly-free/sections/GuestbookSlide.tsx`

**Interfaces:**
- Consumes: `submitRsvp`, `submitMessage`, `type PublicFormState` from `@/lib/wedding/actions` (existing, unchanged); `ATTENDANCE` from `@/lib/wedding/validation` (existing, unchanged).
- Produces: `export default function RsvpSlide(props: { invitationId: string; defaultName: string | null }): JSX.Element`. `export default function GuestbookSlide(props: { invitationId: string; messages: WeddingPreviewData["messages"] }): JSX.Element`. Both are rendered conditionally by the caller (Task 12) based on `isRsvpEnabled`/`isGuestbookEnabled` — neither component checks those flags itself.

- [ ] **Step 1: Write `RsvpSlide.tsx`**

```tsx
"use client";
import { useActionState } from "react";
import { submitRsvp, type PublicFormState } from "@/lib/wedding/actions";
import { ATTENDANCE } from "@/lib/wedding/validation";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

const INPUT =
  "w-full rounded-lg border border-[var(--w-accent)]/40 bg-white/70 px-4 py-2.5 text-sm text-[#2E2A26] outline-none backdrop-blur-sm transition-colors focus:border-[var(--w-primary)]";

const ATTENDANCE_LABELS: Record<string, string> = {
  attending: "Hadir",
  not_attending: "Tidak hadir",
  maybe: "Mungkin",
};

export default function RsvpSlide({
  invitationId,
  defaultName,
}: {
  invitationId: string;
  defaultName: string | null;
}) {
  const [state, formAction, pending] = useActionState<PublicFormState, FormData>(submitRsvp, null);

  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>RSVP</Eyebrow>
        {state?.success ? (
          <p className="text-center font-[family-name:var(--w-font-display)] text-2xl text-[var(--w-primary)]">
            Terima kasih atas konfirmasinya 🤍
          </p>
        ) : (
          <>
            <p className="mb-8 text-center text-sm leading-relaxed opacity-80">Mohon konfirmasi kehadiran Anda.</p>
            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="invitationId" value={invitationId} />
              <input name="guestName" defaultValue={defaultName ?? ""} placeholder="Nama Anda" className={INPUT} />
              <select name="attendanceStatus" defaultValue="attending" className={INPUT}>
                {ATTENDANCE.map((a) => (
                  <option key={a} value={a}>
                    {ATTENDANCE_LABELS[a]}
                  </option>
                ))}
              </select>
              <input name="guestCount" type="number" min={1} max={20} defaultValue={1} className={INPUT} />
              <textarea name="message" rows={3} placeholder="Pesan (opsional)" className={INPUT} />
              {state?.error ? (
                <p role="alert" className="text-sm text-red-700">
                  {state.error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-[var(--w-primary)] px-6 py-3 text-xs tracking-[0.2em] text-white uppercase transition-opacity disabled:opacity-50"
              >
                {pending ? "Mengirim…" : "Kirim RSVP"}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `GuestbookSlide.tsx`**

```tsx
"use client";
import { useActionState } from "react";
import { submitMessage, type PublicFormState } from "@/lib/wedding/actions";
import type { WeddingPreviewData } from "@/components/wedding/types";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

const INPUT =
  "w-full rounded-lg border border-[var(--w-accent)]/40 bg-white/70 px-4 py-2.5 text-sm text-[#2E2A26] outline-none backdrop-blur-sm transition-colors focus:border-[var(--w-primary)]";

export default function GuestbookSlide({
  invitationId,
  messages,
}: {
  invitationId: string;
  messages: WeddingPreviewData["messages"];
}) {
  const [state, formAction, pending] = useActionState<PublicFormState, FormData>(submitMessage, null);

  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>Ucapan &amp; Doa</Eyebrow>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="invitationId" value={invitationId} />
          <input name="guestName" placeholder="Nama Anda" className={INPUT} />
          <textarea name="message" rows={3} placeholder="Tulis ucapan & doa" className={INPUT} />
          {state?.success ? <p className="text-sm text-[var(--w-primary)]">Ucapan terkirim 🤍</p> : null}
          {state?.error ? (
            <p role="alert" className="text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[var(--w-primary)] px-6 py-3 text-xs tracking-[0.2em] text-white uppercase transition-opacity disabled:opacity-50"
          >
            {pending ? "Mengirim…" : "Kirim Ucapan"}
          </button>
        </form>

        <div className="mt-10 flex max-h-80 flex-col gap-4 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-sm opacity-60">Jadilah yang pertama memberi ucapan.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="rounded-xl border border-[var(--w-accent)]/25 bg-white/40 p-4 backdrop-blur-sm">
                <p className="font-[family-name:var(--w-font-display)] text-lg text-[var(--w-primary)]">{m.guestName}</p>
                <p className="mt-1 text-sm leading-relaxed opacity-85">{m.message}</p>
                <p className="mt-2 text-[11px] opacity-50">
                  {new Date(m.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `RsvpSlide.tsx` or `GuestbookSlide.tsx`.

Run: `npx eslint src/components/wedding/templates/weddingly-free/sections/RsvpSlide.tsx src/components/wedding/templates/weddingly-free/sections/GuestbookSlide.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/sections/RsvpSlide.tsx src/components/wedding/templates/weddingly-free/sections/GuestbookSlide.tsx
git commit -m "feat(wedding): add Weddingly Free RSVP and Guestbook slides"
```

---

## Task 11: `ClosingSlide.tsx`

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/sections/ClosingSlide.tsx`

**Interfaces:**
- Produces: `export default function ClosingSlide(props: { invitation: WeddingPreviewData }): JSX.Element`.

- [ ] **Step 1: Write the component**

```tsx
import type { WeddingPreviewData } from "@/components/wedding/types";

export default function ClosingSlide({ invitation }: { invitation: WeddingPreviewData }) {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center bg-[var(--w-bg)] px-6 py-16 text-center">
      <p className="text-sm leading-relaxed opacity-80">
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan
        memberikan doa restu.
      </p>
      <p className="mt-8 font-[family-name:var(--w-font-display)] text-4xl text-[var(--w-primary)]">
        {invitation.brideName} &amp; {invitation.groomName}
      </p>
      <p className="mt-10 text-[11px] tracking-[0.2em] uppercase opacity-50">Created by DwiStudio</p>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `ClosingSlide.tsx`.

Run: `npx eslint src/components/wedding/templates/weddingly-free/sections/ClosingSlide.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/sections/ClosingSlide.tsx
git commit -m "feat(wedding): add Weddingly Free Closing slide"
```

---

## Task 12: `index.tsx`, `thumbnail.svg`, registry wiring (integration)

**Files:**
- Create: `src/components/wedding/templates/weddingly-free/index.tsx`
- Create: `public/weddingly-free/thumbnail.svg`
- Modify: `src/lib/wedding/template-registry.ts`

**Interfaces:**
- Consumes every section from Tasks 3–11, `photoBackgroundStyle` (Task 2), and the existing `WeddingMotionProvider`, `SectionMotion`, `parseAnimationSettings`, `displayFontVar`/`bodyFontVar`, `TemplateProps`.
- Produces: `export default function WeddinglyFree(props: TemplateProps): JSX.Element`, registered in `TEMPLATES["weddingly-free"]`.

- [ ] **Step 1: Create the thumbnail SVG**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="Weddingly Free template thumbnail">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2b2420"/>
      <stop offset="100%" stop-color="#0e0c0a"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <text x="200" y="150" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#e8ddce" font-style="italic">W &amp; F</text>
  <text x="200" y="185" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" letter-spacing="4" fill="#c9a15a">WEDDINGLY FREE</text>
</svg>
```

Save as `public/weddingly-free/thumbnail.svg`.

- [ ] **Step 2: Write `index.tsx`**

```tsx
import type { CSSProperties } from "react";
import type { TemplateProps } from "@/lib/wedding/template-registry";
import { displayFontVar, bodyFontVar } from "@/lib/wedding/fonts";
import { parseAnimationSettings } from "@/lib/wedding/animation-presets";
import WeddingMotionProvider from "@/components/wedding/animation/WeddingMotionProvider";
import SectionMotion from "@/components/wedding/animation/SectionMotion";
import OpeningGate from "./sections/OpeningGate";
import CoverSlide from "./sections/CoverSlide";
import QuoteSlide from "./sections/QuoteSlide";
import CoupleSlide from "./sections/CoupleSlide";
import StorySlide from "./sections/StorySlide";
import EventsSlide from "./sections/EventsSlide";
import CountdownSlide from "./sections/CountdownSlide";
import GallerySlide from "./sections/GallerySlide";
import GiftSlide from "./sections/GiftSlide";
import RsvpSlide from "./sections/RsvpSlide";
import GuestbookSlide from "./sections/GuestbookSlide";
import ClosingSlide from "./sections/ClosingSlide";
import { photoBackgroundStyle } from "./utils";
import "@/styles/wedding-motion.css";

export default function WeddinglyFree({ invitation, guestName, preview = false }: TemplateProps) {
  const anim = parseAnimationSettings(invitation.animationSettings);
  const style = {
    "--w-primary": invitation.primaryColor,
    "--w-secondary": invitation.secondaryColor,
    "--w-accent": invitation.accentColor,
    "--w-bg": invitation.backgroundColor,
    "--w-font-display": `var(${displayFontVar(invitation.fontDisplay)})`,
    "--w-font-body": `var(${bodyFontVar(invitation.fontBody)})`,
  } as CSSProperties;

  const panelPhoto = invitation.coverImage ?? invitation.bridePhoto ?? invitation.groomPhoto ?? null;

  return (
    <WeddingMotionProvider smoothScroll={anim.global.smoothScroll} preview={preview}>
      <main style={style} className="font-[family-name:var(--w-font-body)] text-[#2E2A26] antialiased">
        <OpeningGate invitation={invitation} guestName={guestName} preview={preview} />

        <div className="lg:grid lg:grid-cols-[42%_58%]">
          <div
            aria-hidden
            className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh"
            style={photoBackgroundStyle(panelPhoto)}
          />

          <div>
            <SectionMotion preset={anim.sections.cover} preview={preview} className="snap-start">
              <CoverSlide invitation={invitation} />
            </SectionMotion>
            <SectionMotion preset="fade-up" preview={preview} className="snap-start">
              <QuoteSlide quoteText={invitation.quoteText} />
            </SectionMotion>
            <SectionMotion preset={anim.sections.couple} preview={preview} className="snap-start">
              <CoupleSlide invitation={invitation} scroll={anim.sections.couple} preview={preview} />
            </SectionMotion>
            {invitation.storyText ? (
              <SectionMotion preset={anim.sections.story} preview={preview} className="snap-start">
                <StorySlide title={invitation.storyTitle} text={invitation.storyText} />
              </SectionMotion>
            ) : null}
            <SectionMotion preset={anim.sections.events} preview={preview} className="snap-start">
              <EventsSlide events={invitation.events} />
            </SectionMotion>
            <SectionMotion preset={anim.sections.countdown} preview={preview} className="snap-start">
              <CountdownSlide date={invitation.events[0]?.date ?? null} />
            </SectionMotion>
            <SectionMotion preset={anim.sections.gallery} preview={preview} className="snap-start">
              <GallerySlide invitation={invitation} scroll={anim.sections.gallery} preview={preview} />
            </SectionMotion>
            <SectionMotion preset={anim.sections.gift} preview={preview} className="snap-start">
              <GiftSlide gifts={invitation.gifts} />
            </SectionMotion>
            {invitation.isRsvpEnabled ? (
              <SectionMotion preset={anim.sections.rsvp} preview={preview} className="snap-start">
                <RsvpSlide invitationId={invitation.id} defaultName={guestName} />
              </SectionMotion>
            ) : null}
            {invitation.isGuestbookEnabled ? (
              <SectionMotion preset={anim.sections.guestbook} preview={preview} className="snap-start">
                <GuestbookSlide invitationId={invitation.id} messages={invitation.messages} />
              </SectionMotion>
            ) : null}
            <SectionMotion preset={anim.sections.closing} preview={preview} className="snap-start">
              <ClosingSlide invitation={invitation} />
            </SectionMotion>
          </div>
        </div>
      </main>
    </WeddingMotionProvider>
  );
}
```

- [ ] **Step 3: Register the template**

In `src/lib/wedding/template-registry.ts`, add the import and the registry entry:

```ts
import type { ComponentType } from "react";
import type { WeddingPreviewData } from "@/components/wedding/types";
import ClassicElegant from "@/components/wedding/templates/classic-elegant";
import WeddinglyFree from "@/components/wedding/templates/weddingly-free";

export type TemplateProps = {
  invitation: WeddingPreviewData;
  guestName: string | null;
  /** Admin preview: render the cover inline (no fixed overlay / scroll-lock),
   *  never autoplay music. Off (public route) = full-screen gated cover. */
  preview?: boolean;
};

type TemplateEntry = { label: string; thumbnail: string; component: ComponentType<TemplateProps> };

export const TEMPLATES: Record<string, TemplateEntry> = {
  "classic-elegant": {
    label: "Classic Elegant",
    thumbnail: "/images/placeholder-1.jpg",
    component: ClassicElegant,
  },
  "weddingly-free": {
    label: "Weddingly Free",
    thumbnail: "/weddingly-free/thumbnail.svg",
    component: WeddinglyFree,
  },
};

export const DEFAULT_TEMPLATE = "classic-elegant";

export function getTemplate(slug: string): TemplateEntry {
  return TEMPLATES[slug] ?? TEMPLATES[DEFAULT_TEMPLATE]!;
}

export const TEMPLATE_OPTIONS = Object.entries(TEMPLATES).map(([slug, t]) => ({
  slug,
  label: t.label,
}));
```

(Only the `import WeddinglyFree ...` line and the `"weddingly-free": {...}` entry are new — everything else in this file is unchanged.)

- [ ] **Step 4: Typecheck, lint, and run the full check suite**

Run: `npx tsc --noEmit`
Expected: no errors anywhere in the project.

Run: `npm run lint`
Expected: no errors.

Run: `npm run check`
Expected: all check scripts pass, including the new `utils.check.ts` from Task 2.

- [ ] **Step 5: Smoke-test in the dev server**

Run: `npm run dev` (leave running)

Open `/admin/wedding-invitations/<any-existing-id>` in a browser, go to the **Main** tab, and confirm the **Template** dropdown now lists "Weddingly Free" alongside "Classic Elegant". Select it (don't save yet) and confirm the live preview panel on the right immediately re-renders with the new dark/photo-led layout, no console errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/wedding/templates/weddingly-free/index.tsx public/weddingly-free/thumbnail.svg src/lib/wedding/template-registry.ts
git commit -m "feat(wedding): wire up Weddingly Free template (index + registry)"
```

---

## Task 13: Manual verification pass

**Files:** none (verification only — fix forward in the relevant task's file if something fails, then re-run this task's checks).

- [ ] **Step 1: Point `rizky-dinda` at the new template**

With the dev server running, open `/admin/wedding-invitations`, find the `rizky-dinda` record, open its editor, go to the **Main** tab, change **Template** to "Weddingly Free", and save.

- [ ] **Step 2: Broken-image acceptance check**

`rizky-dinda`'s seed data points at `/images/hero.png` and `/images/placeholder-*.png`, which do not exist in `public/images/` (confirmed absent). Open `http://localhost:3000/undangan/rizky-dinda` and confirm:
- No broken-image icon anywhere (Cover, Couple portraits, Gallery, Gift QR if any).
- Every photo slot that would have shown `hero.png`/`placeholder-*.png` instead shows the `SafeImage`/`photoBackgroundStyle` gradient placeholder, not a blank box.

- [ ] **Step 3: Guest name personalization**

Open `http://localhost:3000/undangan/rizky-dinda?to=Bapak%20Andi` and confirm "Bapak Andi" appears under "Kepada Yth." on the opening gate.

- [ ] **Step 4: Gate + music behavior (public)**

On the public page (not preview), confirm:
- The full-screen gate with the "Buka Undangan" button is visible before any click, and body scroll is locked (page behind it doesn't scroll).
- Clicking "Buka Undangan" fades the gate away, unlocks scroll, and (if `isMusicEnabled` + `musicUrl` are set) starts audio playback only at that point — not before.

- [ ] **Step 5: Admin preview behavior**

Back in `/admin/wedding-invitations/<rizky-dinda-id>?tab=main`, confirm in the live preview panel:
- No "Buka Undangan" button is shown.
- No fixed/locking overlay — content is visible immediately ("opened" from the start).
- No audio plays automatically.

- [ ] **Step 6: RSVP and guestbook submission**

On the public page, scroll (or snap-swipe on mobile emulation) to the RSVP slide, submit a test RSVP, and confirm the success message appears. Do the same for the guestbook/Ucapan slide. Then in `/admin/wedding-invitations/<rizky-dinda-id>?tab=rsvps` and `?tab=guestbook`, confirm the new entries appear.

- [ ] **Step 7: Responsive check**

Using the browser's device toolbar, check viewports 360×800, 390×844, 430×932, and a desktop width (≥1280px). Confirm at each:
- No horizontal overflow/scrollbar.
- No overlapping text.
- Desktop shows the 2-column split (sticky left photo panel, scrolling right content); mobile shows the single-column full-screen slide flow.

- [ ] **Step 8: classic-elegant regression check**

Open any other invitation still using `classic-elegant` (or switch `rizky-dinda` back temporarily) at `/undangan/<slug>` and confirm it renders exactly as before — unaffected by this work.

- [ ] **Step 9: Build**

Run: `npm run build`
Expected: build succeeds. If it fails for reasons unrelated to this feature (pre-existing issues), note them explicitly rather than silently working around them.

- [ ] **Step 10: Final commit (only if Step 1's template switch on `rizky-dinda` should persist)**

If you want the seed's `rizky-dinda` to keep pointing at `weddingly-free` after this session (so future manual tests don't need to re-select it), that change lives only in the database (via the admin save in Step 1) — `prisma/seed.ts` is intentionally not touched by this plan, so a fresh `npm run db:seed` will reset it back to `classic-elegant`. No git commit is needed for this task; it's verification only.
