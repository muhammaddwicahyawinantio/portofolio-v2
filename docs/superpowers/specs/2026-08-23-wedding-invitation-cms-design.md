# Wedding Invitation CMS — Design Spec

**Date:** 2026-08-23
**Status:** Approved (brainstorm complete, awaiting spec review)
**Scope:** MVP digital wedding invitation feature for Dwi Studio, managed from the existing admin CMS, rendered on a public locale-free route.

## 1. Goal

Let an admin create, theme, and publish digital wedding invitations from `/admin`, and serve each one at a public URL `/undangan/[slug]`. Guests open the invitation (optionally personalized via `?to=Nama%20Tamu`), submit RSVP, and leave guestbook messages. The admin reviews RSVPs and moderates the guestbook.

One Dwi Studio app serves many invitations. This is a fixed-template, data-driven system — **not** a drag-and-drop builder.

## 2. Constraints & reuse

Follow the existing codebase; do not refactor unrelated code.

- **Stack:** Next.js 15 (App Router, Turbopack), React 19, Tailwind 4, Prisma + MySQL, NextAuth (v5 beta), `motion`, `next/font/google`.
- **Auth:** admin pages live inside the guarded `admin/(dashboard)` route group and inherit the session guard + sidebar. Every admin server action independently calls the existing `requireAdmin()` pattern (server actions are their own HTTP endpoints).
- **Uploads:** reuse `/api/admin/upload` (writes to `public/uploads/`, returns a URL) and the `ImageControl` / `GalleryControl` / `FileControl` components from `ResourceForm.tsx`.
- **URL validation:** reuse the existing rule — a stored URL must start with `http://`, `https://`, or `/` — to block `javascript:` stored-XSS on public pages.
- **Styling:** admin screens use the studio's editorial tokens (`bg-card`, `border-line`, `font-mono` eyebrows, `rounded-card`, etc.). The public wedding template uses its **own** palette/fonts, fully separate from the studio "Kertas Kalkir" tokens.
- **Language:** wedding content is Indonesian-only and locale-free. Wedding models do **not** use the `_en`/`_id` bilingual suffix pattern that studio models use.

### Not reused

The generic resource system (`RESOURCES[]`, `DELEGATES`, `[resource]/page.tsx`, `saveRecord`/`parseFields`) is flat one-model-per-table CRUD. A wedding is a parent record plus child collections plus a themed public template, so it gets a **dedicated** admin flow and its own `queries.ts` / `actions.ts`. Wedding models are **not** registered in `RESOURCES[]` or `DELEGATES`, so `npm run check` (which validates the generic resource↔schema mapping) is unaffected.

## 3. Routing & middleware

- **Public:** `src/app/undangan/[slug]/page.tsx` with a sibling `src/app/undangan/layout.tsx` that renders its own `<html>/<body>` and loads the curated wedding fonts (the app has no shared root layout — each top-level segment brings its own, exactly like `[locale]` and `admin`).
- **Middleware:** add `undangan` to the next-intl matcher exclusion so it is not locale-prefixed:
  `matcher: ["/((?!api|admin|undangan|_next|_vercel|.*[.].*).*)"]`
- **Admin:** `src/app/admin/(dashboard)/wedding-invitations/` with `page.tsx` (list), `new/page.tsx` (create), and `[id]/page.tsx` (editor).

## 4. Data model (Prisma, MySQL)

Add to `prisma/schema.prisma`, matching existing conventions (`cuid()` ids, `@db.Text` for prose, `updatedAt`, `@@index`). All children cascade-delete with the invitation.

### Enums

```prisma
enum WeddingStatus     { draft published archived }
enum WeddingGiftType   { bank ewallet address qris }
enum WeddingAttendance { attending not_attending maybe }
```

### WeddingInvitation (parent)

- Identity/status: `id`, `title`, `slug @unique`, `status WeddingStatus @default(draft)`, `templateSlug String @default("classic-elegant")`, `publishedAt DateTime?`, `createdAt`, `updatedAt`.
- Couple: `brideName`, `groomName` (required); `brideFullName?`, `groomFullName?`, `brideParents? @db.Text`, `groomParents? @db.Text`, `bridePhoto?`, `groomPhoto?`.
- Content text: `openingText? @db.Text`, `quoteText? @db.Text`, `storyTitle?`, `storyText? @db.Text`, `coverImage?`, `musicUrl?`.
- Theme (string, with sensible classic-elegant defaults so a fresh invitation looks intentional): `primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor`, `fontDisplay`, `fontBody`.
- Toggles: `isMusicEnabled @default(true)`, `isRsvpEnabled @default(true)`, `isGuestbookEnabled @default(true)`.
- Relations: `events`, `gallery`, `gifts`, `guests`, `rsvps`, `messages`.

`fontDisplay` / `fontBody` store a **registry key** (e.g. `"cormorant"`), not a free-text font name — see §7.

### WeddingEvent

`id`, `invitationId`, `title`, `date DateTime`, `startTime String?`, `endTime String?` (times as `"HH:mm"` strings — avoids timezone/time-of-day parsing for MVP), `venueName?`, `venueAddress? @db.Text`, `mapsUrl?`, `description? @db.Text`, `order Int @default(0)`, `createdAt`, `updatedAt`. Index `[invitationId, order]`. Cascade.

### WeddingGallery

`id`, `invitationId`, `imageUrl`, `caption?`, `order`, `createdAt`. Index `[invitationId, order]`. Cascade.

### WeddingGift

`id`, `invitationId`, `type WeddingGiftType`, `providerName?`, `accountNumber?`, `accountName?`, `address? @db.Text`, `qrImage?`, `notes? @db.Text`, `order`, `createdAt`. Index `[invitationId, order]`. Cascade.

### WeddingGuest

Included in the schema now (per review), even though the MVP builds no dedicated Guests tab. Minimal:
`id`, `invitationId`, `name`, `slug`, `phone?`, `groupName?`, `createdAt`. `@@unique([invitationId, slug])`, index `[invitationId]`. Cascade. Relation to `rsvps`.

Foundation for future per-guest personal links. The public page's `?to=Nama%20Tamu` personalization does **not** depend on this table in the MVP — it reads the raw query string.

### WeddingRsvp

`id`, `invitationId`, `guestId String?`, `guestName`, `attendanceStatus WeddingAttendance`, `guestCount Int @default(1)`, `message? @db.Text`, `createdAt`. Invitation relation cascades; guest relation `onDelete: SetNull`. Index `[invitationId, createdAt]`.

### WeddingMessage (guestbook)

`id`, `invitationId`, `guestName`, `message @db.Text`, `isVisible Boolean @default(true)`, `createdAt`. Index `[invitationId, createdAt]`. Cascade.

## 5. Library layer (`src/lib/wedding/`)

- **`queries.ts`** — server reads via `prisma`. `getInvitationBySlug(slug)` (public: only `published`, includes events ordered, gallery ordered, gifts ordered, visible messages). `listInvitations()` and `getInvitationForEdit(id)` (admin: full relations incl. rsvps + all messages).
- **`actions.ts`** — server actions.
  - Admin (call `requireAdmin()`): `saveInvitation`, `deleteInvitation`, `togglePublish`; child CRUD `saveEvent`/`deleteEvent`, `saveGalleryItem`/`deleteGalleryItem`, `saveGift`/`deleteGift`; guestbook moderation `toggleMessageVisible`/`deleteMessage`. On publish, set `publishedAt` and `revalidatePath("/undangan/[slug]")` for that slug.
  - Public (no auth): `submitRsvp`, `submitMessage` — validate the invitation exists, is `published`, and the feature toggle is on; validate + sanitize input (§8); then `revalidatePath` the public slug.
- **`validation.ts`** — shared input rules (slug format, url rule, enum guards, guestCount bounds, text length caps, plain-text sanitize).
- **`template-registry.ts`** — hardcoded `Record<slug, { component, label, thumbnail }>`; default `classic-elegant`. Also the curated font registry (§7). No `WeddingTemplate` DB model.

## 6. Admin editor

Reuses studio admin styling and the shared field controls.

- **List (`/admin/wedding-invitations`):** table with couple, slug, status badge, template, `updatedAt`; row actions **Edit**, **Preview** (opens `/undangan/[slug]` in a new tab), **Copy link**, **Publish/Unpublish** (form → `togglePublish`), **Delete**. "New invitation" button.
- **Create (`/new`):** minimal form — `title`, `slug`, `brideName`, `groomName` — creates a `draft` and redirects to the editor. Slug uniqueness enforced with a friendly error.
- **Editor (`/[id]`):** tabbed via `?tab=` query (server-rendered; no heavy client state, no layout shift). Tabs: **Main · Couple · Events · Gallery · Gifts · Settings · RSVPs · Guestbook**.
  - **Main / Couple / Settings** edit parent fields and submit to `saveInvitation`. Settings holds theme colors (color inputs), font selects, `musicUrl`, and the three feature toggles.
  - **Events / Gallery / Gifts** are child collections: list existing rows + inline add/edit/delete, each scoped to `invitationId`, reusing `ImageControl`/`GalleryControl` for media.
  - **RSVPs** is a read-only list of submissions (name, attendance, count, message, date).
  - **Guestbook** lists all messages with hide/show (`toggleMessageVisible`) and delete.
- **Sidebar:** add a "Weddings" section to `Sidebar.tsx` NAV (lucide `Heart`), href `/admin/wedding-invitations`. Adjust `sectionForPath` so any `/admin/wedding-invitations*` sub-route highlights the section (match `s.href !== "/admin" && pathname.startsWith(s.href)`), so the editor pages keep the rail lit.

## 7. Public template `classic-elegant`

`src/components/wedding/templates/classic-elegant/index.tsx` + `sections/*`; shared bits in `components/wedding/shared/`. `template-registry.ts` maps `templateSlug` → component, defaulting to `classic-elegant`.

**Sections (mobile-first):**
1. **Cover** — full-viewport; cover image or soft gradient fallback; "The Wedding Of", couple names (display serif), date, guest name from `?to=`, "Buka Undangan" button. Content is locked behind an overlay until the button is pressed.
2. **Couple** — photos, names, full names, parents, short quote.
3. **Countdown** — days/hours/minutes/seconds to the first event (client component; SSR-safe).
4. **Events** — a card per event (date, time, venue, address) with an "Open Maps" button (`mapsUrl`).
5. **Love Story** — single narrative from CMS.
6. **Gallery** — responsive grid (2-col mobile, elegant grid desktop).
7. **Gift** — bank/e-wallet/address/QRIS list with copy-to-clipboard for account numbers.
8. **RSVP** — name, attendance (attending/not/maybe), guest count, message → `submitRsvp`; success state. Hidden if `isRsvpEnabled` is off.
9. **Guestbook** — message form → `submitMessage`, plus the list of `isVisible` messages. Hidden if `isGuestbookEnabled` is off.
10. **Closing** — thank-you, couple names, small "Created by Dwi Studio".

**Theming:** the template root wrapper gets per-invitation colors as inline CSS custom properties (`--w-primary`, `--w-accent`, `--w-bg`, …); sections consume them via Tailwind arbitrary-value utilities (`bg-[var(--w-bg)]`). Fonts: a small curated registry (~3 display serifs + ~2 body sans, e.g. Cormorant Garamond / Playfair Display / Cinzel paired with Jost / Lato) loaded via `next/font/google` in `undangan/layout.tsx`, each exposed as a CSS variable; `fontDisplay`/`fontBody` keys select which variable the template uses. Colors and fonts both fall back to classic-elegant defaults if unset.

**Music:** optional background audio (`musicUrl`), started by the "Buka Undangan" gesture to satisfy autoplay policy; gated by `isMusicEnabled`.

**Motion:** light `motion` fade/slide on scroll-in; respect `prefers-reduced-motion`; avoid layout shift; large touch targets. No Three.js.

## 8. Validation & security

- Slug: unique (DB constraint) + format check (lowercase, `a-z0-9-`); friendly error on collision.
- Public route: `notFound()` if the invitation is missing or not `published`.
- RSVP: required `guestName` (trimmed, length cap), `attendanceStatus` must be a valid enum, `guestCount` coerced to an int within bounds (e.g. 1–20), optional `message` length-capped.
- Guestbook: required `guestName` + `message`, both trimmed and length-capped.
- **Sanitize:** all guest-submitted and admin-entered rich text is stored and rendered as **plain text only** — no free HTML (React escaping + no `dangerouslySetInnerHTML`).
- `mapsUrl` / `musicUrl` / image URLs validated with the existing http(s)/`/` rule.
- No credentials/env in output. Seed uses dummy account numbers only.

**Deferred (MVP):** rate limiting on public submissions (the project has no rate-limit helper yet — noted as a `ponytail:` follow-up).

## 9. Seed

Extend `prisma/seed.ts` following its existing idempotent pattern with one published invitation:

- slug `rizky-dinda`, template `classic-elegant`, status `published`.
- Bride Dinda, Groom Rizky; full names, parents, opening + quote + love story.
- Events: **Akad Nikah** and **Resepsi** (dates, times, venue, `mapsUrl`).
- Gallery: a few placeholders (existing public assets or gradient fallback).
- Gift: one dummy bank entry (fake account number).
- Messages: 2–3 visible guestbook entries.

## 10. Implementation phases

1. **Data foundation** — Prisma models + enums, migrate/push, `template-registry.ts` (+ font registry), `queries.ts`, `validation.ts`, and seed.
2. **Public `classic-elegant` template** — `undangan/layout.tsx`, `undangan/[slug]/page.tsx`, middleware exclusion, and all template sections rendering seed data (read-only; RSVP/guestbook forms render but wire up in Phase 5).
3. **Admin list + create + parent editor** — list page, `/new`, and the Main/Couple/Settings tabs with `saveInvitation`/`togglePublish`/`deleteInvitation`; Sidebar entry.
4. **Child collection editors** — Events, Gallery, Gifts tabs with their CRUD actions.
5. **RSVP + Guestbook** — public `submitRsvp`/`submitMessage` actions wired to the template forms, plus the admin RSVPs and Guestbook (moderation) tabs.

## 11. Acceptance criteria

- Admin can create/edit an invitation from the CMS; it persists via Prisma.
- `/undangan/[slug]` renders from the database; non-published slugs 404 for the public.
- `classic-elegant` renders cleanly on mobile and desktop.
- `?to=` guest name appears on the cover.
- RSVP submissions persist and appear in the admin RSVPs tab.
- Guestbook messages persist; visible ones appear on the public page; admin can hide/delete.
- `npm run typecheck`, `npm run lint`, and `npm run check` pass (or pre-existing failures are called out as unrelated).
- No credentials printed.

## 12. Out of scope (future)

Drag-and-drop builder; multi-tenant client login; payment gateway; WhatsApp blast; QR check-in; custom-domain automation; external upload storage; heavy Three.js backgrounds; a dedicated Guests-management tab (model exists; UI deferred); per-guest personal links; a `WeddingTemplate` DB table + additional templates; rate limiting.
