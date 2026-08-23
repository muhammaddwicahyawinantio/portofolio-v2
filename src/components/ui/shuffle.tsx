"use client";

import { createElement, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import "./shuffle.css";

export type ShuffleDirection = "left" | "right" | "up" | "down";

/**
 * Shuffle dari ReactBits (reactbits.dev), diadaptasi ke repo ini.
 *
 * Tiga penyimpangan dari sumbernya:
 *
 * 1. `useGSAP` dari @gsap/react diganti useEffect + gsap.context(fn, scope).
 *    Paket itu belum terpasang, dan useGSAP memang pembungkus tipis atas
 *    keduanya — context yang di-scope ke ref melakukan hal yang sama: hanya
 *    merevert tween yang ia buat sendiri, tidak menyentuh ScrollTrigger lain
 *    di halaman (paku FeatureSteps, ScrollScrub, Reveal).
 * 2. Import dari "@/lib/gsap": ScrollTrigger dan SplitText didaftarkan sekali
 *    di sana, dan hanya di sisi browser.
 * 3. `font-size` dan `font-family` dibuang dari CSS-nya — lihat shuffle.css.
 *
 * SplitText sudah ikut paket gsap publik sejak 3.13, jadi tidak perlu lisensi
 * Club GreenSock.
 */
export default function Shuffle({
  text,
  className = "",
  style,
  shuffleDirection = "right",
  duration = 0.35,
  maxDelay = 0,
  ease = "power3.out",
  threshold = 0.1,
  rootMargin = "-100px",
  tag = "p",
  textAlign = "center",
  onShuffleComplete,
  shuffleTimes = 1,
  animationMode = "evenodd",
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  scrambleCharset = "",
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  shuffleDirection?: ShuffleDirection;
  duration?: number;
  maxDelay?: number;
  ease?: string;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: CSSProperties["textAlign"];
  onShuffleComplete?: () => void;
  shuffleTimes?: number;
  animationMode?: "evenodd" | "random";
  loop?: boolean;
  loopDelay?: number;
  stagger?: number;
  scrambleCharset?: string;
  colorFrom?: string;
  colorTo?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  const splitRef = useRef<SplitText | null>(null);
  const wrappersRef = useRef<HTMLSpanElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const playingRef = useRef(false);
  const hoverHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ("fonts" in document) {
      if (document.fonts.status === "loaded") setFontsLoaded(true);
      else document.fonts.ready.then(() => setFontsLoaded(true));
    } else setFontsLoaded(true);
  }, []);

  const scrollTriggerStart = useMemo(() => {
    const startPct = (1 - threshold) * 100;
    const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || "");
    const mv = mm ? parseFloat(mm[1]!) : 0;
    const mu = mm ? mm[2] || "px" : "px";
    const sign = mv === 0 ? "" : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;
    return `top ${startPct}%${sign}`;
  }, [threshold, rootMargin]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text || !fontsLoaded) return;

    if (respectReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      onShuffleComplete?.();
      return;
    }

    // Scope ke elemen: ctx.revert() hanya membatalkan tween yang dibuat di
    // dalamnya, jadi ScrollTrigger milik komponen lain tidak ikut mati.
    const ctx = gsap.context(() => {
      const removeHover = () => {
        if (hoverHandlerRef.current) {
          el.removeEventListener("mouseenter", hoverHandlerRef.current);
          hoverHandlerRef.current = null;
        }
      };

      const teardown = () => {
        tlRef.current?.kill();
        tlRef.current = null;
        wrappersRef.current.forEach((wrap) => {
          const inner = wrap.firstElementChild;
          const orig = inner?.querySelector('[data-orig="1"]');
          if (orig && wrap.parentNode) wrap.parentNode.replaceChild(orig, wrap);
        });
        wrappersRef.current = [];
        try {
          splitRef.current?.revert();
        } catch {
          /* noop */
        }
        splitRef.current = null;
        playingRef.current = false;
      };

      const build = () => {
        teardown();

        splitRef.current = new SplitText(el, {
          type: "chars",
          charsClass: "shuffle-char",
          wordsClass: "shuffle-word",
          linesClass: "shuffle-line",
          smartWrap: true,
          reduceWhiteSpace: false,
        });

        const chars = splitRef.current.chars ?? [];
        wrappersRef.current = [];

        const rolls = Math.max(1, Math.floor(shuffleTimes));
        const rand = (set: string) => set.charAt(Math.floor(Math.random() * set.length)) || "";
        const vertical = shuffleDirection === "up" || shuffleDirection === "down";

        chars.forEach((raw) => {
          const ch = raw as HTMLElement;
          const parent = ch.parentElement;
          if (!parent) return;

          const { width: w, height: h } = ch.getBoundingClientRect();
          if (!w) return;

          const wrap = document.createElement("span");
          Object.assign(wrap.style, {
            display: "inline-block",
            overflow: "hidden",
            width: `${w}px`,
            height: vertical ? `${h}px` : "auto",
            verticalAlign: "bottom",
          });

          const inner = document.createElement("span");
          Object.assign(inner.style, {
            display: "inline-block",
            whiteSpace: vertical ? "normal" : "nowrap",
            willChange: "transform",
          });

          parent.insertBefore(wrap, ch);
          wrap.appendChild(inner);

          const cell = {
            display: vertical ? "block" : "inline-block",
            width: `${w}px`,
            textAlign: "center",
          };

          const firstOrig = ch.cloneNode(true) as HTMLElement;
          Object.assign(firstOrig.style, cell);

          ch.setAttribute("data-orig", "1");
          Object.assign(ch.style, cell);

          inner.appendChild(firstOrig);
          for (let k = 0; k < rolls; k++) {
            const copy = ch.cloneNode(true) as HTMLElement;
            if (scrambleCharset) copy.textContent = rand(scrambleCharset);
            Object.assign(copy.style, cell);
            inner.appendChild(copy);
          }
          inner.appendChild(ch);

          const steps = rolls + 1;

          if (shuffleDirection === "right" || shuffleDirection === "down") {
            const firstCopy = inner.firstElementChild;
            const real = inner.lastElementChild;
            if (real) inner.insertBefore(real, inner.firstChild);
            if (firstCopy) inner.appendChild(firstCopy);
          }

          if (shuffleDirection === "left" || shuffleDirection === "right") {
            const startX = shuffleDirection === "right" ? -steps * w : 0;
            const finalX = shuffleDirection === "right" ? 0 : -steps * w;
            gsap.set(inner, { x: startX, y: 0, force3D: true });
            inner.setAttribute("data-start-x", String(startX));
            inner.setAttribute("data-final-x", String(finalX));
          } else {
            const startY = shuffleDirection === "down" ? -steps * h : 0;
            const finalY = shuffleDirection === "down" ? 0 : -steps * h;
            gsap.set(inner, { x: 0, y: startY, force3D: true });
            inner.setAttribute("data-start-y", String(startY));
            inner.setAttribute("data-final-y", String(finalY));
          }

          if (colorFrom) inner.style.color = colorFrom;
          wrappersRef.current.push(wrap);
        });
      };

      const strips = () =>
        wrappersRef.current
          .map((w) => w.firstElementChild)
          .filter((s): s is HTMLElement => s instanceof HTMLElement);

      const randomizeScrambles = () => {
        if (!scrambleCharset) return;
        wrappersRef.current.forEach((w) => {
          const strip = w.firstElementChild;
          if (!strip) return;
          const kids = Array.from(strip.children);
          for (let i = 1; i < kids.length - 1; i++) {
            kids[i]!.textContent = scrambleCharset.charAt(
              Math.floor(Math.random() * scrambleCharset.length),
            );
          }
        });
      };

      const cleanupToStill = () => {
        wrappersRef.current.forEach((w) => {
          const strip = w.firstElementChild;
          if (!(strip instanceof HTMLElement)) return;
          const real = strip.querySelector('[data-orig="1"]');
          if (!real) return;
          strip.replaceChildren(real);
          strip.style.transform = "none";
          strip.style.willChange = "auto";
        });
      };

      const armHover = () => {
        if (!triggerOnHover) return;
        removeHover();
        const handler = () => {
          if (playingRef.current) return;
          build();
          randomizeScrambles();
          play();
        };
        hoverHandlerRef.current = handler;
        el.addEventListener("mouseenter", handler);
      };

      function play() {
        const list = strips();
        if (!list.length) return;

        playingRef.current = true;
        const vertical = shuffleDirection === "up" || shuffleDirection === "down";

        const tl = gsap.timeline({
          smoothChildTiming: true,
          repeat: loop ? -1 : 0,
          repeatDelay: loop ? loopDelay : 0,
          onRepeat: () => {
            randomizeScrambles();
            gsap.set(
              list,
              vertical
                ? { y: (_i, t: HTMLElement) => parseFloat(t.getAttribute("data-start-y") || "0") }
                : { x: (_i, t: HTMLElement) => parseFloat(t.getAttribute("data-start-x") || "0") },
            );
            onShuffleComplete?.();
          },
          onComplete: () => {
            playingRef.current = false;
            if (loop) return;
            cleanupToStill();
            if (colorTo) gsap.set(list, { color: colorTo });
            onShuffleComplete?.();
            armHover();
          },
        });

        const addTween = (targets: HTMLElement[], at: number) => {
          const vars: gsap.TweenVars = {
            duration,
            ease,
            force3D: true,
            stagger: animationMode === "evenodd" ? stagger : 0,
          };
          if (vertical) {
            vars.y = (_i: number, t: HTMLElement) =>
              parseFloat(t.getAttribute("data-final-y") || "0");
          } else {
            vars.x = (_i: number, t: HTMLElement) =>
              parseFloat(t.getAttribute("data-final-x") || "0");
          }
          tl.to(targets, vars, at);
          if (colorFrom && colorTo) tl.to(targets, { color: colorTo, duration, ease }, at);
        };

        if (animationMode === "evenodd") {
          const odd = list.filter((_, i) => i % 2 === 1);
          const even = list.filter((_, i) => i % 2 === 0);
          const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
          if (odd.length) addTween(odd, 0);
          if (even.length) addTween(even, odd.length ? oddTotal * 0.7 : 0);
        } else {
          list.forEach((strip) => {
            const at = Math.random() * maxDelay;
            const vars: gsap.TweenVars = { duration, ease, force3D: true };
            if (vertical) vars.y = parseFloat(strip.getAttribute("data-final-y") || "0");
            else vars.x = parseFloat(strip.getAttribute("data-final-x") || "0");
            tl.to(strip, vars, at);
            if (colorFrom && colorTo) {
              tl.fromTo(strip, { color: colorFrom }, { color: colorTo, duration, ease }, at);
            }
          });
        }

        tlRef.current = tl;
      }

      ScrollTrigger.create({
        trigger: el,
        start: scrollTriggerStart,
        once: triggerOnce,
        onEnter: () => {
          build();
          randomizeScrambles();
          play();
          armHover();
          setReady(true);
        },
      });

      return () => {
        removeHover();
        teardown();
      };
    }, ref);

    return () => {
      ctx.revert();
      setReady(false);
    };
  }, [
    text,
    duration,
    maxDelay,
    ease,
    scrollTriggerStart,
    fontsLoaded,
    shuffleDirection,
    shuffleTimes,
    animationMode,
    loop,
    loopDelay,
    stagger,
    scrambleCharset,
    colorFrom,
    colorTo,
    triggerOnce,
    respectReducedMotion,
    triggerOnHover,
    onShuffleComplete,
  ]);

  return createElement(
    tag,
    {
      ref,
      className: `shuffle-parent ${ready ? "is-ready" : ""} ${className}`,
      style: { textAlign, ...style },
    },
    text,
  );
}
