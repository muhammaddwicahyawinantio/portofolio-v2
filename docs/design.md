# Design System — Cream / White / Ink

> Dokumen ini adalah acuan desain untuk project ini. Tujuannya: menyamakan warna, tipografi, dan pola komponen di seluruh halaman/komponen yang sudah ada, supaya hasil akhirnya clean, elegan, dan konsisten — bukan sekadar "ganti warna sana-sini".

---

## 1. Prinsip Desain

- **Restrained, bukan ramai.** Satu aksen warna saja (gold), sisanya monochrome (cream → white → ink black).
- **Kontras lembut.** Hindari `#000000` murni untuk teks body; pakai ink yang sedikit hangat (`#111110`) supaya tidak keras di mata.
- **Whitespace itu fitur.** Jangan padatkan komponen. Beri ruang bernapas antar section.
- **Card putih di atas cream** adalah pola utama untuk membedakan layer konten dari background.
- **Tipografi jadi elemen visual**, bukan cuma pembawa teks — heading pakai serif editorial, body pakai sans yang netral dan sangat legible.

---

## 2. Warna (Design Tokens)

Gunakan token ini sebagai CSS custom properties (`:root`) atau `theme.colors` di Tailwind config — jangan hardcode hex di komponen.

| Token | Hex | Peran |
|---|---|---|
| `--cream` | `#F6F1E7` | Background utama halaman |
| `--cream-deep` | `#EDE5D3` | Variasi background, section alternatif |
| `--card` | `#FFFFFF` | Background card / surface utama |
| `--ink` | `#111110` | Warna teks utama (heading & body penting) |
| `--ink-soft` | `#55534C` | Teks sekunder, deskripsi, caption |
| `--line` | `#E4DCC8` | Border, divider, outline halus |
| `--gold` | `#B5923A` | Aksen tunggal: label, tag, highlight, hover state |

**Aturan pemakaian:**
- Background halaman → `--cream` (boleh dengan gradient tipis, lihat §4).
- Card / modal / dropdown → `--card` (putih solid) dengan border `--line` tipis (1px) + shadow lembut.
- Teks heading & body → `--ink`.
- Teks pendukung (label, meta, timestamp) → `--ink-soft`.
- `--gold` **hanya** untuk aksen kecil: bullet, tag, underline, ikon, hover/focus state. Jangan dipakai untuk area besar (misal background tombol utama) — itu tetap `--ink`.
- Tombol primary → background `--ink`, teks putih. Tombol secondary/ghost → transparent, border `--line`, teks `--ink`.

---

## 3. Tipografi

| Peran | Font | Sumber |
|---|---|---|
| Heading / display | **Spectral** | Google Fonts |
| Body / UI text | **Plus Jakarta Sans** | Google Fonts |

### Import

```css
@import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
```

### Skala & aturan pakai

```css
:root{
  --font-display: 'Spectral', serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}

h1, h2, h3, .display {
  font-family: var(--font-display);
  font-weight: 500;           /* 500–600, jangan lebih dari 600 */
  letter-spacing: -0.01em;
  line-height: 1.05;
  color: var(--ink);
}

body, p, span, button, input, .ui-text {
  font-family: var(--font-body);
  color: var(--ink);
}

.eyebrow, .label, .tag {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold);
}
```

**Catatan penting:**
- Spectral **hanya** untuk heading besar (h1/h2/h3) dan elemen display seperti kutipan/statement. Jangan dipakai untuk paragraf panjang — dia serif editorial, capek dibaca dalam jumlah banyak.
- Italic Spectral (`ital,wght@1,400`) boleh dipakai untuk 1–2 kata penekanan di heading, bukan seluruh kalimat.
- Plus Jakarta Sans untuk semua UI: body text, button, form, navigasi, caption.
- Ukuran heading pakai `clamp()` supaya responsive tanpa breakpoint manual, contoh: `font-size: clamp(32px, 5vw, 46px);`

---

## 4. Background & Texture

- Default background halaman bukan flat color, tapi gradient sangat halus supaya tidak terasa datar:

```css
background:
  radial-gradient(circle at 12% 8%, rgba(181,146,58,0.10), transparent 42%),
  radial-gradient(circle at 88% 92%, rgba(181,146,58,0.08), transparent 45%),
  linear-gradient(160deg, #FBF7EE 0%, var(--cream) 38%, var(--cream-deep) 100%);
```

- Radial gold di dua sudut opacity-nya harus tetap rendah (≤ 0.12) — dia glow, bukan warna baru.
- Untuk section gelap/hero khusus (kalau ada), boleh pakai varian gradient cream → ink (lihat referensi `mercury-fade-bg.html` di project ini) — tapi ini elemen dekoratif opsional, bukan default tiap halaman.

---

## 5. Komponen — Pola yang Sudah Ada

Struktur berikut sudah ada di `color-preview.html` dan jadi acuan pola komponen project:

### Card
```css
.card{
  background: var(--card);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(17,17,16,0.05);
  box-shadow:
    0 1px 2px rgba(17,17,16,0.04),
    0 20px 48px -24px rgba(17,17,16,0.14);
}
```
- `border-radius` konsisten 20px untuk card besar, 12–14px untuk elemen kecil di dalamnya (swatch, mini-card).
- Shadow selalu dua layer: satu tipis dekat (kontak), satu besar lembut (ambient).

### Eyebrow label
```css
.eyebrow::before{
  content:"";
  width:6px; height:6px;
  border-radius:50%;
  background: var(--gold);
}
```
Dot kecil gold + teks uppercase tracking lebar. Dipakai konsisten di atas heading section.

### Button
- Primary: `background: var(--ink); color: #fff; border-radius: 999px;`
- Ghost: `background: transparent; border: 1px solid var(--line); color: var(--ink); border-radius: 999px;`

### Nested surface (mini-card di dalam card)
- Background `--cream` (bukan putih lagi) supaya ada layering tanpa nambah warna baru.

---

## 6. Instruksi untuk Claude Code

Saat mengerjakan project ini:

1. **Baca dulu struktur project** (`src/`, komponen, styling approach yang dipakai — CSS module, Tailwind, styled-components, dll) sebelum menulis apa pun.
2. **Jangan hardcode hex** di dalam komponen. Semua warna wajib lewat token di §2 — kalau project pakai Tailwind, tambahkan ke `tailwind.config` sebagai `theme.extend.colors`; kalau CSS biasa, taruh di `:root` global.
3. **Terapkan token warna ke SEMUA komponen yang sudah ada** secara konsisten — bukan cuma halaman baru. Audit komponen lama (button, card, nav, form, dsb) dan sesuaikan ke palet ini.
4. **Font**: pasang Spectral + Plus Jakarta Sans sesuai §3, replace font lama yang mungkin masih dipakai (cek semua `font-family` di codebase).
5. **Gold (`--gold`) itu aksen, bukan warna utama.** Kalau nemu komponen yang pakai warna lain sebagai "aksen" (biru, hijau, dsb), ganti ke gold sesuai aturan pemakaian di §2 — tapi tetap kecil porsinya (label, tag, hover, ikon).
6. **Konsistensi radius & shadow**: samakan `border-radius` dan shadow style ke pola di §5 di semua card/surface yang ada.
7. **Jangan ubah struktur/logic komponen**, fokus murni ke styling layer (warna, tipografi, spacing) kecuali ada breaking issue yang jelas.
8. Setelah selesai, **screenshot atau jalankan preview** dan cek: apakah kontras teks masih nyaman dibaca, apakah gold tidak dominan berlebihan, apakah spacing antar elemen konsisten.

---

## 7. Referensi Visual

- `color-preview.html` — palet dasar + demo card/button/swatch.
- `mercury-fade-bg.html` — eksplorasi background bertekstur (opsional, untuk hero/section khusus, bukan default).
