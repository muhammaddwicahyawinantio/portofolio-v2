# Weddingly Free Template — Design Spec

**Date:** 2026-08-31
**Status:** Approved (brainstorm complete, awaiting spec review)
**Scope:** A second wedding invitation template (`weddingly-free`), added alongside the existing `classic-elegant`, sharing all data/backend/CMS. Design inspiration only from `petershaan12/Weddingly-Free` — no code, assets, or backend copied.

## 1. Goal

Add `Weddingly Free` as a selectable template in the existing wedding CMS: cinematic, dark photo-led, full-screen slide feel on mobile, a 2-column split on desktop. Fully wired through the existing `WeddingPreviewData` / `TemplateProps` contract — no new routes, no new API, no schema migration, no changes to `classic-elegant` or to admin/auth/upload.

## 2. Constraints & reuse

- Registered like any other template: one entry in `TEMPLATES` (`template-registry.ts`); `WeddingTemplateRenderer` and `TEMPLATE_OPTIONS` need no changes.
- Reuses, unchanged: `WeddingMotionProvider`, `SectionMotion`, `parseAnimationSettings`/`SECTION_KEYS`, `submitRsvp`/`submitMessage`/`ATTENDANCE`, `CopyButton`, `weddingFontVars` / `displayFontVar`/`bodyFontVar`, GSAP/Lenis wrappers (`ParallaxLayer`, `HorizontalScrollSection` if reused), `--w-primary/secondary/accent/bg` and `--w-font-display/body` CSS variables.
- No new dependencies. No `mongodb`/`mongoose`, no `react-intersection-observer`, no `react-type-animation`, no `@next/font`.
- `animationSettings` is one JSON blob per **invitation**, not per-template — adding new `SECTION_KEYS` would leak into classic-elegant's admin Animations tab too. So this template does **not** add new section keys; it reuses the existing 10 and hardcodes a plain CSS entrance for the two slides that don't map to any (`OpeningGate`, `QuoteSlide`).

## 3. File layout

```
src/components/wedding/templates/weddingly-free/
  index.tsx
  utils.ts                     # photoBackgroundStyle() helper only
  sections/
    OpeningGate.tsx    CoverSlide.tsx     QuoteSlide.tsx     CoupleSlide.tsx
    StorySlide.tsx     EventsSlide.tsx    CountdownSlide.tsx GallerySlide.tsx
    GiftSlide.tsx      RsvpSlide.tsx      GuestbookSlide.tsx ClosingSlide.tsx

src/components/wedding/shared/SafeImage.tsx   # new, cross-template location (alongside Section/Eyebrow/CopyButton)
public/weddingly-free/thumbnail.svg           # new, generated (no external asset fetch)
```

Registry addition in `template-registry.ts`:
```ts
"weddingly-free": {
  label: "Weddingly Free",
  thumbnail: "/weddingly-free/thumbnail.svg",
  component: WeddinglyFree,
},
```

## 4. Broken-image safety (the point raised after initial review)

The existing seed (`rizky-dinda`) has dead local paths (`/images/hero.png`, `/images/placeholder-*.png`) that are **not** touched by this task. Every image surface in this template must degrade to a premium-looking placeholder, never a blank/broken `<img>`.

**`<img>` tags → `SafeImage`** (`src/components/wedding/shared/SafeImage.tsx`, new, client component):
- Props: `src: string | null | undefined`, `alt`, `className`, optional `placeholderClassName`.
- If `src` is falsy, or its `onError` fires, renders a `div` styled with a gradient built from `--w-secondary`/`--w-primary` (never a bare empty box) instead of the `<img>`.
- Used by every weddingly-free section that shows a photo (couple portraits, gallery grid, cover/desktop-panel photo). `classic-elegant` is untouched — it keeps its existing raw `<img>` tags, per "don't touch it."

**CSS `background-image` (cover slide, opening gate, desktop sticky panel) → `photoBackgroundStyle()`** (`weddingly-free/utils.ts`):
- Always returns a `backgroundColor: "var(--w-bg)"` plus a **layered** `backgroundImage`: a mood gradient (built from `--w-primary/secondary/accent`, darker than the existing `w-ambient-bg` wash so photo text stays legible) with the photo URL appended as the top layer **only when a URL is supplied**.
- Per the CSS spec, one failed layer in a multi-layer `background-image` doesn't affect the other layers — so if the photo 404s, the gradient underneath still paints. Combined with the explicit `backgroundColor`, there is no code path that renders a blank background.
- One helper, three call sites (`OpeningGate`, `CoverSlide`, `index.tsx`'s desktop panel) — this is what justifies `utils.ts` existing at all. (Countdown's day/hour/min/sec diff and each section's one-line date formatting stay inline; they're used once each, not worth extracting.)

**Gallery fallback chain** (`GallerySlide.tsx`): `invitation.gallery` → else synthesize `[coverImage, bridePhoto, groomPhoto].filter(Boolean)` → each rendered through `SafeImage`, so even a synthesized broken path still lands on the gradient placeholder, never a broken image. If the list is empty after both steps, the section renders its own gradient panel instead of an empty grid.

## 5. Layout

- **Mobile** (default): each slide `min-h-dvh`, scroll container `scroll-snap-type: y proximity` (not `mandatory` — never fights a focused RSVP/guestbook input or a tall Events/Gallery list), each slide `scroll-snap-align: start`.
- **Desktop (`lg:`+)**: 2-column grid. Left: `sticky top-0 h-dvh` panel showing the cover photo via `photoBackgroundStyle()` (static — doesn't swap per section in view; keeps this a CSS-only feature, no IntersectionObserver sync). Right: normal in-flow stack of all slides, scrolls independently by virtue of the sticky left column.
- `OpeningGate` is a fixed full-viewport overlay (public mode only) above both columns; not part of the 2-col grid.

## 6. Section-by-section

| Slide | Data | Notes |
|---|---|---|
| `OpeningGate` | `groomName`/`brideName`, `events[0].date`, `guestName`, `musicUrl`+`isMusicEnabled` | Self-contained `opened` state + `<audio>` + body-scroll-lock, same pattern as classic-elegant's `Cover.tsx`. **Public**: fixed overlay, "Buka Undangan" button, music plays only on click. **Preview**: renders inline (no fixed overlay, no scroll-lock, no autoplay, no button) — starts opened, exactly like classic-elegant's preview branch. |
| `CoverSlide` | `coverImage`/gallery fallback, couple names, first event date | Normal scroll-revealed section, `SectionMotion preset={anim.sections.cover}`. |
| `QuoteSlide` | `quoteText`, fallback *"Dua hati, satu janji, selamanya."* | `SectionMotion preset="fade-up"` (hardcoded, no admin key). |
| `CoupleSlide` | bride/groom name, full name, parents, photos via `SafeImage` | `SectionMotion preset={anim.sections.couple}`; reuses `ParallaxLayer` for `portrait-parallax` like classic-elegant. |
| `StorySlide` | `storyTitle`/`storyText` | Skipped entirely (returns `null`, not rendered) if `storyText` empty. `anim.sections.story`. |
| `EventsSlide` | `invitation.events` | Date/time/venue/address, Maps button if `mapsUrl`. `anim.sections.events`. |
| `CountdownSlide` | `events[0]?.date` | d/h/m/s, inline diff logic (same technique as classic-elegant). `anim.sections.countdown`. |
| `GallerySlide` | `invitation.gallery` → cover/bride/groom fallback → gradient panel | All photos through `SafeImage`. `anim.sections.gallery`; reuses `HorizontalScrollSection` when preset is `horizontal-scroll`. |
| `GiftSlide` | `invitation.gifts` | Same fields/`CopyButton` as classic-elegant's `Gift.tsx`, restyled. `anim.sections.gift`. Skipped if empty. |
| `RsvpSlide` | `isRsvpEnabled`, `submitRsvp` | Same server action/validation as classic-elegant's `Rsvp.tsx`, restyled markup only. Rendered only if `isRsvpEnabled`. |
| `GuestbookSlide` | `isGuestbookEnabled`, `submitMessage`, `invitation.messages` | Same as classic-elegant's `Guestbook.tsx`, restyled. Rendered only if `isGuestbookEnabled`. |
| `ClosingSlide` | couple names | Thank-you + "Created by DwiStudio". `anim.sections.closing`. |

## 7. Not doing (explicit scope cuts)

- No dynamic desktop photo-swap-per-section (static sticky panel only) — real complexity for a "boleh" (optional) request.
- No Weddingly-Free demo photos/audio copied in — no reliable binary-asset fetch here, and it would risk becoming exactly the broken-fallback problem this spec is defending against. `thumbnail.svg` is generated, not fetched.
- `prisma/seed.ts` untouched. Testing `weddingly-free` happens by switching `rizky-dinda`'s template in the existing admin UI (already supported today, zero seed changes needed) — which is also how the two new acceptance criteria below get exercised (that record still has the seed's broken image paths, on purpose).

## 8. Acceptance criteria

All from the original brief, plus:
- With `rizky-dinda`'s existing (broken) `/images/hero.png` and `/images/placeholder-*.png` data, the template renders zero broken `<img>` and no visibly blank background — every photo slot falls back to the gradient placeholder.
- Admin preview never shows the gate button and never locks body scroll; the public route always shows the gate and only plays music after the click.
- `classic-elegant` unaffected; `npm run typecheck` / `lint` / `check` (and `build` if feasible) pass.
