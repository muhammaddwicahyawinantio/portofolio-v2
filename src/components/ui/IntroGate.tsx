"use client";

import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import Intro from "@/components/ui/Intro";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function IntroGate({ children }: { children: ReactNode }) {
  const lenis = useLenis();
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isIntroDismissed, setIsIntroDismissed] = useState(false);

  useEffect(() => {
    if (isIntroDismissed) return;
    lenis?.stop();

    return () => {
      lenis?.start();
    };
  }, [isIntroDismissed, lenis]);

  useLayoutEffect(() => {
    if (isIntroDismissed) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isIntroDismissed]);

  const completeIntro = useCallback(() => {
    setIsIntroComplete(true);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait" onExitComplete={() => setIsIntroDismissed(true)}>
        {!isIntroComplete ? <Intro key="dwistudio-intro" onComplete={completeIntro} /> : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isIntroComplete ? 1 : 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className={isIntroDismissed ? undefined : "pointer-events-none"}
      >
        {children}
      </motion.div>
    </>
  );
}
