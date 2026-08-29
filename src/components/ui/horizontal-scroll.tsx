"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, scroll } from "motion";

/**
 * Horizontal scroll ala Matt Perry (motion.dev): panggung tinggi, track
 * `sticky` di dalamnya, dan progres scroll panggung itulah yang menggeser
 * track-nya di sumbu X. Tiap anak langsung = satu panel selebar layar.
 *
 * Lima penyimpangan dari komponen sumbernya, semuanya wajib di repo ini:
 *
 * 1. Tanpa `<ReactLenis root>`. Root-nya sudah dipasang sekali di SmoothScroll;
 *    root kedua berarti dua instance Lenis berebut scroll yang sama.
 * 2. Selektornya discope ke ref. Aslinya `document.querySelectorAll('li')` dan
 *    `document.querySelector('section')` — di beranda ini itu akan menyapu <li>
 *    milik FeatureSteps dan menempel ke <section> pertama halaman, bukan
 *    miliknya sendiri.
 * 3. Panelnya dioper lewat children, tidak di-hardcode. Section Work sudah
 *    punya isinya sendiri; komponen ini murni pembungkus gerak, nol logika.
 * 4. Ada jeda diam di kedua ujung (keyframe kembar pada 0–20% dan 70–100%).
 *    Aslinya track-nya bergerak terus karena isinya cuma teks + gambar; di sini
 *    panel terakhirnya akordeon yang harus bisa dibaca dan diklik, jadi ia
 *    perlu berhenti dulu sebelum halaman lanjut.
 * 5. Mode statis untuk reduced-motion dan viewport pendek (< 640px). Batasnya
 *    tinggi, BUKAN lebar: yang menentukan efek ini bisa jalan atau tidak
 *    adalah apakah panel tertinggi muat di satu layar, dan di 390px akordeonnya
 *    534px — muat. Jadi ponsel ikut mendapat gerakannya; yang tidak muat hanya
 *    layar pendek (mis. ponsel dalam posisi lanskap). Default tanpa JS = mode
 *    statis (panel menumpuk vertikal seperti biasa), pola yang sama dengan
 *    Reveal, Intro, dan ScrollExpand — jadi isinya tak pernah tersembunyi.
 */
export default function HorizontalScroll({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [moving, setMoving] = useState(false);
  const panels = Children.toArray(children);

  useEffect(() => {
    const mq = window.matchMedia("(min-height: 640px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setMoving(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Efek terpisah, dan sengaja bergantung pada `moving`: animasinya baru boleh
  // dipasang SETELAH kelas mode-gerak menempel di DOM. Kalau digabung dengan
  // efek di atas, ia mengukur track yang belum jadi flex dan belum selebar layar.
  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!moving || !stage || !track || panels.length < 2) return;

    // Persentase pada translateX dihitung dari lebar <ul> itu sendiri, dan
    // <ul>-nya selebar SATU panel (anak-anaknya yang meluber ke kanan). Jadi
    // -100% = tepat satu panel — tanpa 100vw yang meleset selebar scrollbar.
    const end = `-${(panels.length - 1) * 100}%`;
    const controls = animate(
      track,
      { x: ["0%", "0%", end, end] },
      { times: [0, 0.2, 0.7, 1], ease: "easeInOut" },
    );
    const unscroll = scroll(controls, { target: stage });

    return () => {
      unscroll();
      // cancel(), bukan stop(): stop() membekukan transform terakhir sebagai
      // inline style, dan kalau mode berganti ke statis panelnya akan tertinggal
      // separuh keluar layar. cancel() mengembalikannya ke tanpa transform.
      controls.cancel();
    };
  }, [moving, panels.length]);

  return (
    // Padding vertikal cuma dipasang di mode statis: di mode gerak ia diserap
    // panggung setinggi satu layar. 300svh = 100svh dipaku + 200svh jarak
    // gulir; di ponsel dipendekkan ke 220svh karena 200svh jarak gulir dengan
    // ibu jari terasa jauh lebih panjang daripada dengan roda mouse.
    //
    // svh, bukan vh: vh di ponsel = tinggi SAAT BILAH URL TERSEMBUNYI, jadi
    // panggung ber-vh selalu sedikit lebih tinggi dari layar yang benar-benar
    // terlihat dan pakunya meleset.
    <div ref={stageRef} className={moving ? "relative h-[220svh] md:h-[300svh]" : "py-14 md:py-20"}>
      {/* `overflow-x: clip`, bukan `hidden`: hidden menjadikan elemen ini
          kontainer scroll dan memaksa sumbu Y ikut auto — sticky-nya patah dan
          halaman dapat scrollbar horizontal. clip cuma memotong. */}
      <div className={moving ? "sticky top-0 overflow-x-clip" : undefined}>
        <ul
          ref={trackRef}
          className={moving ? "flex h-svh items-center" : "space-y-14 md:space-y-20"}
        >
          {panels.map((panel, i) => (
            <li key={i} className={moving ? "w-full shrink-0" : undefined}>
              {panel}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
