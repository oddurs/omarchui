import * as stylex from "@stylexjs/stylex";

const REDUCED = "@media (prefers-reduced-motion: reduce)";

/** Three speeds, one curve. Nothing bounces; nothing fades text in. */
export const motion = stylex.defineVars({
  tick: { default: "120ms", [REDUCED]: "0ms" },
  move: { default: "180ms", [REDUCED]: "0ms" },
  travel: { default: "240ms", [REDUCED]: "0ms" },
  ease: "cubic-bezier(0.2, 0.7, 0.1, 1)",
});
