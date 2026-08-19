# Project showcase — homepage section, gallery, detail page — design

Date: 2026-08-19

## Goal

Turn the bare-bones `Project` model into a full case-study CMS entry (bilingual
title, tech-stack description, long-form case study, category/role/year/client/
link, cover image, media gallery, featured/archived flags) and expose it in three
places: an expanding-cards showcase on the homepage, a blog-style gallery at
`/projects`, and a full case-study detail page at `/projects/[slug]`.

## Data model

Replace `Project.title` with bilingual title; add case-study and metadata fields;
add featured/archived flags. `images` (existing `Json` array) is kept as-is and
repurposed as the media gallery — image and video URLs mixed, distinguished by
file extension at render time, so no shape change there.

```prisma
model Project {
  id             String   @id @default(cuid())
  title_en       String
  title_id       String
  slug           String   @unique
  description_en String   @db.Text
  description_id String   @db.Text
  caseStudy_en   String   @db.Text
  caseStudy_id   String   @db.Text
  category       String
  role           String
  year           String
  client         String?
  link           String?
  coverImage     String?
  images         Json // mixed image/video URLs; type inferred by extension
  featured       Boolean  @default(false)
  archived       Boolean  @default(false)
  order          Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([order])
}
```

`description_en/id` stays the short pitch + tech-stack blob (plain text,
`whitespace-pre-line` on render — no markdown parser, matches how the user's
pasted copy is just line breaks, not real markdown). `caseStudy_en/id` is the
long-form body, same rendering treatment. `year`/`client`/`role` are plain text,
not typed/validated further (no computed sorting or date logic needs them
structured). `link` is optional — external site URL for the finished project.

Needs a real migration (`npx prisma migrate dev`), not just `db push`, matching
the two existing migrations in `prisma/migrations/`.

## Admin CMS

Ride the existing generic config-driven CRUD
(`src/lib/admin/resources.ts` + `ResourceForm.tsx` + `actions.ts` +
`delegates.ts`) — no new admin page or per-model form.

- Two new `FieldType`s:
  - `"boolean"` — renders a checkbox; `parseFields` reads `form.get(name) === "on"`
    (native checkbox semantics — unchecked boxes are simply absent from
    `FormData`, no hidden-field trick needed).
  - `"gallery"` — renders the multi-file AJAX uploader described below; stored
    value is `Json` string array, same as today's `"list"` type, but populated by
    upload instead of typed URLs.
- Update the `projects` resource `fields` to match the new schema: bilingual
  `title`, `slug`, bilingual `description`, bilingual `caseStudy`, `category`,
  `role`, `year`, `client` (optional text), `link` (optional url), `coverImage`
  (`"image"` type, already exists as a type), `images` (switched from `"list"` to
  `"gallery"`), `featured`/`archived` (`"boolean"`), `order`.
- `ResourceForm.tsx` gains a `GalleryControl`, siblings to the existing
  `ImageControl`: renders current items as a small grid (image `<img>` or
  `<video>` preview picked by extension) each with a "Remove" button, a file
  input that accepts multiple files, uploads each via
  `fetch('/api/admin/upload')` on selection (same AJAX pattern `ImageControl`
  already uses — no page reload, no new library), and appends the returned URLs
  to a hidden `<input type="hidden" name={field.name} value={JSON.stringify(urls)}>`.
  `parseFields`'s `"list"` handling (newline-split) doesn't fit a JSON-array
  hidden input, so `"gallery"` gets its own branch in `parseFields`: parse the
  hidden field's JSON, keep it if it's a string array, else `[]`.
- `/api/admin/upload/route.ts`: add `video/mp4` → `mp4` and `video/webm` → `webm`
  to `ALLOWED_TYPES`; bump `MAX_UPLOAD_BYTES` from 5MB to 20MB (covers short
  case-study clips; still same single local-filesystem write, same
  `ponytail:` caveat already documented in that file from the prior feature).

## Homepage — "Projects" showcase (expanding cards)

The user supplied a ready-made `ExpandingCards` component built against shadcn
conventions (`bg-card`/`border` CSS-var tokens, `cn` from `@/lib/utils`). This
codebase has neither shadcn nor a `cn` helper nor those tokens (confirmed: no
`components.json`, no `src/lib/utils.ts`, palette is the custom
`ink`/`ink-raised`/`graphite`/`ash`/`silver`/`paper` scale in
`src/styles/globals.css`). Adapt, don't paste verbatim:

- Add `src/lib/utils.ts`: a small `cn` — `clsx` only (already a dependency; no
  `tailwind-merge`, nothing here produces conflicting Tailwind classes that need
  merging, matches how `Button.tsx`/`Section.tsx` already do plain
  `clsx(BASE, className)`).
- Install `lucide-react` (the one genuinely new dependency this feature needs).
- Add `src/components/ui/expanding-cards.tsx`: same structure/behavior as the
  supplied component (grid-based expand on hover/click/focus, desktop columns vs
  mobile rows), but card surface restyled to `bg-ink-raised`/`border-graphite/60`
  and text to `text-paper`/`text-silver`/`text-ash` instead of shadcn tokens.
  `CardItem.icon` stays `React.ReactNode` (component doesn't need to know about
  lucide specifically) but every real usage passes the same lucide icon (see
  below) — no per-category icon mapping, that's speculative for a 5-8 item list.
- Wire the unused `linkHref` prop: wrap the title/description block in a
  `next-intl` `Link` (from `@/i18n/navigation`, the locale-aware one every other
  component uses, not raw `next/link`). Add
  `pointer-events-none group-data-[active=true]:pointer-events-auto` to that
  link so an inactive card's invisible (opacity-0) title text can't be tapped by
  accident on mobile before the card has expanded — first tap expands, second
  tap (or hover+click on desktop) navigates.
- New server component `src/components/sections/ProjectShowcase.tsx`: queries
  `prisma.project.findMany({ where: { featured: true, archived: false },
  orderBy: { order: "asc" } })`, maps each row to a `CardItem` (`imgSrc:
  coverImage ?? (images[0] as string) ?? "/images/placeholder-1.jpg"`, `icon:
  <ArrowUpRight size={24} />` fixed for every card, `linkHref:
  /projects/${slug}`, bilingual title/description picked by `locale`). Returns
  `null` when there are zero featured projects (matches `ServiceGrid`'s
  existing empty-state convention).
- Insert `<Section id="projects">` into `src/app/[locale]/page.tsx` between the
  existing `services` section and the closing CTA section, reusing the already
  -translated `projects.eyebrow`/`projects.title` i18n keys as the section
  header (same `eyebrow` treatment as the `mediums`/`services` sections).

## `/projects` — blog-style gallery

Rework `src/app/[locale]/projects/page.tsx` (currently just a bare
`PageHeader`, no data): keep the `PageHeader`, add a new server component
`src/components/sections/ProjectList.tsx` below it — `prisma.project.findMany({
where: { archived: false }, orderBy: { order: "asc" } })`, rendered as a
vertical list of rows (cover thumbnail, category eyebrow, title, description
excerpt, `year · role · client` meta line), each row wrapped in a `Link` to
`/projects/${slug}`. Visually: reuse the bordered-row rhythm already
established by the `mediums` section on the homepage (`border-graphite/50`
divide, not a new grid system) rather than inventing a new card grid — one more
place applying an existing pattern instead of a new one.

## `/projects/[slug]` — detail page (new route)

New `src/app/[locale]/projects/[slug]/page.tsx`:

- `prisma.project.findFirst({ where: { slug, archived: false } })`; `notFound()`
  from `next/navigation` if missing (matches how a 404 is already handled via
  `not-found.tsx` at the `[locale]` level).
- `generateMetadata` via `getTranslations` + the found record's title/description,
  same shape as the existing `projects/page.tsx` metadata function.
- Renders: cover image (fallback to first gallery item, then placeholder), title,
  meta row (category, role, year, client, external `link` if present), the short
  description, the full case-study body (`whitespace-pre-line`), then the media
  gallery — `images` array rendered as a simple grid, each item an `<img>` or
  `<video controls>` picked by extension (`.mp4`/`.webm` → video, else image).
- A "back to projects" link at the top, matching the CTA styling used elsewhere.

## i18n

New keys in both `en.json`/`id.json` under `projects` (parity enforced by
`messages/parity.ts` at typecheck): meta labels (`category`, `role`, `year`,
`client`, `visitSite`, `viewCaseStudy`, `back`). Existing `projects.eyebrow`/
`title`/`lead` are reused as-is for the homepage section header and the
`/projects` `PageHeader`.

## Seed data

`prisma/seed.ts`'s `project.createMany` currently makes 6 generic placeholder
rows against the old schema. Replace with the new schema's shape:

- One real, `featured: true` entry seeded from the Mosh Madness case study copy
  supplied by the user (bilingual title/description/case-study, category "Web
  Design", role "Full Stack Developer", year "2026", client "Muhammad Ilham",
  link to the live Railway URL, cover + gallery pointing at the existing
  `/images/placeholder-*.jpg` files until real assets are uploaded through the
  CMS).
- The remaining rows stay generic placeholders (same `placeholder-N.jpg`
  convention already used by `Website`), updated to the new field set,
  `featured: false`, so the homepage showcase isn't cluttered by filler.

## Out of scope

- Real placeholder image binaries — `public/images/` currently has none beyond
  `.gitkeep` (pre-existing gap, not part of this feature); seed data keeps
  referencing `/images/placeholder-N.jpg` paths the same way `Website` seeding
  already does, to be filled in later either by adding real files or uploading
  through the CMS.
- Per-category icon mapping on the homepage cards — one fixed icon for all cards,
  revisit only if a real design need for differentiated icons shows up.
- Markdown rendering for `caseStudy`/`description` — plain text with preserved
  line breaks, no new parser dependency.
