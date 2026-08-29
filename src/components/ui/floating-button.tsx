"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Diadaptasi dari resep "floating action button" yang umum beredar. Tiga
 * penyimpangan dari sumbernya:
 *
 * 1. `usehooks-ts` tidak dipasang untuk satu hook — klik-di-luar ditulis
 *    langsung di bawah, cukup satu listener pointerdown.
 * 2. Daftarnya sekarang dirender kondisional di dalam AnimatePresence
 *    (`{isOpen && <motion.ul>}`), bukan selalu terpasang dengan opacity 0.
 *    Versi selalu-terpasang tetap bisa diklik/di-tab walau "tertutup" —
 *    AnimatePresence baru berguna kalau elemennya benar-benar lepas dari DOM.
 * 3. `ref` klik-luar dipindah ke wrapper terluar, bukan cuma tombol trigger,
 *    supaya klik salah satu item daftar tidak ikut terhitung "di luar".
 */
type FloatingButtonProps = {
  className?: string;
  children: ReactNode;
  triggerContent: ReactNode;
};

type FloatingButtonItemProps = {
  children: ReactNode;
};

const list = {
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, staggerDirection: -1 },
  },
  hidden: {
    opacity: 0,
    transition: { when: "afterChildren", staggerChildren: 0.1 },
  },
};

const item = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 5 },
};

const btn = {
  visible: { rotate: 45 },
  hidden: { rotate: 0 },
};

function useCloseOnOutsideClick(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [ref, onClose]);
}

function FloatingButton({ className, children, triggerContent }: FloatingButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useCloseOnOutsideClick(ref, () => setIsOpen(false));

  return (
    <div ref={ref} className={cn("relative flex flex-col items-center", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="absolute bottom-full mb-2 flex flex-col items-center gap-2"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={list}
          >
            {children}
          </motion.ul>
        )}
      </AnimatePresence>
      <motion.div
        variants={btn}
        animate={isOpen ? "visible" : "hidden"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {triggerContent}
      </motion.div>
    </div>
  );
}

function FloatingButtonItem({ children }: FloatingButtonItemProps) {
  return <motion.li variants={item}>{children}</motion.li>;
}

export { FloatingButton, FloatingButtonItem };
