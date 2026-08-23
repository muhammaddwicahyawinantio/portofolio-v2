# Color System — Mercury Fade

Palet monokrom silver-abu-hitam untuk Dwi Script. Tanpa warna hue tambahan (no blue/gold/etc) — seluruh kesan "premium" datang dari kontras tonal, gradasi, dan animasi, bukan dari warna.

---

## 1. Token Warna

| Token | Hex | Peran |
|---|---|---|
| `--bg-0` | `#1c1d20` | Background dasar, titik gelap gradasi |
| `--bg-1` | `#3a3c41` | Background terang, titik awal gradasi (kiri-atas) |
| `--panel` | `#232529` | Permukaan kartu/panel jika butuh solid (bukan gradient) |
| `--silver-1` | `#f7f8f9` | Silver paling terang — heading, teks utama, hover state |
| `--silver-2` | `#d5d8dc` | Silver menengah — border gradient, aksen sekunder |
| `--silver-3` | `#9a9ea5` | Silver/abu redup — label, nav, teks tersier |
| `--muted` | `#9a9ea5` | Sama dengan silver-3, dipakai khusus untuk body text sekunder |
| `--text` | `#e9eaec` | Warna teks utama di atas background gelap |
| `--line` | `rgba(255,255,255,.10)` | Garis pembatas/hairline standar |
| `--accent-glow` | `rgba(255,255,255,.12)` | Glow ambient di background |

**Aturan pemakaian:**
- Jangan pernah pakai warna solid selain token di atas. Semua "aksen" harus berasal dari opacity/gradasi silver, bukan hue baru.
- Kontras minimum: teks body di atas `--bg-0`/`--bg-1` harus pakai `--text` atau `--silver-3` ke atas (jangan lebih gelap dari `--silver-3`) supaya tetap accessible.
- `--silver-1` dipakai hemat — untuk heading, hover, dan titik highlight saja. Kalau semua elemen pakai silver-1, hierarki hilang.

---

## 2. Gradasi (Background)

```css
background: radial-gradient(120% 90% at 15% -10%, var(--bg-1), var(--bg-0) 60%);
```
Gradasi utama halaman: terang di kiri-atas, meluruh ke gelap. Ini yang bikin efek "mercury fade" — logam cair yang memudar.

**Varian arah** (pilih sesuai layout):
```css
/* diagonal, dari kanan-bawah */
radial-gradient(120% 90% at 85% 110%, var(--bg-1), var(--bg-0) 60%);

/* vertikal, dari atas */
linear-gradient(180deg, var(--bg-1), var(--bg-0) 70%);
```

---

## 3. Gradasi Teks (Shimmer)

Dipakai di heading besar (nama, judul hero):

```css
h1 {
  background: linear-gradient(100deg,
    var(--silver-3) 0%, var(--silver-1) 25%, var(--silver-1) 45%,
    var(--silver-3) 60%, var(--silver-1) 85%);
  background-size: 260% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shimmer 7s linear infinite;
}
@keyframes shimmer {
  0%   { background-position: 0% 50%; }
  100% { background-position: 260% 50%; }
}
```
Ini yang membuat teks terlihat seperti logam yang berkilau pelan — jangan percepat animasinya di bawah 6s, nanti terasa norak/flashy, bukan elegan.

---

## 4. Ide Background Bertekstur (garis, grid, noise)

Karena kamu minta background yang "keren" — berikut opsi tekstur, semua tetap pakai token warna di atas, tidak menambah hue:

### A. Hairline diagonal (garis tipis miring, kesan brushed-metal)
```css
.bg-lines {
  background-image: repeating-linear-gradient(
    115deg,
    transparent 0px,
    transparent 38px,
    var(--line) 39px,
    transparent 40px
  );
}
```
Efeknya seperti permukaan metal yang disikat (brushed titanium/steel) — garis-garis halus miring, sangat subtle.

### B. Grid tipis (kesan blueprint/technical, cocok untuk developer portfolio)
```css
.bg-grid {
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 64px 64px;
}
```
Bagus dipakai sebagai layer paling belakang, di-mask supaya memudar ke tepi (`mask-image: radial-gradient(...)`).

### C. Ambient sheen (glow lembut yang bergerak) — sudah dipakai di preview
```css
.sheen {
  position: fixed; inset: -20%;
  background:
    radial-gradient(40% 30% at 20% 20%, var(--accent-glow), transparent 60%),
    radial-gradient(35% 25% at 85% 70%, rgba(255,255,255,.06), transparent 60%);
  filter: blur(40px);
  animation: drift 22s ease-in-out infinite alternate;
}
@keyframes drift {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(-4%, 3%) scale(1.08); }
}
```

### D. Noise/grain (menghilangkan kesan "flat digital")
```css
.noise {
  position: fixed; inset: 0; opacity: .035; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

**Rekomendasi kombinasi:** pakai **sheen (C) + noise (D)** sebagai default (sudah teruji di preview), tambahkan **hairline diagonal (A)** hanya di section tertentu (misal hero atau footer) sebagai aksen, jangan di seluruh halaman — supaya tidak terlalu ramai.

---

## 5. Komponen Turunan

**Border/kartu dengan glow saat hover:**
```css
.card {
  border: 1px solid var(--line);
  background: linear-gradient(160deg, rgba(255,255,255,.025), transparent);
}
.card::before {
  content: '';
  position: absolute; inset: 0; padding: 1px;
  background: linear-gradient(140deg, var(--silver-2), transparent 40%, transparent 70%, var(--silver-2));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .4s ease;
}
.card:hover::before { opacity: 1; }
```

**Status/pulse indicator:**
```css
.pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--silver-1); position: relative; }
.pulse::after {
  content: ''; position: absolute; inset: -4px; border-radius: 50%;
  border: 1px solid var(--silver-1); animation: ping 2.2s ease-out infinite;
}
@keyframes ping { 0% { transform: scale(.6); opacity: .8; } 100% { transform: scale(2.1); opacity: 0; } }
```

---

## 6. Aksesibilitas & Batas

- Semua animasi (`shimmer`, `drift`, `ping`) wajib dibungkus `@media (prefers-reduced-motion: reduce)` → set `animation: none`.
- Kontras teks body (`--muted` di atas `--bg-0`) sudah di ambang batas AA untuk teks besar — jangan turunkan lagi kegelapannya untuk teks kecil (<14px).
- Jangan pakai lebih dari satu tekstur background sekaligus (grid + hairline + sheen bertumpuk) — pilih maksimal 2 layer aktif per section.

---

## 7. Ringkasan CSS Variables (siap tempel)

```css
:root {
  --bg-0: #1c1d20;
  --bg-1: #3a3c41;
  --panel: #232529;
  --silver-1: #f7f8f9;
  --silver-2: #d5d8dc;
  --silver-3: #9a9ea5;
  --muted: #9a9ea5;
  --text: #e9eaec;
  --line: rgba(255,255,255,.10);
  --accent-glow: rgba(255,255,255,.12);
  --radius: 2px;
}
```

---

## 8. Prompt untuk Claude Code

Salin prompt di bawah ini apa adanya ke Claude Code di root project kamu. Prompt ini sengaja diminta untuk **menganalisis dulu sebelum mengubah**, supaya Claude Code tidak asal timpa struktur styling yang sudah ada.

```
Aku mau mengganti color theme project ini menjadi tema "Mercury Fade" (silver monochrome, gradasi abu-hitam, tanpa warna hue lain).

LANGKAH 1 — ANALISIS DULU, JANGAN LANGSUNG UBAH:
1. Cari semua tempat warna didefinisikan di project ini (tailwind.config, CSS variables, file global.css/app.css, atau warna hardcode di komponen).
2. Identifikasi konvensi penamaan token warna yang sudah dipakai (misal apakah pakai CSS variables, Tailwind theme.extend.colors, atau langsung className).
3. Cek apakah ada dark mode/light mode switcher yang sudah berjalan, karena tema ini didesain untuk dark background.
4. Laporkan temuan itu ke aku dulu sebelum mengubah apapun — termasuk file mana saja yang akan terdampak.

LANGKAH 2 — SETELAH AKU KONFIRMASI, BARU TERAPKAN INI:
Token warna (gunakan hex ini persis, jangan diubah):
--bg-0: #1c1d20
--bg-1: #3a3c41
--panel: #232529
--silver-1: #f7f8f9
--silver-2: #d5d8dc
--silver-3: #9a9ea5
--muted: #9a9ea5
--text: #e9eaec
--line: rgba(255,255,255,.10)
--accent-glow: rgba(255,255,255,.12)

Aturan implementasi:
- Ganti definisi warna di tempat yang teridentifikasi di Langkah 1, ikuti konvensi penamaan yang sudah ada di project (jangan bikin sistem token baru yang tidak konsisten dengan yang lama).
- Background utama pakai radial-gradient dari --bg-1 ke --bg-0 (lihat detail arah gradient di colour.md bagian 2).
- Tambahkan 2 layer background pendukung: "sheen" (glow ambient bergerak pelan, lihat colour.md bagian 4.C) dan "noise" (grain SVG tipis, lihat colour.md bagian 4.D). Opsional tambahkan hairline diagonal (bagian 4.A) HANYA di section hero/footer, jangan di seluruh halaman.
- Heading utama (h1/h2 penting) pakai efek shimmer gradient text sesuai colour.md bagian 3 — animasi minimal 6 detik per siklus, jangan lebih cepat.
- Semua komponen card/border pakai efek hover glow dari colour.md bagian 5, konsisten di seluruh project.
- WAJIB tambahkan @media (prefers-reduced-motion: reduce) yang mematikan semua animasi warna/shimmer/drift.
- JANGAN menambahkan warna hue baru (biru, emas, hijau, dll) di titik manapun — semua elemen UI harus tetap dalam skala silver-abu-hitam di atas.
- Setelah selesai, tunjukkan diff/summary file yang berubah, dan screenshot atau deskripsikan hasil akhirnya sebelum aku commit.

Detail lengkap tiap token dan alasannya ada di file colour.md yang aku lampirkan — baca itu sebagai referensi utama.
```

Lampirkan file `colour.md` ini bersama prompt di atas saat memulai sesi dengan Claude Code (drag file ke context atau taruh di root project), supaya referensinya lengkap.
