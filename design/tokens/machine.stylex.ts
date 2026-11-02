import * as stylex from "@stylexjs/stylex";

/**
 * Colours of the machine before any theme is drawn. Hyprland's background is black
 * (default/hypr/looknfeel.lua:111), and a fresh login fades in from black. The ink is the one
 * line shown while powered off, kept above 7:1 on black.
 */
export const machine = stylex.defineVars({
  black: "#000000",
  ink: "#a3a3a3",
  /**
   * The boot's ground before any theme loads: Limine's backdrop (default/limine/limine.conf:11-12)
   * and Plymouth's background, rgb(0.101, 0.105, 0.149) (default/plymouth/omarchy.script:3-4).
   */
  boot: "#1a1b26",
  /**
   * Limine's menu, from Omarchy's config: text in term_foreground, the branding and help keys in
   * interface_branding_color, comments in the palette's cyan. default/limine/limine.conf:5-8,15,19.
   */
  limineInk: "#c0caf5",
  limineBrand: "#9ece6a",
  limineComment: "#7dcfff",
  /** Limine draws a built-in 8x16 bitmap font; JetBrains Mono at 15px has its 9px advance. */
  limineGlyph: "15px",
});
