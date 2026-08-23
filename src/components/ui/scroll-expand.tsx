"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import "./scroll-expand.css";

/**
 * ScrollExpand dari ReactBits (reactbits.dev). Bingkai yang memuai dari kotak
 * kecil jadi full-bleed mengikuti scroll, isinya muncul begitu bingkainya
 * hampir penuh. Nol dependensi: clip-path + rAF, tidak menyentuh GSAP.
 *
 * Lima penyimpangan dari sumbernya, semuanya wajib di repo ini:
 *
 * 1. `<img>`/`<video>` hanya dirender kalau `src` memang diisi. Aslinya selalu
 *    merender <img src="">, yang di browser berarti satu permintaan ke URL
 *    halaman itu sendiri. Di sini bingkainya memang tak berisi media — yang
 *    memuai adalah LEMBAR kertasnya.
 * 2. Failsafe tanpa JS. Aslinya menaruh keadaan ISTIRAHAT di CSS (clip-path
 *    terpotong + overlay opacity 0), jadi tanpa JS seluruh isi tak terlihat dan
 *    terpotong permanen. Di sini CSS default = keadaan AKHIR (polos, terbuka
 *    penuh); JS yang memasang `data-mode="expand"` dan menghidupkan efeknya.
 *    Pola yang sama sudah dipakai Reveal, Intro, dan footer di repo ini.
 * 3. Mode statis untuk reduced-motion DAN saat isinya tidak muat. Panggungnya
 *    setinggi satu layar dan ber-`overflow: hidden`, jadi apa pun yang lebih
 *    tinggi dari satu layar akan terpotong permanen. Dulu ini ditebak lewat
 *    breakpoint (< 768px) — akibatnya ponsel tidak pernah kebagian efeknya sama
 *    sekali, bahkan setelah isinya dirampingkan supaya muat. Sekarang DIUKUR:
 *    yang menentukan bukan lebar layar, tapi apakah isinya melebihi panggung.
 *    Aslinya hanya mematikan smoothing saat reduced-motion, tidak mematikan
 *    efeknya.
 * 4. Ambang munculnya isi digeser 0.68→0.5 (dan selesai di 0.86). Aslinya
 *    mengasumsikan ada foto yang enak dipandang selama bingkainya memuai; di
 *    sini bingkainya kosong, jadi menunggu 68% perjalanan scroll cuma
 *    menampilkan persegi krem yang diam.
 * 5. Warna scrim/judul/petunjuk diambil dari token, bukan putih & hitam pekat
 *    yang di-hardcode — lihat scroll-expand.css.
 */

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

export type ScrollExpandProps = {
  src?: string;
  mediaType?: "image" | "video";
  poster?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function ScrollExpand({
  src = "",
  mediaType = "image",
  poster = "",
  alt = "",
  title = "",
  scrollHint = "",
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  children,
  className = "",
  style,
}: ScrollExpandProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement & HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef({
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
  });
  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
  };

  const applyProgress = useCallback((p: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const c = propsRef.current;

    const e = smoothstep(0, 1, p);

    const w = c.startWidth + (100 - c.startWidth) * e;
    const h = c.startHeight + (100 - c.startHeight) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

    if (mediaRef.current) {
      mediaRef.current.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;
    }

    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim * e}`;

    if (titleRef.current) {
      const out = smoothstep(0.4, 0.88, p);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.12, p);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }

    if (overlayRef.current) {
      // 0.5–0.86, bukan 0.68–1: bingkai di sini tidak berisi media, jadi tak ada
      // apa pun untuk dilihat selama isinya belum masuk.
      const inn = smoothstep(0.5, 0.86, p);
      overlayRef.current.style.opacity = `${inn}`;
      overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;
    let isStatic = true;

    const clearInline = () => {
      track.style.height = "";
      stage.style.height = "";
      if (frameRef.current) frameRef.current.style.clipPath = "";
      if (overlayRef.current) {
        overlayRef.current.style.opacity = "";
        overlayRef.current.style.transform = "";
      }
      if (titleRef.current) {
        titleRef.current.style.opacity = "";
        titleRef.current.style.transform = "";
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = "";
        hintRef.current.style.transform = "";
      }
      if (scrimRef.current) scrimRef.current.style.opacity = "";
      if (mediaRef.current) mediaRef.current.style.transform = "";
    };

    const goStatic = () => {
      isStatic = true;
      root.dataset.mode = "static";
      clearInline();
    };

    const measure = () => {
      const c = propsRef.current;

      if (!c.enabled || reduced.matches) {
        goStatic();
        return;
      }

      isStatic = false;
      root.dataset.mode = "expand";
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;
      if (stageH <= 0) return;
      stage.style.height = `${stageH}px`;
      track.style.height = `${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px`;

      // Panggung sudah berukuran final di atas, jadi baru DI SINI isinya bisa
      // diukur terhadapnya: di mode expand overlay-nya `inset: 0`, jadi
      // scrollHeight > clientHeight berarti ada bagian yang tak akan pernah
      // terlihat. Kalau begitu, mundur ke mode statis dan biarkan isinya
      // mengalir biasa — lebih baik tanpa efek daripada teks yang hilang.
      // (Overlay-nya flex-center, jadi yang terbaca cuma limpahan bawah; untuk
      // pertanyaan muat/tidak muat itu sudah cukup.)
      const ov = overlayRef.current;
      if (ov && ov.scrollHeight > ov.clientHeight + 1) {
        goStatic();
        return;
      }

      const w = root.clientWidth || stageH;
      stage.style.setProperty("--se-title-size", `${clamp(w * 0.075, 20, 84)}px`);
    };

    const readProgress = () => {
      const c = propsRef.current;
      const span = stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll) {
        const top = track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const c = propsRef.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }
      applyProgress(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (isStatic) return;
      target = readProgress();
      if (propsRef.current.smoothing <= 0) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const sync = () => {
      measure();
      if (isStatic) return;
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    sync();

    const scroller: Window | HTMLDivElement = useWindowScroll ? window : root;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync);
    reduced.addEventListener("change", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(root);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
      reduced.removeEventListener("change", sync);
      ro.disconnect();
      clearInline();
      delete root.dataset.mode;
    };
  }, [applyProgress, useWindowScroll]);

  // Hanya dirender kalau memang ada sumbernya — <img src=""> berarti satu
  // permintaan jaringan ke URL halaman ini sendiri.
  const media = !src ? null : mediaType === "video" ? (
    <video
      ref={mediaRef}
      className="scroll-expand__media"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
    <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false} />
  );

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${useWindowScroll ? "" : "scroll-expand--scroller"} ${className}`.trim()}
      style={style}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            {src ? <div ref={scrimRef} className="scroll-expand__scrim" /> : null}
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <div ref={titleRef} className="scroll-expand__title">
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
