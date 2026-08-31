"use client";
import { useEffect, useRef, useState } from "react";
import type { WeddingPreviewData } from "@/components/wedding/types";
import { photoBackgroundStyle } from "../utils";

/**
 * Full-screen lock gate, shown before the guest opens the invitation. Public
 * mode only (preview always starts opened, no overlay, no scroll-lock, no
 * autoplay — matches classic-elegant's Cover.tsx preview branch). Also owns
 * the document-level `scroll-snap-type` toggle that the slide sections
 * (wrapped individually via SectionMotion in index.tsx) rely on for their
 * `snap-start` alignment — set here (not in the shared undangan layout) so
 * it never touches classic-elegant's rendering.
 */
export default function OpeningGate({
  invitation,
  guestName,
  preview = false,
}: {
  invitation: WeddingPreviewData;
  guestName: string | null;
  preview?: boolean;
}) {
  const [opened, setOpened] = useState(preview);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstEvent = invitation.events[0];

  useEffect(() => {
    if (preview) return;
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened, preview]);

  useEffect(() => {
    if (preview) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.style.scrollSnapType = "y proximity";
    return () => {
      document.documentElement.style.scrollSnapType = "";
    };
  }, [preview]);

  function open() {
    setOpened(true);
    if (invitation.isMusicEnabled && audioRef.current) audioRef.current.play().catch(() => {});
  }

  const dateLabel = firstEvent
    ? new Date(firstEvent.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const bg = photoBackgroundStyle(invitation.coverImage);

  const inner = (
    <div className="flex flex-col items-center text-center text-white">
      <p className="text-[11px] tracking-[0.35em] text-white/75 uppercase">The Wedding Of</p>
      <h1 className="mt-5 font-[family-name:var(--w-font-display)] text-4xl sm:text-5xl">
        {invitation.brideName} &amp; {invitation.groomName}
      </h1>
      {dateLabel ? <p className="mt-4 text-sm text-white/85">{dateLabel}</p> : null}
      {guestName ? (
        <div className="mt-10">
          <p className="text-xs tracking-[0.2em] text-white/60 uppercase">Kepada Yth.</p>
          <p className="mt-2 font-[family-name:var(--w-font-display)] text-xl">{guestName}</p>
        </div>
      ) : null}
      {preview ? null : (
        <button
          type="button"
          onClick={open}
          className="mt-12 rounded-full border border-white/40 bg-white/10 px-9 py-3 text-xs tracking-[0.25em] text-white uppercase backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Buka Undangan
        </button>
      )}
    </div>
  );

  if (preview) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16" style={bg}>
        {inner}
      </div>
    );
  }

  return (
    <>
      {invitation.isMusicEnabled && invitation.musicUrl ? (
        <audio ref={audioRef} src={invitation.musicUrl} loop preload="auto" />
      ) : null}
      <div
        aria-hidden={opened}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 transition-opacity duration-700 ${
          opened ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={bg}
      >
        {inner}
      </div>
    </>
  );
}
