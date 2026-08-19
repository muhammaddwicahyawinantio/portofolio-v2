export type FieldType = "text" | "textarea" | "number" | "url" | "list" | "select" | "image";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
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
    key: "projects",
    label: "Projects",
    group: "content",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      ...bilingual("description", "Description"),
      { name: "images", label: "Images (one URL per line)", type: "list" },
      { name: "category", label: "Category", type: "text", required: true },
      orderField,
    ],
    columns: ["title", "category", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "websites",
    label: "Websites",
    group: "content",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "url", label: "URL", type: "url", required: true },
      { name: "thumbnail", label: "Thumbnail URL", type: "url", required: true },
      ...bilingual("description", "Description"),
      orderField,
    ],
    columns: ["name", "url", "order"],
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
    key: "testimonials",
    label: "Testimonials",
    group: "content",
    fields: [
      { name: "clientName", label: "Client name", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      ...bilingual("content", "Content"),
      { name: "photo", label: "Photo URL", type: "url" },
      orderField,
    ],
    columns: ["clientName", "position", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "media-gallery",
    label: "Media Gallery",
    group: "content",
    fields: [
      { name: "fileUrl", label: "File URL", type: "url", required: true },
      {
        name: "fileType",
        label: "File type",
        type: "select",
        required: true,
        options: ["IMAGE", "VIDEO"],
      },
      ...bilingual("caption", "Caption", "text"),
      orderField,
    ],
    columns: ["fileUrl", "fileType", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "gallery-3d",
    label: "3D Gallery",
    group: "content",
    fields: [
      { name: "modelUrl", label: "Model URL (.glb)", type: "url", required: true },
      { name: "thumbnail", label: "Thumbnail URL", type: "url", required: true },
      ...bilingual("description", "Description"),
      orderField,
    ],
    columns: ["modelUrl", "order"],
    orderBy: { order: "asc" },
  },
  {
    key: "music",
    label: "Music",
    group: "content",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "audioUrl", label: "Audio URL", type: "url", required: true },
      { name: "cover", label: "Cover URL", type: "url", required: true },
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
      { name: "videoUrl", label: "Video URL", type: "url", required: true },
      { name: "thumbnail", label: "Thumbnail URL", type: "url", required: true },
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

    if (field.required && !value) {
      throw new Error(`${field.label} is required.`);
    }

    // Kolom opsional yang dikosongkan disimpan sebagai null, bukan string kosong.
    data[field.name] = field.required ? value : value || null;
  }

  return data;
}
