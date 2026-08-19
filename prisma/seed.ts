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
