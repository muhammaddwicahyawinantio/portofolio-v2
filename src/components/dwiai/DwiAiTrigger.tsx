"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Sparkles } from "lucide-react";

const DwiAiWidget = dynamic(() => import("@/components/dwiai/DwiAiWidget"), {
  ssr: false,
  loading: () => null,
});

export function DwiAiTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messagesReady, setMessagesReady] = useState(false);
  const readyTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (readyTimerRef.current !== null) window.clearTimeout(readyTimerRef.current);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  function openChat() {
    if (readyTimerRef.current !== null) window.clearTimeout(readyTimerRef.current);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    setMessagesReady(false);
    setIsClosing(false);
    setIsOpen(true);
    readyTimerRef.current = window.setTimeout(() => {
      readyTimerRef.current = null;
      setMessagesReady(true);
    }, 230);
  }

  function closeChat() {
    if (readyTimerRef.current !== null) window.clearTimeout(readyTimerRef.current);
    setMessagesReady(false);
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setIsOpen(false);
      setIsClosing(false);
    }, 180);
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          className="border-line bg-card/95 text-ink shadow-card group fixed right-3 bottom-3 z-50 inline-flex items-center gap-1.5 rounded-full border px-3 py-2 font-mono text-[10px] font-medium tracking-[0.12em] uppercase backdrop-blur transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04] active:scale-[0.94] sm:right-5 sm:bottom-5 sm:px-4 sm:py-2.5 sm:text-[11px]"
        >
          <Sparkles className="text-gold-ink h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
          <span>Dwi AI</span>
          <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" strokeWidth={1.8} aria-hidden />
        </button>
      )}

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close Dwi AI"
            onClick={closeChat}
            data-state={isClosing ? "closing" : "open"}
            className="dwiai-overlay fixed inset-0 z-40 bg-ink/18"
          />
          <div
            data-state={isClosing ? "closing" : "open"}
            className="dwiai-panel bg-cream fixed right-3 bottom-3 z-50 h-[min(560px,calc(100dvh-1.5rem))] w-[min(380px,calc(100vw-1.5rem))] origin-bottom-right overflow-hidden rounded-2xl shadow-2xl sm:right-6 sm:bottom-6"
          >
            {messagesReady ? <DwiAiWidget onClose={closeChat} canAnimateMessages /> : null}
          </div>
        </>
      )}
    </>
  );
}
