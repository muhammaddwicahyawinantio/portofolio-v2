"use client";
import { useEffect, useRef, useState } from "react";
import type { WeddingPreviewData } from "@/components/wedding/types";

export default function Cover({
  invitation,
  guestName,
}: {
  invitation: WeddingPreviewData;
  guestName: string | null;
}) {
  const [opened, setOpened] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstEvent = invitation.events[0];

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

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
        style={{
          backgroundColor: "var(--w-bg)",
          backgroundImage: invitation.coverImage
            ? `linear-gradient(rgba(20,16,12,0.45),rgba(20,16,12,0.55)), url(${invitation.coverImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p
          className={`text-[11px] tracking-[0.3em] uppercase ${
            invitation.coverImage ? "text-white/80" : "text-[var(--w-accent)]"
          }`}
        >
          The Wedding Of
        </p>
        <h1
          className={`mt-4 font-[family-name:var(--w-font-display)] text-5xl ${
            invitation.coverImage ? "text-white" : "text-[var(--w-primary)]"
          }`}
        >
          {invitation.brideName} &amp; {invitation.groomName}
        </h1>
        {dateLabel ? (
          <p className={`mt-3 text-sm ${invitation.coverImage ? "text-white/90" : ""}`}>{dateLabel}</p>
        ) : null}
        {guestName ? (
          <div className={`mt-8 ${invitation.coverImage ? "text-white/90" : ""}`}>
            <p className="text-xs opacity-80">Kepada Yth.</p>
            <p className="mt-1 font-[family-name:var(--w-font-display)] text-lg">{guestName}</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={open}
          className="mt-10 rounded-full bg-[var(--w-primary)] px-8 py-3 text-xs tracking-[0.2em] text-white uppercase"
        >
          Buka Undangan
        </button>
      </div>
    </>
  );
}
