"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { canRunHeavyEffects, renderScale } from "@/lib/webgl";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/**
 * Satu shader menangani dua efek dari brief, karena mekanismenya memang sama:
 * keduanya menggeser koordinat sampel tekstur teks.
 *
 *   - kinetic typography: gelombang sinus berjalan sepanjang waktu, membuat
 *     huruf berperilaku seperti kain yang beriak
 *   - cursor displacement: piksel didorong menjauh dari kursor, makin dekat
 *     makin kuat
 *
 * Saat terdorong kuat, kanal warna dipisah sedikit sehingga tepi huruf pecah
 * seperti bias kristal, lalu menyatu lagi saat kursor menjauh.
 */
const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uTex;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uAspect;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Jarak dikoreksi aspek, kalau tidak dorongannya jadi lonjong di teks lebar.
    vec2 d = (uv - uPointer) * vec2(uAspect, 1.0);
    float dist = length(d);
    float push = smoothstep(0.30, 0.0, dist);

    float wave = sin(uv.x * 9.0 + uTime * 1.1) * 0.0035
               + sin(uv.y * 15.0 - uTime * 0.8) * 0.0022;

    uv += normalize(d + 1e-5) * push * 0.055;
    uv.y += wave * (1.0 + push * 4.0);

    float split = push * 0.012;
    vec4 a = texture2D(uTex, uv + vec2(split, 0.0));
    vec4 b = texture2D(uTex, uv);
    vec4 c = texture2D(uTex, uv - vec2(split, 0.0));

    gl_FragColor = vec4(b.rgb, max(a.a, max(b.a, c.a)));
  }
`;

/**
 * Membungkus judul asli. Teks DOM-nya tetap ada dan tetap terbaca mesin
 * pencari maupun screen reader — canvas hanya menimpanya secara visual, dan
 * hanya kalau perangkatnya sanggup. Kalau tidak, yang tampil ya teks aslinya.
 */
function applyTransform(text: string, mode: string) {
  if (mode === "uppercase") return text.toUpperCase();
  if (mode === "lowercase") return text.toLowerCase();
  return text;
}

export default function KineticText({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    if (!wrap || !host || !canRunHeavyEffects()) return;

    const source = wrap.firstElementChild as HTMLElement | null;
    if (!source) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      if (disposed) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;

      /**
       * Teks digambar ulang dari gaya yang benar-benar dipakai elemen aslinya,
       * jadi ukuran clamp() responsif dan warna tiap baris tetap ikut tanpa
       * satu pun angka disalin ke sini.
       */
      const paint = () => {
        // offsetWidth/offsetTop, bukan getBoundingClientRect: rect ikut
        // ter-transform, dan intro men-scale <main> ke 1.1 saat komponen ini
        // mengukur pertama kali — canvas jadi 10% terlalu besar selamanya.
        const rect = { width: source.offsetWidth, height: source.offsetHeight };
        const dpr = renderScale();
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.textBaseline = "top";

        const lines = Array.from(source.children) as HTMLElement[];
        const targets = lines.length ? lines : [source];

        // Canvas fillText selalu rata-kiri dari titik x yang diberikan — ia
        // tidak tahu apa-apa soal text-align CSS. Tiap baris (block penuh
        // lebar induknya) diukur lebarnya sendiri, lalu titik x-nya dipilih
        // sesuai text-align supaya glyph benar-benar mendarat di tempat CSS
        // akan menaruhnya, bukan selalu menempel di tepi kiri kotak.
        for (const line of targets) {
          const lineStyle = getComputedStyle(line);
          const text = applyTransform(line.textContent ?? "", lineStyle.textTransform);
          const baseSize = parseFloat(lineStyle.fontSize);

          ctx.font = `${lineStyle.fontWeight} ${baseSize}px ${lineStyle.fontFamily}`;
          // letterSpacing baru ada di Chrome/Safari terbaru; tanpa itu tracking
          // rapatnya hilang, tapi teksnya tetap benar.
          if ("letterSpacing" in ctx) ctx.letterSpacing = lineStyle.letterSpacing;

          // fillText TIDAK PERNAH membungkus baris — beda dari CSS, yang akan
          // memecah teks ke baris baru kalau tidak muat. Untuk wordmark besar
          // ini artinya glyph bisa lebih lebar dari boksnya sendiri dan
          // terpotong diam-diam di tepi kanvas. Diukur dulu, dan kalau
          // melebihi lebar boks, font diperkecil proporsional sampai pas —
          // supaya string apa pun panjangnya (locale lain, kata lebih panjang)
          // tetap satu baris utuh, bukan angka ukuran yang ditebak manual.
          const measured = ctx.measureText(text).width;
          if (measured > line.offsetWidth && line.offsetWidth > 0) {
            const scale = line.offsetWidth / measured;
            ctx.font = `${lineStyle.fontWeight} ${Math.floor(baseSize * scale)}px ${lineStyle.fontFamily}`;
          }

          ctx.fillStyle = lineStyle.color;
          const align = lineStyle.textAlign;
          ctx.textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";

          const left = line.offsetLeft - source.offsetLeft;
          const x =
            align === "center"
              ? left + line.offsetWidth / 2
              : align === "right"
                ? left + line.offsetWidth
                : left;

          ctx.fillText(text, x, line.offsetTop - source.offsetTop);
        }

        texture.needsUpdate = true;
        return rect;
      };

      let rect = paint();

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(renderScale());
      // updateStyle dibiarkan default: tanpa ukuran CSS, canvas tampil
      // sebesar piksel intrinsiknya dan meleset sebesar faktor DPR.
      renderer.setSize(rect.width, rect.height);
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const uniforms = {
        uTex: { value: texture },
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(-1, -1) },
        uAspect: { value: rect.width / Math.max(1, rect.height) },
      };

      scene.add(
        new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2),
          new THREE.ShaderMaterial({
            vertexShader: VERTEX,
            fragmentShader: FRAGMENT,
            uniforms,
            transparent: true,
          }),
        ),
      );

      // Teks asli baru disembunyikan setelah canvas siap menggantikannya.
      source.style.visibility = "hidden";

      const resize = () => {
        rect = paint();
        renderer.setSize(rect.width, rect.height);
        uniforms.uAspect.value = rect.width / Math.max(1, rect.height);
      };

      const onPointer = (e: PointerEvent) => {
        const box = renderer.domElement.getBoundingClientRect();
        uniforms.uPointer.value.set(
          (e.clientX - box.left) / box.width,
          1 - (e.clientY - box.top) / box.height,
        );
      };

      let frame = 0;
      const clock = new THREE.Clock();
      const tick = () => {
        uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
        frame = requestAnimationFrame(tick);
      };

      const onVisibility = () => {
        cancelAnimationFrame(frame);
        if (!document.hidden) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      const observer = new ResizeObserver(resize);
      observer.observe(source);
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      // Font yang datang belakangan mengubah metrik teks; gambar ulang.
      document.fonts.ready.then(() => !disposed && resize());

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVisibility);
        texture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        source.style.visibility = "";
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      {children}
      <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0" />
    </div>
  );
}
