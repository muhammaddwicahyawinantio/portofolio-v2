"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * true selama elemennya (hampir) menyentuh viewport.
 *
 * Dipakai untuk mengunci loop requestAnimationFrame. rAF berhenti sendiri kalau
 * TAB-nya disembunyikan; yang tidak ia tangani adalah "tab terlihat, elemennya
 * tidak" — dan itulah keadaan normal sebuah marquee yang duduk di tengah
 * halaman panjang. Loop yang menulis transform ke belasan node tiap frame
 * sementara kita menggulir bagian lain halaman adalah kerja main-thread yang
 * murni rugi, dan di ponsel persis itu yang membuat scroll tersendat.
 *
 * rootMargin memberi jeda supaya animasinya sudah berjalan sebelum elemennya
 * masuk pandangan, bukan tersentak mulai tepat di tepi layar.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin = "300px") {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
