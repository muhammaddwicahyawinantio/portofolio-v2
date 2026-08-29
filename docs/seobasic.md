Tambahkan scope SEO berikut ke task DwiStudio.

# SEO — WAJIB DIBENAHI SECARA MENYELURUH

Tujuan SEO:

- Bahasa Indonesia menjadi versi utama/index utama
- English tetap tersedia sebagai versi alternatif
- struktur URL bersih
- metadata lengkap
- canonical benar
- hreflang benar
- sitemap lengkap
- robots aman
- Open Graph siap share
- Twitter/X card siap
- structured data relevan
- halaman service dan project mudah dipahami search engine
- tidak ada duplicate content akibat locale

Jangan melakukan keyword stuffing.

Gunakan pendekatan SEO yang natural, profesional, dan relevan dengan layanan DwiStudio.

---

# 1. SEO POSITIONING UTAMA

Keyword dan topik utama DwiStudio:

Primary intent:

```text
jasa pembuatan website
jasa website profesional
web developer Indonesia
jasa web development
jasa pembuatan landing page
jasa company profile
jasa website company profile
jasa pembuatan e-commerce
jasa pembuatan aplikasi web
jasa pembuatan sistem web
jasa ERP
jasa e-learning
undangan pernikahan digital
website undangan pernikahan
custom web application
digital solutions
produk digital
```

Jangan memasukkan semua keyword secara paksa ke setiap halaman.

Sebarkan keyword berdasarkan intent halaman.

---

# 2. HOMEPAGE SEO

Bahasa Indonesia:

Title:

`DwiStudio — Jasa Pembuatan Website & Solusi Digital`

Meta Description:

`DwiStudio menyediakan jasa pembuatan website profesional, landing page, company profile, e-commerce, undangan digital, ERP, e-learning, dan sistem web custom untuk bisnis, brand, dan kebutuhan personal.`

Suggested H1:

`Jasa Pembuatan Website & Solusi Digital`

Supporting copy:

`DwiStudio membantu bisnis, brand, dan individu membangun website serta sistem digital yang profesional, cepat, responsif, dan dirancang sesuai kebutuhan.`

English:

Title:

`DwiStudio — Web Development & Digital Solutions`

Description:

`DwiStudio builds professional websites, landing pages, company profiles, e-commerce platforms, digital invitations, ERP, e-learning platforms, and custom web systems.`

H1:

`Web Development & Digital Solutions`

---

# 3. SERVICES PAGE SEO

Indonesia:

Title:

`Jasa Pembuatan Website & Web Development | DwiStudio`

Description:

`Layanan pembuatan website DwiStudio mencakup landing page, company profile, e-commerce, undangan digital, ERP, e-learning, dan aplikasi web custom.`

H1:

`Jasa Pembuatan Website untuk Berbagai Kebutuhan`

Intro:

`DwiStudio menyediakan layanan pengembangan website dan sistem web yang disesuaikan dengan kebutuhan bisnis, organisasi, brand, maupun personal.`

Pastikan service card memiliki heading semantic yang benar.

Contoh:

```html
<h2>Undangan Pernikahan Digital</h2>
<h2>Landing Page</h2>
<h2>Company Profile & E-Commerce</h2>
<h2>ERP & E-Learning</h2>
<h2>Aplikasi & Sistem Web Custom</h2>
```

Jangan memakai `<div>` untuk semua heading jika semantic HTML dapat diperbaiki tanpa merusak styling.

---

# 4. ABOUT PAGE SEO

Indonesia:

Title:

`Tentang DwiStudio — Web Development & Digital Studio`

Description:

`Kenali DwiStudio, studio pengembangan digital yang berfokus pada pembuatan website profesional, aplikasi web, dan solusi digital sesuai kebutuhan.`

H1:

`Tentang DwiStudio`

English:

Title:

`About DwiStudio — Web Development & Digital Studio`

---

# 5. PROJECTS / PORTFOLIO SEO

Indonesia:

Title:

`Portofolio Website & Web Development | DwiStudio`

Description:

`Lihat pilihan proyek website dan sistem digital yang dikembangkan DwiStudio dengan fokus pada desain, performa, pengalaman pengguna, dan teknologi.`

H1:

`Portofolio Website & Sistem Digital`

Setiap project detail harus mempunyai metadata dinamis berdasarkan data project.

Contoh:

```ts
title: `${project.title_id} | Portofolio DwiStudio`
```

Description:

gunakan `description_id`, tetapi potong secara wajar jika terlalu panjang.

Jangan gunakan seluruh case study sebagai meta description.

Jika tersedia:

- coverImage
- title
- description
- slug

gunakan untuk Open Graph project.

---

# 6. CONTACT PAGE SEO

Indonesia:

Title:

`Konsultasi Pembuatan Website | DwiStudio`

Description:

`Diskusikan kebutuhan website, landing page, e-commerce, ERP, e-learning, atau aplikasi web custom bersama DwiStudio.`

H1:

`Konsultasikan Proyek Anda`

Jangan menjadikan halaman kontak terlalu agresif secara keyword.

---

# 7. DIGITAL WEDDING SEO

Jika saat ini wedding masih berupa Service, gunakan copy yang SEO-friendly tetapi natural.

Nama:

`Undangan Pernikahan Digital`

Description:

`Website undangan pernikahan digital yang elegan dan personal, dilengkapi informasi acara, galeri, RSVP, Google Maps, musik, ucapan tamu, dan fitur interaktif lainnya.`

Future SEO intent yang perlu dipertimbangkan ketika Wedding Template sudah dibuat:

```text
undangan digital
undangan pernikahan online
website undangan pernikahan
undangan nikah digital
template wedding website
undangan pernikahan adat
```

Untuk task sekarang:

JANGAN membuat route baru khusus wedding jika belum ada.

Hanya siapkan konten service yang SEO-friendly.

---

# 8. PROJECT METADATA DINAMIS

Audit:

```text
src/app/[locale]/projects/[slug]/page.tsx
```

Gunakan `generateMetadata()` jika belum digunakan.

Metadata harus berdasarkan locale.

Pseudo logic:

```ts
const title =
  locale === "id"
    ? project.title_id
    : project.title_en;

const description =
  locale === "id"
    ? project.description_id
    : project.description_en;
```

Generate:

```text
title
description
canonical
hreflang
openGraph
twitter
```

Jika project tidak ditemukan:

gunakan proper `notFound()`.

Jangan menghasilkan metadata dummy.

---

# 9. METADATA BASE

Audit root/localized layout.

Gunakan Metadata API Next.js.

Jika belum tersedia, tambahkan `metadataBase` menggunakan:

```text
NEXT_PUBLIC_SITE_URL
```

Fallback localhost hanya untuk development.

Production HARUS membaca URL production dari environment variable.

Jangan hardcode production domain jika belum diketahui secara pasti.

Contoh konsep:

```ts
metadataBase: new URL(SITE_URL)
```

---

# 10. TITLE TEMPLATE

Gunakan pola title yang konsisten.

Contoh:

```ts
title: {
  default: "DwiStudio — Jasa Pembuatan Website & Solusi Digital",
  template: "%s | DwiStudio"
}
```

Hindari hasil seperti:

```text
DwiStudio | DwiStudio
```

Jika generateMetadata sudah menambahkan brand manual, jangan menggunakan template dua kali.

Audit dulu sebelum implementasi.

---

# 11. OPEN GRAPH

Tambahkan Open Graph metadata untuk halaman utama.

Minimal:

```text
type
locale
siteName
title
description
url
images
```

Bahasa Indonesia:

```text
locale: id_ID
```

English:

```text
locale: en_US
```

Gunakan image branding / hero / OG image yang benar-benar tersedia.

JANGAN mereferensikan file yang tidak ada.

Kalau belum ada dedicated OG image:

- gunakan asset existing yang paling relevan
- atau gunakan fallback yang valid

Jangan membuat broken Open Graph image URL.

Recommended size untuk asset OG di kemudian hari:

```text
1200 x 630
```

---

# 12. TWITTER / X CARD

Tambahkan:

```text
card: summary_large_image
title
description
images
```

Jangan menambahkan username Twitter/X jika account resmi belum diketahui.

---

# 13. CANONICAL

Canonical HARUS mengikuti default locale baru.

Contoh:

Indonesia:

```text
https://domain.com/
https://domain.com/about
https://domain.com/services
https://domain.com/projects
```

English:

```text
https://domain.com/en
https://domain.com/en/about
https://domain.com/en/services
https://domain.com/en/projects
```

Jangan canonical Indonesia ke `/id`.

Jangan canonical English ke homepage Indonesia.

---

# 14. HREFLANG

Pastikan setiap halaman multilingual memiliki:

```text
id
en
x-default
```

Recommended:

```text
id        -> halaman Indonesia
en        -> halaman English
x-default -> halaman Indonesia
```

Contoh `/services`:

```text
id        https://domain.com/services
en        https://domain.com/en/services
x-default https://domain.com/services
```

Jika helper `alternates()` existing sudah mendukung locale, extend dengan `x-default`.

Jangan duplicate helper jika tidak perlu.

---

# 15. SITEMAP

Audit:

```text
src/app/sitemap.ts
```

Pastikan static route minimal:

```text
/
/about
/services
/projects
/contact
```

untuk:

```text
id
en
```

Masukkan project dynamic yang published/non-archived jika memang public.

Jika database query aman digunakan dalam sitemap, generate:

```text
/projects/{slug}
/en/projects/{slug}
```

untuk semua project public.

Jangan memasukkan:

```text
/admin
/admin/login
/api/*
archived projects
preview-only pages
```

Tambahkan `lastModified` jika data yang relevan tersedia.

Jangan membuat tanggal palsu.

---

# 16. ROBOTS.TXT

Audit:

```text
src/app/robots.ts
```

Pastikan production:

```text
Allow: /
Disallow: /admin/
Disallow: /api/
```

Sitemap:

```text
${SITE_URL}/sitemap.xml
```

Jika project memiliki route internal/private lainnya, exclude secara wajar.

Jangan block:

```text
/_next/static
```

secara sembarangan jika dapat mengganggu rendering/crawling.

---

# 17. STRUCTURED DATA / JSON-LD

Tambahkan structured data hanya yang benar-benar sesuai.

Homepage dapat menggunakan:

```text
Organization
WebSite
ProfessionalService
```

Jangan mengarang:

- rating
- review count
- awards
- jumlah client
- alamat kantor
- phone
- harga
- opening hours

jika data tidak tersedia.

Minimal Organization:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DwiStudio",
  "url": "...",
  "description": "...",
  "sameAs": []
}
```

Jika DwiStudio lebih tepat menggunakan `ProfessionalService`, boleh gunakan.

Pastikan JSON-LD valid.

Jangan inject string JSON secara unsafe.

---

# 18. SERVICE STRUCTURED DATA

Jika implementasi aman dan masuk akal, services page dapat menggunakan:

```text
ItemList
```

dengan daftar Service.

Tidak perlu membuat Product structured data untuk jasa.

Jangan menambahkan fake price/schema Offer jika harga service bersifat range / berubah dan implementasinya tidak jelas.

---

# 19. BREADCRUMB

Untuk project detail, jika memungkinkan tanpa redesign, tambahkan structured data:

```text
BreadcrumbList
```

Contoh:

```text
Beranda
>
Proyek
>
Mosh Madness
```

Tidak wajib menampilkan visual breadcrumb baru jika design saat ini tidak memiliki ruang.

Structured data saja cukup jika implementasi memang sesuai dengan navigation hierarchy.

---

# 20. SEMANTIC HTML

Audit heading hierarchy.

Setiap halaman hanya memiliki satu H1 utama bila memungkinkan.

Hierarchy:

```text
h1
  h2
    h3
```

Jangan:

```text
h1
h4
h2
```

tanpa alasan.

Pastikan:

- nav menggunakan `<nav>`
- main content menggunakan `<main>`
- footer menggunakan `<footer>`
- section meaningful menggunakan `<section>`
- article/project detail dapat menggunakan `<article>` jika cocok

Jangan refactor DOM besar jika berisiko merusak animasi.

---

# 21. IMAGE SEO

Audit `next/image` usage.

Pastikan gambar meaningful memiliki:

```text
alt
width/height atau fill
sizes
```

Alt harus deskriptif.

Contoh bagus:

```text
alt="Tampilan website Mosh Madness"
```

Contoh buruk:

```text
alt="image"
alt="photo"
alt=""
```

Decorative image boleh:

```text
alt=""
```

Jangan keyword stuffing pada alt.

---

# 22. PERFORMANCE / CORE WEB VITALS

Jangan mengorbankan design, tetapi audit basic SEO performance:

- penggunaan `next/image`
- image sizing
- lazy loading untuk image non-critical
- priority hanya untuk image benar-benar above-the-fold
- hindari layout shift
- video jangan preload berlebihan
- font loading tetap efisien
- jangan menambah dependency SEO besar tanpa alasan

Pertahankan animasi GSAP/Lenis, tetapi jangan membuat semua page client component jika tidak perlu.

---

# 23. INTERNAL LINKING

Pastikan Homepage punya internal link ke:

```text
/services
/projects
/contact
```

Jika About relevan:

```text
/about
```

Service card CTA harus mengarah ke contact/project inquiry secara locale-aware.

Project showcase harus mengarah ke detail project.

Jangan menggunakan `<a>` biasa untuk internal route jika project sudah menggunakan locale-aware Link.

---

# 24. CONTENT QUALITY

Copy SEO tetap harus ditulis untuk manusia.

Hindari:

```text
Jasa website murah terbaik profesional nomor 1 Indonesia
```

Hindari pengulangan:

```text
jasa website
jasa website
jasa website
```

Gunakan variasi natural:

```text
pembuatan website
pengembangan web
website profesional
sistem berbasis web
aplikasi web
solusi digital
```

---

# 25. LOCAL SEO

Untuk saat ini jangan menargetkan kota tertentu secara berlebihan kecuali data bisnis memang ingin menargetkannya.

Jangan otomatis mengubah title menjadi:

```text
Jasa Website Banjarmasin
```

di seluruh site.

Tetap gunakan positioning Indonesia secara umum.

Kalau lokasi bisnis memang akan ditargetkan nanti, implementasikan lewat landing page/local SEO terpisah.

---

# 26. INDEXABILITY

Pastikan halaman public:

```text
/
/about
/services
/projects
/contact
/projects/[slug]
```

tidak memiliki accidental:

```html
<meta name="robots" content="noindex">
```

Pastikan:

```text
/admin
```

tidak perlu masuk search engine.

Jika metadata robots bisa dibuat:

```text
index: false
follow: false
```

untuk admin/login, lakukan hanya jika implementasinya aman dan tidak menyebabkan scope besar.

---

# 27. 404

404 page tetap menggunakan locale yang sesuai.

Bahasa Indonesia:

Title:

`Halaman tidak ditemukan`

Description / lead:

`Halaman yang Anda cari tidak tersedia atau mungkin telah dipindahkan.`

CTA:

`Kembali ke Beranda`

English tetap tersedia.

404 tidak perlu keyword SEO berlebihan.

---

# 28. SEARCH ENGINE SAFETY

Jangan:

- membuat fake testimonials
- fake star ratings
- fake review schema
- fake clients
- fake statistics
- fake locations
- hidden keywords
- invisible SEO text
- duplicate paragraphs khusus crawler

Semua content harus sesuai dengan content yang benar-benar tampil atau data yang memang ada.

---

# 29. FINAL SEO AUDIT

Setelah implementasi, audit:

```text
Homepage ID
Homepage EN

About ID
About EN

Services ID
Services EN

Projects ID
Projects EN

Project detail ID
Project detail EN

Contact ID
Contact EN
```

Periksa untuk setiap page:

```text
title
description
H1
canonical
hreflang
Open Graph
Twitter card
indexability
internal link
```

---

# 30. FINAL REPORT SEO

Tambahkan bagian berikut pada laporan akhir Claude:

## SEO

### Default Search Language
- default: Indonesia
- English alternate route: `/en`

### Metadata
Tuliskan title dan description setiap page.

### Canonical
Contoh URL canonical ID dan EN.

### Hreflang
- id
- en
- x-default

### Sitemap
Tuliskan route static dan dynamic yang masuk sitemap.

### Robots
Tuliskan route yang diblokir.

### Open Graph
Jelaskan image dan metadata yang digunakan.

### Structured Data
Tuliskan schema yang dibuat.

### Semantic HTML
Tuliskan perubahan heading/semantic bila ada.

### Image SEO
Tuliskan alt/Next Image improvements.

### Performance
Tuliskan optimasi ringan yang dilakukan.

### Validation

Jalankan:

```bash
npm run lint
npm run build
```

Jika package memiliki typecheck:

```bash
npm run typecheck
```

Pastikan tidak ada error baru dari perubahan SEO.

---

# PRIORITAS SEO

Urutan prioritas:

1. Bahasa Indonesia default
2. URL Indonesia tanpa `/id`
3. canonical benar
4. hreflang benar
5. metadata per page
6. metadata dynamic project
7. sitemap
8. robots
9. Open Graph
10. structured data
11. semantic heading
12. image SEO
13. internal linking
14. performance dasar
15. build bersih

SEO harus menyatu dengan architecture existing.

Jangan install library SEO tambahan jika Next.js Metadata API + `next-intl` sudah cukup.

Jangan redesign UI hanya untuk SEO.

Jangan mengubah database schema kecuali benar-benar diperlukan.

Hasil akhirnya harus membuat DwiStudio siap digunakan sebagai website komersial profesional dengan fokus utama pada:

**jasa pembuatan website, web development, aplikasi web custom, sistem digital, undangan digital, dan produk digital.**