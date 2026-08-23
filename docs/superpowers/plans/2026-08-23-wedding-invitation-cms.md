# Wedding Invitation CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin create/theme/publish digital wedding invitations from `/admin`, served publicly at `/undangan/[slug]` with RSVP + guestbook.

**Architecture:** A dedicated admin flow (`/admin/wedding-invitations`) edits a parent `WeddingInvitation` plus child collections (events, gallery, gifts) and reviews RSVPs/guestbook — it does **not** use the generic `RESOURCES[]`/`DELEGATES` system. The public route is a top-level, locale-free segment rendering a fixed, data-driven `classic-elegant` template themed per-invitation via CSS custom properties. Server components read through `src/lib/wedding/queries.ts`; all mutations are server actions in `src/lib/wedding/actions.ts`.

**Tech Stack:** Next.js 15 (App Router, Turbopack), React 19, Tailwind 4, Prisma + MySQL, NextAuth v5, `motion`, `next/font/google`, lucide-react.

## Global Constraints

- **No new test framework.** Verification uses `npm run typecheck`, `npm run lint`, the assert-based `*.check.ts` pattern run via `tsx` (see `src/lib/admin/resources.check.ts`), and manual dev-server checks. Do not add jest/vitest/playwright.
- **Prisma client import:** `import { prisma } from "@/lib/prisma";` (server-only files). Seed uses `new PrismaClient()` directly (see `prisma/seed.ts`).
- **Auth guard:** every admin server action begins with `await requireAdmin()` (mirrors `src/lib/admin/actions.ts`). Layout guard alone is insufficient — actions are their own HTTP endpoints.
- **Uploads:** reuse `POST /api/admin/upload` and the `ImageControl`/`GalleryControl` components from `src/components/admin/ResourceForm.tsx`. Never build a second uploader.
- **URL safety:** any admin-entered URL rendered publicly must pass `isSafeUrl` (`^(https?:\/\/|\/)`), blocking `javascript:` stored XSS.
- **Plain text only:** no `dangerouslySetInnerHTML` anywhere in wedding code. All guest/admin text renders through normal JSX (React-escaped).
- **Wedding content is Indonesian, locale-free.** Wedding models do NOT use `_en`/`_id` suffixes.
- **DB:** local dev uses `npm run db:push` (no formal migrations in this repo).
- **Commit** after each task with the shown message. Work stays on `master` (per user decision); `git add` only the files the task touched.
- **Studio admin styling:** reuse tokens `bg-card`, `border-line`, `rounded-card`, `shadow-card`, `text-ink`/`text-ink-soft`, `font-mono` eyebrows, the `INPUT` class string, and the `bg-ink text-cream` pill button. The public template uses its OWN palette (CSS vars), never studio tokens.

---

## Phase 1 — Data foundation

### Task 1: Prisma schema — enums + models

**Files:**
- Modify: `prisma/schema.prisma` (append at end)

**Interfaces:**
- Produces: Prisma models `WeddingInvitation`, `WeddingEvent`, `WeddingGallery`, `WeddingGift`, `WeddingGuest`, `WeddingRsvp`, `WeddingMessage`; enums `WeddingStatus`, `WeddingGiftType`, `WeddingAttendance`. Prisma client accessors: `prisma.weddingInvitation`, `.weddingEvent`, `.weddingGallery`, `.weddingGift`, `.weddingGuest`, `.weddingRsvp`, `.weddingMessage`.

- [ ] **Step 1: Append the schema**

Append to `prisma/schema.prisma`:

```prisma
enum WeddingStatus {
  draft
  published
  archived
}

enum WeddingGiftType {
  bank
  ewallet
  address
  qris
}

enum WeddingAttendance {
  attending
  not_attending
  maybe
}

model WeddingInvitation {
  id           String        @id @default(cuid())
  title        String
  slug         String        @unique
  status       WeddingStatus @default(draft)
  templateSlug String        @default("classic-elegant")

  brideName     String
  groomName     String
  brideFullName String?
  groomFullName String?
  brideParents  String? @db.Text
  groomParents  String? @db.Text
  bridePhoto    String?
  groomPhoto    String?

  openingText String? @db.Text
  quoteText   String? @db.Text
  storyTitle  String?
  storyText   String? @db.Text
  coverImage  String?
  musicUrl    String?

  primaryColor    String @default("#5A6B4E")
  secondaryColor  String @default("#B98A7A")
  accentColor     String @default("#C9A15A")
  backgroundColor String @default("#F7F3EC")
  fontDisplay     String @default("cormorant")
  fontBody        String @default("jost")

  isMusicEnabled     Boolean @default(true)
  isRsvpEnabled      Boolean @default(true)
  isGuestbookEnabled Boolean @default(true)

  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  events   WeddingEvent[]
  gallery  WeddingGallery[]
  gifts    WeddingGift[]
  guests   WeddingGuest[]
  rsvps    WeddingRsvp[]
  messages WeddingMessage[]

  @@index([status])
}

model WeddingEvent {
  id           String   @id @default(cuid())
  invitationId String
  title        String
  date         DateTime
  startTime    String?
  endTime      String?
  venueName    String?
  venueAddress String?  @db.Text
  mapsUrl      String?
  description  String?  @db.Text
  order        Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  invitation WeddingInvitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)

  @@index([invitationId, order])
}

model WeddingGallery {
  id           String   @id @default(cuid())
  invitationId String
  imageUrl     String
  caption      String?
  order        Int      @default(0)
  createdAt    DateTime @default(now())

  invitation WeddingInvitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)

  @@index([invitationId, order])
}

model WeddingGift {
  id            String          @id @default(cuid())
  invitationId  String
  type          WeddingGiftType
  providerName  String?
  accountNumber String?
  accountName   String?
  address       String?         @db.Text
  qrImage       String?
  notes         String?         @db.Text
  order         Int             @default(0)
  createdAt     DateTime        @default(now())

  invitation WeddingInvitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)

  @@index([invitationId, order])
}

model WeddingGuest {
  id           String   @id @default(cuid())
  invitationId String
  name         String
  slug         String
  phone        String?
  groupName    String?
  createdAt    DateTime @default(now())

  invitation WeddingInvitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  rsvps      WeddingRsvp[]

  @@unique([invitationId, slug])
  @@index([invitationId])
}

model WeddingRsvp {
  id               String            @id @default(cuid())
  invitationId     String
  guestId          String?
  guestName        String
  attendanceStatus WeddingAttendance
  guestCount       Int               @default(1)
  message          String?           @db.Text
  createdAt        DateTime          @default(now())

  invitation WeddingInvitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  guest      WeddingGuest?     @relation(fields: [guestId], references: [id], onDelete: SetNull)

  @@index([invitationId, createdAt])
}

model WeddingMessage {
  id           String   @id @default(cuid())
  invitationId String
  guestName    String
  message      String   @db.Text
  isVisible    Boolean  @default(true)
  createdAt    DateTime @default(now())

  invitation WeddingInvitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)

  @@index([invitationId, createdAt])
}
```

- [ ] **Step 2: Validate + format**

Run: `npx prisma validate && npx prisma format`
Expected: "The schema at prisma/schema.prisma is valid" and no diff errors.

- [ ] **Step 3: Push to the dev database + regenerate client**

Run: `npm run db:push`
Expected: tables created, "Your database is now in sync with your Prisma schema" and the client regenerates.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors (the new `prisma.wedding*` accessors now exist).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(wedding): add invitation + child Prisma models"
```

---

### Task 2: Validation module + runnable check

**Files:**
- Create: `src/lib/wedding/validation.ts`
- Create: `src/lib/wedding/validation.check.ts`
- Modify: `package.json` (the `check` script)

**Interfaces:**
- Produces: `ATTENDANCE`, `GIFT_TYPES`, `WEDDING_STATUSES` (readonly tuples) + their value types `Attendance`, `GiftType`, `WeddingStatusValue`; `isValidSlug(s): boolean`; `isSafeUrl(s): boolean`; `cleanText(v: unknown, maxLen: number): string`; `parseRsvp(input): { ok: true; value: RsvpInput } | { ok: false; error: string }`; `parseMessage(input): { ok: true; value: MessageInput } | { ok: false; error: string }`. Types `RsvpInput = { guestName: string; attendanceStatus: Attendance; guestCount: number; message: string | null }`, `MessageInput = { guestName: string; message: string }`.
- This module must import nothing Node- or server-only (it is imported by client form components AND by the tsx check).

- [ ] **Step 1: Write the module**

Create `src/lib/wedding/validation.ts`:

```ts
// Shared input rules for wedding public submissions and admin saves.
// No server-only / node imports: imported by client forms and by the tsx check.

export const ATTENDANCE = ["attending", "not_attending", "maybe"] as const;
export type Attendance = (typeof ATTENDANCE)[number];

export const GIFT_TYPES = ["bank", "ewallet", "address", "qris"] as const;
export type GiftType = (typeof GIFT_TYPES)[number];

export const WEDDING_STATUSES = ["draft", "published", "archived"] as const;
export type WeddingStatusValue = (typeof WEDDING_STATUSES)[number];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export function isSafeUrl(value: string): boolean {
  return /^(https?:\/\/|\/)/.test(value);
}

/** Trim then hard-cap length. Non-strings become "". */
export function cleanText(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

export type RsvpInput = {
  guestName: string;
  attendanceStatus: Attendance;
  guestCount: number;
  message: string | null;
};

export function parseRsvp(input: {
  guestName: unknown;
  attendanceStatus: unknown;
  guestCount: unknown;
  message: unknown;
}): { ok: true; value: RsvpInput } | { ok: false; error: string } {
  const guestName = cleanText(input.guestName, 100);
  if (!guestName) return { ok: false, error: "Nama wajib diisi." };

  const status = String(input.attendanceStatus ?? "");
  if (!ATTENDANCE.includes(status as Attendance)) {
    return { ok: false, error: "Status kehadiran tidak valid." };
  }

  const n = Number(input.guestCount);
  const guestCount = Number.isFinite(n) ? Math.min(20, Math.max(1, Math.trunc(n))) : 1;

  const message = cleanText(input.message, 500) || null;

  return {
    ok: true,
    value: { guestName, attendanceStatus: status as Attendance, guestCount, message },
  };
}

export type MessageInput = { guestName: string; message: string };

export function parseMessage(input: {
  guestName: unknown;
  message: unknown;
}): { ok: true; value: MessageInput } | { ok: false; error: string } {
  const guestName = cleanText(input.guestName, 100);
  const message = cleanText(input.message, 500);
  if (!guestName) return { ok: false, error: "Nama wajib diisi." };
  if (!message) return { ok: false, error: "Ucapan wajib diisi." };
  return { ok: true, value: { guestName, message } };
}
```

- [ ] **Step 2: Write the check (this is the failing test)**

Create `src/lib/wedding/validation.check.ts`:

```ts
/**
 * Cek validasi input undangan. Sengaja tanpa framework tes; gagal keras.
 * Jalankan: npm run check
 */
import assert from "node:assert/strict";
import { isValidSlug, isSafeUrl, cleanText, parseRsvp, parseMessage } from "./validation";

// Slug
assert.ok(isValidSlug("rizky-dinda"), "slug normal valid");
assert.ok(!isValidSlug("Rizky Dinda"), "spasi & kapital ditolak");
assert.ok(!isValidSlug("-lead"), "tanda hubung di tepi ditolak");

// URL
assert.ok(isSafeUrl("https://maps.google.com"), "https valid");
assert.ok(isSafeUrl("/uploads/a.jpg"), "path relatif valid");
assert.ok(!isSafeUrl("javascript:alert(1)"), "skema javascript ditolak");

// cleanText
assert.equal(cleanText("  hi  ", 10), "hi", "trim");
assert.equal(cleanText("x".repeat(20), 5), "xxxxx", "cap panjang");
assert.equal(cleanText(123, 5), "", "non-string jadi ''");

// RSVP
const okR = parseRsvp({ guestName: " Andi ", attendanceStatus: "attending", guestCount: "3", message: "" });
assert.ok(okR.ok && okR.value.guestName === "Andi" && okR.value.guestCount === 3 && okR.value.message === null);
const badStatus = parseRsvp({ guestName: "A", attendanceStatus: "yes", guestCount: "1", message: "" });
assert.ok(!badStatus.ok, "status di luar enum ditolak");
const clamp = parseRsvp({ guestName: "A", attendanceStatus: "maybe", guestCount: "999", message: "" });
assert.ok(clamp.ok && clamp.value.guestCount === 20, "guestCount di-clamp ke 20");
const noName = parseRsvp({ guestName: "  ", attendanceStatus: "attending", guestCount: "1", message: "" });
assert.ok(!noName.ok, "nama kosong ditolak");

// Guestbook
const okM = parseMessage({ guestName: "Budi", message: "Selamat!" });
assert.ok(okM.ok && okM.value.message === "Selamat!");
assert.ok(!parseMessage({ guestName: "", message: "hi" }).ok, "nama wajib");
assert.ok(!parseMessage({ guestName: "Budi", message: "  " }).ok, "ucapan wajib");

console.log("wedding validation: semua cek lolos");
```

- [ ] **Step 3: Wire it into `npm run check`**

In `package.json`, change the `check` script to append the wedding check:

```json
"check": "tsx src/lib/admin/resources.check.ts && tsx src/lib/admin/upload.check.ts && tsx src/lib/wedding/validation.check.ts",
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `npm run check`
Expected: ends with `wedding validation: semua cek lolos` and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/wedding/validation.ts src/lib/wedding/validation.check.ts package.json
git commit -m "feat(wedding): input validation module + runnable check"
```

---

### Task 3: Query layer

**Files:**
- Create: `src/lib/wedding/queries.ts`

**Interfaces:**
- Produces: `listInvitations()`, `getInvitationForEdit(id: string)`, `getPublishedInvitation(slug: string)`; exported types `PublicInvitation`, `EditInvitation`, `InvitationListItem`.

- [ ] **Step 1: Write the queries**

Create `src/lib/wedding/queries.ts`:

```ts
import "server-only";
import { prisma } from "@/lib/prisma";

export function listInvitations() {
  return prisma.weddingInvitation.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      templateSlug: true,
      brideName: true,
      groomName: true,
      updatedAt: true,
    },
  });
}

export function getInvitationForEdit(id: string) {
  return prisma.weddingInvitation.findUnique({
    where: { id },
    include: {
      events: { orderBy: { order: "asc" } },
      gallery: { orderBy: { order: "asc" } },
      gifts: { orderBy: { order: "asc" } },
      rsvps: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "desc" } },
    },
  });
}

export function getPublishedInvitation(slug: string) {
  return prisma.weddingInvitation.findFirst({
    where: { slug, status: "published" },
    include: {
      events: { orderBy: { order: "asc" } },
      gallery: { orderBy: { order: "asc" } },
      gifts: { orderBy: { order: "asc" } },
      messages: { where: { isVisible: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export type InvitationListItem = Awaited<ReturnType<typeof listInvitations>>[number];
export type EditInvitation = NonNullable<Awaited<ReturnType<typeof getInvitationForEdit>>>;
export type PublicInvitation = NonNullable<Awaited<ReturnType<typeof getPublishedInvitation>>>;
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/wedding/queries.ts
git commit -m "feat(wedding): query layer for admin + public reads"
```

---

### Task 4: Seed one published invitation

**Files:**
- Modify: `prisma/seed.ts` (add a block before the final `console.log("Seed selesai ✓")`)

**Interfaces:**
- Consumes: `prisma.weddingInvitation`, nested `create` for `events`, `gallery`, `gifts`, `messages`.
- Produces: a published invitation at slug `rizky-dinda`.

- [ ] **Step 1: Add the seed block**

In `prisma/seed.ts`, immediately before `console.log("Seed selesai ✓");`, insert:

```ts
  // Undangan contoh. deleteMany dulu supaya seed idempoten; nomor rekening palsu.
  await prisma.weddingInvitation.deleteMany({ where: { slug: "rizky-dinda" } });
  await prisma.weddingInvitation.create({
    data: {
      title: "Rizky & Dinda",
      slug: "rizky-dinda",
      status: "published",
      templateSlug: "classic-elegant",
      brideName: "Dinda",
      groomName: "Rizky",
      brideFullName: "Dinda Ayu Lestari",
      groomFullName: "Rizky Pratama",
      brideParents: "Putri dari Bapak Sutrisno & Ibu Wahyuni",
      groomParents: "Putra dari Bapak Hendra & Ibu Kartika",
      bridePhoto: "/images/hero.jpg",
      groomPhoto: "/images/hero.jpg",
      openingText:
        "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.",
      quoteText:
        "“Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.”",
      storyTitle: "Cerita Kami",
      storyText:
        "Berawal dari satu kelas kuliah di tahun 2019, pertemanan kami tumbuh perlahan menjadi sesuatu yang lebih dalam. Setelah lima tahun melewati suka dan duka bersama, kami memutuskan untuk melangkah ke jenjang yang lebih serius.",
      coverImage: "/images/hero.jpg",
      publishedAt: new Date(),
      events: {
        create: [
          {
            title: "Akad Nikah",
            date: new Date("2026-11-08T02:00:00.000Z"),
            startTime: "09:00",
            endTime: "10:30",
            venueName: "Masjid Raya Sabilal Muhtadin",
            venueAddress: "Jl. Jend. Sudirman No.1, Banjarmasin",
            mapsUrl: "https://maps.google.com/?q=Masjid+Raya+Sabilal+Muhtadin",
            order: 0,
          },
          {
            title: "Resepsi",
            date: new Date("2026-11-08T05:00:00.000Z"),
            startTime: "12:00",
            endTime: "15:00",
            venueName: "Ballroom Hotel Rattan Inn",
            venueAddress: "Jl. A. Yani KM 5, Banjarmasin",
            mapsUrl: "https://maps.google.com/?q=Hotel+Rattan+Inn+Banjarmasin",
            order: 1,
          },
        ],
      },
      gallery: {
        create: Array.from({ length: 4 }, (_, i) => ({
          imageUrl: `/images/placeholder-${(i % 3) + 1}.jpg`,
          caption: `Momen ${i + 1}`,
          order: i,
        })),
      },
      gifts: {
        create: [
          {
            type: "bank",
            providerName: "Bank Central Asia",
            accountNumber: "1234567890",
            accountName: "Dinda Ayu Lestari",
            notes: "Amplop digital sebagai tanda kasih.",
            order: 0,
          },
        ],
      },
      messages: {
        create: [
          { guestName: "Keluarga Santoso", message: "Selamat menempuh hidup baru! Barakallah.", isVisible: true },
          { guestName: "Rani & Doni", message: "Semoga menjadi keluarga sakinah, mawaddah, warahmah.", isVisible: true },
          { guestName: "Teman Kampus", message: "Akhirnya! Selamat ya kalian berdua ❤️", isVisible: true },
        ],
      },
    },
  });

```

- [ ] **Step 2: Run the seed**

Run: `npm run db:seed`
Expected: ends with `Seed selesai ✓`, no errors.

- [ ] **Step 3: Verify the row exists**

Run: `npx prisma studio` (open `WeddingInvitation`, confirm `rizky-dinda` with 2 events, 4 gallery, 1 gift, 3 messages) — or query in a scratch tsx. Confirm then close.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(wedding): seed sample rizky-dinda invitation"
```

---

## Phase 2 — Public classic-elegant template

### Task 5: Font registry, `/undangan` layout, middleware exclusion, route shell

**Files:**
- Create: `src/lib/wedding/fonts.ts`
- Create: `src/app/undangan/layout.tsx`
- Create: `src/app/undangan/[slug]/page.tsx` (temporary shell; the real template lands in Task 6)
- Modify: `src/middleware.ts`

**Interfaces:**
- Produces: `DISPLAY_FONTS`, `BODY_FONTS` (readonly arrays of `{ key, label, var }`), `displayFontVar(key): string`, `bodyFontVar(key): string`. The `/undangan/[slug]` route reads `params.slug` + `searchParams.to`.

- [ ] **Step 1: Font data (client-safe, no next/font import)**

Create `src/lib/wedding/fonts.ts`:

```ts
// Curated font choices for wedding templates. Keys are stored on the invitation;
// the CSS variables here are defined by next/font in src/app/undangan/layout.tsx.
// Plain data only (no next/font import) so client components can read it too.

export const DISPLAY_FONTS = [
  { key: "cormorant", label: "Cormorant Garamond", var: "--wf-cormorant" },
  { key: "playfair", label: "Playfair Display", var: "--wf-playfair" },
  { key: "cinzel", label: "Cinzel", var: "--wf-cinzel" },
] as const;

export const BODY_FONTS = [
  { key: "jost", label: "Jost", var: "--wf-jost" },
  { key: "lato", label: "Lato", var: "--wf-lato" },
] as const;

export function displayFontVar(key: string): string {
  return (DISPLAY_FONTS.find((f) => f.key === key) ?? DISPLAY_FONTS[0]).var;
}

export function bodyFontVar(key: string): string {
  return (BODY_FONTS.find((f) => f.key === key) ?? BODY_FONTS[0]).var;
}
```

- [ ] **Step 2: The `/undangan` root layout (own html/body + fonts)**

Create `src/app/undangan/layout.tsx`:

```tsx
import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Playfair_Display,
  Cinzel,
  Jost,
  Lato,
} from "next/font/google";
import "@/styles/globals.css";

// Curated wedding fonts. Each exposes a CSS variable consumed by the template
// via --w-font-display / --w-font-body (see fonts.ts + template root).
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--wf-cormorant", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--wf-playfair", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--wf-cinzel", display: "swap" });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--wf-jost", display: "swap" });
const lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700"], variable: "--wf-lato", display: "swap" });

export const metadata: Metadata = {
  title: "Undangan Pernikahan",
  robots: { index: false, follow: false },
};

export default function UndanganLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${cormorant.variable} ${playfair.variable} ${cinzel.variable} ${jost.variable} ${lato.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Temporary route shell**

Create `src/app/undangan/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getPublishedInvitation } from "@/lib/wedding/queries";
import { cleanText } from "@/lib/wedding/validation";

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;
  const invitation = await getPublishedInvitation(slug);
  if (!invitation) notFound();

  const guestName = to ? cleanText(to, 100) || null : null;

  // Replaced by the template render in Task 6.
  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <p>{invitation.brideName} &amp; {invitation.groomName}</p>
      <p>Guest: {guestName ?? "(none)"}</p>
      <p>Events: {invitation.events.length} · Gallery: {invitation.gallery.length}</p>
    </main>
  );
}
```

- [ ] **Step 4: Exclude `/undangan` from the i18n middleware**

In `src/middleware.ts`, change the matcher to add `undangan` to the exclusion group:

```ts
export const config = {
  matcher: ["/((?!api|admin|undangan|_next|_vercel|.*[.].*).*)"],
};
```

- [ ] **Step 5: Verify routing**

Run: `npm run dev`, then check:
- `http://localhost:3000/undangan/rizky-dinda` → renders "Dinda & Rizky", Events: 2, Gallery: 4 (no locale redirect).
- `http://localhost:3000/undangan/rizky-dinda?to=Bapak%20Andi` → Guest: Bapak Andi.
- `http://localhost:3000/undangan/nope` → 404.
- `http://localhost:3000/` → still redirects to `/en` or `/id` (i18n untouched).

- [ ] **Step 6: Typecheck + lint + commit**

Run: `npm run typecheck && npm run lint`
Expected: pass.

```bash
git add src/lib/wedding/fonts.ts src/app/undangan/layout.tsx src/app/undangan/[slug]/page.tsx src/middleware.ts
git commit -m "feat(wedding): public /undangan route, fonts, middleware exclusion"
```

---

### Task 6: Template registry + classic-elegant theming shell

**Files:**
- Create: `src/lib/wedding/template-registry.ts`
- Create: `src/components/wedding/templates/classic-elegant/index.tsx`
- Create: `src/components/wedding/shared/Section.tsx`
- Modify: `src/app/undangan/[slug]/page.tsx` (render the template)

**Interfaces:**
- Produces: `TemplateProps = { invitation: PublicInvitation; guestName: string | null }`; `TEMPLATES` (record), `DEFAULT_TEMPLATE`, `getTemplate(slug): { label; thumbnail; component }`, `TEMPLATE_OPTIONS: { slug; label }[]`; shared `<Section>` wrapper; default-exported `ClassicElegant` component.
- Consumes: `PublicInvitation` (Task 3), `displayFontVar`/`bodyFontVar` (Task 5). Section child components are stubbed here and filled in Tasks 7–8.

- [ ] **Step 1: Shared Section wrapper**

Create `src/components/wedding/shared/Section.tsx`:

```tsx
import type { ReactNode } from "react";

// Vertical rhythm + centered column shared by every template section.
export default function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-6 py-16 sm:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Template registry**

Create `src/lib/wedding/template-registry.ts`:

```ts
import type { ComponentType } from "react";
import type { PublicInvitation } from "@/lib/wedding/queries";
import ClassicElegant from "@/components/wedding/templates/classic-elegant";

export type TemplateProps = { invitation: PublicInvitation; guestName: string | null };

type TemplateEntry = { label: string; thumbnail: string; component: ComponentType<TemplateProps> };

export const TEMPLATES: Record<string, TemplateEntry> = {
  "classic-elegant": {
    label: "Classic Elegant",
    thumbnail: "/images/placeholder-1.jpg",
    component: ClassicElegant,
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

- [ ] **Step 3: Classic-elegant root with per-invitation theming**

Create `src/components/wedding/templates/classic-elegant/index.tsx`. Section children are simple placeholders now; Tasks 7–8 replace each import + element:

```tsx
import type { CSSProperties } from "react";
import type { TemplateProps } from "@/lib/wedding/template-registry";
import { displayFontVar, bodyFontVar } from "@/lib/wedding/fonts";
import Section from "@/components/wedding/shared/Section";

export default function ClassicElegant({ invitation, guestName }: TemplateProps) {
  const style = {
    "--w-primary": invitation.primaryColor,
    "--w-secondary": invitation.secondaryColor,
    "--w-accent": invitation.accentColor,
    "--w-bg": invitation.backgroundColor,
    "--w-font-display": `var(${displayFontVar(invitation.fontDisplay)})`,
    "--w-font-body": `var(${bodyFontVar(invitation.fontBody)})`,
  } as CSSProperties;

  return (
    <main
      style={style}
      className="min-h-screen bg-[var(--w-bg)] font-[family-name:var(--w-font-body)] text-[#2E2A26] antialiased"
    >
      {/* Placeholders — replaced in Tasks 7–8. */}
      <Section className="text-center">
        <p className="font-[family-name:var(--w-font-display)] text-4xl text-[var(--w-primary)]">
          {invitation.brideName} &amp; {invitation.groomName}
        </p>
        <p className="mt-2 text-sm">{guestName ? `Kepada: ${guestName}` : "The Wedding Of"}</p>
      </Section>
    </main>
  );
}
```

- [ ] **Step 4: Render the template from the route**

Replace the body of `src/app/undangan/[slug]/page.tsx` (keep the imports for `notFound`, `getPublishedInvitation`, `cleanText`; add the registry import). The return becomes:

```tsx
import { getTemplate } from "@/lib/wedding/template-registry";
// ...inside the component, after computing guestName:
  const Template = getTemplate(invitation.templateSlug).component;
  return <Template invitation={invitation} guestName={guestName} />;
```

Also add `generateMetadata`:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inv = await getPublishedInvitation(slug);
  if (!inv) return { title: "Undangan" };
  return { title: `${inv.brideName} & ${inv.groomName} — Undangan Pernikahan` };
}
```

- [ ] **Step 5: Verify theming**

Run: `npm run dev`, open `/undangan/rizky-dinda`. Expected: ivory background (`#F7F3EC`), couple names in a serif (Cormorant) olive (`#5A6B4E`) color. With `?to=Bapak%20Andi`, "Kepada: Bapak Andi".

- [ ] **Step 6: Typecheck + lint + commit**

Run: `npm run typecheck && npm run lint`

```bash
git add src/lib/wedding/template-registry.ts src/components/wedding/templates/classic-elegant/index.tsx src/components/wedding/shared/Section.tsx "src/app/undangan/[slug]/page.tsx"
git commit -m "feat(wedding): template registry + classic-elegant theming shell"
```

---

### Task 7: Presentational sections (Couple, Events, Love Story, Gallery, Closing)

**Files:**
- Create: `src/components/wedding/templates/classic-elegant/sections/Couple.tsx`
- Create: `.../sections/Events.tsx`
- Create: `.../sections/LoveStory.tsx`
- Create: `.../sections/Gallery.tsx`
- Create: `.../sections/Closing.tsx`
- Create: `src/components/wedding/shared/Eyebrow.tsx`
- Modify: `.../classic-elegant/index.tsx` (compose these)

**Interfaces:**
- Consumes: `PublicInvitation` and its `events`/`gallery` arrays (typed via `PublicInvitation["events"]` etc.).
- Produces: server components `Couple({ invitation })`, `Events({ events })`, `LoveStory({ title, text })`, `Gallery({ items })`, `Closing({ invitation })`, and `Eyebrow({ children })`.
- All are server components (no client hooks). Media uses `<img>` with the same eslint-disable comment used in `ResourceForm.tsx`. Colors use the `var(--w-*)` custom properties from the root.

- [ ] **Step 1: Eyebrow helper**

Create `src/components/wedding/shared/Eyebrow.tsx`:

```tsx
export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-center text-[11px] tracking-[0.28em] text-[var(--w-accent)] uppercase">
      {children}
    </p>
  );
}
```

- [ ] **Step 2: Couple**

Create `.../sections/Couple.tsx`. Renders bride + groom photos (circular), display-font names, full names, parents, and the quote. Accepts `{ invitation }`. Layout: two stacked cards on mobile, side-by-side (`sm:grid-cols-2`) on desktop, an "&" divider between. Quote in italic display font, centered, below.

```tsx
import type { PublicInvitation } from "@/lib/wedding/queries";
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

function Person({ name, fullName, parents, photo }: { name: string; fullName: string | null; parents: string | null; photo: string | null }) {
  return (
    <div className="text-center">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- local public/ URLs only
        <img src={photo} alt={name} className="mx-auto mb-4 h-40 w-40 rounded-full object-cover ring-1 ring-[var(--w-accent)]/40" />
      ) : (
        <div className="mx-auto mb-4 h-40 w-40 rounded-full bg-[var(--w-secondary)]/20" />
      )}
      <h3 className="font-[family-name:var(--w-font-display)] text-3xl text-[var(--w-primary)]">{name}</h3>
      {fullName ? <p className="mt-1 text-sm">{fullName}</p> : null}
      {parents ? <p className="mt-2 text-xs leading-relaxed opacity-70">{parents}</p> : null}
    </div>
  );
}

export default function Couple({ invitation }: { invitation: PublicInvitation }) {
  return (
    <Section>
      <Eyebrow>The Bride &amp; Groom</Eyebrow>
      {invitation.openingText ? (
        <p className="mb-10 text-center text-sm leading-relaxed opacity-80">{invitation.openingText}</p>
      ) : null}
      <div className="grid items-start gap-10 sm:grid-cols-2">
        <Person name={invitation.brideName} fullName={invitation.brideFullName} parents={invitation.brideParents} photo={invitation.bridePhoto} />
        <Person name={invitation.groomName} fullName={invitation.groomFullName} parents={invitation.groomParents} photo={invitation.groomPhoto} />
      </div>
      {invitation.quoteText ? (
        <p className="mt-12 text-center font-[family-name:var(--w-font-display)] text-lg italic leading-relaxed text-[var(--w-primary)]">
          {invitation.quoteText}
        </p>
      ) : null}
    </Section>
  );
}
```

- [ ] **Step 3: Events**

Create `.../sections/Events.tsx`. One card per event: title (display font), formatted date (Indonesian, `toLocaleDateString("id-ID", { weekday, day, month, year })` — build a `Date` from `event.date`), time range (`startTime`–`endTime` if present), venue name + address, and an "Buka Google Maps" link button (only if `mapsUrl` is set; `target="_blank" rel="noreferrer"`). Accepts `{ events }` typed `PublicInvitation["events"]`.

```tsx
import type { PublicInvitation } from "@/lib/wedding/queries";
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function Events({ events }: { events: PublicInvitation["events"] }) {
  if (events.length === 0) return null;
  return (
    <Section>
      <Eyebrow>Wedding Events</Eyebrow>
      <div className="flex flex-col gap-6">
        {events.map((e) => (
          <div key={e.id} className="rounded-2xl border border-[var(--w-accent)]/30 bg-white/40 p-6 text-center">
            <h3 className="font-[family-name:var(--w-font-display)] text-2xl text-[var(--w-primary)]">{e.title}</h3>
            <p className="mt-2 text-sm">{formatDate(e.date)}</p>
            {e.startTime ? <p className="text-sm opacity-80">{e.startTime}{e.endTime ? ` – ${e.endTime}` : ""} WITA</p> : null}
            {e.venueName ? <p className="mt-3 font-medium">{e.venueName}</p> : null}
            {e.venueAddress ? <p className="text-xs leading-relaxed opacity-70">{e.venueAddress}</p> : null}
            {e.mapsUrl ? (
              <a href={e.mapsUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-full bg-[var(--w-primary)] px-5 py-2 text-xs tracking-[0.15em] text-white uppercase">
                Buka Google Maps
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: LoveStory**

Create `.../sections/LoveStory.tsx`. Accepts `{ title, text }`. Renders eyebrow "Our Story", display-font title, and `text` with `whitespace-pre-line` so CMS line breaks survive.

```tsx
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

export default function LoveStory({ title, text }: { title: string | null; text: string }) {
  return (
    <Section>
      <Eyebrow>Our Story</Eyebrow>
      {title ? (
        <h2 className="mb-6 text-center font-[family-name:var(--w-font-display)] text-3xl text-[var(--w-primary)]">{title}</h2>
      ) : null}
      <p className="text-center text-sm leading-relaxed whitespace-pre-line opacity-85">{text}</p>
    </Section>
  );
}
```

- [ ] **Step 5: Gallery**

Create `.../sections/Gallery.tsx`. Accepts `{ items }` typed `PublicInvitation["gallery"]`. 2-col grid on mobile, 3-col on `sm`, square `object-cover` images, small caption under each (optional). Use the `<img>` eslint-disable comment.

```tsx
import type { PublicInvitation } from "@/lib/wedding/queries";
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

export default function Gallery({ items }: { items: PublicInvitation["gallery"] }) {
  if (items.length === 0) return null;
  return (
    <Section>
      <Eyebrow>Gallery</Eyebrow>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((g) => (
          <figure key={g.id}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local public/ URLs only */}
            <img src={g.imageUrl} alt={g.caption ?? ""} className="aspect-square w-full rounded-lg object-cover" />
            {g.caption ? <figcaption className="mt-1 text-center text-[11px] opacity-60">{g.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 6: Closing**

Create `.../sections/Closing.tsx`. Accepts `{ invitation }`. Centered thank-you line, couple names in display font, and a small "Created by Dwi Studio" credit.

```tsx
import type { PublicInvitation } from "@/lib/wedding/queries";
import Section from "@/components/wedding/shared/Section";

export default function Closing({ invitation }: { invitation: PublicInvitation }) {
  return (
    <Section className="text-center">
      <p className="text-sm leading-relaxed opacity-80">
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
      </p>
      <p className="mt-8 font-[family-name:var(--w-font-display)] text-4xl text-[var(--w-primary)]">
        {invitation.brideName} &amp; {invitation.groomName}
      </p>
      <p className="mt-10 text-[11px] tracking-[0.2em] uppercase opacity-50">Created by Dwi Studio</p>
    </Section>
  );
}
```

- [ ] **Step 7: Compose in the template root**

In `.../classic-elegant/index.tsx`, import the five sections and replace the placeholder `<Section>` with the composed body (Cover + Countdown + RSVP + Guestbook come in later tasks — leave those out for now):

```tsx
import Couple from "./sections/Couple";
import Events from "./sections/Events";
import LoveStory from "./sections/LoveStory";
import Gallery from "./sections/Gallery";
import Closing from "./sections/Closing";
// ...inside <main>:
      <Couple invitation={invitation} />
      <Events events={invitation.events} />
      {invitation.storyText ? <LoveStory title={invitation.storyTitle} text={invitation.storyText} /> : null}
      <Gallery items={invitation.gallery} />
      <Closing invitation={invitation} />
```

Remove the temporary placeholder `<Section>` block and the now-unused `guestName` display (Cover will use `guestName` in Task 8 — keep the prop).

- [ ] **Step 8: Verify + commit**

Run: `npm run dev`, open `/undangan/rizky-dinda`. Expected: couple, 2 event cards with maps buttons, love story, 4-image gallery, closing. Check mobile viewport (DevTools ~390px) — no horizontal scroll.
Run: `npm run typecheck && npm run lint`

```bash
git add src/components/wedding
git commit -m "feat(wedding): classic-elegant presentational sections"
```

---

### Task 8: Interactive sections (Cover gate + music, Countdown, Gift copy)

**Files:**
- Create: `.../sections/Cover.tsx` (client)
- Create: `.../sections/Countdown.tsx` (client)
- Create: `.../sections/Gift.tsx` (server)
- Create: `src/components/wedding/shared/CopyButton.tsx` (client)
- Modify: `.../classic-elegant/index.tsx`

**Interfaces:**
- Produces: `Cover({ invitation, guestName })` (client) — full-screen locked overlay with "Buka Undangan" that unlocks scroll and starts music; `Countdown({ date })` (client) — days/hours/minutes/seconds to `date`; `Gift({ gifts })` (server); `CopyButton({ value })` (client).
- Consumes: `PublicInvitation` + `guestName`. `Cover` locks `document.body` scroll until opened; when opened and `invitation.isMusicEnabled` and `invitation.musicUrl`, calls `audio.play()`.

- [ ] **Step 1: CopyButton**

Create `src/components/wedding/shared/CopyButton.tsx`:

```tsx
"use client";
import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
      className="rounded-full border border-[var(--w-accent)]/50 px-4 py-1.5 text-[11px] tracking-[0.15em] text-[var(--w-primary)] uppercase"
    >
      {copied ? "Tersalin ✓" : "Salin"}
    </button>
  );
}
```

- [ ] **Step 2: Gift (server) using CopyButton**

Create `.../sections/Gift.tsx`. One card per gift. For `bank`/`ewallet`: show `providerName`, `accountName`, `accountNumber` + a `CopyButton value={accountNumber}`. For `address`: show `address`. For `qris`: show the `qrImage`. Always show `notes` if present. Accepts `{ gifts }` typed `PublicInvitation["gifts"]`.

```tsx
import type { PublicInvitation } from "@/lib/wedding/queries";
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";
import CopyButton from "@/components/wedding/shared/CopyButton";

export default function Gift({ gifts }: { gifts: PublicInvitation["gifts"] }) {
  if (gifts.length === 0) return null;
  return (
    <Section>
      <Eyebrow>Wedding Gift</Eyebrow>
      <p className="mb-8 text-center text-sm leading-relaxed opacity-80">
        Doa restu Anda merupakan karunia yang sangat berarti. Jika memberi lebih, Anda dapat mengirim tanda kasih melalui:
      </p>
      <div className="flex flex-col gap-4">
        {gifts.map((g) => (
          <div key={g.id} className="rounded-2xl border border-[var(--w-accent)]/30 bg-white/40 p-6 text-center">
            {g.providerName ? <p className="font-medium text-[var(--w-primary)]">{g.providerName}</p> : null}
            {g.accountNumber ? (
              <>
                <p className="mt-2 font-[family-name:var(--w-font-display)] text-2xl tracking-wider">{g.accountNumber}</p>
                {g.accountName ? <p className="text-xs opacity-70">a.n. {g.accountName}</p> : null}
                <div className="mt-3 flex justify-center"><CopyButton value={g.accountNumber} /></div>
              </>
            ) : null}
            {g.address ? <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{g.address}</p> : null}
            {g.qrImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- local public/ URLs only
              <img src={g.qrImage} alt="QRIS" className="mx-auto mt-3 h-48 w-48 object-contain" />
            ) : null}
            {g.notes ? <p className="mt-3 text-xs opacity-60">{g.notes}</p> : null}
          </div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Countdown (client, hydration-safe)**

Create `.../sections/Countdown.tsx`. Renders 0/0/0/0 on first paint, then ticks via `useEffect`+`setInterval` after mount (avoids SSR/client mismatch). Accepts `{ date: string | Date | null }`; returns `null` if no date.

```tsx
"use client";
import { useEffect, useState } from "react";
import Section from "@/components/wedding/shared/Section";
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

export default function Countdown({ date }: { date: string | Date | null }) {
  const target = date ? new Date(date).getTime() : null;
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (target === null) return;
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (target === null) return null;

  const cells: [number, string][] = [[t.d, "Hari"], [t.h, "Jam"], [t.m, "Menit"], [t.s, "Detik"]];
  return (
    <Section className="text-center">
      <Eyebrow>Counting Down</Eyebrow>
      <div className="flex justify-center gap-3">
        {cells.map(([n, label]) => (
          <div key={label} className="min-w-16 rounded-xl border border-[var(--w-accent)]/30 bg-white/40 px-3 py-4">
            <div className="font-[family-name:var(--w-font-display)] text-3xl text-[var(--w-primary)]">{n}</div>
            <div className="mt-1 text-[10px] tracking-[0.15em] uppercase opacity-60">{label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Cover (client) with gate + music + `?to=`**

Create `.../sections/Cover.tsx`. Full-viewport hero with cover image (or gradient fallback), "The Wedding Of", couple names (display font), first-event date, and — if `guestName` — a "Kepada Yth." line. A "Buka Undangan" button flips `opened`; while `!opened` the overlay is fixed over the page and `document.body.style.overflow = "hidden"`; on open it fades out, restores scroll, and (if enabled) plays the audio. Accepts `{ invitation, guestName }`.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import type { PublicInvitation } from "@/lib/wedding/queries";

export default function Cover({ invitation, guestName }: { invitation: PublicInvitation; guestName: string | null }) {
  const [opened, setOpened] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstEvent = invitation.events[0];

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [opened]);

  function open() {
    setOpened(true);
    if (invitation.isMusicEnabled && audioRef.current) audioRef.current.play().catch(() => {});
  }

  const dateLabel = firstEvent
    ? new Date(firstEvent.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <>
      {invitation.isMusicEnabled && invitation.musicUrl ? (
        <audio ref={audioRef} src={invitation.musicUrl} loop preload="auto" />
      ) : null}
      <div
        aria-hidden={opened}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-700 ${opened ? "pointer-events-none opacity-0" : "opacity-100"}`}
        style={{
          backgroundColor: "var(--w-bg)",
          backgroundImage: invitation.coverImage ? `linear-gradient(rgba(20,16,12,0.45),rgba(20,16,12,0.55)), url(${invitation.coverImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className={`text-[11px] tracking-[0.3em] uppercase ${invitation.coverImage ? "text-white/80" : "text-[var(--w-accent)]"}`}>The Wedding Of</p>
        <h1 className={`mt-4 font-[family-name:var(--w-font-display)] text-5xl ${invitation.coverImage ? "text-white" : "text-[var(--w-primary)]"}`}>
          {invitation.brideName} &amp; {invitation.groomName}
        </h1>
        {dateLabel ? <p className={`mt-3 text-sm ${invitation.coverImage ? "text-white/90" : ""}`}>{dateLabel}</p> : null}
        {guestName ? (
          <div className={`mt-8 ${invitation.coverImage ? "text-white/90" : ""}`}>
            <p className="text-xs opacity-80">Kepada Yth.</p>
            <p className="mt-1 text-lg font-[family-name:var(--w-font-display)]">{guestName}</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={open}
          className="mt-10 rounded-full bg-[var(--w-primary)] px-8 py-3 text-xs tracking-[0.2em] text-white uppercase"
        >
          Buka Undangan
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Compose Cover / Countdown / Gift into the template**

In `.../classic-elegant/index.tsx`, add imports and place them: `Cover` first (before Couple), `Countdown` after Couple (using the first event's date), `Gift` after Gallery:

```tsx
import Cover from "./sections/Cover";
import Countdown from "./sections/Countdown";
import Gift from "./sections/Gift";
// inside <main>, order:
      <Cover invitation={invitation} guestName={guestName} />
      <Couple invitation={invitation} />
      <Countdown date={invitation.events[0]?.date ?? null} />
      <Events events={invitation.events} />
      {invitation.storyText ? <LoveStory title={invitation.storyTitle} text={invitation.storyText} /> : null}
      <Gallery items={invitation.gallery} />
      <Gift gifts={invitation.gifts} />
      <Closing invitation={invitation} />
```

- [ ] **Step 6: Verify + commit**

Run: `npm run dev`, open `/undangan/rizky-dinda`. Expected: locked cover overlay; page cannot scroll behind it; "Buka Undangan" fades it away and scroll works; countdown ticks each second; gift card shows a "Salin" button that copies the account number. Test `?to=Bapak%20Andi` shows on the cover. Test mobile viewport.
Run: `npm run typecheck && npm run lint`

```bash
git add src/components/wedding
git commit -m "feat(wedding): cover gate, music, countdown, gift copy"
```

---

## Phase 3 — Admin list, create, and parent editor

### Task 9: Parent invitation server actions

**Files:**
- Create: `src/lib/wedding/actions.ts`

**Interfaces:**
- Produces: `type FormState = { error?: string } | null`; `saveInvitation(prev: FormState, form: FormData): Promise<FormState>` (sections `main` | `couple` | `settings`; create happens when `__id` is empty, using `main` fields + brideName/groomName); `deleteInvitation(form: FormData): Promise<void>`; `togglePublish(form: FormData): Promise<void>`.
- Consumes: validation helpers (Task 2), `TEMPLATES` (Task 6), `DISPLAY_FONTS`/`BODY_FONTS` (Task 5).
- Form field contract for `saveInvitation`: hidden `__id`, hidden `__section`; **main:** `title`, `slug`, `status`, `templateSlug`, `coverImage`, `openingText`, `quoteText`, `storyTitle`, `storyText` (+ `brideName`,`groomName` when creating); **couple:** `brideName`, `groomName`, `brideFullName`, `groomFullName`, `brideParents`, `groomParents`, `bridePhoto`, `groomPhoto`; **settings:** `primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor` (hex `#rrggbb`), `fontDisplay`, `fontBody`, `musicUrl`, checkboxes `isMusicEnabled`, `isRsvpEnabled`, `isGuestbookEnabled`.

- [ ] **Step 1: Write the actions**

Create `src/lib/wedding/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  isValidSlug,
  isSafeUrl,
  cleanText,
  WEDDING_STATUSES,
  type WeddingStatusValue,
} from "@/lib/wedding/validation";
import { TEMPLATES } from "@/lib/wedding/template-registry";
import { DISPLAY_FONTS, BODY_FONTS } from "@/lib/wedding/fonts";

export type FormState = { error?: string } | null;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function urlField(form: FormData, name: string): string | null {
  const v = cleanText(form.get(name), 500);
  if (!v) return null;
  if (!isSafeUrl(v)) throw new Error(`${name} harus diawali http://, https://, atau /.`);
  return v;
}

function hex(form: FormData, name: string, fallback: string): string {
  const v = cleanText(form.get(name), 20);
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
}

function buildSectionData(section: string, form: FormData): Record<string, unknown> {
  if (section === "main") {
    const title = cleanText(form.get("title"), 150);
    const slug = cleanText(form.get("slug"), 150).toLowerCase();
    if (!title) throw new Error("Judul wajib diisi.");
    if (!isValidSlug(slug)) throw new Error("Slug hanya huruf kecil, angka, dan tanda hubung.");
    const status = String(form.get("status") ?? "draft");
    if (!WEDDING_STATUSES.includes(status as WeddingStatusValue)) throw new Error("Status tidak valid.");
    const templateSlug = String(form.get("templateSlug") ?? "");
    if (!(templateSlug in TEMPLATES)) throw new Error("Template tidak valid.");
    return {
      title,
      slug,
      status,
      templateSlug,
      coverImage: urlField(form, "coverImage"),
      openingText: cleanText(form.get("openingText"), 1000) || null,
      quoteText: cleanText(form.get("quoteText"), 1000) || null,
      storyTitle: cleanText(form.get("storyTitle"), 150) || null,
      storyText: cleanText(form.get("storyText"), 4000) || null,
    };
  }
  if (section === "couple") {
    const brideName = cleanText(form.get("brideName"), 100);
    const groomName = cleanText(form.get("groomName"), 100);
    if (!brideName || !groomName) throw new Error("Nama kedua mempelai wajib diisi.");
    return {
      brideName,
      groomName,
      brideFullName: cleanText(form.get("brideFullName"), 150) || null,
      groomFullName: cleanText(form.get("groomFullName"), 150) || null,
      brideParents: cleanText(form.get("brideParents"), 500) || null,
      groomParents: cleanText(form.get("groomParents"), 500) || null,
      bridePhoto: urlField(form, "bridePhoto"),
      groomPhoto: urlField(form, "groomPhoto"),
    };
  }
  if (section === "settings") {
    const fontDisplay = String(form.get("fontDisplay") ?? "");
    const fontBody = String(form.get("fontBody") ?? "");
    if (!DISPLAY_FONTS.some((f) => f.key === fontDisplay)) throw new Error("Font display tidak valid.");
    if (!BODY_FONTS.some((f) => f.key === fontBody)) throw new Error("Font body tidak valid.");
    return {
      primaryColor: hex(form, "primaryColor", "#5A6B4E"),
      secondaryColor: hex(form, "secondaryColor", "#B98A7A"),
      accentColor: hex(form, "accentColor", "#C9A15A"),
      backgroundColor: hex(form, "backgroundColor", "#F7F3EC"),
      fontDisplay,
      fontBody,
      musicUrl: urlField(form, "musicUrl"),
      isMusicEnabled: form.get("isMusicEnabled") === "on",
      isRsvpEnabled: form.get("isRsvpEnabled") === "on",
      isGuestbookEnabled: form.get("isGuestbookEnabled") === "on",
    };
  }
  throw new Error("Section tidak dikenal.");
}

export async function saveInvitation(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const section = String(form.get("__section") ?? "");

  let data: Record<string, unknown>;
  try {
    data = buildSectionData(section, form);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Input tidak valid." };
  }

  let targetId = id;
  try {
    if (id) {
      await prisma.weddingInvitation.update({ where: { id }, data });
    } else {
      // Create only from /new (section "main"); couple names required to satisfy schema.
      const brideName = cleanText(form.get("brideName"), 100);
      const groomName = cleanText(form.get("groomName"), 100);
      if (!brideName || !groomName) return { error: "Nama kedua mempelai wajib diisi." };
      const created = await prisma.weddingInvitation.create({
        data: { ...data, brideName, groomName } as Prisma.WeddingInvitationCreateInput,
      });
      targetId = created.id;
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Slug sudah dipakai undangan lain." };
    }
    return { error: err instanceof Error ? err.message : "Gagal menyimpan." };
  }

  revalidatePath("/admin/wedding-invitations");
  const inv = await prisma.weddingInvitation.findUnique({ where: { id: targetId }, select: { slug: true } });
  if (inv) revalidatePath(`/undangan/${inv.slug}`);
  redirect(`/admin/wedding-invitations/${targetId}?tab=${id ? section : "couple"}&saved=1`);
}

export async function deleteInvitation(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  if (!id) return;
  await prisma.weddingInvitation.delete({ where: { id } });
  revalidatePath("/admin/wedding-invitations");
  redirect("/admin/wedding-invitations");
}

export async function togglePublish(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  if (!id) return;
  const current = await prisma.weddingInvitation.findUnique({ where: { id }, select: { status: true, slug: true } });
  if (!current) return;
  const next = current.status === "published" ? "draft" : "published";
  await prisma.weddingInvitation.update({
    where: { id },
    data: { status: next, publishedAt: next === "published" ? new Date() : null },
  });
  revalidatePath("/admin/wedding-invitations");
  revalidatePath(`/undangan/${current.slug}`);
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run typecheck`
Expected: pass.

```bash
git add src/lib/wedding/actions.ts
git commit -m "feat(wedding): parent invitation server actions"
```

---

### Task 10: Admin list page + sidebar entry

**Files:**
- Create: `src/app/admin/(dashboard)/wedding-invitations/page.tsx`
- Modify: `src/components/admin/Sidebar.tsx` (add nav section + `sectionForPath` tweak)

**Interfaces:**
- Consumes: `listInvitations` (Task 3), `togglePublish`/`deleteInvitation` (Task 9).
- Produces: the list route at `/admin/wedding-invitations`.

- [ ] **Step 1: List page**

Create `src/app/admin/(dashboard)/wedding-invitations/page.tsx`. Mirror the table styling of `src/app/admin/(dashboard)/[resource]/page.tsx`. Columns: couple (`brideName & groomName`), slug, status badge, template, updatedAt. Row actions: **Edit** (`/admin/wedding-invitations/[id]`), **Preview** (`/undangan/[slug]` new tab), **Publish/Unpublish** (`<form action={togglePublish}>` with hidden `__id`), **Delete** (`<form action={deleteInvitation}>`). Header has a "New invitation" link to `/new`.

```tsx
import Link from "next/link";
import { listInvitations } from "@/lib/wedding/queries";
import { togglePublish, deleteInvitation } from "@/lib/wedding/actions";

export default async function WeddingInvitationsPage() {
  const rows = await listInvitations();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">Wedding Invitations</h1>
        <Link href="/admin/wedding-invitations/new" className="bg-ink text-cream hover:bg-ink-soft rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.2em] uppercase transition-colors">
          New invitation
        </Link>
      </header>

      <section className="border-line bg-card rounded-card shadow-card overflow-x-auto border">
        {rows.length === 0 ? (
          <p className="text-ink-soft px-6 py-10 text-sm">Nothing here yet. Create the first invitation.</p>
        ) : (
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="text-ink-soft border-line border-b font-mono text-[11px] tracking-[0.1em] uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Couple</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Template</th>
                <th className="px-6 py-3 font-medium">Updated</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-line hover:bg-cream-deep/50 border-t align-top transition-colors">
                  <td className="text-ink px-6 py-4">{r.brideName} &amp; {r.groomName}</td>
                  <td className="text-ink-soft px-6 py-4">{r.slug}</td>
                  <td className="text-ink-soft px-6 py-4">{r.status}</td>
                  <td className="text-ink-soft px-6 py-4">{r.templateSlug}</td>
                  <td className="text-ink-soft px-6 py-4">{r.updatedAt.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/admin/wedding-invitations/${r.id}`} className="text-ink-soft hover:text-ink text-xs">Edit</Link>
                      <a href={`/undangan/${r.slug}`} target="_blank" rel="noreferrer" className="text-ink-soft hover:text-ink text-xs">Preview</a>
                      <form action={togglePublish}>
                        <input type="hidden" name="__id" value={r.id} />
                        <button type="submit" className="text-ink-soft hover:text-ink text-xs">{r.status === "published" ? "Unpublish" : "Publish"}</button>
                      </form>
                      <form action={deleteInvitation}>
                        <input type="hidden" name="__id" value={r.id} />
                        <button type="submit" className="text-danger/75 hover:text-danger text-xs transition-colors">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Sidebar — add the section**

In `src/components/admin/Sidebar.tsx`: import `Heart` from lucide-react (add to the existing import list). Add a NAV section after the `content` block (or wherever fits the grouping):

```tsx
  {
    key: "weddings",
    label: "Weddings",
    icon: Heart,
    href: "/admin/wedding-invitations",
    hint: "Digital wedding invitations — create, theme, publish, and review RSVPs.",
  },
```

- [ ] **Step 3: Sidebar — light the rail on editor sub-routes**

In `sectionForPath`, before the final `return "dashboard"`, add a prefix match so `/admin/wedding-invitations/[id]` keeps the section active (guard against `/admin` matching everything):

```tsx
  for (const s of NAV) {
    if (s.href && s.href !== "/admin" && pathname.startsWith(s.href)) return s.key;
  }
```

Place this loop after the existing exact-match loop.

- [ ] **Step 4: Verify + commit**

Run: `npm run dev`, open `/admin` (log in), click the Weddings rail icon → list shows `Rizky & Dinda`, status `published`. Preview opens the public page. Publish toggles to `draft` (public then 404s) and back.
Run: `npm run typecheck && npm run lint`

```bash
git add "src/app/admin/(dashboard)/wedding-invitations/page.tsx" src/components/admin/Sidebar.tsx
git commit -m "feat(wedding): admin list page + sidebar entry"
```

---

### Task 11: Create page (`/new`)

**Files:**
- Create: `src/app/admin/(dashboard)/wedding-invitations/new/page.tsx`
- Create: `src/components/wedding/admin/InvitationCreateForm.tsx` (client)

**Interfaces:**
- Consumes: `saveInvitation` (Task 9). Submits `__section="main"`, empty `__id`, with `title`, `slug`, `brideName`, `groomName`, hidden `status="draft"`, hidden `templateSlug="classic-elegant"`.

- [ ] **Step 1: Create form (client, useActionState)**

Create `src/components/wedding/admin/InvitationCreateForm.tsx`. Mirror `ResourceForm`'s `useActionState` + `INPUT` class + submit button. Fields: Title, Slug, Bride name, Groom name. Include hidden `__section="main"`, `__id=""`, `status="draft"`, `templateSlug="classic-elegant"`.

```tsx
"use client";
import { useActionState } from "react";
import { saveInvitation, type FormState } from "@/lib/wedding/actions";

const INPUT = "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors";
const LABEL = "text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase";

export default function InvitationCreateForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveInvitation, null);
  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <input type="hidden" name="__section" value="main" />
      <input type="hidden" name="__id" value="" />
      <input type="hidden" name="status" value="draft" />
      <input type="hidden" name="templateSlug" value="classic-elegant" />
      <label><span className={LABEL}>Title *</span><input name="title" className={INPUT} placeholder="Rizky & Dinda" /></label>
      <label><span className={LABEL}>Slug *</span><input name="slug" className={INPUT} placeholder="rizky-dinda" /></label>
      <label><span className={LABEL}>Bride name *</span><input name="brideName" className={INPUT} /></label>
      <label><span className={LABEL}>Groom name *</span><input name="groomName" className={INPUT} /></label>
      {state?.error ? <p role="alert" className="text-danger text-[13px]">{state.error}</p> : null}
      <div>
        <button type="submit" disabled={pending} className="bg-ink text-cream hover:bg-ink-soft rounded-full px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:opacity-50">
          {pending ? "Creating…" : "Create draft"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create page**

Create `src/app/admin/(dashboard)/wedding-invitations/new/page.tsx`:

```tsx
import Link from "next/link";
import InvitationCreateForm from "@/components/wedding/admin/InvitationCreateForm";

export default function NewInvitationPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">New Invitation</h1>
        <Link href="/admin/wedding-invitations" className="text-ink-soft hover:text-ink text-xs">Back to list</Link>
      </header>
      <section className="border-line bg-card rounded-card shadow-card border p-6">
        <InvitationCreateForm />
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify + commit**

Run: `npm run dev`, `/admin/wedding-invitations/new` → create a draft → redirects to `/admin/wedding-invitations/<id>?tab=couple` (editor arrives in Task 12; a 404/placeholder here is expected until then). Confirm the row appears in the list. Try a duplicate slug `rizky-dinda` → inline error "Slug sudah dipakai…".
Run: `npm run typecheck && npm run lint`

```bash
git add "src/app/admin/(dashboard)/wedding-invitations/new/page.tsx" src/components/wedding/admin/InvitationCreateForm.tsx
git commit -m "feat(wedding): create-invitation page"
```

---

### Task 12: Editor shell + Main/Couple/Settings tabs

**Files:**
- Create: `src/app/admin/(dashboard)/wedding-invitations/[id]/page.tsx`
- Create: `src/components/wedding/admin/EditorTabs.tsx` (server; renders tab links from `?tab=`)
- Create: `src/components/wedding/admin/InvitationSectionForm.tsx` (client; generic section form)
- Create: `src/components/wedding/admin/fields.tsx` (client; shared Text/Textarea/Image/Select/Color/Checkbox controls + `INPUT`/`LABEL` constants)

**Interfaces:**
- Consumes: `getInvitationForEdit` (Task 3), `saveInvitation` (Task 9), `TEMPLATE_OPTIONS` (Task 6), `DISPLAY_FONTS`/`BODY_FONTS` (Task 5), `WEDDING_STATUSES` (Task 2), and the reused `ImageControl` from `ResourceForm` (re-exported — see Step 1).
- Produces: the editor route, a `<Tabs current={tab} id={id} />` nav, and a reusable `<InvitationSectionForm section id record fields />`.
- Tab set for this task: `main`, `couple`, `settings`. Tabs `events`, `gallery`, `gifts` render "coming in Phase 4" placeholders; `rsvps`, `guestbook` render "coming in Phase 5" placeholders. Later tasks replace those placeholders.

- [ ] **Step 1: Shared admin field controls**

Create `src/components/wedding/admin/fields.tsx`. Export `INPUT`, `LABEL` constants; a `<Field label required>` wrapper; and small controls `TextInput`, `TextArea`, `SelectInput`, `ColorInput`, `Checkbox`. Re-export the existing uploader so wedding forms reuse it:

```tsx
"use client";
export { default as ImageControl } from "@/components/admin/ResourceForm"; // see note
```

Note: `ImageControl` is not currently exported from `ResourceForm.tsx` (only the default `ResourceForm`). In this step, also modify `src/components/admin/ResourceForm.tsx` to add `export` to the `ImageControl` function declaration (`export function ImageControl(...)`), so wedding forms can import it without duplicating the uploader. Then here:

```tsx
"use client";
import type { ReactNode } from "react";
export { ImageControl } from "@/components/admin/ResourceForm";

export const INPUT = "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors";
export const LABEL = "text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase";

export function Field({ label, required, children, wide }: { label: string; required?: boolean; children: ReactNode; wide?: boolean }) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className={LABEL}>{label}{required ? <span className="text-gold-ink"> *</span> : null}</span>
      {children}
    </label>
  );
}
```

(Define `TextInput`, `TextArea`, `SelectInput`, `ColorInput`, `Checkbox` as thin wrappers over `<input>/<textarea>/<select>` using `INPUT`; `ColorInput` renders `<input type="color">` plus a text input sharing the same `name` is unnecessary — use a single `<input type="color" name=... defaultValue=...>` which posts `#rrggbb`.)

- [ ] **Step 2: Section form (client)**

Create `src/components/wedding/admin/InvitationSectionForm.tsx`. A client component taking `{ section, id, record, children }` — it wraps `children` (the section's fields) in a `<form action={formAction}>` with `useActionState(saveInvitation)`, hidden `__section`/`__id`, a `saved` note, error display, and the submit button. The section pages pass their field JSX as `children`, reading defaults from `record`.

```tsx
"use client";
import { useActionState } from "react";
import { saveInvitation, type FormState } from "@/lib/wedding/actions";

export default function InvitationSectionForm({ section, id, children }: { section: string; id: string; children: React.ReactNode }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveInvitation, null);
  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="__section" value={section} />
      <input type="hidden" name="__id" value={id} />
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
      {state?.error ? <p role="alert" className="text-danger text-[13px]">{state.error}</p> : null}
      <div>
        <button type="submit" disabled={pending} className="bg-ink text-cream hover:bg-ink-soft rounded-full px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors disabled:opacity-50">
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Tabs nav (server)**

Create `src/components/wedding/admin/EditorTabs.tsx`. Renders the 8 tab links (`main`, `couple`, `events`, `gallery`, `gifts`, `settings`, `rsvps`, `guestbook`) as `Link`s to `?tab=<key>`, highlighting `current`.

```tsx
import Link from "next/link";

const TABS: [string, string][] = [
  ["main", "Main"], ["couple", "Couple"], ["events", "Events"], ["gallery", "Gallery"],
  ["gifts", "Gifts"], ["settings", "Settings"], ["rsvps", "RSVPs"], ["guestbook", "Guestbook"],
];

export default function EditorTabs({ id, current }: { id: string; current: string }) {
  return (
    <nav className="border-line flex flex-wrap gap-1 border-b pb-3">
      {TABS.map(([key, label]) => (
        <Link
          key={key}
          href={`/admin/wedding-invitations/${id}?tab=${key}`}
          aria-current={current === key ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 text-xs transition-colors ${current === key ? "bg-cream-deep text-ink" : "text-ink-soft hover:bg-cream-deep/50 hover:text-ink"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Editor page with tab switch**

Create `src/app/admin/(dashboard)/wedding-invitations/[id]/page.tsx`. Load the record via `getInvitationForEdit`; `notFound()` if missing. Read `?tab` (default `main`). Render header (couple name + Preview link + saved note), `<EditorTabs>`, then a `switch(tab)` that renders the section. For this task implement `main`, `couple`, `settings` with `<InvitationSectionForm>` + fields from `fields.tsx`; render placeholder `<p>` for the other five.

Key field wiring (defaults from `record`):
- **main:** `title` (TextInput), `slug` (TextInput), `status` (SelectInput, options `WEDDING_STATUSES`), `templateSlug` (SelectInput, options `TEMPLATE_OPTIONS`), `coverImage` (ImageControl), `openingText`/`quoteText`/`storyText` (TextArea, wide), `storyTitle` (TextInput).
- **couple:** `brideName`, `groomName`, `brideFullName`, `groomFullName` (TextInput); `brideParents`, `groomParents` (TextArea); `bridePhoto`, `groomPhoto` (ImageControl).
- **settings:** `primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor` (ColorInput); `fontDisplay` (SelectInput, `DISPLAY_FONTS`), `fontBody` (SelectInput, `BODY_FONTS`); `musicUrl` (TextInput type url); `isMusicEnabled`, `isRsvpEnabled`, `isGuestbookEnabled` (Checkbox).

`ImageControl` expects a `field` prop shaped `{ name, label, type }` and a `record`; pass `field={{ name: "coverImage", label: "Cover Image", type: "image" }}` and `record={record}` — it reads `record[field.name]` for the initial URL and posts the resolved URL under `field.name`.

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getInvitationForEdit } from "@/lib/wedding/queries";
import EditorTabs from "@/components/wedding/admin/EditorTabs";
import InvitationSectionForm from "@/components/wedding/admin/InvitationSectionForm";
import { Field, TextInput, TextArea, SelectInput, ColorInput, Checkbox, ImageControl } from "@/components/wedding/admin/fields";
import { WEDDING_STATUSES } from "@/lib/wedding/validation";
import { TEMPLATE_OPTIONS } from "@/lib/wedding/template-registry";
import { DISPLAY_FONTS, BODY_FONTS } from "@/lib/wedding/fonts";

export default async function EditInvitationPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; saved?: string }> }) {
  const { id } = await params;
  const { tab = "main", saved } = await searchParams;
  const record = await getInvitationForEdit(id);
  if (!record) notFound();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">{record.brideName} &amp; {record.groomName}</h1>
        <div className="flex items-center gap-4">
          {saved ? <span className="text-success font-mono text-[13px]">Saved.</span> : null}
          <a href={`/undangan/${record.slug}`} target="_blank" rel="noreferrer" className="text-ink-soft hover:text-ink text-xs">Preview</a>
          <Link href="/admin/wedding-invitations" className="text-ink-soft hover:text-ink text-xs">List</Link>
        </div>
      </header>

      <EditorTabs id={id} current={tab} />

      <section className="border-line bg-card rounded-card shadow-card border p-6">
        {tab === "main" ? (
          <InvitationSectionForm section="main" id={id}>
            <Field label="Title" required><TextInput name="title" defaultValue={record.title} /></Field>
            <Field label="Slug" required><TextInput name="slug" defaultValue={record.slug} /></Field>
            <Field label="Status"><SelectInput name="status" defaultValue={record.status} options={WEDDING_STATUSES.map((s) => ({ value: s, label: s }))} /></Field>
            <Field label="Template"><SelectInput name="templateSlug" defaultValue={record.templateSlug} options={TEMPLATE_OPTIONS.map((t) => ({ value: t.slug, label: t.label }))} /></Field>
            <Field label="Cover Image" wide><ImageControl field={{ name: "coverImage", label: "Cover Image", type: "image" }} record={record} /></Field>
            <Field label="Opening Text" wide><TextArea name="openingText" defaultValue={record.openingText ?? ""} /></Field>
            <Field label="Quote" wide><TextArea name="quoteText" defaultValue={record.quoteText ?? ""} /></Field>
            <Field label="Story Title"><TextInput name="storyTitle" defaultValue={record.storyTitle ?? ""} /></Field>
            <Field label="Story Text" wide><TextArea name="storyText" defaultValue={record.storyText ?? ""} /></Field>
          </InvitationSectionForm>
        ) : tab === "couple" ? (
          <InvitationSectionForm section="couple" id={id}>
            <Field label="Bride Name" required><TextInput name="brideName" defaultValue={record.brideName} /></Field>
            <Field label="Groom Name" required><TextInput name="groomName" defaultValue={record.groomName} /></Field>
            <Field label="Bride Full Name"><TextInput name="brideFullName" defaultValue={record.brideFullName ?? ""} /></Field>
            <Field label="Groom Full Name"><TextInput name="groomFullName" defaultValue={record.groomFullName ?? ""} /></Field>
            <Field label="Bride Parents" wide><TextArea name="brideParents" defaultValue={record.brideParents ?? ""} /></Field>
            <Field label="Groom Parents" wide><TextArea name="groomParents" defaultValue={record.groomParents ?? ""} /></Field>
            <Field label="Bride Photo" wide><ImageControl field={{ name: "bridePhoto", label: "Bride Photo", type: "image" }} record={record} /></Field>
            <Field label="Groom Photo" wide><ImageControl field={{ name: "groomPhoto", label: "Groom Photo", type: "image" }} record={record} /></Field>
          </InvitationSectionForm>
        ) : tab === "settings" ? (
          <InvitationSectionForm section="settings" id={id}>
            <Field label="Primary Color"><ColorInput name="primaryColor" defaultValue={record.primaryColor} /></Field>
            <Field label="Secondary Color"><ColorInput name="secondaryColor" defaultValue={record.secondaryColor} /></Field>
            <Field label="Accent Color"><ColorInput name="accentColor" defaultValue={record.accentColor} /></Field>
            <Field label="Background Color"><ColorInput name="backgroundColor" defaultValue={record.backgroundColor} /></Field>
            <Field label="Font Display"><SelectInput name="fontDisplay" defaultValue={record.fontDisplay} options={DISPLAY_FONTS.map((f) => ({ value: f.key, label: f.label }))} /></Field>
            <Field label="Font Body"><SelectInput name="fontBody" defaultValue={record.fontBody} options={BODY_FONTS.map((f) => ({ value: f.key, label: f.label }))} /></Field>
            <Field label="Music URL" wide><TextInput name="musicUrl" type="url" defaultValue={record.musicUrl ?? ""} /></Field>
            <Field label="Enable Music"><Checkbox name="isMusicEnabled" defaultChecked={record.isMusicEnabled} /></Field>
            <Field label="Enable RSVP"><Checkbox name="isRsvpEnabled" defaultChecked={record.isRsvpEnabled} /></Field>
            <Field label="Enable Guestbook"><Checkbox name="isGuestbookEnabled" defaultChecked={record.isGuestbookEnabled} /></Field>
          </InvitationSectionForm>
        ) : (
          <p className="text-ink-soft text-sm">This tab ships in a later phase.</p>
        )}
      </section>
    </div>
  );
}
```

Implement the referenced controls in `fields.tsx`: `TextInput({ name, defaultValue, type })`, `TextArea({ name, defaultValue })`, `SelectInput({ name, defaultValue, options })`, `ColorInput({ name, defaultValue })` (`<input type="color">`), `Checkbox({ name, defaultChecked })` (`<input type="checkbox">` styled like ResourceForm's boolean).

- [ ] **Step 5: Verify + commit**

Run: `npm run dev`. In the editor: change primary color in Settings → save → open Preview → cover/heading color changed. Edit slug in Main → save. Edit couple names → save → reflected on public page. Confirm the `saved=1` note shows.
Run: `npm run typecheck && npm run lint`

```bash
git add "src/app/admin/(dashboard)/wedding-invitations/[id]/page.tsx" src/components/wedding/admin src/components/admin/ResourceForm.tsx
git commit -m "feat(wedding): invitation editor shell + main/couple/settings tabs"
```

---

## Phase 4 — Child collection editors

### Task 13: Child collection server actions (events, gallery, gifts)

**Files:**
- Modify: `src/lib/wedding/actions.ts` (append child actions)

**Interfaces:**
- Produces: `saveEvent(prev, form)`, `deleteEvent(form)`, `saveGalleryItem(prev, form)`, `deleteGalleryItem(form)`, `saveGift(prev, form)`, `deleteGift(form)` — all `FormState`/`void` like the parent actions. Each save reads hidden `__invitationId`, optional `__id` (update vs create), redirects to `/admin/wedding-invitations/<invitationId>?tab=<events|gallery|gifts>&saved=1`, and revalidates the public slug.
- Form contracts — **event:** `title` (req), `date` (`yyyy-mm-dd`, req), `startTime`, `endTime`, `venueName`, `venueAddress`, `mapsUrl`, `description`, `order`; **gallery:** `imageUrl` (req), `caption`, `order`; **gift:** `type` (enum `GIFT_TYPES`, req), `providerName`, `accountNumber`, `accountName`, `address`, `qrImage`, `notes`, `order`.

- [ ] **Step 1: Append child actions**

Append to `src/lib/wedding/actions.ts` (add `GIFT_TYPES`, `type GiftType` to the validation import):

```ts
async function invitationSlug(invitationId: string): Promise<string | null> {
  const inv = await prisma.weddingInvitation.findUnique({ where: { id: invitationId }, select: { slug: true } });
  return inv?.slug ?? null;
}

function intField(form: FormData, name: string): number {
  const n = Number(cleanText(form.get(name), 10));
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

async function afterChildSave(invitationId: string, tab: string, prev: FormState): Promise<FormState> {
  // placeholder to satisfy TS in examples; real flow redirects (see below)
  return prev;
}

// ---- Events ----
export async function saveEvent(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const invitationId = String(form.get("__invitationId") ?? "");
  const id = String(form.get("__id") ?? "");
  if (!invitationId) return { error: "Undangan tidak dikenal." };

  const title = cleanText(form.get("title"), 150);
  const dateStr = cleanText(form.get("date"), 20);
  if (!title) return { error: "Judul acara wajib diisi." };
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { error: "Tanggal tidak valid." };

  let mapsUrl: string | null;
  try { mapsUrl = urlField(form, "mapsUrl"); } catch (e) { return { error: e instanceof Error ? e.message : "URL tidak valid." }; }

  const data = {
    title, date,
    startTime: cleanText(form.get("startTime"), 10) || null,
    endTime: cleanText(form.get("endTime"), 10) || null,
    venueName: cleanText(form.get("venueName"), 200) || null,
    venueAddress: cleanText(form.get("venueAddress"), 500) || null,
    mapsUrl,
    description: cleanText(form.get("description"), 1000) || null,
    order: intField(form, "order"),
  };

  if (id) await prisma.weddingEvent.update({ where: { id }, data });
  else await prisma.weddingEvent.create({ data: { ...data, invitationId } });

  const slug = await invitationSlug(invitationId);
  revalidatePath(`/admin/wedding-invitations/${invitationId}`);
  if (slug) revalidatePath(`/undangan/${slug}`);
  redirect(`/admin/wedding-invitations/${invitationId}?tab=events&saved=1`);
}

export async function deleteEvent(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  if (!id) return;
  await prisma.weddingEvent.delete({ where: { id } });
  const slug = await invitationSlug(invitationId);
  revalidatePath(`/admin/wedding-invitations/${invitationId}`);
  if (slug) revalidatePath(`/undangan/${slug}`);
}

// ---- Gallery ----
export async function saveGalleryItem(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const invitationId = String(form.get("__invitationId") ?? "");
  const id = String(form.get("__id") ?? "");
  if (!invitationId) return { error: "Undangan tidak dikenal." };
  const imageUrl = cleanText(form.get("imageUrl"), 500);
  if (!imageUrl || !isSafeUrl(imageUrl)) return { error: "Gambar wajib diunggah." };
  const data = { imageUrl, caption: cleanText(form.get("caption"), 200) || null, order: intField(form, "order") };
  if (id) await prisma.weddingGallery.update({ where: { id }, data });
  else await prisma.weddingGallery.create({ data: { ...data, invitationId } });
  const slug = await invitationSlug(invitationId);
  revalidatePath(`/admin/wedding-invitations/${invitationId}`);
  if (slug) revalidatePath(`/undangan/${slug}`);
  redirect(`/admin/wedding-invitations/${invitationId}?tab=gallery&saved=1`);
}

export async function deleteGalleryItem(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  if (!id) return;
  await prisma.weddingGallery.delete({ where: { id } });
  const slug = await invitationSlug(invitationId);
  revalidatePath(`/admin/wedding-invitations/${invitationId}`);
  if (slug) revalidatePath(`/undangan/${slug}`);
}

// ---- Gifts ----
export async function saveGift(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const invitationId = String(form.get("__invitationId") ?? "");
  const id = String(form.get("__id") ?? "");
  if (!invitationId) return { error: "Undangan tidak dikenal." };
  const type = String(form.get("type") ?? "");
  if (!GIFT_TYPES.includes(type as GiftType)) return { error: "Tipe gift tidak valid." };
  let qrImage: string | null;
  try { qrImage = urlField(form, "qrImage"); } catch (e) { return { error: e instanceof Error ? e.message : "URL tidak valid." }; }
  const data = {
    type: type as GiftType,
    providerName: cleanText(form.get("providerName"), 150) || null,
    accountNumber: cleanText(form.get("accountNumber"), 100) || null,
    accountName: cleanText(form.get("accountName"), 150) || null,
    address: cleanText(form.get("address"), 500) || null,
    qrImage,
    notes: cleanText(form.get("notes"), 500) || null,
    order: intField(form, "order"),
  };
  if (id) await prisma.weddingGift.update({ where: { id }, data });
  else await prisma.weddingGift.create({ data: { ...data, invitationId } });
  const slug = await invitationSlug(invitationId);
  revalidatePath(`/admin/wedding-invitations/${invitationId}`);
  if (slug) revalidatePath(`/undangan/${slug}`);
  redirect(`/admin/wedding-invitations/${invitationId}?tab=gifts&saved=1`);
}

export async function deleteGift(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  if (!id) return;
  await prisma.weddingGift.delete({ where: { id } });
  const slug = await invitationSlug(invitationId);
  revalidatePath(`/admin/wedding-invitations/${invitationId}`);
  if (slug) revalidatePath(`/undangan/${slug}`);
}
```

Delete the unused `afterChildSave` stub before committing (it is only shown to illustrate the redirect flow — not needed). Update the top import: `import { isValidSlug, isSafeUrl, cleanText, WEDDING_STATUSES, GIFT_TYPES, type WeddingStatusValue, type GiftType } from "@/lib/wedding/validation";`

- [ ] **Step 2: Typecheck + commit**

Run: `npm run typecheck`
Expected: pass (no reference to the removed stub).

```bash
git add src/lib/wedding/actions.ts
git commit -m "feat(wedding): event/gallery/gift child actions"
```

---

### Task 14: Child collection editor UI (Events, Gallery, Gifts tabs)

**Files:**
- Create: `src/components/wedding/admin/ChildList.tsx` (server helper: renders existing rows + a delete form per row)
- Create: `src/components/wedding/admin/EventForm.tsx`, `GalleryForm.tsx`, `GiftForm.tsx` (client add/edit forms)
- Modify: `src/app/admin/(dashboard)/wedding-invitations/[id]/page.tsx` (wire the three tabs, reading `?child=<id>` for edit mode)

**Interfaces:**
- Consumes: child actions (Task 13); `record.events`/`record.gallery`/`record.gifts` (Task 3); `ImageControl` (Task 12); `GIFT_TYPES` (Task 2).
- Produces: three working tabs. Each tab shows an add/edit form + a list of existing rows; clicking "Edit" on a row sets `?tab=<t>&child=<rowId>` so the form pre-fills; "Delete" posts the delete action.
- Date input uses native `<input type="date">`; the form pre-fills it from `event.date` via `toISOString().slice(0,10)`.

- [ ] **Step 1: EventForm (client)**

Create `src/components/wedding/admin/EventForm.tsx`. `useActionState(saveEvent)`. Props `{ invitationId, record }` where `record` is an existing event or `null`. Hidden `__invitationId`, `__id` (record?.id ?? ""). Fields: title (req), date (`type="date"`, req, default `record?.date` sliced), startTime/endTime (`type="time"`), venueName, venueAddress (textarea), mapsUrl (url), description (textarea), order (number). Submit label "Save event" / "Add event". Use `INPUT`/`LABEL`/`Field` from `fields.tsx`. Include `key={record?.id ?? "new"}` on the form so switching rows resets defaults (mirrors ResourceForm).

- [ ] **Step 2: GalleryForm (client)**

Create `GalleryForm.tsx`. `useActionState(saveGalleryItem)`. Props `{ invitationId, record }`. Fields: `imageUrl` via `ImageControl` (`field={{ name: "imageUrl", label: "Image", type: "image" }}`), caption, order. Same hidden inputs + reset key.

- [ ] **Step 3: GiftForm (client)**

Create `GiftForm.tsx`. `useActionState(saveGift)`. Props `{ invitationId, record }`. Fields: `type` (select from `GIFT_TYPES`), providerName, accountNumber, accountName, address (textarea), `qrImage` (ImageControl), notes (textarea), order. Same hidden inputs + reset key.

- [ ] **Step 4: ChildList (server)**

Create `ChildList.tsx`. Generic list: props `{ rows, columns, tab, invitationId, deleteAction }` where `columns: { label: string; get: (row) => string }[]`. Renders a table (reuse the list table classes) with Edit link (`?tab=<tab>&child=<row.id>`) and a `<form action={deleteAction}>` with hidden `__id` + `__invitationId`. Keep it a typed generic over `{ id: string }`.

```tsx
import Link from "next/link";

export default function ChildList<T extends { id: string }>({
  rows, columns, tab, invitationId, deleteAction,
}: {
  rows: T[];
  columns: { label: string; get: (row: T) => string }[];
  tab: string;
  invitationId: string;
  deleteAction: (form: FormData) => void | Promise<void>;
}) {
  if (rows.length === 0) return <p className="text-ink-soft mt-6 text-sm">No entries yet.</p>;
  return (
    <div className="border-line mt-8 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="text-ink-soft border-line border-b font-mono text-[11px] tracking-[0.1em] uppercase">
          <tr>{columns.map((c) => <th key={c.label} className="px-4 py-2.5 font-medium">{c.label}</th>)}<th className="px-4 py-2.5 text-right font-medium">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-line border-t">
              {columns.map((c) => <td key={c.label} className="text-ink-soft px-4 py-3">{c.get(row)}</td>)}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-4">
                  <Link href={`/admin/wedding-invitations/${invitationId}?tab=${tab}&child=${row.id}`} className="text-ink-soft hover:text-ink text-xs">Edit</Link>
                  <form action={deleteAction}>
                    <input type="hidden" name="__id" value={row.id} />
                    <input type="hidden" name="__invitationId" value={invitationId} />
                    <button type="submit" className="text-danger/75 hover:text-danger text-xs">Delete</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Wire the three tabs in the editor page**

In `[id]/page.tsx`: read `child` from `searchParams`. Replace the Phase-4 placeholders for `events`/`gallery`/`gifts` with the form (pre-filled from the matching child row when `child` is set) + `<ChildList>`. Import the forms, `ChildList`, and `deleteEvent`/`deleteGalleryItem`/`deleteGift`.

Example for the events branch:

```tsx
tab === "events" ? (
  <>
    <EventForm invitationId={id} record={record.events.find((e) => e.id === child) ?? null} />
    <ChildList
      rows={record.events}
      tab="events"
      invitationId={id}
      deleteAction={deleteEvent}
      columns={[
        { label: "Title", get: (e) => e.title },
        { label: "Date", get: (e) => new Date(e.date).toLocaleDateString("id-ID") },
        { label: "Order", get: (e) => String(e.order) },
      ]}
    />
  </>
) : /* gallery, gifts analogous */
```

For gallery columns: `imageUrl` (truncated) + caption + order. For gifts: type + providerName + order.

- [ ] **Step 6: Verify + commit**

Run: `npm run dev`. In the editor Events tab: add an event → appears in list + on the public page; edit it → prefilled → save; delete it. Repeat for Gallery (upload flows through `/api/admin/upload`) and Gifts (add a bank entry → copy button works on public).
Run: `npm run typecheck && npm run lint`

```bash
git add src/components/wedding/admin "src/app/admin/(dashboard)/wedding-invitations/[id]/page.tsx"
git commit -m "feat(wedding): events/gallery/gifts child editors"
```

---

## Phase 5 — RSVP + Guestbook (public submit + admin views)

### Task 15: Public submit actions + admin moderation actions

**Files:**
- Modify: `src/lib/wedding/actions.ts` (append)

**Interfaces:**
- Produces: `type PublicFormState = { error?: string; success?: boolean } | null`; `submitRsvp(prev, form)`, `submitMessage(prev, form)` (public, NO `requireAdmin`; both verify the invitation is `published` and the relevant toggle is on); `toggleMessageVisible(form)`, `deleteMessage(form)` (admin).
- Form contracts — **RSVP:** `invitationId`, `guestName`, `attendanceStatus`, `guestCount`, `message`. **Message:** `invitationId`, `guestName`, `message`.

- [ ] **Step 1: Append the actions**

Append to `src/lib/wedding/actions.ts` (add `parseRsvp`, `parseMessage` to the validation import):

```ts
export type PublicFormState = { error?: string; success?: boolean } | null;

export async function submitRsvp(_prev: PublicFormState, form: FormData): Promise<PublicFormState> {
  const invitationId = String(form.get("invitationId") ?? "");
  const inv = await prisma.weddingInvitation.findUnique({
    where: { id: invitationId },
    select: { status: true, isRsvpEnabled: true, slug: true },
  });
  if (!inv || inv.status !== "published" || !inv.isRsvpEnabled) return { error: "Undangan tidak tersedia." };

  const parsed = parseRsvp({
    guestName: form.get("guestName"),
    attendanceStatus: form.get("attendanceStatus"),
    guestCount: form.get("guestCount"),
    message: form.get("message"),
  });
  if (!parsed.ok) return { error: parsed.error };

  await prisma.weddingRsvp.create({ data: { invitationId, ...parsed.value } });
  revalidatePath(`/undangan/${inv.slug}`);
  return { success: true };
}

export async function submitMessage(_prev: PublicFormState, form: FormData): Promise<PublicFormState> {
  const invitationId = String(form.get("invitationId") ?? "");
  const inv = await prisma.weddingInvitation.findUnique({
    where: { id: invitationId },
    select: { status: true, isGuestbookEnabled: true, slug: true },
  });
  if (!inv || inv.status !== "published" || !inv.isGuestbookEnabled) return { error: "Undangan tidak tersedia." };

  const parsed = parseMessage({ guestName: form.get("guestName"), message: form.get("message") });
  if (!parsed.ok) return { error: parsed.error };

  await prisma.weddingMessage.create({ data: { invitationId, ...parsed.value } }); // isVisible defaults true
  revalidatePath(`/undangan/${inv.slug}`);
  return { success: true };
}

export async function toggleMessageVisible(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  const isVisible = form.get("__isVisible") === "true";
  if (!id) return;
  await prisma.weddingMessage.update({ where: { id }, data: { isVisible: !isVisible } });
  const slug = await invitationSlug(invitationId);
  revalidatePath(`/admin/wedding-invitations/${invitationId}`);
  if (slug) revalidatePath(`/undangan/${slug}`);
}

export async function deleteMessage(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  if (!id) return;
  await prisma.weddingMessage.delete({ where: { id } });
  const slug = await invitationSlug(invitationId);
  revalidatePath(`/admin/wedding-invitations/${invitationId}`);
  if (slug) revalidatePath(`/undangan/${slug}`);
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run typecheck`

```bash
git add src/lib/wedding/actions.ts
git commit -m "feat(wedding): public rsvp/message submit + admin moderation actions"
```

---

### Task 16: Public RSVP + Guestbook sections

**Files:**
- Create: `.../classic-elegant/sections/Rsvp.tsx` (client)
- Create: `.../classic-elegant/sections/Guestbook.tsx` (client form + server-rendered list wrapper)
- Modify: `.../classic-elegant/index.tsx` (compose, gated by toggles)

**Interfaces:**
- Consumes: `submitRsvp`, `submitMessage` (Task 15); `ATTENDANCE` (Task 2); `PublicInvitation` (`messages` for the list). 
- Produces: `Rsvp({ invitationId, defaultName })`, `Guestbook({ invitationId, messages })`.

- [ ] **Step 1: Rsvp (client)**

Create `Rsvp.tsx`. `useActionState(submitRsvp)`. Hidden `invitationId`. Fields: `guestName` (default `defaultName ?? ""`), `attendanceStatus` (select from `ATTENDANCE` with Indonesian labels: attending→"Hadir", not_attending→"Tidak hadir", maybe→"Mungkin"), `guestCount` (number, min 1 max 20, default 1), `message` (textarea). On `state?.success`, replace the form with a centered "Terima kasih atas konfirmasinya 🤍". Style with the `var(--w-*)` palette (not studio tokens).

- [ ] **Step 2: Guestbook (client)**

Create `Guestbook.tsx`. `useActionState(submitMessage)`. Hidden `invitationId`. Fields: `guestName`, `message`. On success, show a small "Ucapan terkirim 🤍" note above the form (the new message appears in the list after revalidation). Below the form, render the `messages` list (each: `guestName` in display font + `message` + relative/formatted date). Empty state: "Jadilah yang pertama memberi ucapan."

- [ ] **Step 3: Compose in the template**

In `.../classic-elegant/index.tsx`, add imports and place (after Gift, before Closing), gated by toggles:

```tsx
import Rsvp from "./sections/Rsvp";
import Guestbook from "./sections/Guestbook";
// inside <main>, before <Closing/>:
      {invitation.isRsvpEnabled ? <Rsvp invitationId={invitation.id} defaultName={guestName} /> : null}
      {invitation.isGuestbookEnabled ? <Guestbook invitationId={invitation.id} messages={invitation.messages} /> : null}
```

- [ ] **Step 4: Verify + commit**

Run: `npm run dev`, open `/undangan/rizky-dinda`. Submit an RSVP → success state; submit a guestbook message → it appears in the list. Toggle `isRsvpEnabled` off in admin Settings → the RSVP section disappears on public.
Run: `npm run typecheck && npm run lint`

```bash
git add src/components/wedding
git commit -m "feat(wedding): public RSVP + guestbook sections"
```

---

### Task 17: Admin RSVPs + Guestbook tabs

**Files:**
- Modify: `src/app/admin/(dashboard)/wedding-invitations/[id]/page.tsx` (replace the `rsvps` + `guestbook` placeholders)

**Interfaces:**
- Consumes: `record.rsvps`, `record.messages` (Task 3); `toggleMessageVisible`, `deleteMessage` (Task 15).
- Produces: read-only RSVPs table + moderated Guestbook list.

- [ ] **Step 1: RSVPs tab (read-only)**

Replace the `rsvps` placeholder with a table over `record.rsvps`: columns guestName, attendanceStatus, guestCount, message, date. Add a small summary line above (counts by status computed inline). No actions.

- [ ] **Step 2: Guestbook tab (moderation)**

Replace the `guestbook` placeholder with a list over `record.messages`: each shows guestName, message, date, a visibility state, a `toggleMessageVisible` form (hidden `__id`, `__invitationId`, `__isVisible`) with button "Hide"/"Show", and a `deleteMessage` form. Reuse the studio table/row styling.

```tsx
tab === "rsvps" ? (
  record.rsvps.length === 0 ? <p className="text-ink-soft text-sm">No RSVPs yet.</p> : (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="text-ink-soft border-line border-b font-mono text-[11px] tracking-[0.1em] uppercase">
          <tr><th className="px-4 py-2.5 font-medium">Name</th><th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 font-medium">Guests</th><th className="px-4 py-2.5 font-medium">Message</th><th className="px-4 py-2.5 font-medium">Date</th></tr>
        </thead>
        <tbody>
          {record.rsvps.map((r) => (
            <tr key={r.id} className="border-line border-t align-top">
              <td className="text-ink px-4 py-3">{r.guestName}</td>
              <td className="text-ink-soft px-4 py-3">{r.attendanceStatus}</td>
              <td className="text-ink-soft px-4 py-3">{r.guestCount}</td>
              <td className="text-ink-soft px-4 py-3">{r.message ?? "—"}</td>
              <td className="text-ink-soft px-4 py-3">{new Date(r.createdAt).toLocaleDateString("id-ID")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
) : tab === "guestbook" ? (
  record.messages.length === 0 ? <p className="text-ink-soft text-sm">No messages yet.</p> : (
    <ul className="flex flex-col gap-3">
      {record.messages.map((m) => (
        <li key={m.id} className="border-line flex items-start justify-between gap-4 rounded-lg border p-4">
          <div className={m.isVisible ? "" : "opacity-50"}>
            <p className="text-ink text-sm font-medium">{m.guestName}</p>
            <p className="text-ink-soft mt-1 text-sm">{m.message}</p>
            <p className="text-ink-soft mt-1 text-[11px]">{new Date(m.createdAt).toLocaleDateString("id-ID")} · {m.isVisible ? "Visible" : "Hidden"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <form action={toggleMessageVisible}>
              <input type="hidden" name="__id" value={m.id} />
              <input type="hidden" name="__invitationId" value={id} />
              <input type="hidden" name="__isVisible" value={String(m.isVisible)} />
              <button type="submit" className="text-ink-soft hover:text-ink text-xs">{m.isVisible ? "Hide" : "Show"}</button>
            </form>
            <form action={deleteMessage}>
              <input type="hidden" name="__id" value={m.id} />
              <input type="hidden" name="__invitationId" value={id} />
              <button type="submit" className="text-danger/75 hover:text-danger text-xs">Delete</button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  )
) : (
  <p className="text-ink-soft text-sm">This tab ships in a later phase.</p>
)
```

(The trailing `else` placeholder can now be removed since all eight tabs are implemented.)

- [ ] **Step 3: Full verification pass**

Run: `npm run dev` and walk the acceptance criteria:
- Create an invitation, fill couple/events/settings, publish.
- Open `/undangan/<slug>` and `?to=Bapak%20Andi`.
- Submit an RSVP + a message → confirm both show in the admin RSVPs and Guestbook tabs.
- Hide a message → it disappears from the public list. Delete it.
- Mobile viewport check on the public page.

Run: `npm run typecheck && npm run lint && npm run check`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(dashboard)/wedding-invitations/[id]/page.tsx"
git commit -m "feat(wedding): admin RSVPs + guestbook moderation tabs"
```

---

## Self-review

**Spec coverage:**
- Models (WeddingInvitation + all children incl. WeddingGuest) → Task 1. ✓
- Validation/sanitize/slug/url → Tasks 2, 9, 13, 15. ✓
- Queries → Task 3. Seed → Task 4. ✓
- Public route + middleware + locale-free → Task 5. Template registry + theming + fonts → Tasks 5–6. ✓
- All 10 template sections: Cover/Countdown/Gift/CopyButton (Task 8), Couple/Events/LoveStory/Gallery/Closing (Task 7), RSVP/Guestbook (Task 16). ✓
- Admin list + actions (edit/preview/copy-link/publish) → Task 10. Note: "Copy link" is covered by the "Preview" link + the browser; an explicit copy-to-clipboard button was not added to keep the list server-rendered. **Deviation flagged** — add a small client CopyLink button in Task 10 if desired.
- Create page → Task 11. Editor + Main/Couple/Settings → Task 12. Child editors → Tasks 13–14. RSVP/Guestbook admin → Task 17. ✓
- WeddingGuest: schema only (Task 1), no UI — matches spec §12. `?to=` reads query string (Task 5). ✓
- Acceptance criteria verified in Task 17 Step 3. ✓

**Placeholder scan:** The only intentional "later phase" placeholders are transient tab stubs, each explicitly replaced in a named later task (12→14→17). The `afterChildSave` stub in Task 13 is explicitly deleted before commit. No "TBD"/"add error handling" hand-waving remains.

**Type consistency:** `FormState` (parent/child actions) vs `PublicFormState` (public submits) are distinct and used consistently. `PublicInvitation`/`EditInvitation`/`InvitationListItem` come from `queries.ts` and are the prop types across template + admin. `TemplateProps` matches the page's render call. Action names are stable across tasks (`saveInvitation`, `saveEvent`, `saveGalleryItem`, `saveGift`, `submitRsvp`, `submitMessage`, `toggleMessageVisible`, `deleteMessage`). `ImageControl` export added in Task 12 Step 1 and consumed in Tasks 12/14.

**Known small deviations to confirm during execution:**
1. Explicit "Copy link" clipboard button on the list omitted (Preview link covers sharing) — trivially addable.
2. `startTime`/`endTime` stored as `"HH:mm"` strings (spec §4) — the public "WITA" timezone label in Events is hardcoded; make it generic if non-WITA weddings are expected.
