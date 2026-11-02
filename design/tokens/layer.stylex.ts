import * as stylex from "@stylexjs/stylex";

/** Named stacking steps, lowest first. Components never write a z-index literal. */
export const layer = stylex.defineVars({
  base: "0",
  /** Inside one notification deck (an isolated stack): the front card over the two peeking behind. */
  cardBack: "1",
  cardMid: "2",
  cardFront: "3",
  window: "1",
  /** Floating and pinned windows: above the tiles, under a fullscreen window. */
  floating: "4",
  fullscreen: "5",
  sticky: "20",
  toast: "30",
  osd: "35",
  overlay: "40",
  popover: "45",
  dock: "50",
  lock: "60",
  flash: "70",
  /** The boot splash, the power-off screen and the black cover the desktop fades in from. */
  boot: "80",
  /** The site's own navigation, which floats over the whole machine. */
  nav: "90",
});
