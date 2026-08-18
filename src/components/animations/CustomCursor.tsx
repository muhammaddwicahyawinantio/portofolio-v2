"use client";

import { useEffect, useRef } from "react";

const TRAIL_MAX = 26; // sampel jejak yang disimpan
const DECAY = 0.045; // hilangnya "tinta" per frame
const RING_IDLE = 7;
const RING_HOVER = 26;
const DOT_R = 3.5; // titik inti, ukurannya tetap
const INTERACTIVE = "a, button, input, textarea, select, [data-cursor]";

type Point = { x: number; y: number; w: number; life: number };

/**
 * Kursor custom dan brush trail digambar di SATU canvas, jadi cuma ada satu
 * RAF loop, bukan dua sumber animasi yang harus disinkronkan.
 *
 * Canvas-nya ber-mix-blend-mode: difference, jadi goresan otomatis membalik
 * nilai apa pun di belakangnya — putih di atas ink, gelap di atas segmen
 * terang Value Rail. Tidak perlu logika warna sama sekali.
 */
export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Layar sentuh tidak punya kursor, dan reduced motion tidak mau jejak.
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Sembunyikan kursor native hanya setelah yang custom benar-benar hidup,
    // supaya tanpa JS pointer tidak ikut hilang.
    document.documentElement.classList.add("has-custom-cursor");

    const trail: Point[] = [];
    const pointer = { x: -100, y: -100 };
    const dot = { x: -100, y: -100, r: RING_IDLE };
    let targetR = RING_IDLE;
    let last = { x: -100, y: -100 };
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      const dx = pointer.x - last.x;
      const dy = pointer.y - last.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2.5) return;

      // Makin cepat gerakannya, makin tipis goresan — seperti kuas sungguhan.
      const w = Math.max(1.5, 13 - dist * 0.32);
      trail.push({ x: pointer.x, y: pointer.y, w, life: 1 });
      if (trail.length > TRAIL_MAX) trail.shift();
      last = { x: pointer.x, y: pointer.y };
    };

    const onOver = (e: Event) => {
      const el = e.target as Element | null;
      targetR = el?.closest?.(INTERACTIVE) ? RING_HOVER : RING_IDLE;
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Jejak: garis penghubung sampel, menebal dan makin pekat ke arah terbaru.
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#edeff2";
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1]!;
        const b = trail[i]!;
        const t = i / trail.length;
        ctx.globalAlpha = 0.8 * t * a.life;
        ctx.lineWidth = b.w * t;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i]!.life -= DECAY;
        if (trail[i]!.life <= 0) trail.splice(i, 1);
      }

      // Titik kursor menyusul dengan easing ringan, radius ikut easing juga.
      dot.x += (pointer.x - dot.x) * 0.2;
      dot.y += (pointer.y - dot.y) * 0.2;
      dot.r += (targetR - dot.r) * 0.15;

      // Cincin yang membesar, bukan cakram penuh — cakram menutupi elemen yang
      // justru sedang mau diklik. Titik inti tetap kecil supaya posisinya jelas.
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#edeff2";
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_R, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#edeff2";
      ctx.lineWidth = 1.25;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.stroke();

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("mouseover", onOver);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-difference [@media(pointer:coarse)]:hidden"
    />
  );
}
