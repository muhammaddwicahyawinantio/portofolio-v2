# PLAN.md — Redesign Homepage DWI Studio

> Status: DRAFT requirement (belum dieksekusi). Dokumen ini dibuat dari brief + screenshot yang diberikan user. Beberapa detail teknis (nama tabel, nama komponen, struktur admin) masih ASUMSI karena belum dicek langsung ke codebase — perlu dikonfirmasi/divalidasi di Claude Code plan mode sebelum eksekusi.

## 0. Prinsip Umum
- **Animasi & komponen yang SUDAH ADA tidak boleh diubah** — termasuk animasi hero saat ini, animasi card Features (khususnya tombol/interaksi "explore" yang sudah jalan), dan animasi Works section.
- Semua **komponen/section baru** boleh pakai inspirasi animasi dari [21st.dev](https://21st.dev/) atau [React Bits](https://www.reactbits.dev/), tapi harus disesuaikan ke design system existing (dark editorial monochrome, serif display font untuk heading besar, warna ivory/cream + hitam, aksen gold kecil seperti bullet "WORK"/"SERVICES").
- Semua konten baru (bukan hardcoded) harus **dinamis dari Admin CMS** yang sudah ada (DWI CMS) — bukan bikin CMS baru dari nol, tapi nambah menu/field di struktur CMS existing.
- Struktur project saat ini: Next.js App Router, komponen di `src/components/ui/`, ada `feature-section.tsx`, `FeatureShowcase.tsx`, `Button.tsx`, dsb. CMS punya sidebar Content: Projects, Websites, About, Work Experience, Education, Skills, Certifications, Features, Services, Products, Testimonials, Media Gallery, 3D Gallery, Music, Films — dan Settings: Footer, Social Links, Navigation, Messages, Profile.

---

## 1. Hero Section — REDESIGN + DATA DINAMIS (BARU di CMS)

**Kondisi sekarang:** Hero hardcoded — teks "One studio. Five mediums." + background image statis + scroll indicator.

**Target:**
- Background image, headline, CTA button (teks + URL) diambil dari CMS, bukan hardcoded lagi.
- Layout/animasi visual boleh tetap seperti referensi (fullscreen image, teks besar overlay, scroll-down indicator) — cuma sumber datanya yang berubah jadi dinamis.

**CMS — tambah menu baru "Hero Section" di bawah Content:**
Field yang perlu ditambahkan:
| Field | Tipe | Keterangan |
|---|---|---|
| `background_image` | image upload | gambar full-bleed hero |
| `headline` | text/rich text | judul utama (bisa multi-baris seperti "One studio." / "Five mediums.") |
| `subheadline` | text (optional) | teks kecil, misal "SCROLL DOWN TO BEGIN THE STORY" |
| `cta_text` | text | label tombol CTA |
| `cta_url` | text/url | tujuan tombol CTA |

**Database:** tabel baru `hero_section` (single-row/settings-style, bukan repeatable — kecuali nanti mau di-manage multiple hero untuk locale EN/ID, perlu dikonfirmasi apakah hero perlu multilingual juga seperti section lain).

**Asumsi yang perlu dikonfirmasi:** apakah hero perlu 1 versi per locale (EN/ID) mengingat situs sudah multilingual, atau 1 hero global untuk semua bahasa?

---

## 2. Features Section — TAMBAH ROUTE URL PER ITEM

**Kondisi sekarang:** Section Features sudah ada (di `feature-section.tsx` / `FeatureSteps`), render dari CMS menu "Features", tapi belum ada link custom per item, animasi hover sudah bagus.

**Target:**
- Setiap feature item punya field baru `route_url` (custom link dari CMS) — saat diklik/lewat tombol "Explore" akan mengarah ke URL tersebut.
- Tambahkan tombol **"Explore"** di setiap card feature.
- **Animasi TIDAK berubah** — hover state, transisi index, layout tetap sama seperti sekarang. Tombol Explore ditambahkan tanpa mengganggu animasi existing (styling harus nyambung/konsisten dengan tone card).

**CMS — edit menu "Features" (sudah ada), tambah field:**
| Field | Tipe | Keterangan |
|---|---|---|
| `route_url` | text/url | link tujuan saat tombol Explore diklik. Bisa internal (`/services/xxx`) atau eksternal. |

---

## 3. Works Section — TIDAK ADA PERUBAHAN
Section ini (yang menampilkan panel-panel project seperti "ahanti projects") sudah dianggap final oleh user. **Tidak disentuh sama sekali** di redesign ini.

---

## 4. Benefit Section — SECTION BARU

**Kondisi sekarang:** belum ada.

**Target (berdasarkan brief user: "cara kerja dan dikerjakan oleh orang professional"):**
Section baru yang menonjolkan dua hal utama:
1. **Cara kerja / proses** — bisa mirip pola section "How the work runs" yang sudah ada di referensi (Research & Direction → Visual Identity → Design & Build → Handover), TAPI ini section terpisah bernama "Benefit", jadi perlu dibedakan framingnya: bukan menjelaskan tahapan proyek, tapi menjelaskan **kenapa klien untung kerja sama** (benefit, bukan proses murni).
2. **Dikerjakan oleh profesional** — poin kredibilitas (misal: pengalaman, jumlah project selesai, jaminan kualitas, komunikasi langsung dengan developer, dsb).

**Asumsi konten (karena brief user cukup singkat), disarankan struktur:**
- Heading section, misal: "Why work with us" / "Kenapa Percayakan ke Kami"
- 3–4 benefit cards, masing-masing: icon/angka, judul singkat, deskripsi 1-2 kalimat. Contoh isi yang masuk akal (silakan diedit user):
  - "Dikerjakan Developer Berpengalaman" — dikerjakan langsung oleh profesional, bukan tim outsourcing berlapis
  - "Proses Transparan" — update progres jelas dari awal sampai handover
  - "Custom, Bukan Template" — desain & fitur disesuaikan kebutuhan, bukan template generik
  - "Support Setelah Selesai" — pendampingan setelah website live

**CMS — tambah menu baru "Benefits":**
| Field | Tipe | Keterangan |
|---|---|---|
| `icon` | icon/image | ikon representasi benefit |
| `title` | text | judul benefit |
| `description` | text | deskripsi singkat |
| `order` | number | urutan tampil |

**Perlu dikonfirmasi user:** apakah mau pakai copy default di atas, atau user sendiri yang isi manual lewat CMS nanti (kemungkinan besar opsi kedua — CMS-nya yang penting siap, kontennya user isi sendiri).

---

## 5. Services Section — PECAH JADI 2 KOLOM

**Kondisi sekarang:** 1 grid berisi 3 card (Wedding Invitation, Landing Page, Company Profile/E-commerce) dari CMS menu "Services".

**Target:**
- Layout jadi **2 kolom sejajar**:
  - **Kiri — "Builder"**: menampilkan 6 card dari data yang slug/route-nya `/services`. CTA per card: tombol **"Explore"**.
  - **Kanan — "Digital Product"**: menampilkan 6 card dari data yang slug/route-nya `/products`. CTA per card: tombol **"Explore"**.
- CMS sudah punya menu terpisah "Services" dan "Products" di sidebar — kemungkinan besar tinggal dipetakan: kolom kiri ambil dari data Services, kolom kanan dari data Products. **Perlu dicek di Claude Code** apakah data Products sudah cukup terisi 6 item, karena saat ini section Services yang tampil baru 3 card.
- Tombol lama "Start a Project" pada card Services yang sudah ada → diganti/disamakan jadi tombol **"Explore"** agar konsisten dengan section Features & section Services kanan-kiri ini (perlu dikonfirmasi: apakah "Explore" hanya untuk section baru, atau menggantikan semua CTA card serupa di homepage biar konsisten).

**CMS:** tidak perlu field baru signifikan (field harga, fitur, dsb sudah ada) — cukup pastikan setiap item Services & Products punya field `slug`/`route` yang benar untuk link tombol Explore.

---

## 6. Testimonial Section — DIAMBIL DARI CONTACT + QR CODE

**Kondisi sekarang:** Section Contact ("Have something to make?") + footer besar "DWI STUDIO / AVAILABLE FOR WORK" di bawahnya.

**Target:**
- Layout 2 kolom:
  - **Kiri**: form contact (existing, dari section Contact).
  - **Kanan**: QR code image + teks **"Buat ngopi"** di bawah/atas QR.
- **Catatan penting / asumsi yang perlu dikonfirmasi user:** brief menyebut section ini "Testimonial" tapi isinya adalah form contact + QR — bukan testimoni klien (quote/review). Ada 2 kemungkinan:
  1. User memang maksud **restructure section Contact** (bukan bikin testimonial baru) — form + QR menggantikan bagian CTA "Start a Project" yang sekarang.
  2. Atau user ingin section **Testimonial terpisah** (menampilkan review klien dari CMS menu "Testimonials" yang sudah ada di sidebar) DAN section Contact tetap ada terpisah dengan tambahan QR code.

  → **Plan ini mengasumsikan opsi 1** (restructure Contact section) karena deskripsi user paling cocok ke situ. Kalau maksudnya opsi 2, perlu dikonfirmasi ulang sebelum eksekusi karena akan menambah 1 section terpisah, bukan mengubah section Contact.

**CMS — tambah field di menu Settings atau Contact (asumsi perlu section/menu baru "Contact Settings" kalau belum ada):**
| Field | Tipe | Keterangan |
|---|---|---|
| `qr_code_image` | image upload | gambar QR code |
| `qr_code_label` | text | teks label, default "Buat ngopi" |

---

## 7. Ringkasan Perubahan CMS & Database

| Menu CMS | Status | Aksi |
|---|---|---|
| Hero Section | Baru | Buat menu + tabel baru |
| Features | Sudah ada | Tambah field `route_url` |
| Works | Sudah ada | Tidak ada perubahan |
| Benefits | Baru | Buat menu + tabel baru |
| Services | Sudah ada | Pastikan field `slug` lengkap, sinkronkan ke layout kolom kiri |
| Products | Sudah ada | Pastikan field `slug` lengkap & minimal 6 item, sinkronkan ke layout kolom kanan |
| Contact / Testimonial | Sudah ada (Contact) | Tambah field QR code + label, restructure layout |

---

## 8. Yang Perlu Dicek Langsung di Codebase (tugas Claude Code plan mode)
1. Struktur data & API route untuk Features, Services, Products saat ini — apakah sudah type-safe dan gampang ditambah field baru.
2. Komponen animasi Features (`FeatureSteps`) — pastikan penambahan tombol Explore tidak mengganggu class/animasi hover yang sudah ada.
3. Struktur admin CMS (routing, form builder pattern yang dipakai) supaya menu baru "Hero Section" & "Benefits" konsisten dengan menu lain.
4. Cek apakah data Products sudah berisi 6 item atau perlu seeding tambahan.
5. Cek apakah ada sistem multilingual (EN/ID) yang harus diikuti untuk semua field baru (khususnya Hero, Benefits) — situs sudah pakai locale switcher.
6. Review ulang section Contact existing untuk menentukan pendekatan restructure paling aman (reuse komponen form yang ada, tambah kolom kanan baru).

---

## 9. Prompt Siap Pakai — untuk Claude Code Plan Mode

```
Saya mau redesign homepage project ini berdasarkan PLAN.md yang sudah saya siapkan (ada di root project). 

Tolong lakukan ini di PLAN MODE (jangan langsung eksekusi kode dulu):

1. Baca PLAN.md secara menyeluruh.
2. Baca struktur codebase saat ini: struktur folder src/components/ui/, khususnya feature-section.tsx, FeatureShowcase.tsx, Button.tsx, dan komponen homepage lainnya (page.tsx). Baca juga struktur admin CMS (routing & form pattern untuk menu Content di sidebar: Projects, Features, Services, Products, Testimonials, dll) dan skema database/model yang dipakai saat ini.
3. Untuk tiap section di PLAN.md (Hero, Features, Works, Benefits, Services, Testimonial/Contact), cocokkan dengan kode yang benar-benar ada sekarang — beri catatan kalau ada asumsi di PLAN.md yang ternyata tidak sesuai struktur kode aktual.
4. Susun rencana implementasi konkret meliputi:
   - Perubahan schema database (tabel/kolom baru) untuk Hero Section dan Benefits, plus field tambahan untuk Features (route_url) dan Contact (qr_code_image, qr_code_label).
   - Perubahan di admin CMS: menu baru apa yang perlu dibuat, form field apa yang ditambahkan, mengikuti pattern form builder yang sudah dipakai di menu CMS lain.
   - Perubahan komponen frontend per section, dengan penekanan: JANGAN mengubah animasi yang sudah ada di Hero, Features (khususnya tombol/interaksi explore existing), dan Works. Animasi/komponen baru boleh terinspirasi dari https://21st.dev/ atau https://www.reactbits.dev/ tapi disesuaikan ke design system existing (dark editorial, monochrome, serif heading).
   - Untuk section Services: jelaskan cara paling aman memecah jadi 2 kolom (Builder dari data Services, Digital Product dari data Products), termasuk cek apakah data Products sudah cukup 6 item.
   - Untuk section Testimonial: tampilkan ke saya dulu apakah lebih masuk akal me-restructure section Contact yang ada (form + QR code) atau membuat section Testimonial terpisah dari menu Testimonials yang sudah ada di CMS — beri rekomendasi berdasarkan kode aktual, karena PLAN.md saya menandai ini masih ambigu.
5. Tampilkan rencana lengkap ke saya dulu (file per file, urutan pengerjaan, dan pertanyaan klarifikasi jika ada) sebelum mulai coding apa pun.
```

---

## 10. Pertanyaan Terbuka untuk User (mohon dijawab sebelum eksekusi penuh)
1. Hero Section: satu versi global atau per-locale (EN/ID)?
2. Benefit Section: kontennya mau diisi user manual via CMS, atau butuh draft copy dari saya dulu?
3. Tombol "Explore" — apakah menggantikan SEMUA tombol CTA card sejenis di homepage (termasuk Services lama), atau hanya dipakai di section baru (Features & Services kiri-kanan)?
4. Section 6 ("Testimonial"): fix restructure Contact section (form + QR), atau tetap mau ada section Testimonial terpisah (review klien) ditambah section Contact + QR yang beda lagi?
