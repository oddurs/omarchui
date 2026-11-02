import * as stylex from "@stylexjs/stylex";

/**
 * Colours of the machine before any theme is drawn. Hyprland's background is black
 * (default/hypr/looknfeel.lua:111), and a fresh login fades in from black. The ink is the one
 * line shown while powered off, kept above 7:1 on black.
 */
export const machine = stylex.defineVars({
  black: "#000000",
  ink: "#a3a3a3",
});
