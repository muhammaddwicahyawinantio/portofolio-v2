Kerjakan project **DwiStudio** yang saat ini ada di repository:

`muhammaddwicahyawinantio/portofolio-v2`

Sebelum melakukan perubahan, baca dan audit terlebih dahulu struktur project yang ada.

JANGAN melakukan rewrite arsitektur besar.

Project saat ini sudah menggunakan:

- Next.js App Router
- TypeScript
- Tailwind CSS
- next-intl
- Prisma
- MySQL
- CMS Admin
- data bilingual menggunakan suffix `_en` dan `_id`

Tujuan task ini adalah:

1. menjadikan **Bahasa Indonesia sebagai bahasa default seluruh website publik**
2. English tetap tersedia sebagai bahasa kedua
3. memperbaiki arah routing locale
4. memperbarui seluruh dummy content / seed
5. memperbarui copywriting website agar DwiStudio memiliki positioning profesional sebagai:
   - jasa pembuatan website
   - jasa pembuatan web system
   - portfolio developer/studio
   - penyedia produk digital
6. mempertahankan design, animasi, CMS, database, auth, dan fitur existing

---

# 1. AUDIT TERLEBIH DAHULU

Sebelum mengubah code, cek file terkait:

```text
src/i18n/routing.ts
src/i18n/request.ts
src/i18n/navigation.ts

src/i18n/messages/id.json
src/i18n/messages/en.json
src/i18n/messages/parity.ts

src/middleware.ts

src/app/[locale]/
src/app/sitemap.ts
src/app/robots.ts

src/lib/seo.ts
src/lib/nav.ts

src/components/layout/Header.tsx
src/components/layout/Footer.tsx
src/components/layout/LocaleSwitch.tsx

src/components/sections/
src/components/ui/

prisma/schema.prisma
prisma/seed.ts
```

Cari juga semua hardcoded copy Bahasa Inggris / Indonesia di seluruh `src`.

Jangan hanya mengubah `id.json`.

Pastikan tidak ada teks publik penting yang masih hardcoded dalam bahasa Inggris ketika locale Indonesia aktif.

---

# 2. UBAH DEFAULT LANGUAGE MENJADI INDONESIA

Saat ini routing kurang lebih menggunakan:

```ts
locales: ["en", "id"]
defaultLocale: "en"
localePrefix: "as-needed"
```

Ubah default menjadi:

```ts
locales: ["id", "en"]
defaultLocale: "id"
localePrefix: "as-needed"
```

Urutan locale boleh menyesuaikan kebutuhan internal, tetapi Bahasa Indonesia HARUS menjadi default.

Target URL:

```text
/                     -> Indonesia
/about                -> Indonesia
/services             -> Indonesia
/projects             -> Indonesia
/contact               -> Indonesia

/en                   -> English
/en/about             -> English
/en/services          -> English
/en/projects          -> English
/en/contact            -> English
```

Bahasa Indonesia sebagai default TIDAK perlu prefix `/id`.

Jangan menghasilkan:

```text
/id/about
/id/services
```

untuk URL default baru.

---

# 3. VALIDASI REDIRECTION / ROUTING

Pastikan:

```text
localhost:3000
```

langsung menampilkan Bahasa Indonesia.

Jika user secara eksplisit memilih English:

```text
/en
```

harus menampilkan English.

Periksa behavior middleware `next-intl`.

Jangan membuat middleware custom baru kalau konfigurasi `next-intl` existing sudah mampu menangani ini.

Pastikan route:

```text
/admin
/api
_next
assets
uploaded files
```

tetap dikecualikan dari locale middleware sebagaimana implementasi existing.

Admin CMS tidak perlu dipindahkan ke:

```text
/id/admin
```

atau:

```text
/en/admin
```

Tetap:

```text
/admin
```

---

# 4. LOCALE SWITCHER

Audit:

```text
src/components/layout/LocaleSwitch.tsx
```

Pastikan locale switch tetap bekerja setelah Indonesia menjadi default.

Expected:

Saat berada di:

```text
/about
```

dan user memilih English:

```text
/en/about
```

Saat berada di:

```text
/en/about
```

dan user memilih Indonesia:

```text
/about
```

Tidak boleh menjadi:

```text
/id/about
```

Update komentar/documentation lama yang masih mengatakan:

```text
EN tanpa prefix
ID dengan prefix
```

karena setelah perubahan kondisinya menjadi:

```text
ID tanpa prefix
EN dengan prefix
```

---

# 5. UPDATE SEO & SITEMAP

Audit:

```text
src/lib/seo.ts
src/app/sitemap.ts
src/app/robots.ts
src/app/[locale]/layout.tsx
```

Karena `localePath()` menggunakan `routing.defaultLocale`, jangan membuat logic duplicate jika helper existing masih bisa digunakan.

Pastikan canonical baru:

Indonesia:

```text
/
/about
/services
/projects
/contact
```

English:

```text
/en
/en/about
/en/services
/en/projects
/en/contact
```

Pastikan `hreflang` dan alternates tetap benar.

Contoh:

```text
id -> /services
en -> /en/services
```

Perhatikan sitemap existing.

Saat ini daftar PATHS kemungkinan belum memasukkan `/services`.

Tambahkan `/services` jika memang belum tersedia di sitemap.

Jangan menghilangkan route existing.

---

# 6. PERBARUI POSITIONING DWISTUDIO

Positioning lama DwiStudio masih banyak berbicara mengenai:

```text
Web
Motion
3D
Sound
Film
```

Jangan lagi menjadikan konsep tersebut sebagai pesan utama website.

DwiStudio sekarang harus lebih jelas diposisikan sebagai:

**Digital Studio & Web Development**

Fokus utama:

```text
Website Development
Web Application
Digital Wedding
Landing Page
Company Profile
E-Commerce
ERP / E-Learning
Custom Web System
Digital Products
```

Boleh mempertahankan kemampuan motion / interactive / 3D sebagai kapabilitas pendukung visual jika memang digunakan dalam project, tetapi jangan menjadi core business message.

---

# 7. COPYWRITING UTAMA — BAHASA INDONESIA

Gunakan tone:

- profesional
- premium
- modern
- terpercaya
- tidak berlebihan
- tidak terlalu corporate
- jelas untuk calon klien Indonesia
- tidak menggunakan slang berlebihan
- tidak menggunakan kalimat marketing murahan
- hindari klaim seperti "nomor 1", "terbaik", atau klaim tanpa bukti

Brand tetap:

**DwiStudio**

---

# 8. META / SEO COPY

Ubah meta Indonesia menjadi kurang lebih:

Title:

`DwiStudio — Jasa Pembuatan Website & Solusi Digital`

Description:

`DwiStudio menyediakan jasa pembuatan website profesional, landing page, company profile, e-commerce, undangan digital, ERP, e-learning, dan sistem web custom untuk bisnis, brand, dan kebutuhan personal.`

Untuk English buat versi natural:

Title:

`DwiStudio — Web Development & Digital Solutions`

Description:

`DwiStudio builds professional websites, landing pages, company profiles, e-commerce platforms, digital invitations, ERP, e-learning platforms, and custom web systems.`

Jangan menerjemahkan secara kaku.

---

# 9. HERO HOMEPAGE

Pesan Hero harus langsung menjelaskan apa itu DwiStudio.

Rekomendasi Bahasa Indonesia:

Eyebrow jika diperlukan:

`Digital Studio & Web Development`

Headline:

`Bangun pengalaman digital yang bekerja untuk bisnis Anda.`

atau jika layout hero saat ini terdiri dari 3 baris dan perlu mempertahankan animasinya:

```text
Bangun.
Tumbuh.
Secara Digital.
```

Subheadline / lead:

`DwiStudio merancang dan mengembangkan website, aplikasi web, serta solusi digital yang menggabungkan desain modern, performa, dan fungsi yang benar-benar dibutuhkan bisnis.`

CTA utama:

`Mulai Proyek`

CTA kedua jika tersedia:

`Lihat Karya`

Scroll:

`Jelajahi`

Scroll hint:

`Lihat layanan dan karya kami`

WAJIB:

Pertahankan struktur DOM/animasi Hero existing sebisa mungkin.

Jangan merusak Intro, GSAP, kinetic text, responsive typography, atau visual existing hanya karena mengganti copy.

Adaptasikan kalimat terhadap struktur component existing.

---

# 10. SECTION INTRO / VALUE PROPOSITION

Ganti konsep:

`Satu studio. Lima medium.`

menjadi positioning yang lebih sesuai.

Gunakan copy seperti:

Headline:

`Solusi digital yang dirancang untuk berkembang bersama bisnis Anda.`

Description:

`Dari website sederhana hingga sistem web yang kompleks, setiap proyek DwiStudio dirancang berdasarkan kebutuhan nyata—dengan perhatian pada pengalaman pengguna, performa, identitas visual, dan kemudahan pengelolaan.`

Jika section existing membutuhkan beberapa kategori/medium, ubah menjadi kategori layanan yang lebih relevan.

Contoh:

```text
Website
Website profesional dengan desain responsif, cepat, dan disesuaikan dengan identitas bisnis.

Web System
Aplikasi dan sistem berbasis web yang dibangun mengikuti proses serta kebutuhan operasional.

E-Commerce
Platform penjualan digital yang dirancang untuk menghadirkan pengalaman belanja yang jelas dan mudah digunakan.

Digital Experience
Undangan digital dan pengalaman web interaktif dengan visual serta interaksi yang lebih personal.

Digital Products
Produk digital pilihan untuk mendukung kebutuhan kreativitas, produktivitas, dan hiburan digital.
```

Namun jangan memaksakan struktur 5 kategori apabila component/database existing memiliki arsitektur berbeda.

Sesuaikan dengan implementasi yang ada.

---

# 11. ABOUT PAGE

Ubah copy About.

Recommended Bahasa Indonesia:

Eyebrow:

`Tentang DwiStudio`

Title:

`Teknologi yang tepat, dibangun untuk kebutuhan yang nyata.`

Lead:

`DwiStudio adalah studio pengembangan digital yang membantu bisnis, brand, dan individu membangun website serta sistem digital yang profesional, fungsional, dan mudah dikembangkan.`

Body jika tersedia:

`Setiap proyek dimulai dari memahami tujuan, kebutuhan pengguna, dan proses bisnis. Dari sana, solusi dirancang dengan pendekatan yang seimbang antara tampilan visual, pengalaman pengguna, performa, dan teknologi.`

`DwiStudio menangani berbagai kebutuhan mulai dari landing page, company profile, e-commerce, undangan pernikahan digital, ERP, e-learning, hingga aplikasi web custom.`

`Selain layanan pengembangan, DwiStudio juga menghadirkan produk digital pilihan untuk mendukung kebutuhan kreativitas, produktivitas, dan aktivitas digital sehari-hari.`

Jika halaman About saat ini hanya memiliki title + lead, jangan membuat section baru secara berlebihan.

Gunakan content sesuai kapasitas layout existing.

---

# 12. SERVICES PAGE

Gunakan:

Eyebrow:

`Layanan`

Title:

`Solusi web untuk berbagai kebutuhan.`

Lead:

`Pilih layanan yang sesuai dengan kebutuhan Anda. Setiap website dikembangkan secara responsif, terstruktur, dan dapat disesuaikan dengan kebutuhan bisnis maupun personal.`

Price label:

`Mulai dari`

CTA:

`Konsultasikan Proyek`

---

# 13. UPDATE SERVICE DUMMY DATA

Audit `prisma/seed.ts`.

Existing Service sudah memiliki field bilingual:

```text
name_en
name_id

description_en
description_id

features_en
features_id

benefits_en
benefits_id
```

Pertahankan struktur tersebut.

Perbaiki copy menjadi lebih profesional.

Gunakan layanan berikut sebagai basis.

## A. Undangan Pernikahan Digital

Nama:

`Undangan Pernikahan Digital`

Description:

`Undangan pernikahan berbasis web yang elegan, personal, dan mudah dibagikan kepada keluarga serta tamu melalui berbagai platform.`

Features:

```text
Desain responsif untuk mobile dan desktop
Nama tamu personal
Informasi akad dan resepsi
Countdown acara
Galeri foto
Love story
Google Maps
RSVP online
Ucapan dan doa tamu
Background music
Amplop digital
Domain custom opsional
```

Benefits:

```text
Mudah dibagikan melalui WhatsApp dan media sosial
Informasi acara dapat diperbarui tanpa mencetak ulang undangan
Tampilan lebih interaktif dan personal
Dapat diakses kapan saja melalui browser
```

Gunakan pricing existing kecuali memang ada alasan kuat mengubah.

---

## B. Landing Page

Description:

`Landing page yang dirancang secara fokus untuk memperkenalkan produk, layanan, campaign, atau bisnis sekaligus mengarahkan pengunjung menuju tindakan yang diinginkan.`

Features:

```text
Desain profesional dan responsif
Struktur konten berorientasi konversi
CTA WhatsApp atau kontak
Formulir leads
Integrasi Google Maps
Integrasi media sosial
SEO dasar
Optimasi performa
```

Benefits:

```text
Meningkatkan kredibilitas produk atau bisnis
Menyampaikan penawaran secara lebih terarah
Membantu menghasilkan leads
Mudah digunakan untuk campaign digital
```

---

## C. Company Profile / E-Commerce

Description:

`Website perusahaan yang merepresentasikan identitas bisnis secara profesional dan dapat dikembangkan menjadi platform katalog maupun penjualan online.`

Features:

```text
Company profile
Produk atau layanan
Katalog
Admin CMS
Artikel atau blog
Kontak dan WhatsApp
SEO dasar
Manajemen produk
Shopping cart
Checkout
Integrasi pembayaran sesuai kebutuhan
```

Benefits:

```text
Meningkatkan kepercayaan terhadap perusahaan
Memudahkan calon pelanggan menemukan informasi bisnis
Membuka peluang penjualan secara online
Konten website dapat dikelola melalui admin
```

---

## D. ERP / E-Learning

Description:

`Sistem web terintegrasi untuk membantu pengelolaan proses bisnis, administrasi, pembelajaran, data pengguna, dan pelaporan dalam satu platform.`

Features:

```text
Login multi-user
Dashboard
Role dan permission
Manajemen data
Workflow
Reporting
Modul pembelajaran
Materi
Video
Kuis dan ujian
Nilai
Sertifikat
```

Benefits:

```text
Mengurangi proses manual
Membuat data lebih terpusat
Meningkatkan efisiensi operasional
Mempermudah monitoring dan pelaporan
Sistem dapat dikembangkan mengikuti kebutuhan organisasi
```

---

## E. Custom Web Application

Nama:

`Aplikasi & Sistem Web Custom`

Description:

`Aplikasi web yang dirancang khusus mengikuti alur kerja, kebutuhan operasional, dan tujuan bisnis yang tidak dapat dipenuhi oleh solusi generik.`

Potential systems:

```text
CRM
HRIS
Inventory
Finance
Booking
Cooperative System
Internal Dashboard
Operational System
Customer Portal
API Integration
```

Benefits:

```text
Fitur disesuaikan dengan proses bisnis
Mengurangi pekerjaan berulang
Membantu integrasi data dan sistem
Dapat dikembangkan secara bertahap
Lebih fleksibel dibanding aplikasi generik
```

English version harus dibuat natural dan profesional juga.

---

# 14. DIGITAL PRODUCTS

DwiStudio juga menjual produk digital.

Namun PENTING:

Audit schema/database terlebih dahulu.

Saat ini jangan langsung membuat model Prisma baru bernama Product jika project belum memiliki kebutuhan atau UI product yang jelas.

Pertama cari apakah:

```text
DigitalProduct
Product
Store
Catalog
Shop
```

sudah ada.

Jika BELUM ada:

Untuk task ini cukup siapkan positioning/copy website sehingga DwiStudio dapat menjelaskan bahwa tersedia produk digital.

JANGAN membuat sistem checkout/store besar di task ini tanpa kebutuhan.

Buat copy umum yang aman seperti:

Title:

`Produk Digital`

Description:

`Pilihan produk digital untuk mendukung kebutuhan produktivitas, kreativitas, hiburan, dan aktivitas online melalui proses pemesanan yang praktis dan layanan yang responsif.`

CTA:

`Lihat Produk Digital`

Jangan menggunakan copy:

`akun murah`

`akun sharing termurah`

`premium ilegal`

atau klaim serupa.

Tone harus tetap profesional.

Jika ternyata sudah ada model/section produk digital di branch actual, update dummy content existing saja dan jangan membuat sistem baru.

---

# 15. PROJECTS / PORTFOLIO

Gunakan:

Eyebrow:

`Portofolio`

Title:

`Proyek terpilih.`

Lead:

`Beberapa website dan sistem digital yang dikembangkan dengan fokus pada kebutuhan bisnis, pengalaman pengguna, dan implementasi teknologi yang tepat.`

Project detail labels:

```text
Peran
Tahun
Klien
Kunjungi Website
Kembali ke Proyek
```

---

# 16. UPDATE DUMMY PROJECTS

Di `prisma/seed.ts` terdapat dummy seperti:

```text
Project 01
Project 02
Client Site 1
example-1.com
```

Jangan biarkan dummy generik tersebut menjadi content public utama.

Untuk project yang benar-benar sudah memiliki data konkret seperti Mosh Madness:

PERTAHANKAN.

Jangan menghapus case study real hanya untuk mengganti dummy.

Untuk placeholder project lain, gunakan dummy yang lebih representatif terhadap DwiStudio.

Contoh:

```text
Wedding Invitation Platform
Company Profile Website
E-Commerce Experience
Learning Management System
Business Dashboard
```

Tetapi:

- jangan mengklaim itu sebagai client nyata
- jangan membuat nama perusahaan nyata palsu
- jangan memberi external URL palsu seolah-olah website client hidup
- jika dummy, buat jelas sebagai showcase/concept project

Contoh client:

`Concept Project`

atau null jika UI mendukung.

English dan Indonesia tetap harus memiliki data yang sepadan.

---

# 17. WEBSITE DUMMY

Existing dummy:

```text
Client Site 1
Client Site 2
https://example-1.com
```

Perbaiki agar lebih masuk akal.

Namun jangan membuat domain palsu yang terlihat seperti client production.

Jika model Website hanya dipakai showcase, gunakan nama seperti:

```text
Business Website Concept
Creative Commerce Concept
Digital Wedding Concept
Dashboard System Concept
```

Untuk URL dummy:

lebih baik null jika schema memungkinkan.

Jika schema saat ini WAJIB String, jangan lakukan migration hanya untuk masalah dummy content kecuali benar-benar diperlukan.

Boleh pertahankan URL example jika section tidak public.

Audit usage-nya terlebih dahulu.

---

# 18. CONTACT

Eyebrow:

`Kontak`

Title:

`Mari bicarakan proyek Anda.`

Lead:

`Ceritakan website atau sistem yang ingin Anda bangun. DwiStudio akan membantu mengarahkan kebutuhan, ruang lingkup, dan pendekatan pengembangan yang sesuai.`

Form:

```text
Nama
Email
Subjek
Pesan
Kirim Pesan
Mengirim...
```

Success:

`Terima kasih. Pesan Anda sudah diterima dan akan ditinjau secepatnya.`

Required:

`Mohon lengkapi semua kolom yang wajib diisi.`

Email:

`Mohon masukkan alamat email yang valid.`

Rate limit:

`Terlalu banyak permintaan dari koneksi ini. Silakan coba kembali beberapa saat lagi.`

Generic:

`Terjadi kesalahan saat mengirim pesan. Silakan coba kembali.`

---

# 19. CTA HOMEPAGE

Gunakan:

Eyebrow:

`Mulai Proyek`

Heading:

`Punya ide yang ingin diwujudkan secara digital?`

Supporting copy jika layout memungkinkan:

`Diskusikan kebutuhan Anda dan temukan pendekatan pengembangan yang paling sesuai.`

CTA:

`Konsultasikan Proyek`

---

# 20. FOOTER

Gunakan statement yang lebih profesional.

Contoh:

`Membangun website dan solusi digital yang dirancang untuk kebutuhan nyata.`

Copyright:

`Hak cipta dilindungi.`

Jangan gunakan:

`Terbuka untuk proyek terpilih.`

jika positioning sekarang ingin lebih terbuka untuk jasa komersial.

---

# 21. ENGLISH VERSION TETAP DIPERTAHANKAN

JANGAN:

- menghapus `en.json`
- menghapus field `_en`
- menjadikan semua database hanya Indonesia
- menghapus locale switcher

English tetap tersedia.

Tetapi Bahasa Indonesia adalah pengalaman default.

Pastikan `id.json` dan `en.json` memiliki key parity yang sama.

Jalankan parity check existing jika tersedia.

English copy harus natural.

Hindari literal translation yang terdengar seperti hasil mesin.

---

# 22. DATABASE & PRISMA

Jangan mengubah schema hanya untuk menjadikan Indonesia sebagai default.

Model bilingual existing harus dipertahankan.

Jangan rename:

```text
name_en
name_id
description_en
description_id
```

menjadi satu field.

Tujuan default Indonesia diselesaikan melalui:

- routing
- request locale
- UI default
- SEO
- dummy content

bukan dengan menghilangkan internationalization.

---

# 23. SEED SAFETY

HATI-HATI dengan:

```ts
deleteMany()
```

di `prisma/seed.ts`.

Sebelum menjalankan seed, cek apakah database local memang aman untuk di-reset.

JANGAN menjalankan seed terhadap database production.

Jika perlu menjalankan test seed:

gunakan environment development/local.

Jangan menghapus data production.

Perubahan file seed boleh dilakukan tanpa langsung mengeksekusinya apabila environment tidak dapat dipastikan aman.

---

# 24. JANGAN MERUSAK DESIGN

Scope utama task ini:

```text
Language
Routing
i18n
Copywriting
SEO
Dummy content
Seed
```

Jangan redesign website.

Pertahankan:

- theme
- warna
- typography
- responsive behavior
- GSAP
- Lenis
- Intro
- Custom Cursor
- animation
- component architecture
- admin CMS
- authentication
- upload
- Prisma structure

UI hanya boleh berubah jika panjang copy Indonesia membutuhkan adjustment kecil yang wajar.

---

# 25. HARD-CODE AUDIT

Search seluruh project untuk teks seperti:

```text
One studio
Five mediums
About
Projects
Services
Contact
Get in touch
Start a project
Selected work
Available for select work
Web, motion, 3D, sound, and film
```

Pastikan teks publik menggunakan i18n.

Jangan memindahkan teks teknis/internal ke i18n jika tidak perlu.

---

# 26. ADMIN CMS

Admin CMS saat ini satu bahasa.

Task ini TIDAK perlu membuat CMS bilingual UI.

Yang penting:

CMS tetap bisa mengelola field:

```text
*_id
*_en
```

jika memang existing form mendukungnya.

Jangan merusak ResourceForm, resource configuration, CRUD, atau admin dashboard.

Jika label admin masih English tetapi CMS memang sejak awal satu bahasa dan tidak menggunakan `next-intl`, jangan lakukan refactor besar pada task ini.

Prioritas adalah PUBLIC WEBSITE.

---

# 27. ROUTE LINK AUDIT

Cek semua:

```tsx
<Link href="...">
router.push(...)
redirect(...)
Button href="..."
```

untuk route publik.

Gunakan navigation abstraction existing dari:

```text
@/i18n/navigation
```

jika memang pattern project mengharuskannya.

Jangan hardcode `/id`.

Contoh yang salah setelah perubahan:

```tsx
<Link href="/id/services">
```

Contoh yang benar:

```tsx
<Link href="/services">
```

melalui locale-aware Link jika component tersebut berada dalam public localized tree.

---

# 28. VALIDASI FINAL ROUTES

Minimal test:

```text
/
 /about
 /services
 /projects
 /contact

/en
/en/about
/en/services
/en/projects
/en/contact
```

Expected:

```text
/ = Indonesia
/en = English
```

Pastikan tidak terjadi:

- redirect loop
- 404
- double prefix
- `/id/id/...`
- `/en/en/...`
- kehilangan locale ketika berpindah halaman

---

# 29. VALIDASI SEO

Pastikan setiap locale menghasilkan:

- title
- description
- canonical
- hreflang

Homepage default harus canonical ke `/`.

Bukan:

```text
/en
```

atau:

```text
/id
```

English homepage canonical:

```text
/en
```

---

# 30. TEST

Setelah perubahan jalankan:

```bash
npm run lint
```

Lihat scripts package.json dan jalankan TypeScript check jika tersedia.

Kemudian:

```bash
npm run build
```

Jangan menganggap selesai jika build gagal karena perubahan yang kamu buat.

Perbaiki seluruh error yang berasal dari task ini.

Jika ada error existing yang tidak berhubungan dengan perubahan ini:

laporkan secara terpisah dan jangan melakukan refactor besar untuk memperbaikinya.

---

# 31. LAPORAN AKHIR

Setelah selesai berikan laporan dengan format:

## AUDIT

- sistem i18n sebelum perubahan
- default locale sebelum perubahan
- route behavior sebelum perubahan
- hardcoded language yang ditemukan
- dummy content yang ditemukan

## I18N

- file yang diubah
- default locale baru
- behavior locale prefix
- locale switch behavior

## ROUTES

Tuliskan hasil:

```text
/ -> ID
/en -> EN
/about -> ID
/en/about -> EN
...
```

## CONTENT

Jelaskan copy yang diperbarui pada:

- Meta
- Hero
- Homepage
- About
- Services
- Projects
- Contact
- Footer
- Digital Products positioning

## DUMMY / SEED

Jelaskan:

- project dummy yang diperbarui
- website dummy yang diperbarui
- service dummy yang diperbarui
- data real yang dipertahankan

## SEO

Jelaskan:

- canonical
- hreflang
- sitemap
- metadata

## FILES CHANGED

List semua file yang disentuh.

## TEST RESULT

```text
lint:
typecheck:
build:
```

## NOTES

Tuliskan pekerjaan lanjutan yang relevan tetapi jangan implementasikan di luar scope.

---

# PRIORITAS UTAMA

Urutan kerja:

1. Audit code existing.
2. Ubah Bahasa Indonesia menjadi default locale.
3. Pastikan routing Indonesia tanpa `/id`.
4. English pindah ke `/en`.
5. Validasi locale switch.
6. Perbaiki SEO, canonical, hreflang dan sitemap.
7. Perbarui `id.json`.
8. Perbarui `en.json` supaya parity tetap sama.
9. Perbarui dummy/seed.
10. Ubah positioning DwiStudio menjadi web development + digital solutions + digital products.
11. Jangan merusak design atau CMS.
12. Jalankan lint/build.
13. Berikan laporan akhir.

Jangan melakukan perubahan database schema yang tidak diperlukan.

Jangan membuat fitur store/product baru di task ini.

Jangan mengintegrasikan Weddingly pada task ini.

Task Weddingly akan dikerjakan terpisah setelah fondasi bahasa dan content DwiStudio selesai.