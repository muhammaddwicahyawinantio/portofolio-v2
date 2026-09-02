import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

/**
 * Menemukan (dan opsional memperbaiki) baris CMS yang menunjuk berkas yang
 * TIDAK ADA di public/ — sisa data seed lama yang memakai /images/hero.png dan
 * /images/placeholder-N.*, berkas yang tidak pernah ikut ter-commit. Efeknya di
 * situs live: ikon gambar rusak di /about, kartu musik/film, dan galeri
 * undangan.
 *
 * Ini BUKAN pekerjaan `npm run db:seed`. Seed memanggil deleteMany({}) pada 15
 * model, jadi menjalankannya ulang akan MENGHAPUS seluruh konten CMS asli
 * (proyek, testimonial, foto About yang sudah diunggah). Skrip ini hanya
 * menulis ulang path yang mati, tidak menyentuh apa pun yang berkasnya ada.
 *
 *   npx tsx prisma/fix-dead-media.ts          # dry run, cuma melaporkan
 *   npx tsx prisma/fix-dead-media.ts --write  # benar-benar memperbarui
 */
const FALLBACK = "/images/placeholder.svg";
const WRITE = process.argv.includes("--write");

/** Kolom yang benar-benar memuat URL berkas. Kolom rute seperti
 *  NavigationItem.url sengaja TIDAK ada di sini: "/about" adalah halaman,
 *  bukan berkas, dan menyapunya akan melaporkan false positive. */
const TARGETS: { model: string; fields: string[] }[] = [
  { model: "project", fields: ["coverImage", "images"] },
  { model: "service", fields: ["image"] },
  { model: "product", fields: ["image"] },
  { model: "feature", fields: ["image"] },
  { model: "heroSection", fields: ["backgroundImage"] },
  { model: "about", fields: ["images"] },
  { model: "certification", fields: ["image"] },
  { model: "testimonial", fields: ["avatar"] },
  { model: "mediaGalleryItem", fields: ["fileUrl"] },
  { model: "musicItem", fields: ["cover"] },
  { model: "filmItem", fields: ["thumbnail"] },
  { model: "contactSettings", fields: ["qrImage"] },
  { model: "weddingInvitation", fields: ["bridePhoto", "groomPhoto", "coverImage"] },
  { model: "weddingGallery", fields: ["imageUrl"] },
];

const isDead = (v: unknown): v is string =>
  typeof v === "string" &&
  v.startsWith("/") &&
  !v.startsWith("//") &&
  !existsSync(path.join(process.cwd(), "public", v.split("?")[0]!));

async function main() {
  let found = 0;
  let fixed = 0;

  for (const { model, fields } of TARGETS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (prisma as any)[model];
    if (!delegate?.findMany) continue;

    for (const row of await delegate.findMany()) {
      const data: Record<string, unknown> = {};

      for (const field of fields) {
        const value = row[field];

        if (Array.isArray(value)) {
          const next = value.map((v) => (isDead(v) ? FALLBACK : v));
          const changed = next.some((v, i) => v !== value[i]);
          if (changed) {
            value.forEach((v, i) => {
              if (v !== next[i]) console.log(`  ${model}(${row.id}).${field}[${i}] = ${v}`);
            });
            data[field] = next;
          }
        } else if (isDead(value)) {
          console.log(`  ${model}(${row.id}).${field} = ${value}`);
          data[field] = FALLBACK;
        }
      }

      const changedFields = Object.keys(data).length;
      if (!changedFields) continue;
      found += changedFields;
      if (WRITE) {
        await delegate.update({ where: { id: row.id }, data });
        fixed += changedFields;
      }
    }
  }

  console.log(
    WRITE
      ? `\n${fixed} kolom diperbarui ke ${FALLBACK}.`
      : `\n${found} kolom menunjuk berkas yang hilang. Jalankan ulang dengan --write untuk memperbaiki.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
