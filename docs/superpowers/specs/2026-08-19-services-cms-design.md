# Services / Layanan section — design

Date: 2026-08-19

## Goal

A new bilingual "Services" (`services`/`layanan`) feature: a homepage section plus a
standalone route, both rendering pricing packages that are fully editable — text,
price, features, benefits, and a photo — from the existing admin CMS at `/admin`.
This is the first feature where the public site actually reads from the database;
every other CMS-backed model today (e.g. `FooterContent`) is wired in the admin but
never consumed on the frontend.

## Route & i18n

- New page `src/app/[locale]/services/page.tsx`, following the `about/page.tsx`
  pattern (`generateMetadata` via `getTranslations`, body via `useTranslations` +
  `use(params)` + `setRequestLocale`).
- With the existing `localePrefix: "as-needed"` config this yields `/services` (EN)
  and `/id/services` (ID) — matching `/about` / `/id/about`. A literal `/layanan`
  slug would require a `next-intl` `pathnames` map that doesn't exist yet; skipped
  as unnecessary complexity unless explicitly requested.
- Add "Services" / "Layanan" to the static `NAV` array in `src/lib/nav.ts` (the
  `NavigationItem` DB model exists but nothing reads it yet — not touching that gap,
  out of scope for this feature).
- New `services` namespace in `src/i18n/messages/en.json` and `id.json` for page
  chrome (eyebrow, heading, lead, price prefix, CTA labels) — must keep both files
  in parity (`messages/parity.ts` enforces this at typecheck).

## Data model

Extend the existing `Service` Prisma model (not a new model) — it already has
`name_en/id`, `description_en/id`, `icon`, `order`:

```prisma
model Service {
  id             String @id @default(cuid())
  name_en        String
  name_id        String
  description_en String @db.Text
  description_id String @db.Text
  icon           String
  priceLabel     String
  features_en    Json
  features_id    Json
  benefits_en    Json
  benefits_id    Json
  image          String?
  order          Int    @default(0)

  @@index([order])
}
```

`priceLabel` is a single field (not bilingual) — it's a currency range, identical
in both languages. `features`/`benefits` are JSON string arrays, same convention as
`Project.images`. `image` is nullable; the public UI shows a placeholder graphic
when empty.

## Admin CMS

Ride the existing generic config-driven CRUD (`src/lib/admin/resources.ts` +
`ResourceForm.tsx` + `actions.ts` + `delegates.ts`) — no new admin page.

- Extend the `services` resource's `fields` with `priceLabel` (text), bilingual
  `features`/`benefits` (list type), and `image` (new field type).
- Add `"image"` to the `FieldType` union. In `parseFields`, it behaves like `"url"`
  (plain optional string column) — the type only changes how `ResourceForm` renders
  the control.
- New field type `image` in `ResourceForm.tsx`: a file input that uploads
  immediately on selection, shows a thumbnail preview, and writes the returned URL
  into a hidden text input (`name={field.name}`) so the surrounding form/action
  code is unchanged.
- New route `src/app/api/admin/upload/route.ts`: `POST`, calls the same
  `auth()` check pattern as `actions.ts`'s `requireAdmin`, reads
  `request.formData()` (native — no new dependency), validates `image/*` MIME and a
  5MB size cap, writes to `public/uploads/<crypto.randomUUID()>.<ext>`, returns
  `{ url: "/uploads/<file>" }`.
  - `ponytail:` local filesystem storage — won't survive a serverless/multi-instance
    deploy (e.g. Vercel's ephemeral FS). Confirmed acceptable: this project targets
    a host with persistent disk. Upgrade path if that changes: swap the route's
    write step for a cloud blob provider; the field/API contract (`{ url }`) doesn't
    need to change.

## Public rendering

One shared server component, `src/components/sections/ServiceGrid.tsx` (+ a
`ServiceCard`), reading `prisma.service.findMany({ orderBy: { order: "asc" } })`
and picking the `_en`/`_id` fields by locale. Visually adapted from the reference
`blogs.tsx` component (image, badge, title, arrow-hover "read more" link) but
restyled into the project's existing monochrome ink/paper/graphite Tailwind tokens
— no shadcn or lucide-react in this codebase; the arrow becomes a small inline SVG,
matching the hand-rolled `components/ui` convention.

Used in two places:
- Homepage `src/app/[locale]/page.tsx`: new `<Section id="services">` inserted
  between the existing "mediums" index section and the closing CTA section.
- `/services` page: same grid under a `PageHeader`, with features/benefits shown in
  full (not truncated, unlike a possible abbreviated homepage variant — with only 5
  packages total, both places show everything, no truncation needed).

## Seed data

`prisma/seed.ts`'s `service.createMany` currently seeds 4 generic placeholder rows
(`Web Development`, `Brand Identity`, `Motion Design`, `3D & WebGL`) that are never
rendered anywhere in the current codebase. Replace them (delete existing rows, then
create) with the 5 real packages, translated to EN/ID pairs:

1. 💍 Wedding Invitation / Undangan Pernikahan — Rp300.000–Rp1.000.000
2. 🚀 Landing Page — Rp1.500.000–Rp4.000.000
3. 🏢 Company Profile / E-Commerce — Rp4.000.000–Rp12.000.000+
4. 🎓 ERP / E-Learning System — Rp15.000.000–Rp50.000.000+
5. ⚙️ Custom Web App / System — Rp10.000.000–Rp100.000.000+

Each with a short description, its feature list, and benefit list per the pricing
table supplied by the user.

## Out of scope

- `/layanan` as a distinct URL slug (see i18n note above).
- Migrating `NavigationItem`/`FooterContent` to actually drive the frontend — unrelated
  pre-existing gap, not touched by this feature.
- Cloud image storage — local filesystem confirmed sufficient for current hosting.
