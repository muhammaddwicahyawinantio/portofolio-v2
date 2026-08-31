"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRive, type UseRiveParameters } from "@rive-app/react-canvas";
import { cn } from "@/lib/utils";
import { useInView } from "@/lib/use-in-view";

// These numeric values are the runtime's stable StateMachineInputType values.
// Keeping them here lets the adapter work with Rive files that expose their
// interaction inputs without requiring asset-specific code in every caller.
const STATE_MACHINE_INPUT_TRIGGER = 58;
const STATE_MACHINE_INPUT_BOOLEAN = 59;
const TOUCH_HOVER_HOLD_MS = 900;

export type RiveAnimationProps = {
  /** Public URL or path to a `.riv` file, for example `/rive/cat.riv`. */
  src: string;
  className?: string;
  autoplay?: boolean;
  artboard?: string;
  stateMachines?: string | string[];
  animations?: string | string[];
  ariaLabel?: string;
  removeBackground?: boolean;
  clickSoundSrc?: string;
};

function removeConnectedBackground(imageData: ImageData) {
  const { data, width, height } = imageData;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  const background = [data[0], data[1], data[2]];
  const tolerance = 48;
  let head = 0;
  let tail = 0;

  const isBackground = (index: number) => {
    if (data[index + 3] === 0) return false;
    const distance =
      Math.abs(data[index] - background[0]) +
      Math.abs(data[index + 1] - background[1]) +
      Math.abs(data[index + 2] - background[2]);
    return distance <= tolerance;
  };

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pixel = y * width + x;
    if (visited[pixel]) return;
    visited[pixel] = 1;
    if (isBackground(pixel * 4)) queue[tail++] = pixel;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    data[pixel * 4 + 3] = 0;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
}

/**
 * Small Next.js-safe wrapper around the Rive React runtime.
 *
 * The runtime only starts on the client, while the component itself remains
 * importable from Server Components. The container owns the size so the Rive
 * canvas can resize correctly across desktop and mobile layouts.
 */
export default function RiveAnimation({
  src,
  className,
  autoplay = true,
  artboard,
  stateMachines,
  animations,
  ariaLabel,
  removeBackground = true,
  clickSoundSrc,
}: RiveAnimationProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionLayerRef = useRef<HTMLDivElement>(null);
  const clickSoundRef = useRef<HTMLAudioElement>(null);
  const lastSoundAtRef = useRef(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const stateMachine = typeof stateMachines === "string" ? stateMachines : undefined;

  const playClickSound = useCallback(() => {
    const now = Date.now();
    if (now - lastSoundAtRef.current < 500) return;
    lastSoundAtRef.current = now;

    const sound = clickSoundRef.current;
    if (!sound) return;
    sound.currentTime = 0;
    void sound.play().catch(() => {
      // Browsers only allow audio after a direct visitor interaction.
    });
  }, []);

  useEffect(() => {
    if (!clickSoundSrc) return;

    const isPointInsideRoot = (clientX: number, clientY: number) => {
      const root = rootRef.current;
      if (!root) return false;
      const rect = root.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return false;
      }
      // The hero section is `position: sticky`, so once later sections scroll
      // over it, this box's screen coordinates still match — but the cat is no
      // longer the topmost thing there. Confirm the actual element under the
      // pointer is still ours before playing the sound.
      const topElement = document.elementFromPoint(clientX, clientY);
      return Boolean(topElement && root.contains(topElement));
    };
    const firstChangedTouchInsideRoot = (event: TouchEvent) => {
      for (let index = 0; index < event.changedTouches.length; index += 1) {
        const touch = event.changedTouches.item(index);
        if (touch && isPointInsideRoot(touch.clientX, touch.clientY)) return touch;
      }
      return null;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (isPointInsideRoot(event.clientX, event.clientY)) playClickSound();
    };
    const onTouchStart = (event: TouchEvent) => {
      if (firstChangedTouchInsideRoot(event)) playClickSound();
    };
    const onClick = (event: MouseEvent) => {
      if (isPointInsideRoot(event.clientX, event.clientY)) playClickSound();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("touchstart", onTouchStart, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [clickSoundSrc, playClickSound]);

  const riveParams: UseRiveParameters = {
    src,
    artboard,
    autoplay,
    animations,
    stateMachine,
    stateMachines: Array.isArray(stateMachines) ? stateMachines : undefined,
    // Keep Rive listeners enabled so files with built-in hover/click listeners
    // (such as angrycat.riv) stay interactive.
    shouldDisableRiveListeners: false,
    isTouchScrollEnabled: true,
    enableMultiTouch: true,
    automaticallyHandleEvents: true,
  };

  const { RiveComponent, canvas: riveCanvas, rive } = useRive(riveParams, {
    shouldResizeCanvasToContainer: true,
    useDevicePixelRatio: true,
    // The transparent-background compositor reads the rendered pixels from
    // this canvas. Offscreen rendering can transfer the canvas control away
    // from the DOM on mobile, leaving no readable context or hit target.
    useOffscreenRenderer: false,
  });
  const inView = useInView(rootRef);
  const activeStateMachineName =
    stateMachine ?? (Array.isArray(stateMachines) ? stateMachines[0] : stateMachines) ?? rive?.stateMachineNames[0];

  useEffect(() => {
    if (!rive || !autoplay || stateMachine || Array.isArray(stateMachines) || animations) return;

    // Rive 4.x falls back to the first linear animation when no playback
    // target is supplied. Assets with built-in hover/click listeners need the
    // first state machine to be explicitly played so the runtime can register
    // its pointer listeners as well.
    const defaultStateMachine = rive.stateMachineNames[0];
    if (!defaultStateMachine) return;

    rive.play(defaultStateMachine, true);
    rive.setupRiveListeners({ isTouchScrollEnabled: true });
  }, [animations, autoplay, rive, stateMachine, stateMachines]);

  useEffect(() => {
    if (!rive || !activeStateMachineName) return;

    const inputs = rive.stateMachineInputs(activeStateMachineName) ?? [];
    const booleanInputs = inputs.filter((input) => input.type === STATE_MACHINE_INPUT_BOOLEAN);
    const triggerInputs = inputs.filter((input) => input.type === STATE_MACHINE_INPUT_TRIGGER);
    const namedHoverInputs = booleanInputs.filter((input) => /hover|pointer|mouse|tap|press|active/i.test(input.name));
    const hoverInputs = namedHoverInputs.length ? namedHoverInputs : booleanInputs;
    if (!hoverInputs.length && !triggerInputs.length) return;

    // Use the full-size layer as the touch target. When background removal is
    // enabled the source canvas is visually hidden, and some mobile browsers
    // do not reliably dispatch touch events to an opacity-zero canvas.
    const interactionTarget = interactionLayerRef.current;
    if (!interactionTarget) return;

    let hoverReleaseTimer = 0;
    const clearHoverRelease = () => {
      if (!hoverReleaseTimer) return;
      window.clearTimeout(hoverReleaseTimer);
      hoverReleaseTimer = 0;
    };
    const setHover = (active: boolean) => {
      if (active) clearHoverRelease();
      hoverInputs.forEach((input) => {
        input.value = active;
      });
      // Input values are consumed on the next frame. Explicitly waking the
      // renderer is important on mobile, where the runtime may have paused
      // between intersection-observer frames.
      rive.startRendering();
    };
    const fireTriggers = () => {
      triggerInputs.forEach((input) => input.fire());
      rive.startRendering();
    };
    const releaseTouchHoverSoon = () => {
      clearHoverRelease();
      hoverReleaseTimer = window.setTimeout(() => {
        setHover(false);
        hoverReleaseTimer = 0;
      }, TOUCH_HOVER_HOLD_MS);
    };

    const isSourceCanvasEvent = (event: Event) =>
      Boolean(
        riveCanvas &&
          event.target instanceof Node &&
          riveCanvas.contains(event.target),
      );
    const isInteractionLayerEvent = (event: Event) =>
      Boolean(
        event.target instanceof Node &&
          interactionTarget.contains(event.target),
      );
    const isPointInsideRoot = (clientX: number, clientY: number) => {
      const root = rootRef.current;
      if (!root) return false;
      const rect = root.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return false;
      }
      // Same sticky-cover issue as the click-sound listener above: confirm the
      // topmost element at this point is actually ours, not later content that
      // has scrolled over the (still sticky-positioned) hero.
      const topElement = document.elementFromPoint(clientX, clientY);
      return Boolean(topElement && root.contains(topElement));
    };
    const firstChangedTouchInsideRoot = (event: TouchEvent) => {
      for (let index = 0; index < event.changedTouches.length; index += 1) {
        const touch = event.changedTouches.item(index);
        if (touch && isPointInsideRoot(touch.clientX, touch.clientY)) return touch;
      }
      return null;
    };
    const forwardPointerEventToCanvas = (type: string, event: PointerEvent) => {
      if (!riveCanvas) return;
      riveCanvas.dispatchEvent(
        new PointerEvent(type, {
          altKey: event.altKey,
          bubbles: type !== "pointerenter" && type !== "pointerleave",
          button: event.button,
          buttons: event.buttons,
          cancelable: true,
          clientX: event.clientX,
          clientY: event.clientY,
          composed: true,
          ctrlKey: event.ctrlKey,
          height: event.height,
          isPrimary: event.isPrimary,
          metaKey: event.metaKey,
          pointerId: event.pointerId,
          pointerType: event.pointerType,
          pressure: event.pressure,
          screenX: event.screenX,
          screenY: event.screenY,
          shiftKey: event.shiftKey,
          width: event.width,
        }),
      );
    };

    let touchPointerActive = false;
    let lastPointerActivation = 0;
    let documentTouchActive = false;
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") {
        if (!isSourceCanvasEvent(event)) setHover(true);
        return;
      }
      touchPointerActive = true;
      setHover(true);
      try {
        interactionTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional; touch events still provide the fallback.
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || !touchPointerActive) return;
      // A touchscreen has no real hover event. Treat movement while the
      // finger is down as the equivalent of staying inside the hover target.
      setHover(true);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") {
        if (!isSourceCanvasEvent(event)) {
          fireTriggers();
          playClickSound();
          setHover(false);
          lastPointerActivation = Date.now();
        }
        return;
      }
      fireTriggers();
      playClickSound();
      releaseTouchHoverSoon();
      touchPointerActive = false;
      lastPointerActivation = Date.now();
      try {
        interactionTarget.releasePointerCapture(event.pointerId);
      } catch {
        // The browser may already have released the pointer after touchend.
      }
    };
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && !isSourceCanvasEvent(event)) {
        setHover(true);
      }
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && !isSourceCanvasEvent(event)) {
        setHover(false);
      }
    };
    const onPointerCancel = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      setHover(false);
      touchPointerActive = false;
    };
    const onTouchStart = () => {
      if (touchPointerActive) return;
      setHover(true);
    };
    const onTouchMove = () => {
      if (touchPointerActive) return;
      setHover(true);
    };
    const onTouchEnd = () => {
      // Modern browsers can emit both PointerEvents and TouchEvents for one
      // finger tap. PointerUp already fired the trigger, so do not fire it a
      // second time when the matching TouchEnd arrives.
      if (touchPointerActive || Date.now() - lastPointerActivation < 500) return;
      fireTriggers();
      playClickSound();
      releaseTouchHoverSoon();
      lastPointerActivation = Date.now();
    };
    const onTouchCancel = () => {
      if (touchPointerActive) return;
      setHover(false);
    };
    const onClick = (event: MouseEvent) => {
      // If the source canvas received the click, the Rive runtime owns it.
      // Otherwise this layer is the fallback target (notably on mobile when
      // the source canvas is hidden by the background compositor).
      if (isSourceCanvasEvent(event) || Date.now() - lastPointerActivation < 500) {
        return;
      }
      fireTriggers();
      playClickSound();
    };
    const onDocumentPointerDown = (event: PointerEvent) => {
      if (
        event.pointerType !== "touch" ||
        isInteractionLayerEvent(event) ||
        !isPointInsideRoot(event.clientX, event.clientY)
      ) {
        return;
      }
      documentTouchActive = true;
      touchPointerActive = true;
      forwardPointerEventToCanvas("pointerover", event);
      forwardPointerEventToCanvas("pointerenter", event);
      forwardPointerEventToCanvas("pointermove", event);
      forwardPointerEventToCanvas("pointerdown", event);
      setHover(true);
    };
    const onDocumentPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || !documentTouchActive) return;
      forwardPointerEventToCanvas("pointerup", event);
      fireTriggers();
      playClickSound();
      releaseTouchHoverSoon();
      documentTouchActive = false;
      touchPointerActive = false;
      lastPointerActivation = Date.now();
    };
    const onDocumentPointerCancel = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || !documentTouchActive) return;
      forwardPointerEventToCanvas("pointercancel", event);
      forwardPointerEventToCanvas("pointerout", event);
      forwardPointerEventToCanvas("pointerleave", event);
      setHover(false);
      documentTouchActive = false;
      touchPointerActive = false;
    };
    const onDocumentTouchStart = (event: TouchEvent) => {
      if (isInteractionLayerEvent(event) || !firstChangedTouchInsideRoot(event)) return;
      documentTouchActive = true;
      setHover(true);
    };
    const onDocumentTouchEnd = (event: TouchEvent) => {
      if (
        !documentTouchActive ||
        isInteractionLayerEvent(event) ||
        !firstChangedTouchInsideRoot(event) ||
        Date.now() - lastPointerActivation < 500
      ) {
        return;
      }
      fireTriggers();
      playClickSound();
      releaseTouchHoverSoon();
      documentTouchActive = false;
      lastPointerActivation = Date.now();
    };
    const onDocumentTouchCancel = () => {
      if (!documentTouchActive) return;
      setHover(false);
      documentTouchActive = false;
    };

    interactionTarget.addEventListener("pointerdown", onPointerDown);
    interactionTarget.addEventListener("pointermove", onPointerMove);
    interactionTarget.addEventListener("pointerup", onPointerUp);
    interactionTarget.addEventListener("pointercancel", onPointerCancel);
    interactionTarget.addEventListener("pointerover", onPointerOver);
    interactionTarget.addEventListener("pointerout", onPointerOut);
    interactionTarget.addEventListener("touchstart", onTouchStart, { passive: true });
    interactionTarget.addEventListener("touchmove", onTouchMove, { passive: true });
    interactionTarget.addEventListener("touchend", onTouchEnd, { passive: true });
    interactionTarget.addEventListener("touchcancel", onTouchCancel, { passive: true });
    interactionTarget.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onDocumentPointerDown, true);
    document.addEventListener("pointerup", onDocumentPointerUp, true);
    document.addEventListener("pointercancel", onDocumentPointerCancel, true);
    document.addEventListener("touchstart", onDocumentTouchStart, { capture: true, passive: true });
    document.addEventListener("touchend", onDocumentTouchEnd, { capture: true, passive: true });
    document.addEventListener("touchcancel", onDocumentTouchCancel, { capture: true, passive: true });

    return () => {
      interactionTarget.removeEventListener("pointerdown", onPointerDown);
      interactionTarget.removeEventListener("pointermove", onPointerMove);
      interactionTarget.removeEventListener("pointerup", onPointerUp);
      interactionTarget.removeEventListener("pointercancel", onPointerCancel);
      interactionTarget.removeEventListener("pointerover", onPointerOver);
      interactionTarget.removeEventListener("pointerout", onPointerOut);
      interactionTarget.removeEventListener("touchstart", onTouchStart);
      interactionTarget.removeEventListener("touchmove", onTouchMove);
      interactionTarget.removeEventListener("touchend", onTouchEnd);
      interactionTarget.removeEventListener("touchcancel", onTouchCancel);
      interactionTarget.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onDocumentPointerDown, true);
      document.removeEventListener("pointerup", onDocumentPointerUp, true);
      document.removeEventListener("pointercancel", onDocumentPointerCancel, true);
      document.removeEventListener("touchstart", onDocumentTouchStart, true);
      document.removeEventListener("touchend", onDocumentTouchEnd, true);
      document.removeEventListener("touchcancel", onDocumentTouchCancel, true);
      clearHoverRelease();
    };
  }, [activeStateMachineName, playClickSound, rive, riveCanvas]);

  useEffect(() => {
    if (!removeBackground || !riveCanvas || !inView) {
      setIsProcessing(false);
      return;
    }

    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;
    const displayContext = displayCanvas.getContext("2d", { willReadFrequently: false });
    if (!displayContext) return;

    const source2d = riveCanvas.getContext("2d");
    const sourceGl = source2d ? null : riveCanvas.getContext("webgl2") ?? riveCanvas.getContext("webgl");
    if (!source2d && !sourceGl) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    let frame = 0;

    const processFrame = () => {
      const width = riveCanvas.width;
      const height = riveCanvas.height;
      if (width > 0 && height > 0) {
        if (displayCanvas.width !== width || displayCanvas.height !== height) {
          displayCanvas.width = width;
          displayCanvas.height = height;
        }

        let imageData: ImageData;
        if (source2d) {
          imageData = source2d.getImageData(0, 0, width, height);
        } else {
          const pixels = new Uint8Array(width * height * 4);
          sourceGl?.readPixels(0, 0, width, height, sourceGl.RGBA, sourceGl.UNSIGNED_BYTE, pixels);
          const flipped = new Uint8ClampedArray(pixels.length);
          for (let y = 0; y < height; y += 1) {
            const sourceRow = (height - y - 1) * width * 4;
            const targetRow = y * width * 4;
            flipped.set(pixels.subarray(sourceRow, sourceRow + width * 4), targetRow);
          }
          imageData = new ImageData(flipped, width, height);
        }

        removeConnectedBackground(imageData);
        displayContext.putImageData(imageData, 0, 0);
      }
      frame = window.requestAnimationFrame(processFrame);
    };

    frame = window.requestAnimationFrame(processFrame);
    return () => window.cancelAnimationFrame(frame);
  }, [removeBackground, riveCanvas, inView]);

  return (
    <div
      className={cn("relative", className)}
      ref={rootRef}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <div
        className={cn(
          "pointer-events-auto absolute inset-0 touch-manipulation [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:touch-manipulation",
          removeBackground && isProcessing ? "opacity-0" : "opacity-100",
        )}
        ref={interactionLayerRef}
        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      >
        <RiveComponent className="block h-full w-full select-none" />
      </div>
      {clickSoundSrc ? (
        <audio ref={clickSoundRef} src={clickSoundSrc} preload="auto" />
      ) : null}
      {removeBackground ? (
        <canvas
          ref={displayCanvasRef}
          className="pointer-events-none block h-full w-full"
        />
      ) : null}
    </div>
  );
}
