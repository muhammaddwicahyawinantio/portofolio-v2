import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Pita berjalan mendatar. Geraknya sepenuhnya CSS (lihat .marquee di
 * globals.css), jadi komponen ini BUKAN client component — ia bisa dipakai
 * langsung dari server component tanpa mengirim JavaScript apa pun.
 *
 * Referensinya (designali-in/marquee) membawa prop vertical, reverse, dan tiga
 * varian speed. Tidak ada satu pun yang dipakai di sini, jadi tidak ditulis:
 * arah dan kecepatan diatur lewat --marquee-duration kalau memang perlu.
 *
 * `repeat` menyalin isinya beberapa kali supaya sambungannya tidak pernah
 * memperlihatkan celah — animasinya menggeser tepat selebar satu salinan.
 * Salinan ke-2 dan seterusnya di-aria-hidden: tanpa itu pembaca layar
 * membacakan tiap kutipan empat kali.
 */
export default function Marquee({
  children,
  repeat = 4,
  className,
}: {
  children: ReactNode;
  repeat?: number;
  className?: string;
}) {
  return (
    <div className={clsx("marquee", className)}>
      {Array.from({ length: repeat }, (_, index) => (
        <div key={index} className="marquee-track" aria-hidden={index > 0 || undefined}>
          {children}
        </div>
      ))}
    </div>
  );
}
