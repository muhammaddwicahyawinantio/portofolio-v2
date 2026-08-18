import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = ["Branding", "Web Design", "Motion", "Photography"];

async function main() {
  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@dwistudio.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL ?? "admin@dwistudio.com",
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!", 10),
      name: "Dwi Cahya",
    },
  });

  await prisma.project.createMany({
    skipDuplicates: true,
    data: Array.from({ length: 6 }, (_, i) => ({
      title: `Project ${String(i + 1).padStart(2, "0")}`,
      slug: `project-${i + 1}`,
      description_en: `A monochrome study in form and motion — case study ${i + 1}.`,
      description_id: `Studi monokrom tentang bentuk dan gerak — studi kasus ${i + 1}.`,
      images: [`/images/placeholder-${(i % 3) + 1}.jpg`],
      category: CATEGORIES[i % CATEGORIES.length]!,
      order: i,
    })),
  });

  await prisma.website.createMany({
    skipDuplicates: true,
    data: Array.from({ length: 4 }, (_, i) => ({
      name: `Client Site ${i + 1}`,
      url: `https://example-${i + 1}.com`,
      thumbnail: `/images/placeholder-${(i % 3) + 1}.jpg`,
      description_en: `Full-stack build for client ${i + 1}.`,
      description_id: `Pengembangan full-stack untuk klien ${i + 1}.`,
      order: i,
    })),
  });

  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      ["Web Development", "Pengembangan Web", "pen-tool"],
      ["Brand Identity", "Identitas Merek", "layers"],
      ["Motion Design", "Desain Gerak", "play"],
      ["3D & WebGL", "3D & WebGL", "box"],
    ].map(([en, id, icon], i) => ({
      name_en: en!,
      name_id: id!,
      description_en: `${en} crafted with obsessive detail.`,
      description_id: `${id} dikerjakan dengan detail obsesif.`,
      icon: icon!,
      order: i,
    })),
  });

  await prisma.testimonial.createMany({
    skipDuplicates: true,
    data: Array.from({ length: 3 }, (_, i) => ({
      clientName: ["Rani Putri", "Alex Mercer", "Bima Santoso"][i]!,
      position: ["Creative Director", "Founder", "Head of Product"][i]!,
      content_en: "Delivered beyond what we imagined — the motion work is exceptional.",
      content_id: "Hasilnya melampaui bayangan kami — kerja animasinya luar biasa.",
      order: i,
    })),
  });

  await prisma.mediaGalleryItem.createMany({
    skipDuplicates: true,
    data: Array.from({ length: 6 }, (_, i) => ({
      fileUrl: `/images/placeholder-${(i % 3) + 1}.jpg`,
      caption_en: `Frame ${i + 1}`,
      caption_id: `Bingkai ${i + 1}`,
      order: i,
    })),
  });

  await prisma.gallery3DItem.createMany({
    skipDuplicates: true,
    data: Array.from({ length: 3 }, (_, i) => ({
      modelUrl: `/models/model-${i + 1}.glb`,
      thumbnail: `/images/placeholder-${(i % 3) + 1}.jpg`,
      description_en: `Real-time 3D asset ${i + 1}.`,
      description_id: `Aset 3D real-time ${i + 1}.`,
      order: i,
    })),
  });

  await prisma.musicItem.createMany({
    skipDuplicates: true,
    data: Array.from({ length: 3 }, (_, i) => ({
      title: `Track ${i + 1}`,
      audioUrl: `/audio/track-${i + 1}.mp3`,
      cover: `/images/placeholder-${(i % 3) + 1}.jpg`,
      order: i,
    })),
  });

  await prisma.filmItem.createMany({
    skipDuplicates: true,
    data: Array.from({ length: 3 }, (_, i) => ({
      title: `Film ${i + 1}`,
      videoUrl: `https://vimeo.com/00000${i + 1}`,
      thumbnail: `/images/placeholder-${(i % 3) + 1}.jpg`,
      description_en: `Short film ${i + 1}.`,
      description_id: `Film pendek ${i + 1}.`,
      order: i,
    })),
  });

  await prisma.footerContent.upsert({
    where: { id: "footer" },
    update: {},
    create: {
      id: "footer",
      text_en: "Let's build something worth remembering.",
      text_id: "Mari bangun sesuatu yang layak dikenang.",
      copyrightText: "© Dwi Studio",
    },
  });

  await prisma.socialLink.createMany({
    skipDuplicates: true,
    data: [
      ["Instagram", "https://instagram.com/", "instagram"],
      ["LinkedIn", "https://linkedin.com/", "linkedin"],
      ["GitHub", "https://github.com/", "github"],
      ["Dribbble", "https://dribbble.com/", "dribbble"],
    ].map(([platform, url, icon], i) => ({
      platform: platform!,
      url: url!,
      icon: icon!,
      order: i,
    })),
  });

  await prisma.navigationItem.createMany({
    skipDuplicates: true,
    data: [
      ["About", "Tentang", "/about"],
      ["Projects", "Proyek", "/projects"],
      ["Contact", "Kontak", "/contact"],
    ].map(([en, id, url], i) => ({ label_en: en!, label_id: id!, url: url!, order: i })),
  });

  await prisma.message.createMany({
    skipDuplicates: true,
    data: Array.from({ length: 5 }, (_, i) => ({
      name: ["Sarah Lin", "Budi Hartono", "Maya Kusuma", "Tom Reeves", "Nadia Alfa"][i]!,
      email: `sender${i + 1}@example.com`,
      subject: [
        "New website inquiry",
        "Kolaborasi proyek",
        "Budget question",
        "Speaking invite",
        "Portfolio review",
      ][i]!,
      message: "Halo, saya tertarik bekerja sama. Bisa kirim detail paket dan timeline?",
      isRead: i > 2,
      createdAt: new Date(Date.now() - i * 86_400_000),
    })),
  });

  // 7 hari terakhir untuk chart "Visitor Statistics" (Wed–Tue).
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - i));
    await prisma.visitorStat.upsert({
      where: { date: d },
      update: {},
      create: { date: d, count: 120 + Math.floor(Math.random() * 400) },
    });
  }

  console.log("Seed selesai ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
