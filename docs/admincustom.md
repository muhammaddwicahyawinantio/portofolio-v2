# PLAN: Update Admin Panel — Sidebar, Dashboard, Login

## Tujuan
Redesign tampilan **halaman admin/CMS** secara keseluruhan: sidebar navigasi baru, dashboard overview, dan halaman login. Ini murni **restyle + restrukturisasi navigasi**, BUKAN rebuild dari nol — data, endpoint, dan logic CRUD yang sudah ada tetap dipakai, hanya dipindah/dikelompokkan ke struktur menu baru.

## Aturan Wajib (baca sebelum eksekusi)
1. Jalankan skill `frontend-design` sebagai design lead sebelum mulai styling — buat token plan singkat dulu (warna, tipografi, signature element) sebelum coding, ikuti palette yang **sudah ada di project ini** (Mercury Fade — cream/charcoal), JANGAN pakai warna dari referensi gambar.
2. Dua referensi yang dilampirkan HANYA untuk **struktur/tata letak & pola interaksi** — bukan warna:
   - `sidebar-component.tsx` → referensi pola **two-level sidebar** (icon rail sempit di kiri + panel detail yang bisa collapse/expand, submenu accordion). Ikuti pola interaksinya (collapsible, hover state, animasi expand/collapse pakai easing halus), tapi restyle total warnanya ke design token project (bukan hitam #1a1a1a / neutral-800 bawaan referensi).
   - `referens_dashboard.jpg` (Finexy) → referensi **layout & jenis data** dashboard (topbar, greeting header, kartu ringkasan, chart profit/loss, tabel aktivitas terbaru, kartu). Ikuti susunan informasinya, ukuran proporsi card, jenis komponen (stat card, chart, tabel dengan status badge, dsb) — TAPI warna oranye/hitam/putih di situ JANGAN dipakai, ganti total ke palette project.
3. Icon: kalau project belum pakai `@carbon/icons-react`, JANGAN install library icon baru — cek dulu icon set yang sudah dipakai di project (kemungkinan `lucide-react` kalau berbasis shadcn/ui) dan cari padanan icon yang setara secara makna, bukan asal fallback.
4. Semua komponen baru dibangun mengikuti struktur shadcn/ui yang sudah ada (`/components/ui`), reuse token warna & style dari Tailwind config project, bukan hardcode class baru yang beda sistem.

---

## 1. Struktur Sidebar Baru

Bangun ulang navigasi admin dengan struktur berikut (ganti struktur menu lama, tapi field/data lama yang relevan dipetakan ke sini, jangan hilang):

```
📊 Dashboard                     (halaman overview/ringkasan, standalone — tanpa dropdown)

📁 Content                       (dropdown)
   ├─ Projects
   │    ├─ Website
   │    ├─ Product Digital
   │    └─ 3D Gallery
   
👤 About                         (dropdown)
   ├─ Education
   ├─ Work
   ├─ Certification
   ├─ Music
   └─ Film

🛠️ Services                      (dropdown)
   ├─ Pricing        ← ganti nama dari "Services" lama, data & fungsinya SAMA (mapping 1:1, jangan bikin ulang dari nol)
   ├─ Features
   └─ Benefits

🤖 AI Chat                       (BARU — halaman kosong dulu / placeholder template, lihat bagian 4)

⚙️ Settings                      (dropdown)
   ├─ Navbar
   ├─ Footer
   ├─ Message
   ├─ Contact
   ├─ Social Links
   └─ Profile
```

### Catatan implementasi struktur
- Pola dari referensi: **icon rail kiri** (ikon-ikon utama level 1, ukuran ~40-64px, collapsed by default) + **panel detail kanan** yang expand berisi submenu/section title, search box, dan daftar item dengan accordion untuk children. Pertahankan pola ini karena scalable untuk banyak menu.
- Item "Dashboard" dan "AI Chat" tidak punya dropdown → klik langsung navigasi ke halaman masing-masing tanpa expand accordion.
- Panel kanan tetap bisa di-collapse ke mode icon-only (seperti pola `isCollapsed` di referensi) untuk mode compact/mobile.
- State aktif (menu yang sedang dibuka) harus jelas secara visual pakai warna aksen dari design token, bukan neutral-800 bawaan referensi.
- Semua transisi collapse/expand pakai easing custom halus (bukan default linear), durasi ±400-500ms, hormati `prefers-reduced-motion`.

### Migrasi data lama
- Cari di codebase menu/route lama yang isinya setara dengan "Services" → pindahkan ke `Services > Pricing`, pastikan semua field, relasi database, dan halaman edit/create-nya tetap terhubung, hanya label & posisi di navigasi yang berubah.
- Audit menu-menu lama lain yang mungkin sudah ada (misal ada page "Portfolio" atau "Skills") — petakan ke kategori baru yang paling sesuai (`Content > Projects` atau `About`) sebelum menghapus route lama. Jangan hapus data, hanya reorganisasi akses.

---

## 2. Halaman Login Admin

Redesign total halaman login supaya "menarik" dan konsisten dengan identitas brand (Mercury Fade — cream/charcoal, tipografi premium):

- Layout: split-screen (kiri form login minimal, kanan area visual/brand — bisa pakai brush texture/gradient ambient sesuai token warna project) ATAU centered card minimal dengan background bertekstur halus — pilih salah satu sesuai audit brand yang sudah ada, jangan default template auth generik.
- Form: input email/password dengan style konsisten shadcn/ui, label mengambang atau di atas input (pilih salah satu, konsisten di seluruh admin), state focus jelas, validasi error dalam bahasa yang jelas dan actionable.
- Tambahkan micro-interaction halus: fade-in saat halaman load, subtle animasi saat submit (loading state di button, bukan spinner polos generik).
- Sertakan branding kecil (logo/nama brand) di halaman ini supaya terasa bagian dari satu identitas, bukan halaman auth boilerplate.
- Responsive penuh sampai mobile — di mobile, sisi visual/brand boleh disembunyikan atau jadi header kecil di atas form.

---

## 3. Halaman Dashboard Overview

Ikuti pola informasi dari referensi Finexy, tapi diselaraskan ke konteks admin CMS ini (bukan finance app) — sesuaikan makna kartu ke data yang relevan untuk project ini (misal: jumlah project publish, pesan masuk, aktivitas terbaru, dsb — sesuaikan ke data yang benar-benar ada di project, jangan bikin data dummy finance yang tidak relevan):

- **Header greeting** — "Good morning/afternoon, [nama admin]" + subtext singkat status.
- **Kartu ringkasan utama** (3-4 kartu): angka besar + label + indikator perubahan (naik/turun), ambil dari metrik yang relevan ke konten project ini (contoh: Total Projects, Pesan Baru, Total Pengunjung — sesuaikan dengan data yang tersedia).
- **Chart** — 1 chart visual (bar/line) untuk tren yang relevan (misal aktivitas/traffic per bulan), pakai komponen chart yang sudah ada di project kalau ada (recharts/chart.js), style-nya ikuti token warna project.
- **Tabel aktivitas terbaru** — list aktivitas/perubahan terakhir di CMS (misal: "Project X di-update", "Pesan baru dari Y") dengan kolom status berupa badge warna (ikuti token warna, bukan oranye/hijau default).
- **Kartu sekunder** (opsional, sesuai konten yang ada) — progress bar, quick actions, atau shortcut ke menu yang sering diakses.

Semua card ukurannya proporsional (jangan terlalu besar/lega), konsisten dengan arahan sizing yang sudah dibahas sebelumnya — rapat tapi tetap breathable, radius & border mengikuti design token.

---

## 4. AI Chat (Menu Baru — Template Awal)

Ini fitur baru, jadi cukup buat **template/skeleton dulu**, belum perlu logic AI real:

- Halaman dengan layout chat standar: area riwayat pesan (scrollable) + input box di bawah + tombol kirim.
- Bubble chat kiri (AI) dan kanan (admin/user) dengan style konsisten token warna project.
- State kosong (belum ada chat): tampilkan pesan pengantar singkat + contoh prompt starter (2-3 chip suggestion).
- Sertakan komentar/TODO di kode menandai bagian yang nanti perlu dihubungkan ke backend/API AI beneran, supaya gampang dilanjut nanti.
- Tidak perlu animasi berat di sini — cukup fade-in saat pesan baru muncul, konsisten dengan gaya micro-interaction section lain.

---

## Urutan Eksekusi (untuk Claude Code)

1. **Audit** struktur admin/CMS yang sudah ada saat ini (routing, komponen sidebar lama, halaman-halaman yang sudah ada) — laporkan dulu temuan sebelum mengubah apa pun.
2. **Design plan singkat** (token warna, tipografi, pola komponen) mengikuti skill `frontend-design`, konsisten dengan sistem yang sudah dipakai di frontend publik project ini — konfirmasi sebelum lanjut kalau ada keputusan besar.
3. Bangun ulang **komponen sidebar** (icon rail + detail panel) sesuai struktur menu baru di atas, restyle total dari referensi.
4. **Migrasi route/data lama** ke struktur menu baru (terutama Services → Pricing), verifikasi tidak ada data/fungsi yang hilang.
5. Bangun halaman **Dashboard overview** baru.
6. Bangun halaman **AI Chat** (template).
7. Redesign halaman **Login admin**.
8. Review menyeluruh: responsive check, keyboard focus, reduced-motion fallback, dan screenshot self-critique tiap halaman sebelum dianggap selesai.

## Acceptance Criteria
- [ ] Semua menu di sidebar baru berfungsi dan mengarah ke halaman/data yang benar (tidak ada broken link/data hilang)
- [ ] Tidak ada satu pun warna dari referensi (oranye Finexy, hitam pekat sidebar referensi) yang terbawa ke hasil akhir
- [ ] Layout & pola interaksi (collapsible sidebar, accordion submenu, jenis kartu dashboard) mengikuti referensi
- [ ] Halaman login baru, responsive, dan konsisten dengan identitas brand
- [ ] AI Chat tampil sebagai halaman utuh (UI-only) tanpa error meski belum terhubung backend
- [ ] Semua halaman lolos cek reduced-motion & keyboard focus
