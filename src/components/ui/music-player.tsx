"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import TiltedCard from "@/components/ui/tilted-card";

export type MusicTrack = {
  id: string;
  title: string;
  cover: string;
  audioUrl: string;
};

function clock(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Pemutar ala Spotify, disusun sebagai grid kartu yang sama persis dengan
 * kolom film: dua kolom, sampul di dalam TiltedCard, judul di bawahnya, dan
 * amplitudo tilt yang sama (12 / 1.08). Sebelumnya ini daftar vertikal dengan
 * thumbnail 96px — tilt-nya nyaris tidak terbaca pada ukuran sekecil itu.
 *
 * Rasio sampul tetap persegi, bukan 4/3 seperti kartu film: sampul album memang
 * persegi, dan memaksanya jadi 4/3 hanya akan memotongnya.
 *
 * SATU elemen <audio> dipakai bersama seluruh trek, bukan satu per kartu. Itu
 * yang membuat perilakunya seperti Spotify tanpa kode koordinasi: menekan trek
 * lain otomatis menghentikan yang sedang berjalan, karena memang tidak ada
 * pemutar kedua yang bisa berbunyi.
 *
 * Berkasnya baru ditarik saat kartu ditekan — `src` diisi di dalam handler, dan
 * preload="none" menjaga agar tidak ada satu byte pun terunduh sebelum itu.
 *
 * Bilah progres berada DI LUAR <button>, bukan di dalamnya: <input> di dalam
 * <button> markup yang tidak sah, dan geseran mouse-nya akan tertelan klik
 * tombol induknya.
 */
export default function MusicPlayer({ tracks }: { tracks: MusicTrack[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  if (tracks.length === 0) return null;

  async function toggle(track: MusicTrack) {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.src = track.audioUrl;
    setTime(0);
    setDuration(0);
    try {
      await audio.play();
      setPlayingId(track.id);
    } catch {
      // Autoplay ditolak atau berkasnya gagal dimuat; biarkan diam.
      setPlayingId(null);
    }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = value;
    setTime(value);
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setPlayingId(null);
          setTime(0);
        }}
      />

      <ul className="grid grid-cols-3 gap-4">
        {tracks.map((track) => {
          const active = playingId === track.id;

          return (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => toggle(track)}
                aria-pressed={active}
                className="group block w-full text-left"
              >
                <TiltedCard rotateAmplitude={12} scaleOnHover={1.08}>
                  <div className="border-line rounded-card relative aspect-square w-full overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
                    <img src={track.cover} alt="" className="h-full w-full object-cover" />

                    {/* Tetap terlihat saat trek berjalan, muncul saat hover kalau
                        tidak — jadi kartu yang sedang diputar selalu terbaca. */}
                    <span
                      data-active={active}
                      className="bg-charcoal/55 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 data-[active=true]:opacity-100"
                    >
                      <span className="bg-card text-ink flex size-11 items-center justify-center rounded-full">
                        {active ? (
                          <Pause aria-hidden className="size-5" />
                        ) : (
                          <Play aria-hidden className="size-5" />
                        )}
                      </span>
                    </span>
                  </div>
                </TiltedCard>

                <p className="group-hover:text-ink-soft mt-3 truncate text-sm font-semibold transition-colors">
                  {track.title}
                </p>
              </button>

              {active ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={duration > 0 ? duration : 100}
                    value={time}
                    step={0.1}
                    onChange={(e) => seek(Number(e.target.value))}
                    aria-label={track.title}
                    className="accent-gold-ink bg-cream-deep h-1 w-full cursor-pointer appearance-none rounded-full"
                  />
                  <span className="text-ink-soft shrink-0 font-mono text-[10px] tabular-nums">
                    {clock(time)}
                  </span>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
