"use client";

import { useRef } from "react";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import type { StateMachineInput } from "@rive-app/react-canvas";
import { cn } from "@/lib/utils";

const STATE_MACHINE = "State Machine 1";
const WAVE_PULSE_MS = 350;
const CLICK_PULSE_MS = 250;

/**
 * cat-botton.riv punya empat input boolean ("hover?", "waveR?", "waveL?",
 * "clicked?" — dicek lewat rive.stateMachineInputs, bukan ditebak), tak satu
 * pun trigger. Boolean yang dimaksud dipakai sebagai pulsa (nyala sesaat lalu
 * mati sendiri) diwujudkan manual lewat setTimeout di sini.
 */
function pulse(input: StateMachineInput | null, ms: number) {
  if (!input) return;
  input.value = true;
  window.setTimeout(() => {
    input.value = false;
  }, ms);
}

export type CatSubmitButtonProps = {
  pending: boolean;
  ariaLabel: string;
  className?: string;
};

/**
 * Tombol submit form contact: bentuk tombolnya sendiri datang dari artwork
 * cat-botton.riv (state "Get Started" bawaan filenya) — tidak ada pill/latar
 * tambahan di sini, cuma canvas Rive yang jadi <button type="submit"> asli.
 *
 * Listener bawaan Rive dimatikan (shouldDisableRiveListeners) supaya SEMUA
 * interaksi — mouse, sentuh, keyboard, dan status pending — lewat satu jalur
 * di komponen ini saja, tidak dobel dengan listener internal file-nya.
 */
export default function CatSubmitButton({ pending, ariaLabel, className }: CatSubmitButtonProps) {
  const { rive, RiveComponent } = useRive(
    {
      src: "/rive/cat-botton.riv",
      stateMachines: STATE_MACHINE,
      autoplay: true,
      // BottomCenter, bukan Center: artboard-nya menyediakan ruang kosong di
      // ATAS tombol supaya kucing muat muncul ke sana. Center menaruh tombol
      // idle-nya melayang di tengah kotak (banyak ruang kosong di atas MAUPUN
      // di bawah) — BottomCenter menjejakkan tombolnya ke dasar kotak, ruang
      // kosongnya cuma di atas dan dipakai sungguhan begitu kucingnya muncul.
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
      shouldDisableRiveListeners: true,
    },
    { shouldResizeCanvasToContainer: true, useDevicePixelRatio: true },
  );

  const hover = useStateMachineInput(rive, STATE_MACHINE, "hover?");
  const waveR = useStateMachineInput(rive, STATE_MACHINE, "waveR?");
  const waveL = useStateMachineInput(rive, STATE_MACHINE, "waveL?");
  const clicked = useStateMachineInput(rive, STATE_MACHINE, "clicked?");

  // Sentuh sudah menyalakan hover+wave+clicked sendiri di pointerdown (lihat
  // onPointerDown) supaya reaksinya instan di mobile, bukan menunggu event
  // click yang disintesis browser sesudahnya — flag ini yang menekan event
  // click susulan itu supaya clicked? tidak terpulsa dua kali untuk satu tap.
  const suppressNextClickRef = useRef(false);

  function setHover(active: boolean) {
    if (!hover || pending) return;
    hover.value = active;
    // Nilai input baru kepakai frame berikutnya; render loop bisa idle kalau
    // tak ada yang animasi, jadi bangunkan render-nya secara eksplisit.
    rive?.startRendering();
  }

  function playWave() {
    if (pending) return;
    // File-nya menyediakan reaksi wave kanan DAN kiri terpisah — pilih acak
    // salah satu tiap kali supaya tidak terasa itu-itu saja.
    pulse(Math.random() < 0.5 ? waveR : waveL, WAVE_PULSE_MS);
    rive?.startRendering();
  }

  function playClick() {
    if (pending) return;
    pulse(clicked, CLICK_PULSE_MS);
    rive?.startRendering();
  }

  function onPointerEnter(event: React.PointerEvent<HTMLButtonElement>) {
    // Sentuh tidak punya "hover masuk" yang sungguhan tanpa tekan — biarkan
    // pointerdown di bawah yang menangani mobile.
    if (event.pointerType === "touch") return;
    setHover(true);
    playWave();
  }

  function onPointerLeave() {
    // Berlaku untuk semua jenis pointer, termasuk sentuh — jaring pengaman
    // supaya hover? selalu balik mati begitu kontak lepas dari tombol.
    setHover(false);
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "touch") return;
    suppressNextClickRef.current = true;
    setHover(true);
    playWave();
    playClick();
  }

  function onPointerUp() {
    setHover(false);
  }

  function onPointerCancel() {
    setHover(false);
  }

  function onFocus() {
    setHover(true);
  }

  function onBlur() {
    setHover(false);
  }

  function onClick() {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    // Mouse dan keyboard (Enter/Space pada tombol yang fokus) sampai ke sini.
    playClick();
  }

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={ariaLabel}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onClick}
      className={cn(
        // Artboard aslinya 400x300 (4:3, dicek via rive.artboardWidth/Height),
        // dan wadah di sini dibuat PERSIS 4:3 — bukan sekadar "dekat" seperti
        // ukuran lama (210x135 = 1.56, 260x170 = 1.53). Fit.Contain mengecilkan
        // artwork sampai sisi paling sempit muat: pada kotak yang lebih lebar
        // dari 4:3, tinggi jadi pembatasnya dan sisa lebarnya jadi ruang kosong
        // kiri-kanan yang terbuang — 210px lebar dulu cuma terpakai 180px.
        // Dengan rasio yang sama persis, artwork mengisi penuh kotaknya, jadi
        // kucing + tombolnya membesar dua kali: dari kotak yang lebih besar DAN
        // dari ruang yang tidak lagi terbuang.
        //
        // 240x180 (mobile) muat di viewport tersempit yang diuji: 360px dikurangi
        // padding Container (px-5) dan padding kartu form (p-4) menyisakan ~288px.
        // mx-auto: tombol jadi pusat perhatian yang disengaja, bukan nempel kiri.
        "mx-auto block h-[180px] w-[240px] shrink-0 touch-manipulation overflow-visible select-none sm:h-[240px] sm:w-[320px]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <RiveComponent className="block h-full w-full" />
    </button>
  );
}
