"use client";
import { useEffect, useRef, useState } from "react";
import type { WeddingPreviewData } from "@/components/wedding/types";

export default function Cover({
  invitation,
  guestName,
  preview = false,
}: {
  invitation: WeddingPreviewData;
  guestName: string | null;
  preview?: boolean;
}) {
  // Preview starts opened so the admin sees the content, not the locked gate.
  const [opened, setOpened] = useState(preview);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstEvent = invitation.events[0];

  useEffect(() => {
    if (preview) return; // never touch the admin page's body scroll
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened, preview]);

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

  const onImage = Boolean(invitation.coverImage);

  const inner = (
    <>
      <p
        className={`text-[11px] tracking-[0.3em] uppercase ${
          onImage ? "text-white/80" : "text-[var(--w-accent)]"
        }`}
      >
        The Wedding Of
      </p>
      <h1
        className={`mt-4 font-[family-name:var(--w-font-display)] text-5xl ${
          onImage ? "text-white" : "text-[var(--w-primary)]"
        }`}
      >
        {invitation.brideName} &amp; {invitation.groomName}
      </h1>
      {dateLabel ? (
        <p className={`mt-3 text-sm ${onImage ? "text-white/90" : ""}`}>{dateLabel}</p>
      ) : null}
      {guestName ? (
        <div className={`mt-8 ${onImage ? "text-white/90" : ""}`}>
          <p className="text-xs opacity-80">Kepada Yth.</p>
          <p className="mt-1 font-[family-name:var(--w-font-display)] text-lg">{guestName}</p>
        </div>
      ) : null}
      {preview ? null : (
        <button
          type="button"
          onClick={open}
          className="mt-10 rounded-full bg-[var(--w-primary)] px-8 py-3 text-xs tracking-[0.2em] text-white uppercase"
        >
          Buka Undangan
        </button>
      )}
    </>
  );

  const bgStyle = {
    backgroundColor: "var(--w-bg)",
    backgroundImage: onImage
      ? `linear-gradient(rgba(20,16,12,0.45),rgba(20,16,12,0.55)), url(${invitation.coverImage})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  } as const;

  // Admin preview: inline hero inside the device frame, no fixed overlay,
  // no scroll-lock, no audio element (music must not autoplay in preview).
  if (preview) {
    return (
      <div
        className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center"
        style={bgStyle}
      >
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
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-700 ${
          opened ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={bgStyle}
      >
        {inner}
      </div>
    </>
  );
}
