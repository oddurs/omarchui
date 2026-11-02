import * as stylex from "@stylexjs/stylex";

/** Named stacking steps, lowest first. Components never write a z-index literal. */
export const layer = stylex.defineVars({
  base: "0",
  window: "1",
  fullscreen: "5",
  sticky: "20",
  toast: "30",
  osd: "35",
  overlay: "40",
  popover: "45",
  dock: "50",
  lock: "60",
  flash: "70",
});
