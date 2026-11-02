import * as stylex from "@stylexjs/stylex";

/**
 * The one focus language. `ring` for free-standing controls, `inset` where a ring would be
 * clipped (rows in a list, buttons in a bar), `halo` for windows and fields that already
 * draw an accent border.
 */
export const focus = stylex.defineVars({
  ring: "0 0 0 1px var(--accent), 0 0 0 4px var(--halo)",
  inset: "inset 0 0 0 1px var(--accent)",
  halo: "0 0 0 3px var(--halo)",
});
