export const INTRO_REPLAY_EVENT = "dwi:intro-replay";

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
