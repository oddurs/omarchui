import * as stylex from "@stylexjs/stylex";

const DARK = "@media (prefers-color-scheme: dark)";

/**
 * Colour roles. Keys keep their literal `--name` so a theme is applied at runtime by
 * writing eighteen custom properties onto <html> (see lib/theme-runtime.ts).
 * Defaults: Catppuccin Latte in light, Tokyo Night in dark; checked against
 * lib/themes.ts by tests/tokens.test.ts.
 */
export const color = stylex.defineVars({
  "--wall": { default: "#d7d8dc", [DARK]: "#0e0e14" },
  "--sunken": { default: "#e3e4e8", [DARK]: "#13141c" },
  "--surface": { default: "#eff1f5", [DARK]: "#1a1b26" },
  "--raised": { default: "#f9f9fb", [DARK]: "#24283b" },
  "--line": { default: "#ccd0da", [DARK]: "#292e42" },
  "--line-2": { default: "#acb0be", [DARK]: "#414868" },
  "--text": { default: "#3e4156", [DARK]: "#c0caf5" },
  "--text-2": { default: "#4d506a", [DARK]: "#9fa7cc" },
  "--text-3": { default: "#595c74", [DARK]: "#878faf" },
  "--accent": { default: "#1955cb", [DARK]: "#7aa2f7" },
  "--on-accent": { default: "#ffffff", [DARK]: "#000000" },
  "--red": { default: "#bb0d33", [DARK]: "#f7768e" },
  "--green": { default: "#2b6b1d", [DARK]: "#9ece6a" },
  "--yellow": { default: "#815211", [DARK]: "#e0af68" },
  "--blue": { default: "#1955cb", [DARK]: "#7aa2f7" },
  "--magenta": { default: "#8a4678", [DARK]: "#ad8ee6" },
  "--cyan": { default: "#10686d", [DARK]: "#449dab" },
  "--orange": { default: "#a43b21", [DARK]: "#eb927b" },
  "--ok": "var(--green)",
  "--warn": "var(--yellow)",
  "--err": "var(--red)",
  "--info": "var(--cyan)",
  "--halo": "color-mix(in oklab, var(--accent) 32%, transparent)",
  "--tint": "color-mix(in oklab, var(--accent) 14%, transparent)",
  "--scrim": "color-mix(in oklab, var(--wall) 55%, transparent)",
});
