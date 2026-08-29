import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  await prisma.project.deleteMany({});
  await prisma.project.createMany({
    data: [
      {
        title_en: "Mosh Madness (Brand Clothing)",
        title_id: "Mosh Madness (Brand Clothing)",
        slug: "mosh-madness",
        description_en:
          "Mosh Madness\n\nWhere dark cinematic art meets premium streetwear. High-fidelity clothing engineered with raw expression, featuring exclusive artwork by Ilham.\n\nTech Stack\nFrontend: Next.js (React) & Tailwind CSS v4\nMotion & Animation: GSAP & Lenis Smooth Scroll\nBackend & Database: Prisma ORM & MySQL",
        description_id:
          "Mosh Madness\n\nTempat seni dark cinematic menyatu dengan streetwear premium. Pakaian berkualitas tinggi yang dirancang dengan ekspresi murni, menampilkan karya seni eksklusif oleh Ilham.\n\nTech Stack\nFrontend: Next.js (React) & Tailwind CSS v4\nMotion & Animation: GSAP & Lenis Smooth Scroll\nBackend & Database: Prisma ORM & MySQL",
        caseStudy_en:
          "Mosh Madness — Brand Website & Admin CMS\n\nMosh Madness is a dark-artistic streetwear brand based in Banjarmasin, Indonesia, established on May 16, 2024. As the sole developer on this project, I handled everything end-to-end — design research, system architecture, and deployment — as a full-stack solo build.\n\nChallenge: The brand needed more than a simple storefront. The owner wanted full control over the site's content — products, hero imagery, sponsor logos, section copy, and media assets — through a custom admin panel, with zero need to touch code. The other challenge was delivering an aggressive, grunge-editorial visual identity that felt distinctive rather than templated, while staying performant across devices.\n\nSolution & Stack: Built on Next.js (App Router) with strict TypeScript for a safe, scalable foundation, paired with Tailwind CSS and Framer Motion for a custom design and animation system, and Lenis for premium smooth scrolling. All product and content data is fully database-driven through MySQL and Prisma (running in engine-free mode), with NextAuth v5 handling admin authentication. Asset storage runs on local project storage backed by a Railway Volume — a leaner, self-contained alternative to third-party CDN services. The whole stack is containerized with Docker and deployed on Railway.\n\nVisual Identity: A dark color palette with a crimson accent (#b60025), a radius-0 brutalist grid, and a layered typography system — Death Stinger for display type, Bebas Neue for headlines, Hanken Grotesk for body copy, and JetBrains Mono for technical/data elements — creating a tone that's intense, exclusive, and still highly functional.\n\nKey Features: A full CMS with CRUD for products, hero content, sponsors, section text, contact messages, and a media library; a cinematic About section with scroll-triggered video transitions and typewriter text; and a fully database-driven product catalog with no hardcoded content.",
        caseStudy_id:
          'Mosh Madness — Website Brand & Admin CMS\n\nMosh Madness adalah brand streetwear dark-artistic asal Banjarmasin yang berdiri 16 Mei 2024. Sebagai satu-satunya developer di proyek ini, aku menangani seluruh proses dari riset desain, arsitektur sistem, hingga deployment — full-stack, solo.\n\nTantangan: Brand ini butuh lebih dari sekadar storefront. Owner ingin platform yang bisa dia kelola sendiri tanpa sentuh kode — mulai dari produk, hero section, logo sponsor, teks tiap bagian halaman, sampai media library — semuanya lewat panel admin custom. Tantangan lain adalah menghadirkan identitas visual yang agresif dan "grunge-editorial" tanpa terasa generik atau templated, sekaligus tetap ringan dan performa terjaga di semua device.\n\nSolusi & Stack: Dibangun dengan Next.js (App Router) dan TypeScript strict mode untuk fondasi yang aman dan scalable, Tailwind CSS dan Framer Motion untuk sistem desain serta animasi custom, dan Lenis untuk smooth scroll premium. Data produk dan konten sepenuhnya database-driven lewat MySQL + Prisma (mode engine-free), dengan NextAuth v5 untuk autentikasi admin. Untuk penyimpanan aset, sistem menggunakan local storage berbasis Railway Volume — pendekatan yang lebih sederhana dan mandiri dibanding layanan CDN pihak ketiga. Seluruh aplikasi di-containerize dengan Docker dan di-deploy ke Railway.\n\nIdentitas Visual: Palet warna gelap dengan aksen crimson (#b60025), grid brutalist tanpa radius, dan sistem tipografi berlapis — Death Stinger untuk display, Bebas Neue untuk headline, Hanken Grotesk untuk body copy, dan JetBrains Mono untuk elemen data/teknikal — menghasilkan tone yang intens, eksklusif, dan tetap fungsional.\n\nFitur Utama: CMS penuh dengan CRUD untuk produk, hero, sponsor, teks section, pesan kontak, dan media library; section "About" sinematik dengan transisi video dan teks typewriter yang di-trigger scroll; serta katalog produk yang seluruhnya dikelola dari database, bukan hardcode.',
        category: "Web Design",
        role: "Full Stack Developer",
        year: "2026",
        client: "Muhammad Ilham",
        link: "https://moshmadness-production.up.railway.app/",
        coverImage: "/images/placeholder-1.png",
        images: ["/images/placeholder-1.png", "/images/placeholder-2.png"],
        featured: true,
        archived: false,
        order: 0,
      },
      // Showcase konsep, BUKAN client nyata — ditandai eksplisit di judul dan
      // deskripsi (per audit repositioning) supaya tidak terbaca sebagai studi
      // kasus klien sungguhan. `client: null` sekaligus menyembunyikan field
      // Klien di halaman detail (dt/dd-nya dirender kondisional).
      ...[
        {
          slug: "wedding-invitation-platform",
          title_en: "Wedding Invitation Platform (Concept)",
          title_id: "Platform Undangan Pernikahan Digital (Konsep)",
          description_en:
            "Concept project: a digital wedding invitation platform with RSVP, guest wishes, and a gallery, built to explore the templating system behind DwiStudio's wedding invitation service.",
          description_id:
            "Proyek konsep: platform undangan pernikahan digital dengan RSVP, ucapan tamu, dan galeri foto, dibangun untuk mengeksplorasi sistem template di balik layanan undangan pernikahan digital DwiStudio.",
          category: "Digital Experience",
        },
        {
          slug: "company-profile-website",
          title_en: "Company Profile Website (Concept)",
          title_id: "Website Company Profile (Konsep)",
          description_en:
            "Concept project: a company profile site with services, articles, and a CMS-managed content structure for a growing business.",
          description_id:
            "Proyek konsep: website company profile dengan halaman layanan, artikel, dan struktur konten yang dikelola CMS untuk bisnis yang sedang berkembang.",
          category: "Web Design",
        },
        {
          slug: "e-commerce-experience",
          title_en: "E-Commerce Experience (Concept)",
          title_id: "Pengalaman E-Commerce (Konsep)",
          description_en:
            "Concept project: an online storefront with product catalog, cart, and checkout flow designed for a clear, low-friction shopping experience.",
          description_id:
            "Proyek konsep: toko online dengan katalog produk, keranjang, dan alur checkout yang dirancang untuk pengalaman belanja yang jelas dan minim hambatan.",
          category: "E-Commerce",
        },
        {
          slug: "learning-management-system",
          title_en: "Learning Management System (Concept)",
          title_id: "Sistem E-Learning (Konsep)",
          description_en:
            "Concept project: a multi-user e-learning system with course materials, quizzes, and progress tracking for an education provider.",
          description_id:
            "Proyek konsep: sistem e-learning multi-user dengan materi pembelajaran, kuis, dan pelacakan progres untuk penyedia pendidikan.",
          category: "Web System",
        },
        {
          slug: "business-dashboard",
          title_en: "Business Dashboard (Concept)",
          title_id: "Dashboard Bisnis (Konsep)",
          description_en:
            "Concept project: an internal dashboard for tracking operational data, with role-based access and reporting for day-to-day decisions.",
          description_id:
            "Proyek konsep: dashboard internal untuk memantau data operasional, dengan akses berbasis peran dan pelaporan untuk keputusan sehari-hari.",
          category: "Web System",
        },
      ].map((p, i) => ({
        ...p,
        caseStudy_en: "Full case study coming soon.",
        caseStudy_id: "Studi kasus lengkap segera hadir.",
        role: "Full Stack Developer",
        year: "2026",
        client: null,
        link: null,
        coverImage: null,
        images: [] as string[],
        featured: false,
        archived: false,
        order: i + 1,
      })),
    ],
  });

  // Showcase internal admin, bukan halaman publik (grep: tidak ada pemakai di
  // src/app/[locale]) — nama konsep, bukan client nyata, konsisten dengan Project.
  await prisma.website.deleteMany({});
  await prisma.website.createMany({
    data: [
      { name: "Business Website Concept", url: "https://example.com/business-website" },
      { name: "Creative Commerce Concept", url: "https://example.com/creative-commerce" },
      { name: "Digital Wedding Concept", url: "https://example.com/digital-wedding" },
      { name: "Dashboard System Concept", url: "https://example.com/dashboard-system" },
    ].map((w, i) => ({
      ...w,
      thumbnail: `/images/placeholder-${(i % 3) + 1}.png`,
      description_en: `Full-stack build — ${w.name.toLowerCase()}.`,
      description_id: `Pengembangan full-stack — ${w.name.toLowerCase()}.`,
      order: i,
    })),
  });

  await prisma.about.deleteMany({});
  await prisma.about.create({
    data: {
      title_en: "About Me",
      title_id: "Tentang Saya",
      location: "Banjarmasin, Indonesia",
      status_en: "Available for freelance",
      status_id: "Terbuka untuk proyek lepas",
      shortDescription_en:
        "Full-stack developer and designer building sites that load fast and move well.",
      shortDescription_id:
        "Developer full-stack sekaligus desainer, membangun situs yang ringan dimuat dan mulus bergerak.",
      motto_en: "Ship the smallest thing that works, then make it beautiful.",
      motto_id: "Kirim yang paling sederhana dan berhasil dulu, baru buat indah.",
      cvFile: null,
      fullStory_en:
        "I did not start in software. My first job was on a logistics floor, counting stock and reconciling manifests, where a misplaced digit meant a truck went to the wrong city. That work taught me something no course did: systems fail at the seams, and the seams are where nobody is looking. I began writing small scripts to catch my own mistakes, then scripts to catch everyone else's, and somewhere in there the scripts became the job. I moved into IT support, then into development, and I have been building ever since. My approach has not changed much since the warehouse. I read the problem before I touch the keyboard, I trace the whole path rather than patch the loudest symptom, and I prefer the smallest change that actually holds. Good software, like good logistics, is mostly about removing the places where things can quietly go wrong.",
      fullStory_id:
        "Saya tidak memulai dari dunia perangkat lunak. Pekerjaan pertama saya di lantai logistik, menghitung stok dan mencocokkan manifes, tempat satu digit yang keliru berarti satu truk berangkat ke kota yang salah. Pekerjaan itu mengajarkan hal yang tidak diajarkan kursus mana pun: sistem runtuh di sambungannya, dan sambungan itu justru yang tidak pernah diperhatikan siapa pun. Saya mulai menulis skrip kecil untuk menangkap kesalahan saya sendiri, lalu skrip untuk menangkap kesalahan orang lain, dan entah sejak kapan skrip itu berubah jadi pekerjaannya. Saya pindah ke IT support, lalu ke pengembangan, dan sejak itu terus membangun. Cara kerja saya tidak banyak berubah sejak masa gudang. Saya membaca masalahnya sebelum menyentuh papan ketik, menelusuri seluruh jalurnya alih-alih menambal gejala yang paling berisik, dan memilih perubahan terkecil yang benar-benar bertahan. Perangkat lunak yang baik, seperti logistik yang baik, sebagian besar soal menghapus tempat-tempat di mana sesuatu bisa diam-diam melenceng.",
      images: Array.from({ length: 5 }, () => "/images/hero.png"),
    },
  });

  await prisma.workExperience.deleteMany({});
  await prisma.workExperience.createMany({
    data: [
      {
        company: "Dwi Studio",
        role_en: "Founder & Developer",
        role_id: "Pendiri & Developer",
        period: "2024 — now",
        order: 1,
      },
      {
        company: "Mosh Madness",
        role_en: "Full Stack Developer",
        role_id: "Developer Full Stack",
        period: "2024 — 2026",
        order: 2,
      },
      {
        company: "PT Logistik Nusantara",
        role_en: "IT Support",
        role_id: "IT Support",
        period: "2021 — 2024",
        order: 3,
      },
      {
        company: "PT Logistik Nusantara",
        role_en: "Logistics Staff",
        role_id: "Staf Logistik",
        period: "2019 — 2021",
        order: 4,
      },
    ],
  });

  await prisma.education.deleteMany({});
  await prisma.education.createMany({
    data: [
      {
        institution: "Universitas Lambung Mangkurat — Informatics",
        period: "2019 — 2023",
        order: 1,
      },
      { institution: "SMKN 2 Banjarmasin — Software Engineering", period: "2016 — 2019", order: 2 },
    ],
  });

  await prisma.skill.deleteMany({});
  await prisma.skill.createMany({
    data: [
      { title: "Next.js", order: 1 },
      { title: "TypeScript", order: 2 },
      { title: "React", order: 3 },
      { title: "Tailwind CSS", order: 4 },
      { title: "Prisma", order: 5 },
      { title: "MySQL", order: 6 },
      { title: "GSAP", order: 7 },
      { title: "Three.js", order: 8 },
      { title: "Figma", order: 9 },
      { title: "Docker", order: 10 },
    ],
  });

  await prisma.certification.deleteMany({});
  await prisma.certification.createMany({
    data: [
      { name: "Meta Front-End Developer", image: "/images/hero.png", order: 1 },
      { name: "Google UX Design", image: "/images/hero.png", order: 2 },
      { name: "AWS Cloud Practitioner", image: "/images/hero.png", order: 3 },
    ],
  });

  // upsert dengan `update: {}`, bukan deleteMany — pola FooterContent. Baris
  // ini disunting admin lewat CMS, jadi seed ulang tidak boleh menimpanya.
  // Isinya sengaja sama persis dengan kunci i18n `hero` yang selama ini
  // dipakai, supaya tampilan hero tidak berubah setelah pindah ke database.
  await prisma.heroSection.upsert({
    where: { id: "hero" },
    update: {},
    create: {
      id: "hero",
      backgroundImage: "/images/hero.png",
      headline_en: "Build.\nGrow,\ngo digital.",
      headline_id: "Bangun.\nTumbuh,\nsecara digital.",
      subheadline_en: "Explore · See our services and work",
      subheadline_id: "Jelajahi · Lihat layanan dan karya kami",
      paragraph_en:
        "DwiStudio designs and builds websites, web apps, and digital solutions that combine modern design, performance, and the features your business actually needs.",
      paragraph_id:
        "DwiStudio merancang dan mengembangkan website, aplikasi web, serta solusi digital yang menggabungkan desain modern, performa, dan fungsi yang benar-benar dibutuhkan bisnis.",
      metrics_en: ["99% Client Satisfaction", "Fast & Responsive, Optimized Design", "Modern, Up-to-date Tech Stack"],
      metrics_id: ["99% Kepuasan Klien", "Fast & Responsive Desain Optimized", "Modern Tech Stack Terkini"],
      ctaText_en: null,
      ctaText_id: null,
      ctaUrl: null,
    },
  });

  await prisma.feature.deleteMany({});
  await prisma.feature.createMany({
    data: [
      {
        slug: "riset-dan-arah",
        title_en: "Research & Direction",
        title_id: "Riset & Arah",
        description_en:
          "Every project opens with reading, not designing: who the audience is, what the competitors already own, and which single idea is worth defending.",
        description_id:
          "Tiap proyek dibuka dengan membaca, bukan mendesain: siapa audiensnya, apa yang sudah dikuasai pesaing, dan satu gagasan mana yang layak dipertahankan.",
        image: "/images/hero.png",
        order: 1,
      },
      {
        slug: "identitas-visual",
        title_en: "Visual Identity",
        title_id: "Identitas Visual",
        description_en:
          "Type, colour, and grid settle into one system — tested at a favicon and at a billboard before anything is called finished.",
        description_id:
          "Tipografi, warna, dan grid mengendap jadi satu sistem — diuji pada ukuran favicon dan papan iklan sebelum apa pun disebut selesai.",
        image: "/images/hero.png",
        order: 2,
      },
      {
        slug: "rancang-dan-bangun",
        title_en: "Design & Build",
        title_id: "Rancang & Bangun",
        description_en:
          "Layouts are drawn in the browser, not only in a canvas, so what gets approved is what actually ships.",
        description_id:
          "Tata letak digambar langsung di browser, bukan cuma di kanvas, jadi yang disetujui memang yang benar-benar dikirim.",
        image: "/images/hero.png",
        order: 3,
      },
      {
        slug: "serah-terima",
        title_en: "Handover",
        title_id: "Serah Terima",
        description_en:
          "You leave with a CMS you can run yourself — content, images, and copy editable without touching a line of code.",
        description_id:
          "Kamu pulang membawa CMS yang bisa kamu jalankan sendiri — konten, gambar, dan teks bisa diubah tanpa menyentuh satu baris kode.",
        image: "/images/hero.png",
        order: 4,
      },
    ],
  });

  // Alasan klien memilih studio ini — bukan tahapan proyek. Tahapan sudah
  // dipegang Features ("How the work runs"), jadi teksnya sengaja bicara soal
  // untungnya buat klien, bukan urutan kerjanya.
  await prisma.benefit.deleteMany({});
  await prisma.benefit.createMany({
    data: [
      {
        icon: "👤",
        title_en: "Built by one professional",
        title_id: "Dikerjakan satu profesional",
        description_en:
          "You talk to the person writing the code. No account manager in between, no work quietly passed down a chain of subcontractors.",
        description_id:
          "Kamu bicara langsung dengan orang yang menulis kodenya. Tanpa perantara, tanpa pekerjaan yang diam-diam dioper ke rantai subkontraktor.",
        order: 1,
      },
      {
        icon: "🪟",
        title_en: "Transparent progress",
        title_id: "Progres transparan",
        description_en:
          "Scope, timeline, and price are agreed before anything starts, and you see the build in the browser as it grows — not once at the end.",
        description_id:
          "Lingkup, timeline, dan harga disepakati sebelum apa pun dimulai, dan kamu melihat hasilnya tumbuh langsung di browser — bukan sekali saja di akhir.",
        order: 2,
      },
      {
        icon: "✎",
        title_en: "Custom, never a template",
        title_id: "Custom, bukan template",
        description_en:
          "Type, colour, and layout are drawn for your brand. Nothing here is a theme with your logo dropped into it.",
        description_id:
          "Tipografi, warna, dan tata letak digambar untuk brand kamu. Tidak ada tema jadi yang cuma ditempeli logo.",
        order: 3,
      },
      {
        icon: "🔑",
        title_en: "You get the keys",
        title_id: "Kendali di tangan kamu",
        description_en:
          "Every project ships with its own CMS and a walkthrough. Changing a sentence or a photo never needs a developer again.",
        description_id:
          "Tiap proyek diserahkan lengkap dengan CMS-nya sendiri dan panduannya. Mengubah satu kalimat atau foto tidak pernah lagi butuh developer.",
        order: 4,
      },
    ],
  });

  await prisma.service.deleteMany({});
  await prisma.service.createMany({
    data: [
      {
        icon: "💍",
        name_en: "Digital Wedding Invitation",
        name_id: "Undangan Pernikahan Digital",
        description_en:
          "An elegant, personal web-based wedding invitation that's easy to share with family and guests across any platform.",
        description_id:
          "Undangan pernikahan berbasis web yang elegan, personal, dan mudah dibagikan kepada keluarga serta tamu melalui berbagai platform.",
        priceLabel: "Rp300.000 – Rp1.000.000",
        features_en: [
          "Responsive design for mobile and desktop",
          "Personalized guest names",
          "Ceremony & reception details",
          "Event countdown",
          "Photo gallery",
          "Love story",
          "Google Maps location",
          "Online RSVP",
          "Guest wishes & prayers",
          "Background music",
          "Digital gift envelope",
          "Custom domain (optional)",
        ],
        features_id: [
          "Desain responsif untuk mobile dan desktop",
          "Nama tamu personal",
          "Informasi akad dan resepsi",
          "Countdown acara",
          "Galeri foto",
          "Love story",
          "Google Maps",
          "RSVP online",
          "Ucapan dan doa tamu",
          "Background music",
          "Amplop digital",
          "Domain custom opsional",
        ],
        benefits_en: [
          "Easy to share via WhatsApp and social media",
          "Event details can be updated without reprinting",
          "A more interactive, personal presentation",
          "Accessible anytime from any browser",
        ],
        benefits_id: [
          "Mudah dibagikan melalui WhatsApp dan media sosial",
          "Informasi acara dapat diperbarui tanpa mencetak ulang undangan",
          "Tampilan lebih interaktif dan personal",
          "Dapat diakses kapan saja melalui browser",
        ],
        order: 0,
      },
      {
        icon: "🚀",
        name_en: "Landing Page",
        name_id: "Landing Page",
        description_en:
          "A landing page focused on introducing your product, service, or campaign and guiding visitors toward the action you want them to take.",
        description_id:
          "Landing page yang dirancang secara fokus untuk memperkenalkan produk, layanan, atau campaign sekaligus mengarahkan pengunjung menuju tindakan yang diinginkan.",
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
        description_en:
          "A company website that represents your business professionally and can grow into a full product catalog or online store.",
        description_id:
          "Website perusahaan yang merepresentasikan identitas bisnis secara profesional dan dapat dikembangkan menjadi platform katalog maupun penjualan online.",
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
        description_en:
          "An integrated web system to manage business operations, administration, learning, user data, and reporting in one platform.",
        description_id:
          "Sistem web terintegrasi untuk membantu pengelolaan proses bisnis, administrasi, pembelajaran, data pengguna, dan pelaporan dalam satu platform.",
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
        name_en: "Custom Web Application & System",
        name_id: "Aplikasi & Sistem Web Custom",
        description_en:
          "A web application designed specifically around your workflow, operational needs, and business goals that off-the-shelf software can't cover.",
        description_id:
          "Aplikasi web yang dirancang khusus mengikuti alur kerja, kebutuhan operasional, dan tujuan bisnis yang tidak dapat dipenuhi oleh solusi generik.",
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

  // Produk digital yang dijual lewat Lynk.id. `image: null` disengaja — tidak
  // ada berkas logo merek di repo ini, dan ProductCard sudah punya monogram
  // sebagai gantinya. Unggah artwork asli lewat CMS (Content -> Products).
  // Deskripsi hanya menyebut apa yang memang ada di paketnya; harga, durasi,
  // dan syaratnya ditulis di halaman Lynk.id masing-masing, bukan di sini.
  await prisma.product.deleteMany({});
  await prisma.product.createMany({
    data: [
      {
        title: "ChatGPT Plus",
        subtitle_en: "OpenAI",
        subtitle_id: "OpenAI",
        description_en:
          "Access to OpenAI's newest models, with higher message limits than the free tier. Includes advanced reasoning, file and image uploads, data analysis, and image generation.",
        description_id:
          "Akses ke model terbaru OpenAI, dengan batas pesan lebih tinggi dari versi gratis. Termasuk reasoning tingkat lanjut, unggah berkas dan gambar, analisis data, dan pembuatan gambar.",
        image: null,
        link: "https://lynk.id/dwistudio/chatgpt-plus",
        order: 0,
      },
      {
        title: "Canva Pro",
        subtitle_en: "Canva",
        subtitle_id: "Canva",
        description_en:
          "The full Canva template and asset library, plus Background Remover, Magic Resize, brand kits, and 1 TB of cloud storage for your designs.",
        description_id:
          "Seluruh pustaka template dan aset Canva, plus Background Remover, Magic Resize, brand kit, dan penyimpanan awan 1 TB untuk desain kamu.",
        image: null,
        link: "https://lynk.id/dwistudio/canva-pro",
        order: 1,
      },
      {
        title: "Gemini Advanced",
        subtitle_en: "Google One AI Premium",
        subtitle_id: "Google One AI Premium",
        description_en:
          "Google's most capable Gemini model, with Deep Research, longer context windows, and Gemini built into Gmail, Docs, and Drive. Includes 2 TB of Google One storage.",
        description_id:
          "Model Gemini paling mumpuni dari Google, dengan Deep Research, konteks yang jauh lebih panjang, dan Gemini yang menyatu di Gmail, Docs, dan Drive. Termasuk penyimpanan Google One 2 TB.",
        image: null,
        link: "https://lynk.id/dwistudio/gemini-advanced",
        order: 2,
      },
      {
        title: "Netflix Premium",
        subtitle_en: "Netflix",
        subtitle_id: "Netflix",
        description_en:
          "The Premium tier: streaming up to 4K HDR with spatial audio, and downloads for watching offline.",
        description_id:
          "Paket Premium: streaming sampai 4K HDR dengan spatial audio, dan unduhan untuk ditonton offline.",
        image: null,
        link: "https://lynk.id/dwistudio/netflix-premium",
        order: 3,
      },
      {
        title: "Disney+ Hotstar Premium",
        subtitle_en: "Disney+ Hotstar",
        subtitle_id: "Disney+ Hotstar",
        description_en:
          "Disney, Pixar, Marvel, Star Wars, and National Geographic, plus Hotstar's local catalogue and live sport. Streams up to 4K with Dolby Atmos.",
        description_id:
          "Disney, Pixar, Marvel, Star Wars, dan National Geographic, plus katalog lokal Hotstar dan siaran olahraga langsung. Streaming sampai 4K dengan Dolby Atmos.",
        image: null,
        link: "https://lynk.id/dwistudio/disney-hotstar-premium",
        order: 4,
      },
    ],
  });

  await prisma.testimonial.deleteMany({});
  await prisma.testimonial.createMany({
    data: Array.from({ length: 3 }, (_, i) => ({
      name: ["Rani Putri", "Alex Mercer", "Bima Santoso"][i]!,
      position: ["Creative Director", "Founder", "Head of Product"][i]!,
      content: [
        "Delivered beyond what we imagined. The motion work made the brand feel alive without losing its restraint.",
        "Dwi Studio translated a messy brief into a website that finally feels like us.",
        "Clear process, careful craft, and no wasted noise. The project shipped exactly where it needed to land.",
      ][i]!,
      rating: 5,
      isActive: true,
    })),
  });

  await prisma.mediaGalleryItem.deleteMany({});
  await prisma.mediaGalleryItem.createMany({
    data: Array.from({ length: 6 }, (_, i) => ({
      fileUrl: `/images/placeholder-${(i % 3) + 1}.png`,
      caption_en: `Frame ${i + 1}`,
      caption_id: `Bingkai ${i + 1}`,
      order: i,
    })),
  });

  await prisma.gallery3DItem.deleteMany({});
  await prisma.gallery3DItem.createMany({
    data: Array.from({ length: 3 }, (_, i) => ({
      modelUrl: `/models/model-${i + 1}.glb`,
      thumbnail: `/images/placeholder-${(i % 3) + 1}.png`,
      description_en: `Real-time 3D asset ${i + 1}.`,
      description_id: `Aset 3D real-time ${i + 1}.`,
      order: i,
    })),
  });

  await prisma.musicItem.deleteMany({});
  await prisma.musicItem.createMany({
    data: Array.from({ length: 3 }, (_, i) => ({
      title: `Track ${i + 1}`,
      audioUrl: `/audio/track-${i + 1}.mp3`,
      cover: `/images/placeholder-${(i % 3) + 1}.png`,
      order: i,
    })),
  });

  await prisma.filmItem.deleteMany({});
  await prisma.filmItem.createMany({
    data: Array.from({ length: 3 }, (_, i) => ({
      title: `Film ${i + 1}`,
      videoUrl: `https://vimeo.com/00000${i + 1}`,
      thumbnail: `/images/placeholder-${(i % 3) + 1}.png`,
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
      text_en: "Building websites and digital solutions designed for real business needs.",
      text_id: "Membangun website dan solusi digital yang dirancang untuk kebutuhan nyata.",
      copyrightText: "© DwiStudio",
    },
  });

  // SVG placeholder, bukan QR sungguhan — dipindai tidak menghasilkan apa-apa.
  // Ia cuma menahan tempat supaya kolom kanan section Contact punya bentuk
  // final sejak awal. Ganti dengan QR asli lewat CMS: Settings → Contact.
  await prisma.contactSettings.upsert({
    where: { id: "contact" },
    update: {},
    create: {
      id: "contact",
      qrImage: "/images/qr-placeholder.svg",
      qrLabel_en: "Buy me a coffee",
      qrLabel_id: "Buat ngopi",
    },
  });

  await prisma.socialLink.deleteMany({});
  await prisma.socialLink.createMany({
    data: [
      ["Instagram", "https://instagram.com/winantioo", "instagram"],
      ["WhatsApp", "https://wa.me/6285156767900", "whatsapp"],
      ["LinkedIn", "https://www.linkedin.com/in/m.dwicahyawinantio", "linkedin"],
      ["GitHub", "https://github.com/muhammaddwicahyawinantio", "github"],
    ].map(([platform, url, icon], i) => ({
      platform: platform!,
      url: url!,
      icon: icon!,
      order: i,
    })),
  });

  await prisma.navigationItem.deleteMany({});
  await prisma.navigationItem.createMany({
    data: [
      ["About", "Tentang", "/about"],
      ["Projects", "Proyek", "/projects"],
      ["Contact", "Kontak", "/contact"],
    ].map(([en, id, url], i) => ({ label_en: en!, label_id: id!, url: url!, order: i })),
  });

  // SENGAJA tanpa deleteMany, beda dari seluruh model di atas: tabel ini
  // menyimpan kiriman kontak asli dari pengunjung. Menghapusnya dari skrip
  // seed akan membuang pesan sungguhan kalau seed pernah kena database
  // produksi. Konsekuensinya baris contoh menumpuk tiap seed — itu
  // pertukaran yang disengaja.
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
      bridePhoto: "/images/hero.png",
      groomPhoto: "/images/hero.png",
      openingText:
        "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.",
      quoteText:
        "“Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.”",
      storyTitle: "Cerita Kami",
      storyText:
        "Berawal dari satu kelas kuliah di tahun 2019, pertemanan kami tumbuh perlahan menjadi sesuatu yang lebih dalam. Setelah lima tahun melewati suka dan duka bersama, kami memutuskan untuk melangkah ke jenjang yang lebih serius.",
      coverImage: "/images/hero.png",
      publishedAt: new Date(),
      // Set animasi "perfect" — showcase cinematic cover, portrait parallax,
      // dan galeri horizontal-scroll.
      animationSettings: {
        global: {
          smoothScroll: true,
          profile: "elegant",
          intensity: "medium",
          background: "parallax-soft",
        },
        sections: {
          cover: "cinematic-opening",
          couple: "portrait-parallax",
          countdown: "number-rise",
          events: "card-reveal",
          story: "timeline-reveal",
          gallery: "horizontal-scroll",
          gift: "soft-rise",
          rsvp: "form-reveal",
          guestbook: "message-cascade",
          closing: "fade-up",
        },
      },
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
          imageUrl: `/images/placeholder-${(i % 3) + 1}.png`,
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
          {
            guestName: "Keluarga Santoso",
            message: "Selamat menempuh hidup baru! Barakallah.",
            isVisible: true,
          },
          {
            guestName: "Rani & Doni",
            message: "Semoga menjadi keluarga sakinah, mawaddah, warahmah.",
            isVisible: true,
          },
          {
            guestName: "Teman Kampus",
            message: "Akhirnya! Selamat ya kalian berdua ❤️",
            isVisible: true,
          },
        ],
      },
    },
  });

  console.log("Seed selesai ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
