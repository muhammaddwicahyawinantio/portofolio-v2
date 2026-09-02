export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "url"
  | "list"
  | "select"
  | "image"
  /** Unggahan non-gambar (PDF CV) — dirender FileControl, bukan pratinjau <img>. */
  | "file"
  | "boolean"
  | "gallery";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  /** Hanya untuk type "file": nilai atribut accept pada <input type="file">. */
  accept?: string;
  /** Hanya untuk type "image": tolak video (mis. QR code — harus gambar). */
  imageOnly?: boolean;
};

export type Resource = {
  key: string; // segmen URL
  label: string;
  group: "content" | "settings";
  fields: Field[];
  columns: string[]; // kolom yang tampil di tabel
  orderBy: Record<string, "asc" | "desc">;
  singleton?: boolean; // satu baris, di-upsert (FooterContent)
  readOnly?: boolean; // hanya baca + hapus (Message)
};

const bilingual = (base: string, label: string, type: FieldType = "textarea"): Field[] => [
  { name: `${base}_en`, label: `${label} (EN)`, type, required: true },
  { name: `${base}_id`, label: `${label} (ID)`, type, required: true },
];

const orderField: Field = { name: "order", label: "Order", type: "number" };

export const RESOURCES: Resource[] = [
  {
    key: "hero",
    label: "Hero Section",
    group: "content",
    singleton: true,
    fields: [
      { name: "backgroundImage", label: "Background Image", type: "image" },
      // Textarea, dan itu disengaja: satu baris teks = satu baris judul di
      // hero. Baris pertama tegak, sisanya italic (lihat Hero.tsx).
      ...bilingual("headline", "Headline"),
      // Empat field di bawah TIDAK lewat bilingual(): helper itu selalu
      // menyetel required, dan hero tetap harus tampil walau CTA dikosongkan.
      { name: "subheadline_en", label: "Subheadline (EN)", type: "text" },
      { name: "subheadline_id", label: "Subheadline (ID)", type: "text" },
      { name: "paragraph_en", label: "Paragraph (EN)", type: "textarea" },
      { name: "paragraph_id", label: "Paragraph (ID)", type: "textarea" },
      { name: "metrics_en", label: "Social Proof / Mini Metrics (EN, one per line)", type: "list" },
      { name: "metrics_id", label: "Social Proof / Mini Metrics (ID, one per line)", type: "list" },
      { name: "ctaText_en", label: "Proposal Button Text (EN)", type: "text" },
      { name: "ctaText_id", label: "Proposal Button Text (ID)", type: "text" },
      // Dua berkas terpisah, bukan satu: tombol CTA hero menampilkan pemilih
      // bahasa dulu, lalu membuka pratinjau proposal PDF sesuai pilihan —
      // lihat Hero.tsx (ProposalButton) dan route upload (cap 10MB PDF).
      { name: "proposalPdf_id", label: "Proposal PDF — Indonesia (maks 10MB)", type: "file", accept: "application/pdf" },
      { name: "proposalPdf_en", label: "Proposal PDF — English (maks 10MB)", type: "file", accept: "application/pdf" },
    ],
    columns: ["headline_en"],
    orderBy: { id: "asc" },
  },
  {
    key: "projects",
    label: "Projects",
    group: "content",
    fields: [
      ...bilingual("title", "Title", "text"),
      { name: "slug", label: "Slug", type: "text", required: true },
      ...bilingual("description", "Description"),
      ...bilingual("caseStudy", "Case Study Details"),
      { name: "category", label: "Category", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "year", label: "Year", type: "text", required: true },
      { name: "client", label: "Client", type: "text" },
      { name: "link", label: "Link", type: "url" },
      { name: "coverImage", label: "Cover Image (Image/Video)", type: "image" },
      { name: "images", label: "Project Media (Images/Videos)", type: "gallery" },
      { name: "featured", label: "Feature on Homepage", type: "boolean" },
      { name: "archived", label: "Archive Project", type: "boolean" },
      orderField,
    ],
    columns: ["title_en", "category", "featured", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "about",
    label: "About",
    group: "content",
    singleton: true,
    fields: [
      ...bilingual("title", "Title", "text"),
      { name: "location", label: "Location", type: "text", required: true },
      ...bilingual("status", "Status", "text"),
      ...bilingual("shortDescription", "Short Description"),
      ...bilingual("motto", "Motto"),
      { name: "cvFile", label: "CV / Resume (PDF)", type: "file", accept: "application/pdf" },
      ...bilingual("fullStory", "Full Story Biography"),
      { name: "images", label: "Portrait Photos (5)", type: "gallery" },
    ],
    columns: ["title_en", "location"],
    orderBy: { id: "asc" },
  },
  {
    key: "work-experience",
    label: "Work Experience",
    group: "content",
    fields: [
      { name: "company", label: "Company", type: "text", required: true },
      ...bilingual("role", "Role", "text"),
      { name: "period", label: "Period", type: "text", required: true },
      orderField,
    ],
    columns: ["company", "role_en", "period", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "education",
    label: "Education",
    group: "content",
    fields: [
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "period", label: "Period", type: "text", required: true },
      orderField,
    ],
    columns: ["institution", "period", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "skills",
    label: "Skills",
    group: "content",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "icon", label: "Icon Image", type: "image" },
      orderField,
    ],
    columns: ["title", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "certifications",
    label: "Certifications",
    group: "content",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "image", label: "Image", type: "image" },
      orderField,
    ],
    columns: ["name", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "features",
    label: "Features",
    group: "content",
    fields: [
      ...bilingual("title", "Title", "text"),
      { name: "slug", label: "Slug", type: "text", required: true },
      // Kosongkan untuk memakai halaman detail bawaan, /features/{slug}.
      { name: "link", label: "Explore Link", type: "url" },
      ...bilingual("description", "Description"),
      { name: "image", label: "Image", type: "image" },
      orderField,
    ],
    columns: ["title_en", "slug", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "benefits",
    label: "Benefits",
    group: "content",
    fields: [
      { name: "icon", label: "Icon (emoji)", type: "text", required: true },
      ...bilingual("title", "Title", "text"),
      ...bilingual("description", "Description"),
      orderField,
    ],
    columns: ["title_en", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "services",
    label: "Services",
    group: "content",
    fields: [
      ...bilingual("name", "Name", "text"),
      ...bilingual("description", "Description"),
      { name: "icon", label: "Icon (emoji)", type: "text", required: true },
      { name: "priceLabel", label: "Price", type: "text", required: true },
      // Kosongkan untuk memakai /contact, tujuan CTA kartu layanan sebelumnya.
      { name: "link", label: "Explore Link", type: "url" },
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
  {
    key: "products",
    label: "Products",
    group: "content",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      ...bilingual("subtitle", "Subtitle", "text"),
      ...bilingual("description", "Description"),
      { name: "image", label: "Image", type: "image" },
      { name: "link", label: "Lynk.id Link", type: "url", required: true },
      orderField,
    ],
    columns: ["title", "link", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "testimonials",
    label: "Testimonials",
    group: "content",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "position", label: "Position", type: "text" },
      { name: "content", label: "Content", type: "textarea", required: true },
      { name: "rating", label: "Rating", type: "number" },
      { name: "avatar", label: "Avatar URL", type: "url" },
      { name: "isActive", label: "Active", type: "boolean" },
    ],
    columns: ["name", "position", "rating", "isActive", "createdAt"],
    orderBy: { createdAt: "desc" },
  },
  {
    key: "music",
    label: "Music",
    group: "content",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "audioUrl",
        label: "Audio File (MP3)",
        type: "file",
        required: true,
        accept: "audio/mpeg",
      },
      { name: "cover", label: "Cover Image", type: "image", required: true },
      orderField,
    ],
    columns: ["title", "audioUrl", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "films",
    label: "Films",
    group: "content",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "videoUrl", label: "Link", type: "url", required: true },
      { name: "thumbnail", label: "Image", type: "image", required: true },
      ...bilingual("description", "Description"),
      orderField,
    ],
    columns: ["title", "videoUrl", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "footer",
    label: "Footer",
    group: "settings",
    singleton: true,
    fields: [
      ...bilingual("text", "Text"),
      { name: "copyrightText", label: "Copyright", type: "text", required: true },
    ],
    columns: ["copyrightText"],
    orderBy: { id: "asc" },
  },
  {
    key: "contact",
    label: "Contact",
    group: "settings",
    singleton: true,
    fields: [
      { name: "qrImage", label: "QR Code Image", type: "image", imageOnly: true },
      { name: "qrLabel_en", label: "QR Label (EN)", type: "text" },
      { name: "qrLabel_id", label: "QR Label (ID)", type: "text" },
    ],
    columns: ["qrLabel_en"],
    orderBy: { id: "asc" },
  },
  {
    key: "social-links",
    label: "Social Links",
    group: "settings",
    fields: [
      { name: "platform", label: "Platform", type: "text", required: true },
      { name: "url", label: "URL", type: "url", required: true },
      { name: "icon", label: "Icon", type: "text", required: true },
      orderField,
    ],
    columns: ["platform", "url", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "navigation",
    label: "Navigation",
    group: "settings",
    fields: [
      ...bilingual("label", "Label", "text"),
      { name: "url", label: "URL", type: "text", required: true },
      orderField,
    ],
    columns: ["label_en", "url", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "messages",
    label: "Messages",
    group: "settings",
    readOnly: true,
    fields: [],
    columns: ["name", "email", "subject", "createdAt"],
    orderBy: { createdAt: "desc" },
  },
];

export function getResource(key: string): Resource | undefined {
  return RESOURCES.find((r) => r.key === key);
}

/**
 * Batas kepercayaan. Hanya field yang dideklarasikan resource yang lolos,
 * apa pun yang dikirim form: nama kolom tak dikenal tidak akan pernah sampai
 * ke Prisma, dan tiap nilai dipaksa ke tipe yang benar.
 */
export function parseFields(resource: Resource, form: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const field of resource.fields) {
    const raw = form.get(field.name);
    const value = typeof raw === "string" ? raw.trim() : "";

    if (field.type === "number") {
      const n = Number(value);
      data[field.name] = Number.isFinite(n) ? Math.trunc(n) : 0;
      continue;
    }

    if (field.type === "boolean") {
      // Checkbox native: hadir di FormData ("on") kalau tercentang, absen kalau tidak.
      data[field.name] = form.get(field.name) === "on";
      continue;
    }

    if (field.type === "gallery") {
      // Nilai datang sebagai JSON array (lihat GalleryControl), bukan baris per URL.
      let items: string[] = [];
      try {
        const parsed = JSON.parse(value || "[]");
        if (Array.isArray(parsed)) {
          items = parsed.filter((v): v is string => typeof v === "string");
        }
      } catch {
        items = [];
      }
      data[field.name] = items;
      continue;
    }

    if (field.type === "list") {
      data[field.name] = value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      continue;
    }

    if (field.type === "select") {
      if (!field.options?.includes(value)) {
        throw new Error(`${field.label} must be one of: ${field.options?.join(", ")}`);
      }
      data[field.name] = value;
      continue;
    }

    if (field.type === "url") {
      // <input type="url"> hanya validasi di client. Field ini kadang dirender
      // ke <a href> publik (mis. ProjectDetail), jadi tanpa cek skema di sini
      // nilai seperti "javascript:..." yang disimpan lewat CMS bisa jadi
      // stored XSS di halaman publik.
      if (!value) {
        if (field.required) {
          throw new Error(`${field.label} is required.`);
        }
        data[field.name] = null;
        continue;
      }
      if (!/^(https?:\/\/|\/)/.test(value)) {
        throw new Error(`${field.label} must start with http://, https://, or /.`);
      }
      data[field.name] = value;
      continue;
    }

    if (field.required && !value) {
      throw new Error(`${field.label} is required.`);
    }

    // Kolom opsional yang dikosongkan disimpan sebagai null, bukan string kosong.
    data[field.name] = field.required ? value : value || null;
  }

  return data;
}
