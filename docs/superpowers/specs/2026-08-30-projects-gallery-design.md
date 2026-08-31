# Projects Gallery — Design Spec

**Goal:** Add a new "Projects Gallery" section directly below the Hero on the homepage, using an Argent Loop-style vertical infinite slider adapted from https://21st.dev/@hardikkashiyani123456788/components/argent-loop-infinite-slider, reading live data from the existing `Project` CMS (Prisma) — no new schema, no new admin UI, no dummy content.

## Context

- Homepage (`src/app/[locale]/page.tsx`) already renders `Hero` then a `homepage-paper` wrapper containing `Section#features`, `Section#projects` (an existing, unrelated `ExpandingCards`-based "Work" panel inside `HorizontalScroll`), `Section#benefits`, `Section#services`, and `ReadyPanel`.
- `Project` Prisma model (`prisma/schema.prisma`) already has everything needed: `title_en/id`, `slug`, `description_en/id`, `category`, `year`, `coverImage`, `images` (Json array), `featured`, `archived`, `order`. No migration needed.
- Admin CMS (`src/lib/admin/resources.ts`, key `"projects"`) already exposes every field used here. Not touched.
- `/projects/[slug]` detail route (`src/app/[locale]/projects/[slug]/page.tsx` → `ProjectDetail.tsx`, exporting `getProject(slug)`) already exists and is the navigation target. Not touched.
- Design tokens: "Kertas Kalkir" rev. B (`src/styles/globals.css`) — `ink` (text), `charcoal`/`charcoal-soft` (solid dark objects), `gold`/`sand-deep`/`gold-ink` (decorative accent / non-text / small-text accent), `line` (8%-opacity hairline), `cream`/`cream-deep` (paper backgrounds). Homepage sections force a white background (`.homepage-paper`). No new tokens.
- Existing reusable primitives: `Container`, `Section`, `Reveal` (scroll fade-in), `Button` (pill CTA, `variant="charcoal"` for solid dark-on-light, `variant="cream"` for light-on-photo, already used by `Hero`), `Link`/`useRouter` from `@/i18n/navigation` (locale-aware), `toStringArray`/`isVideoUrl` from `@/lib/media`.
- `Lenis` is mounted once at the root via `SmoothScroll.tsx` (`ReactLenis root`). No second Lenis instance may be created.
- Live DB check (2026-08-30): only 5 non-archived `Project` rows exist, all "(Concept)" placeholders with `featured: true`; none reference `public/projects/*.png` (those 3 files — `moshmadness.png`, `kspps.png`, `kopinearme.png` — aren't linked to any row yet). Per user decision, this is a content gap the user will fill via Admin → Projects after this ships; the component must not fabricate data and must fall back gracefully when `coverImage`/`images` are empty.

## Architecture

Two new files, one edited file.

### 1. `src/components/ui/argent-loop-infinite-slider.tsx` (new, `"use client"`)

Generic, presentation-only primitive — no Prisma import, no i18n.

```ts
export interface GalleryProject {
  slug: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image: string; // always a usable URL; caller resolves the fallback chain
}

interface ArgentLoopInfiniteSliderProps {
  projects: GalleryProject[];
  exploreLabel: string;
  openHintLabel: string; // desktop-only caption, reuses existing i18n key
}
```

- **State:** `activeIndex: number` is the *only* React state. Everything else (drag progress, lerp position, wheel accumulator, pointer start coordinates) lives in refs.
- **rAF loop:** one `requestAnimationFrame` loop lerps a ref-held `currentProgress` toward a ref-held `targetProgress` (`current += (target - current) * factor`) every frame, then imperatively writes `transform`/`opacity` to each slide's DOM node via a `refs` array — never touches React state per frame. The loop starts on mount and on interaction, stops (via `cancelAnimationFrame`) once `currentProgress` is within an epsilon of `targetProgress`, restarting on the next interaction.
- **Virtual looping:** no DOM duplication. Index math uses circular helpers — `wrap(i, n) = ((i % n) + n) % n` and a shortest-signed-circular-delta function so moving from the last project to the first advances forward, not backward. Only render all `n` slides (project counts here are small; no virtualization needed) and position each via its circular delta from `activeIndex`.
- **Snapping:** on interaction end (wheel threshold crossed, drag released past threshold, minimap/dot clicked, arrow key pressed, double-click momentum), set `targetProgress` to the new integer index. The rAF loop lerps to it. Once settled, commit `setActiveIndex` (single state update, drives the metadata panel re-render).
- **Wheel:** `onWheel` handler on the container only (not `window`), passive (no `preventDefault`), accumulates `deltaY` in a ref; once the accumulator crosses a threshold, advance/retreat `targetProgress` by 1 and reset the accumulator. Page scroll is never blocked.
- **Touch/swipe:** `onTouchStart/Move/End` on the image stage tracks `deltaX`/`deltaY`. Only once `|deltaX| > |deltaY|` (horizontal intent) does the handler treat the gesture as a slide-swipe and call `preventDefault` on that specific touchmove; otherwise it does nothing and the browser's native vertical page scroll proceeds untouched. Swipe past a distance threshold on touchend commits the next/prev index.
- **Desktop drag:** `onPointerDown/Move/Up` on the image stage mirrors the horizontal-swipe gesture (mouse drag left/right) — safe to `preventDefault` freely since mouse drag never conflicts with wheel-based page scroll.
- **Keyboard:** container is focusable (`tabIndex={0}`); `ArrowLeft`/`ArrowUp` = prev, `ArrowRight`/`ArrowDown` = next.
- **Minimap:** desktop/tablet (`md:` and up) — a vertical hairline tick-rail (`border-line`) with one tick per project, current tick filled `charcoal`, click-to-jump. Mobile (`< md`) — replaced with a compact `0{n} / 0{total}` counter plus a small dot strip (per the user's explicit mobile allowance).
- **Parallax:** while lerping, a secondary transform (image scaled slightly, offset by a fraction of the progress delta) is applied purely via the same rAF-driven refs, no extra state.
- **Navigation:**
  - Desktop-only: `onDoubleClick` on the main image → `router.push(`/projects/${active.slug}`)` via `useRouter` from `@/i18n/navigation` (locale-aware).
  - Always (primary on mobile): an "Explore Project" `Button` (`variant="charcoal"`) linking to `/projects/${active.slug}`.
  - `openHintLabel` (desktop only, `hidden md:block`) reuses the existing, currently-unused i18n string `projects.openHint`.
- **Reduced motion:** `prefers-reduced-motion` check (matching `Reveal`'s convention) disables the lerp loop — index changes snap instantly, content is never hidden.
- **Responsive layout:** mobile gets a distinct stacked layout (dominant image, metadata below with category+year on one row, full-width-friendly button, compact minimap) — not a shrunk desktop grid. No horizontal overflow: slider stage is `overflow-hidden`, width constrained to its container.

### 2. `src/components/sections/ProjectsGallery.tsx` (new, server component)

```ts
import "server-only";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { toStringArray, isVideoUrl } from "@/lib/media";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { ArgentLoopInfiniteSlider, type GalleryProject } from "@/components/ui/argent-loop-infinite-slider";

export default async function ProjectsGallery({ locale }: { locale: string }) {
  const [rows, t] = await Promise.all([
    prisma.project.findMany({ where: { featured: true, archived: false }, orderBy: { order: "asc" } }),
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
        <h2 className="font-rampart-one font-display mb-10 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] font-medium tracking-[-0.01em]">
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

(Exact JSX/markup for heading may be adjusted slightly during implementation to match spacing conventions elsewhere; field mapping and data flow above are fixed.)

Filter is `featured && !archived` — same convention `ProjectShowcase` already uses for its homepage panel. Known consequence: until the user diversifies which rows are `featured`, this section will show the same 5 rows as the existing "Work" panel further down the page. Not a defect.

### 3. `src/app/[locale]/page.tsx` (edit)

Add `import ProjectsGallery from "@/components/sections/ProjectsGallery";` and insert `<ProjectsGallery locale={locale} />` as the **first** child inside the existing `<div className="homepage-paper relative z-10">` wrapper, before `<Section id="features">`. Nothing else in this file changes. `Hero` is untouched.

### 4. i18n

One new key pair, added to both `src/i18n/messages/en.json` and `id.json` under the existing `"projects"` namespace (parity required — `messages/parity.ts` enforces this at typecheck):

- `exploreProject`: en `"Explore Project"`, id `"Jelajahi Proyek"`.

`projects.openHint` and `projects.eyebrow`/`projects.title` already exist and are reused as-is (no edits).

## Safety / non-goals

- No Prisma schema change, no new migration, no admin resource/field changes, no server action changes.
- No writes to Project rows / no seed changes — the 5-concept-row / missing-image state is a known, accepted starting point (user's call, see Context).
- `Hero`, `ProjectList`, `ProjectDetail`, `ExpandingCards`-based "Work" panel: untouched.
- No new npm dependency — the rAF/lerp/drag logic is hand-rolled per the user's explicit requirement to avoid a state update every frame; `Button`/`Container`/`Section`/`Reveal`/`Link`/`useRouter`/`toStringArray`/`isVideoUrl` are all reused as-is.
- No global `window` event listeners; no `preventDefault` on wheel, ever; touchmove only calls `preventDefault` once horizontal intent is confirmed. Page scroll (Hero → Gallery → next section) and Lenis remain fully functional.

## Verification

- `npm run lint`, `npm run build` (per user's explicit ask) — both must be clean.
- Manual check in the dev server: homepage renders the new section under Hero; wheel/scroll over the gallery still scrolls the page; desktop double-click on the image opens `/projects/[slug]`; mobile viewport (375/390/430) shows the compact layout, no horizontal overflow, "Explore Project" is tappable; empty-`Project`-table case renders nothing (verified by temporarily reasoning about the `rows.length === 0` guard, matching the existing `ProjectShowcase`/`ProjectList` convention — not by actually truncating the live table).
