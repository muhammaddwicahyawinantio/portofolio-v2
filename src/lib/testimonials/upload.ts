import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { MAX_TESTIMONIAL_AVATAR_BYTES, MAX_TESTIMONIAL_AVATAR_MB } from "@/lib/testimonials/constants";

/**
 * SVG sengaja TIDAK ada di sini. submitPublicTestimonial() adalah server action
 * tanpa autentikasi — siapa pun bisa mengunggah avatar. SVG adalah dokumen XML
 * yang boleh memuat <script>, dan berkasnya disajikan apa adanya dari
 * /uploads/testimonials/*.svg, satu origin dengan situsnya: membukanya
 * langsung mengeksekusi script itu dengan cookie sesi admin ikut terkirim.
 * Format lain di bawah aman karena sharp me-rasterkannya jadi webp.
 */
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isAvatarFile(file: unknown): file is File {
  return file instanceof File && file.size > 0;
}

export function validateAvatarFile(file: File) {
  if (!IMAGE_TYPES[file.type]) {
    throw new Error("Avatar must be an image file.");
  }

  if (file.size > MAX_TESTIMONIAL_AVATAR_BYTES) {
    throw new Error(`Avatar is too large. Maximum size is ${MAX_TESTIMONIAL_AVATAR_MB}MB.`);
  }
}

async function ensureUploadDir() {
  const dir = path.join(process.cwd(), "public", "uploads", "testimonials");
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function storeTestimonialAvatar(file: File): Promise<string> {
  validateAvatarFile(file);

  const dir = await ensureUploadDir();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const image = sharp(buffer).rotate();
    const metadata = await image.metadata();
    const pipeline =
      metadata.width && metadata.width > 1920
        ? image.resize({ width: 1920, withoutEnlargement: true })
        : image;
    const webp = await pipeline.webp({ quality: 80 }).toBuffer();
    const filename = `${randomUUID()}.webp`;

    await writeFile(path.join(dir, filename), webp);
    return `/uploads/testimonials/${filename}`;
  } catch (error) {
    console.error("Failed to optimize testimonial avatar, storing original.", error);
    const ext = IMAGE_TYPES[file.type] ?? "img";
    const filename = `${randomUUID()}.${ext}`;

    await writeFile(path.join(dir, filename), buffer);
    return `/uploads/testimonials/${filename}`;
  }
}
