# Services / Layanan CMS Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual "Services" (`/services`, `/id/services`) homepage section and route, backed by the CMS, with admin-editable pricing packages (text, price, features, benefits, and an uploaded photo).

**Architecture:** Extend the existing `Service` Prisma model with pricing fields; ride the existing config-driven admin CRUD (`resources.ts` + `ResourceForm.tsx`) by adding one new `"image"` field type backed by a new local-filesystem upload API route; add a shared `ServiceGrid`/`ServiceCard` server component that queries Prisma directly and is used both on the homepage and on the new `/services` page — this is the first feature where the public site actually reads from the database.

**Tech Stack:** Next.js 15 App Router, TypeScript, Prisma + MySQL, next-intl, Tailwind CSS v4, no test framework (this repo verifies logic with plain `assert`-based check scripts run via `npm run check`, and UI by hand in the browser).

## Global Constraints

- No new npm dependencies (native `request.formData()` for uploads, no shadcn/lucide/cloud storage — see spec at `docs/superpowers/specs/2026-08-19-services-cms-design.md`).
- Image uploads write to `public/uploads/` (local filesystem) — confirmed acceptable for this project's hosting; `ponytail:`-flagged ceiling if it ever moves to serverless hosting.
- Bilingual columns use `_en`/`_id` suffixes; sortable content has an `order: Int` column — match existing `Service` conventions exactly.
- No shadcn/ui, no lucide-react, no `next/image` — this codebase hand-rolls `components/ui` with `clsx` and plain `<img>`. Match that, not the shadcn reference component's styling.
- `/services` route only (EN unprefixed, ID at `/id/services`) — no separate `/layanan` slug (would need a `next-intl` `pathnames` config that doesn't exist).
- `npm run typecheck` fails if `id.json` is missing any key `en.json` has (`src/i18n/messages/parity.ts`) — always add both.

---

### Task 1: Extend `Service` Prisma model and migrate

**Files:**
- Modify: `prisma/schema.prisma:40-50`

**Interfaces:**
- Produces: `Service` model gains `priceLabel: String`, `features_en: Json`, `features_id: Json`, `benefits_en: Json`, `benefits_id: Json`, `image: String?`. Consumed by Task 2 (seed), Task 3 (admin resource fields), Task 7 (`ServiceGrid`).

- [ ] **Step 1: Edit the `Service` model**

Replace lines 40-50 of `prisma/schema.prisma`:

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

- [ ] **Step 2: Generate and apply the migration**

Run: `npm run db:migrate -- --name add_service_pricing_fields`

Expected: Prisma prints `Your database is now in sync with your schema.` and a new
folder appears under `prisma/migrations/` (e.g.
`prisma/migrations/<timestamp>_add_service_pricing_fields/migration.sql`) containing
`ALTER TABLE Service ADD COLUMN ...` statements for the 6 new columns. This also
regenerates `@prisma/client`, so `prisma.service` rows will now type-include the new
fields everywhere in the app.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): add pricing fields to Service model"
```

---

### Task 2: Replace `Service` seed data with the 5 pricing packages

**Files:**
- Modify: `prisma/seed.ts:44-59`

**Interfaces:**
- Consumes: `Service` model fields from Task 1.
- Produces: 5 seeded `Service` rows (Wedding Invitation, Landing Page, Company
  Profile/E-Commerce, ERP/E-Learning, Custom Web App/System). Consumed by Task 7+
  (public rendering) and Task 3's admin table (existing generic CRUD, no code
  change needed there).

- [ ] **Step 1: Replace the `service.createMany` block**

The 4 old placeholder rows (`Web Development`, `Brand Identity`, `Motion Design`,
`3D & WebGL`) are never rendered anywhere in the current codebase — replace them
outright rather than appending to them, so `Service` doesn't end up mixing
placeholder and real content.

Replace lines 44-59 of `prisma/seed.ts` (the `await prisma.service.createMany(...)`
block) with:

```ts
  await prisma.service.deleteMany({});
  await prisma.service.createMany({
    data: [
      {
        icon: "💍",
        name_en: "Wedding Invitation",
        name_id: "Undangan Pernikahan",
        description_en: "An elegant digital invitation that's easy to share with every guest.",
        description_id: "Undangan digital yang elegan dan mudah dibagikan ke semua tamu.",
        priceLabel: "Rp300.000 – Rp1.000.000",
        features_en: [
          "Custom names & couple details",
          "Wedding countdown",
          "Photo gallery",
          "Google Maps location",
          "Online RSVP",
          "Love story",
          "Background music",
          "Guest wishes",
          "Custom domain (optional)",
        ],
        features_id: [
          "Custom nama & pasangan",
          "Countdown pernikahan",
          "Galeri foto",
          "Lokasi Google Maps",
          "RSVP online",
          "Love story",
          "Musik latar",
          "Ucapan tamu",
          "Domain custom (opsional)",
        ],
        benefits_en: [
          "Cheaper than printed invitations",
          "Easy to share via WhatsApp & Instagram",
          "Professional look",
          "Accessible 24/7",
        ],
        benefits_id: [
          "Hemat biaya dibanding undangan cetak",
          "Mudah dibagikan lewat WhatsApp & Instagram",
          "Tampilan profesional",
          "Bisa diakses 24 jam",
        ],
        order: 0,
      },
      {
        icon: "🚀",
        name_en: "Landing Page",
        name_id: "Landing Page",
        description_en: "A single focused page to promote your product or service.",
        description_id: "Satu halaman fokus untuk mempromosikan produk atau jasa Anda.",
        priceLabel: "Rp1.500.000 – Rp4.000.000",
        features_en: [
          "1 professional page",
          "Fully responsive",
          "WhatsApp CTA button",
          "Contact form",
          "Google Maps",
          "Basic SEO",
          "Social media integration",
        ],
        features_id: [
          "1 halaman profesional",
          "Responsive di semua perangkat",
          "Tombol CTA WhatsApp",
          "Form kontak",
          "Google Maps",
          "SEO dasar",
          "Integrasi media sosial",
        ],
        benefits_en: [
          "Boosts business credibility",
          "Great for promoting products/services",
          "Helps generate new leads",
        ],
        benefits_id: [
          "Meningkatkan kredibilitas bisnis",
          "Cocok untuk promosi produk/jasa",
          "Membantu mendapatkan leads baru",
        ],
        order: 1,
      },
      {
        icon: "🏢",
        name_en: "Company Profile / E-Commerce",
        name_id: "Company Profile / E-Commerce",
        description_en: "A complete company website, expandable into a full online store.",
        description_id: "Website perusahaan lengkap, bisa dikembangkan jadi toko online.",
        priceLabel: "Rp4.000.000 – Rp12.000.000+",
        features_en: [
          "Company profile",
          "Services/products page",
          "Catalog",
          "Admin panel",
          "Articles/blog",
          "Contact & WhatsApp",
          "Basic SEO",
          "E-commerce option: cart, checkout, payment, product management",
        ],
        features_id: [
          "Profil perusahaan",
          "Halaman layanan/produk",
          "Katalog",
          "Admin panel",
          "Artikel/blog",
          "Kontak & WhatsApp",
          "SEO dasar",
          "Opsi e-commerce: keranjang, checkout, pembayaran, manajemen produk",
        ],
        benefits_en: [
          "Boosts company professionalism",
          "Expands market reach",
          "Business info available 24/7",
          "Products can be sold online",
        ],
        benefits_id: [
          "Profesionalitas perusahaan meningkat",
          "Memperluas pasar",
          "Info bisnis tersedia 24 jam",
          "Produk bisa dijual online",
        ],
        order: 2,
      },
      {
        icon: "🎓",
        name_en: "ERP / E-Learning System",
        name_id: "ERP / Sistem E-Learning",
        description_en: "A multi-user system for managing business operations or learning.",
        description_id: "Sistem multi-user untuk mengelola operasional bisnis atau pembelajaran.",
        priceLabel: "Rp15.000.000 – Rp50.000.000+",
        features_en: [
          "Multi-user login",
          "Dashboard",
          "Roles & permissions",
          "Data management",
          "Reporting",
          "Learning modules",
          "Materials, video, quizzes, exams, grades, certificates",
        ],
        features_id: [
          "Login multi-user",
          "Dashboard",
          "Role & permission",
          "Manajemen data",
          "Laporan",
          "Modul pembelajaran",
          "Materi, video, kuis, ujian, nilai, sertifikat",
        ],
        benefits_en: [
          "Automates business/education processes",
          "Reduces manual work",
          "Centralized data",
          "Easier monitoring",
          "Improved operational efficiency",
        ],
        benefits_id: [
          "Mengotomatisasi proses bisnis/pendidikan",
          "Mengurangi pekerjaan manual",
          "Data lebih terpusat",
          "Monitoring lebih mudah",
          "Efisiensi operasional meningkat",
        ],
        order: 3,
      },
      {
        icon: "⚙️",
        name_en: "Custom Web App / System",
        name_id: "Custom Web Apps / Sistem",
        description_en: "A system built around your specific business workflow.",
        description_id: "Sistem dibangun sesuai alur bisnis spesifik Anda.",
        priceLabel: "Rp10.000.000 – Rp100.000.000+",
        features_en: [
          "Built to your needs: CRM, HRIS, cooperative, inventory, finance, booking",
          "Dashboard",
          "Workflow",
          "API",
          "Third-party integrations",
        ],
        features_id: [
          "Sistem sesuai kebutuhan: CRM, HRIS, koperasi, inventory, keuangan, booking",
          "Dashboard",
          "Workflow",
          "API",
          "Integrasi pihak ketiga",
        ],
        benefits_en: [
          "System matches your business flow",
          "Reduces manual work",
          "Increases productivity",
          "Can be extended as needed",
        ],
        benefits_id: [
          "Sistem sesuai alur bisnis",
          "Mengurangi pekerjaan manual",
          "Meningkatkan produktivitas",
          "Bisa dikembangkan sesuai kebutuhan",
        ],
        order: 4,
      },
    ],
  });
```

Note: this block drops the `skipDuplicates` upsert-style pattern the rest of the
seed file uses, because the shape of `Service` data fundamentally changed (new
required columns) — `deleteMany` + `createMany` guarantees a clean, consistent set
of 5 rows every time the seed runs, instead of accumulating duplicates or leaving
stale generic rows behind.

- [ ] **Step 2: Run the seed script**

Run: `npm run db:seed`

Expected: exits 0, ends with `Seed selesai ✓`. If MySQL isn't reachable, start it
first — `DATABASE_URL` in `.env` points at `mysql://root:@localhost:3306/dwistudio`.

- [ ] **Step 3: Verify row count**

Run: `npx prisma studio` (opens a local DB browser) or:

```bash
npx tsx -e "import { prisma } from './src/lib/prisma'; prisma.service.count().then(n => { console.log(n); process.exit(0); })"
```

Expected: `5`.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(db): seed Service with real pricing packages"
```

---

### Task 3: Admin CMS — `"image"` field type + extend `services` resource

**Files:**
- Modify: `src/lib/admin/resources.ts:1,63-71`
- Modify: `src/lib/admin/resources.check.ts` (append)

**Interfaces:**
- Consumes: `Service` fields from Task 1.
- Produces: `FieldType` includes `"image"`. `getResource("services").fields`
  includes `priceLabel`, `features_en`/`features_id`, `benefits_en`/`benefits_id`,
  `image`. `parseFields` already handles these correctly with zero changes (see
  Step 1 note). Consumed by Task 5 (`ResourceForm`'s new `image` control).

- [ ] **Step 1: Add `"image"` to `FieldType` and extend the `services` resource**

In `src/lib/admin/resources.ts`, change line 1:

```ts
export type FieldType = "text" | "textarea" | "number" | "url" | "list" | "select" | "image";
```

Replace the `services` resource (lines 59-71) with:

```ts
  {
    key: "services",
    label: "Services",
    group: "content",
    fields: [
      ...bilingual("name", "Name", "text"),
      ...bilingual("description", "Description"),
      { name: "icon", label: "Icon (emoji)", type: "text", required: true },
      { name: "priceLabel", label: "Price", type: "text", required: true },
      { name: "features_en", label: "Features (EN, one per line)", type: "list" },
      { name: "features_id", label: "Features (ID, one per line)", type: "list" },
      { name: "benefits_en", label: "Benefits (EN, one per line)", type: "list" },
      { name: "benefits_id", label: "Benefits (ID, one per line)", type: "list" },
      { name: "image", label: "Photo", type: "image" },
      orderField,
    ],
    columns: ["name_en", "priceLabel", "order"],
    orderBy: { order: "asc" },
  },
```

No change is needed in `parseFields`: it only special-cases `"number"`, `"list"`,
and `"select"` — every other type (`text`, `textarea`, `url`, and now `image`)
already falls through to the generic required/optional-string branch, which is
exactly the behavior an `image` field needs (it just stores whatever URL string
`ResourceForm` puts in the hidden input for it — see Task 5).

- [ ] **Step 2: Add a check for the new fields**

Append to the end of `src/lib/admin/resources.check.ts` (before the final
`console.log` line — move the `console.log` to the very end after adding this):

```ts
// 7. Field baru services: list dua-bahasa kepisah, image jadi string opsional.
const services = getResource("services");
assert.ok(services, "resource services harus ada");
const serviceForm = {
  name_en: "Landing Page",
  name_id: "Landing Page",
  description_en: "A focused page.",
  description_id: "Halaman fokus.",
  icon: "🚀",
  priceLabel: "Rp1.500.000 – Rp4.000.000",
  features_en: " 1 page \n\n Responsive \n",
  features_id: "1 halaman\nResponsive",
  benefits_en: "More leads",
  benefits_id: "Leads lebih banyak",
  image: "",
  order: "1",
};
const parsedService = parseFields(services, form(serviceForm));
assert.deepEqual(
  parsedService.features_en,
  ["1 page", "Responsive"],
  "list dua-bahasa dipisah per baris seperti field list lain",
);
assert.equal(parsedService.image, null, "image kosong harus null, bukan string kosong");

const withImage = parseFields(services, form({ ...serviceForm, image: "/uploads/a.jpg" }));
assert.equal(withImage.image, "/uploads/a.jpg", "image terisi disimpan apa adanya");
```

Then move `console.log("parseFields: 6 cek lolos");` to
`console.log("parseFields: 7 cek lolos");` at the very end of the file.

- [ ] **Step 3: Run the check**

Run: `npm run check`

Expected: prints `parseFields: 7 cek lolos` with no assertion errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/admin/resources.ts src/lib/admin/resources.check.ts
git commit -m "feat(admin): add image field type and pricing fields to services resource"
```

---

### Task 4: Image upload backend (validation module + API route)

**Files:**
- Create: `src/lib/admin/upload.ts`
- Create: `src/lib/admin/upload.check.ts`
- Create: `src/app/api/admin/upload/route.ts`
- Modify: `package.json:17` (the `check` script)

**Interfaces:**
- Produces: `MAX_UPLOAD_BYTES: number`, `randomUploadName(mimeType: string): string | null`
  from `src/lib/admin/upload.ts`. `POST /api/admin/upload` — multipart body with a
  `file` field; `200 { url: string }` on success, `400 { error: string }` on bad
  input, `401 { error: string }` if unauthenticated. Consumed by Task 5
  (`ResourceForm`'s image control calls this route).

- [ ] **Step 1: Write the failing check for the validation module**

Create `src/lib/admin/upload.check.ts`:

```ts
/**
 * Cek untuk validasi upload gambar — batas kepercayaan: ekstensi file yang
 * ditulis ke disk berasal dari whitelist MIME type, bukan dari nama file yang
 * dikirim klien, supaya klien tidak bisa menulis file dengan ekstensi sembarang.
 *
 * Jalankan: npm run check
 */
import assert from "node:assert/strict";
import { MAX_UPLOAD_BYTES, randomUploadName } from "./upload";

// 1. MIME type yang didukung menghasilkan nama file dengan ekstensi yang benar.
const jpgName = randomUploadName("image/jpeg");
assert.ok(jpgName?.endsWith(".jpg"), "image/jpeg harus jadi .jpg");
assert.match(jpgName!, /^[0-9a-f-]+\.jpg$/, "nama file harus uuid + ekstensi, tanpa input klien");

assert.ok(randomUploadName("image/png")?.endsWith(".png"));
assert.ok(randomUploadName("image/webp")?.endsWith(".webp"));

// 2. MIME type di luar whitelist ditolak (mis. text/html yang menyamar jadi upload).
assert.equal(randomUploadName("text/html"), null, "MIME type tak dikenal harus ditolak");
assert.equal(randomUploadName("application/octet-stream"), null);

// 3. Dua panggilan tidak pernah menghasilkan nama yang sama (uuid v4).
assert.notEqual(randomUploadName("image/png"), randomUploadName("image/png"));

// 4. Batas ukuran wajar untuk foto profil/kartu, bukan file besar sembarang.
assert.equal(MAX_UPLOAD_BYTES, 5 * 1024 * 1024, "batas 5MB");

console.log("upload: 5 cek lolos");
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx tsx src/lib/admin/upload.check.ts`
Expected: fails with a module-not-found error for `./upload` (the file doesn't exist yet).

- [ ] **Step 3: Implement the validation module**

Create `src/lib/admin/upload.ts`:

```ts
import { randomUUID } from "node:crypto";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Ekstensi berasal dari whitelist MIME type yang divalidasi, bukan dari nama
 * file yang dikirim klien — supaya nama file hasil upload tidak pernah bisa
 * dikontrol klien (mencegah penulisan file dengan ekstensi sembarang).
 */
export function randomUploadName(mimeType: string): string | null {
  const ext = ALLOWED_TYPES[mimeType];
  return ext ? `${randomUUID()}.${ext}` : null;
}
```

- [ ] **Step 4: Run it to confirm it passes**

Run: `npx tsx src/lib/admin/upload.check.ts`
Expected: prints `upload: 5 cek lolos`.

- [ ] **Step 5: Wire it into the `check` npm script**

In `package.json`, change line 17 from:

```json
    "check": "tsx src/lib/admin/resources.check.ts"
```

to:

```json
    "check": "tsx src/lib/admin/resources.check.ts && tsx src/lib/admin/upload.check.ts"
```

- [ ] **Step 6: Write the upload API route**

Create `src/app/api/admin/upload/route.ts`:

```ts
import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, randomUploadName } from "@/lib/admin/upload";

/**
 * Sama seperti server action lain di CMS: memeriksa sesi sendiri, bukan
 * cuma mengandalkan penjagaan layout admin (lihat lib/admin/actions.ts).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 400 });
  }

  const filename = randomUploadName(file.type);
  if (!filename) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
```

- [ ] **Step 7: Run the full check + typecheck**

Run: `npm run check && npm run typecheck`
Expected: both exit 0; `check` now prints both the 7-check and 5-check lines.

- [ ] **Step 8: Commit**

```bash
git add src/lib/admin/upload.ts src/lib/admin/upload.check.ts src/app/api/admin/upload/route.ts package.json
git commit -m "feat(admin): add local image upload API route"
```

---

### Task 5: `ResourceForm` — image upload UI control

**Files:**
- Modify: `src/components/admin/ResourceForm.tsx`

**Interfaces:**
- Consumes: `POST /api/admin/upload` from Task 4 (`{ url }` on success, `{ error }`
  on failure). `field.type === "image"` from Task 3.
- Produces: an `image`-type field renders a file-upload control that still submits
  as a plain string form field (`name={field.name}`), so `saveRecord` in
  `actions.ts` needs no changes.

- [ ] **Step 1: Add `useState` to the imports**

In `src/components/admin/ResourceForm.tsx`, change line 3 from:

```ts
import { useActionState } from "react";
```

to:

```ts
import { useActionState, useState, type ChangeEvent } from "react";
```

- [ ] **Step 2: Add the `ImageControl` component**

Insert this new function after `Control` (after line 52, before the
`ResourceForm` export) in `src/components/admin/ResourceForm.tsx`:

```tsx
function ImageControl({ field, record }: { field: Field; record?: Record<string, unknown> | null }) {
  const initial = typeof record?.[field.name] === "string" ? (record[field.name] as string) : "";
  const [url, setUrl] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };

    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    setUrl(data.url ?? "");
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={field.name} value={url} readOnly />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase (local public/ URLs only)
        <img src={url} alt="" className="border-graphite/60 h-32 w-32 border object-cover" />
      ) : (
        <div className="border-graphite/60 text-graphite flex h-32 w-32 items-center justify-center border border-dashed text-[10px] uppercase">
          No image
        </div>
      )}
      <input type="file" accept="image/*" onChange={onFileChange} className={INPUT} />
      {uploading ? <p className="text-ash text-xs">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Branch to it from `Control`**

In `Control`, add this branch right after the `select` branch (after the closing
`}` of the `if (field.type === "select")` block, before the `textarea`/`list`
check):

```tsx
  if (field.type === "image") {
    return <ImageControl field={field} record={record} />;
  }
```

- [ ] **Step 4: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both exit 0.

- [ ] **Step 5: Manual verification in the browser**

Run: `npm run dev`, sign in at `http://localhost:3000/admin/login` with
`ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env`, open `/admin/services`, click "New
entry" (or edit an existing package), and in the "Photo" field choose an image
file.
Expected: a thumbnail preview appears, and after saving, `public/uploads/`
contains the new file and the record's `image` column holds `/uploads/<name>`
(check via `npx prisma studio`).

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/ResourceForm.tsx
git commit -m "feat(admin): add image upload control to ResourceForm"
```

---

### Task 6: i18n — `services` namespace + nav entry

**Files:**
- Modify: `src/i18n/messages/en.json`
- Modify: `src/i18n/messages/id.json`
- Modify: `src/lib/nav.ts`

**Interfaces:**
- Produces: `services.{eyebrow,title,lead,priceFrom,inquire}` and `nav.services`
  message keys in both locales; `NAV` includes a `services` entry. Consumed by
  Task 7 (`ServiceGrid`/`ServiceCard` labels), Task 8 (`/services` page), Task 9
  (homepage section), and `MorphMenu.tsx` (already reads `NAV` + `nav.*` — no
  change needed there).

- [ ] **Step 1: Add `nav.services` and the `services` namespace to `en.json`**

In `src/i18n/messages/en.json`, change the `nav` block (lines 6-11) to:

```json
  "nav": {
    "about": "About",
    "projects": "Projects",
    "services": "Services",
    "contact": "Contact",
    "getInTouch": "Get in touch"
  },
```

Add a new `services` block right after the `contact` block (after line 63, before
`"contactForm": {`):

```json
  "services": {
    "eyebrow": "Services",
    "title": "Packages & pricing.",
    "lead": "Five ways to work together, from a wedding invitation to a fully custom system.",
    "priceFrom": "Starting from",
    "inquire": "Start a project"
  },
```

- [ ] **Step 2: Mirror both additions in `id.json`**

In `src/i18n/messages/id.json`, change the `nav` block (lines 6-11) to:

```json
  "nav": {
    "about": "Tentang",
    "projects": "Proyek",
    "services": "Layanan",
    "contact": "Kontak",
    "getInTouch": "Hubungi saya"
  },
```

Add a new `services` block right after the `contact` block (after line 63, before
`"contactForm": {`):

```json
  "services": {
    "eyebrow": "Layanan",
    "title": "Paket & harga.",
    "lead": "Lima cara bekerja sama, mulai dari undangan pernikahan sampai sistem custom.",
    "priceFrom": "Mulai dari",
    "inquire": "Mulai proyek"
  },
```

- [ ] **Step 3: Add the nav entry**

Replace `src/lib/nav.ts` entirely:

```ts
/** Item navigasi utama. Sumbernya pindah ke model NavigationItem di Fase 7. */
export const NAV = [
  { key: "about", href: "/about" },
  { key: "projects", href: "/projects" },
  { key: "services", href: "/services" },
  { key: "contact", href: "/contact" },
] as const;
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: exits 0 (this is exactly the parity check `messages/parity.ts` guards —
it would fail here if `id.json` were missing a key `en.json` has).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/messages/en.json src/i18n/messages/id.json src/lib/nav.ts
git commit -m "feat(i18n): add services namespace and nav entry"
```

---

### Task 7: `ServiceCard` + `ServiceGrid` components

**Files:**
- Create: `src/components/sections/ServiceCard.tsx`
- Create: `src/components/sections/ServiceGrid.tsx`

**Interfaces:**
- Consumes: `Service` Prisma model (Task 1), seeded rows (Task 2), `prisma` client
  singleton from `src/lib/prisma.ts`, `Reveal` from `src/components/animations/Reveal.tsx`,
  `Link` from `src/i18n/navigation`.
- Produces: `ServiceCard` (default export, props `{ service: ServiceView }`) and
  `ServiceView` type. `ServiceGrid` (default export, async server component, props
  `{ locale: string; priceFromLabel: string; inquireLabel: string }`) — renders
  `null` if there are no services, otherwise a grid of `ServiceCard`s wrapped in
  `Reveal`. Consumed by Task 8 (`/services` page) and Task 9 (homepage section).

- [ ] **Step 1: Create `ServiceCard`**

Create `src/components/sections/ServiceCard.tsx`:

```tsx
import { Link } from "@/i18n/navigation";

export type ServiceView = {
  id: string;
  icon: string;
  name: string;
  description: string;
  priceLabel: string;
  priceFromLabel: string;
  features: string[];
  benefits: string[];
  image: string | null;
  inquireLabel: string;
};

export default function ServiceCard({ service }: { service: ServiceView }) {
  return (
    <article className="bg-ink flex flex-col p-6 md:p-8">
      <div className="border-graphite/60 relative mb-6 aspect-[4/3] w-full overflow-hidden border">
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
          <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
        ) : (
          <div className="bg-ink-raised flex h-full w-full items-center justify-center text-4xl">
            {service.icon}
          </div>
        )}
        <p className="bg-paper text-ink absolute top-0 left-0 px-3 py-1.5 text-sm">
          {service.icon}
        </p>
      </div>

      <h3 className="font-display text-xl leading-tight font-extrabold tracking-[-0.02em] md:text-2xl">
        {service.name}
      </h3>
      <p className="text-silver mt-2 text-sm leading-[1.6]">{service.description}</p>
      <p className="text-paper mt-4 text-sm font-semibold">
        {service.priceFromLabel} {service.priceLabel}
      </p>

      {service.features.length > 0 ? (
        <ul className="text-ash mt-4 flex flex-col gap-1.5 text-xs leading-relaxed">
          {service.features.map((feature) => (
            <li key={feature}>— {feature}</li>
          ))}
        </ul>
      ) : null}

      {service.benefits.length > 0 ? (
        <ul className="text-ash border-graphite/40 mt-4 flex flex-col gap-1.5 border-t pt-4 text-xs leading-relaxed">
          {service.benefits.map((benefit) => (
            <li key={benefit}>✓ {benefit}</li>
          ))}
        </ul>
      ) : null}

      <Link
        href="/contact"
        className="group border-graphite/60 hover:border-paper mt-6 inline-flex w-fit items-center gap-3 border px-4 py-2.5 text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
      >
        {service.inquireLabel}
        <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3">
          <path
            d="M1 8h13M9 3l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </article>
  );
}
```

- [ ] **Step 2: Create `ServiceGrid`**

Create `src/components/sections/ServiceGrid.tsx`:

```tsx
import "server-only";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/animations/Reveal";
import ServiceCard, { type ServiceView } from "./ServiceCard";

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export default async function ServiceGrid({
  locale,
  priceFromLabel,
  inquireLabel,
}: {
  locale: string;
  priceFromLabel: string;
  inquireLabel: string;
}) {
  const rows = await prisma.service.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) return null;

  const services: ServiceView[] = rows.map((row) => ({
    id: row.id,
    icon: row.icon,
    name: locale === "id" ? row.name_id : row.name_en,
    description: locale === "id" ? row.description_id : row.description_en,
    priceLabel: row.priceLabel,
    priceFromLabel,
    features: toStringArray(locale === "id" ? row.features_id : row.features_en),
    benefits: toStringArray(locale === "id" ? row.benefits_id : row.benefits_en),
    image: row.image,
    inquireLabel,
  }));

  return (
    <Reveal>
      <div className="border-graphite/40 bg-graphite/40 grid gap-px border sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: exits 0. (Both files are new and unused by anything yet, so this only
checks they compile in isolation — Tasks 8-9 wire them in.)

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ServiceCard.tsx src/components/sections/ServiceGrid.tsx
git commit -m "feat(services): add ServiceCard and ServiceGrid components"
```

---

### Task 8: `/services` route page

**Files:**
- Create: `src/app/[locale]/services/page.tsx`

**Interfaces:**
- Consumes: `ServiceGrid` (Task 7), `PageHeader`/`Container` from `src/components/ui`,
  `alternates` from `src/lib/seo.ts`, `services.*` messages (Task 6). Follows the
  exact shape of `src/app/[locale]/about/page.tsx`.
- Produces: working `/services` (EN) and `/id/services` (ID) routes.

- [ ] **Step 1: Create the page**

Create `src/app/[locale]/services/page.tsx`:

```tsx
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { alternates } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import Container from "@/components/ui/Container";
import ServiceGrid from "@/components/sections/ServiceGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });

  return {
    title: t("title"),
    description: t("lead"),
    alternates: alternates(locale, "/services"),
  };
}

export default function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("services");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <Container className="pb-24 md:pb-36">
        <ServiceGrid locale={locale} priceFromLabel={t("priceFrom")} inquireLabel={t("inquire")} />
      </Container>
    </>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 3: Manual verification in the browser**

Run: `npm run dev`, visit `http://localhost:3000/services` and
`http://localhost:3000/id/services`.
Expected: page header shows the EN/ID copy from Task 6, and a grid of 5 pricing
cards renders below it with correct language per locale, correct price, features,
and benefits.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/services/page.tsx
git commit -m "feat(services): add /services route page"
```

---

### Task 9: Wire `ServiceGrid` into the homepage

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `ServiceGrid` (Task 7), `services.*` messages (Task 6).
- Produces: a new "Services" section on the homepage, between the existing
  "mediums" section and the closing CTA section.

- [ ] **Step 1: Import `ServiceGrid` and add the `services` translations hook**

In `src/app/[locale]/page.tsx`, add to the imports (after the `MEDIUMS` import on
line 10):

```ts
import ServiceGrid from "@/components/sections/ServiceGrid";
```

Add a new translations hook after line 19 (`const cta = useTranslations("cta");`):

```ts
  const services = useTranslations("services");
```

- [ ] **Step 2: Insert the new section**

Insert this new `<Section>` between the closing `</Section>` of the "mediums"
block (line 100) and the opening `<Section>` of the CTA block (line 102):

```tsx
        <Section id="services" className="border-graphite/40 border-t">
          <Container>
            <p className="text-ash mb-14 text-[11px] font-semibold tracking-[0.3em] uppercase md:mb-20">
              {services("eyebrow")}
            </p>
            <ServiceGrid
              locale={locale}
              priceFromLabel={services("priceFrom")}
              inquireLabel={services("inquire")}
            />
          </Container>
        </Section>
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 4: Manual verification in the browser**

Run: `npm run dev`, visit `http://localhost:3000/` and `http://localhost:3000/id`.
Expected: scrolling past the "mediums" index section reveals the new Services
section with the same 5-card grid, correct locale, and the fade/rise-in animation
on scroll (same as the mediums list).

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat(home): add services section to homepage"
```

---

### Task 10: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck, lint, and check**

Run: `npm run typecheck && npm run lint && npm run check`
Expected: all three exit 0.

- [ ] **Step 2: Full manual walkthrough**

Run: `npm run dev` and check, in a browser:
1. `/` and `/id` — Services section appears with correct copy per locale, hover
   states work on the "Start a project" links, cards show the seeded photos or
   the emoji-icon placeholder when no photo is uploaded yet.
2. `/services` and `/id/services` — same grid, full page.
3. Header menu (hamburger) — "Services"/"Layanan" appears in the nav list between
   Projects and Contact, links to the right locale-prefixed URL.
4. `/admin/services` — table shows all 5 packages with price in the list; editing
   one and re-uploading a photo replaces the preview and persists after save.

- [ ] **Step 3: Report any gaps found**

If anything above fails, fix it in the relevant task's files (not a new task) and
re-run that task's verification step before continuing.
