"use client";

import { useEffect, useRef } from "react";
import { canRunHeavyEffects, renderScale } from "@/lib/webgl";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/**
 * Tinta yang menyebar pelan. Intinya domain warping: hasil fbm dipakai lagi
 * sebagai koordinat fbm berikutnya, dua tingkat. Itu yang mengubah noise biasa
 * jadi pusaran menyerupai tinta di air, bukan bintik acak.
 *
 * Keluarannya sengaja sangat gelap — ini gerak di latar, bukan tekstur yang
 * bersaing dengan teks di depannya.
 */
const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uPointer;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * (uRes.x / uRes.y), uv.y) * 2.2;
    float t = uTime * 0.05;

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7, 9.2) + 0.15 * t),
      fbm(p + 3.0 * q + vec2(8.3, 2.8) - 0.12 * t)
    );
    float ink = fbm(p + 3.5 * r);

    // Kursor menarik tinta ke arahnya, sangat halus.
    float pull = smoothstep(0.45, 0.0, distance(uv, uPointer));
    ink += pull * 0.14;

    float v = smoothstep(0.32, 0.9, ink);
    gl_FragColor = vec4(vec3(v) * 0.06, 1.0);
  }
`;

export default function LiquidBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !canRunHeavyEffects()) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    // Import dinamis: Three.js baru diunduh setelah perangkat lolos gerbang.
    import("three").then((THREE) => {
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
      renderer.setPixelRatio(renderScale());
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const uniforms = {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      };

      scene.add(
        new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2),
          new THREE.ShaderMaterial({ vertexShader: VERTEX, fragmentShader: FRAGMENT, uniforms }),
        ),
      );

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = document.documentElement;
        renderer.setSize(w, h);
        uniforms.uRes.value.set(w, h);
      };
      resize();

      const onPointer = (e: PointerEvent) => {
        uniforms.uPointer.value.set(
          e.clientX / window.innerWidth,
          1 - e.clientY / window.innerHeight,
        );
      };

      let frame = 0;
      const clock = new THREE.Clock();
      const tick = () => {
        uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
        frame = requestAnimationFrame(tick);
      };

      // Berhenti total saat tab tidak terlihat: shader fullscreen di tab
      // belakang adalah pemborosan baterai yang paling sering terlewat.
      const onVisibility = () => {
        cancelAnimationFrame(frame);
        if (!document.hidden) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVisibility);
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
