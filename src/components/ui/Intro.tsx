"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

type IntroProps = {
  onComplete: () => void;
};

const EASE = [0.16, 1, 0.3, 1] as const;
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;
const INTRO_DURATION_MS = 2600;
const HOLD_AFTER_COMPLETE_MS = 1500;

export default function Intro({ onComplete }: IntroProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 300 : INTRO_DURATION_MS;
    const startedAt = performance.now();
    let frame = 0;
    let completionTimer = 0;
    let holdTimer = 0;
    let done = false;

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(nextProgress);

      if (elapsed >= duration) {
        if (!done) {
          done = true;
          setProgress(100);
          holdTimer = window.setTimeout(
            () => {
              completionTimer = window.setTimeout(onComplete, 0);
            },
            reduceMotion ? 80 : HOLD_AFTER_COMPLETE_MS,
          );
        }
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      done = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(completionTimer);
      window.clearTimeout(holdTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-white text-black"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 1,
        backgroundColor: "#000000",
        color: "#ffffff",
        y: "-100%",
        transition: { duration: 1.35, ease: CURTAIN_EASE },
      }}
      aria-label="Loading DwiStudio"
      role="status"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: EASE }}
      />

      <div className="relative z-10 flex w-[min(42rem,calc(100vw-3rem))] flex-col items-center gap-8 px-6 text-center">
        <motion.div
          className="font-rampart-one text-[clamp(4.5rem,16vw,10rem)] leading-none font-normal tracking-normal tabular-nums"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {String(progress).padStart(3, "0")}
        </motion.div>

        <motion.p
          className="font-mono text-[10px] tracking-[0.24em] uppercase sm:text-xs"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          Website Developement - Digital Products
        </motion.p>

        <div className="w-full max-w-md">
          <div className="h-px w-full overflow-hidden bg-black/15">
            <motion.span
              className="block h-full origin-left bg-black"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.12, ease: "linear" }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
