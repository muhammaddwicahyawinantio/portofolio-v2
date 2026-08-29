export const INTRO_REPLAY_EVENT = "dwi:intro-replay";
export const INTRO_MIN_VISIBLE_MS = 2500;
export const INTRO_MAX_VISIBLE_MS = 3800;

function delay(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function waitForImage(image: HTMLImageElement) {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();
  if (typeof image.decode === "function") {
    return image.decode().catch(() => {});
  }

  return new Promise<void>((resolve) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => resolve(), { once: true });
  });
}

function waitForImageUrl(src: string | null | undefined) {
  if (!src) return Promise.resolve();

  const image = new Image();
  image.src = src;
  return waitForImage(image);
}

function waitForVideoMetadata(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return Promise.resolve();

  video.preload = "metadata";
  video.load();

  return new Promise<void>((resolve) => {
    video.addEventListener("loadedmetadata", () => resolve(), { once: true });
    video.addEventListener("error", () => resolve(), { once: true });
  });
}

async function waitForCriticalAssets() {
  const fonts = document.fonts?.ready.catch(() => undefined) ?? Promise.resolve();
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("main img, header img"))
    .slice(0, 8)
    .map(waitForImage);
  const heroVideo = document.querySelector<HTMLVideoElement>("[data-hero-video]");
  const heroPoster = heroVideo ? waitForImageUrl(heroVideo.poster) : Promise.resolve();
  const heroMetadata = heroVideo ? waitForVideoMetadata(heroVideo) : Promise.resolve();

  await Promise.all([fonts, heroPoster, heroMetadata, ...images]);
}

export async function waitForIntroGate(startedAt: number) {
  const elapsed = performance.now() - startedAt;
  const minRemaining = Math.max(0, INTRO_MIN_VISIBLE_MS - elapsed);
  const maxRemaining = Math.max(0, INTRO_MAX_VISIBLE_MS - elapsed);

  await Promise.all([
    delay(minRemaining),
    Promise.race([waitForCriticalAssets(), delay(maxRemaining)]),
  ]);
}

/**
 * Trigger replay intro dari mana saja: `replayIntro()` di kode, atau
 * `window.dwiIntroReplay()` dari console.
 *
 * Sengaja terpisah dari Intro.tsx: satu modul yang mengekspor komponen React
 * sekaligus nilai biasa memaksa Fast Refresh melakukan full reload tiap edit.
 */
export function replayIntro() {
  window.dispatchEvent(new Event(INTRO_REPLAY_EVENT));
}
