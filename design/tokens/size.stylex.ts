import * as stylex from "@stylexjs/stylex";

/** Fixed dimensions of parts, all on the 4px grid. */
export const size = stylex.defineVars({
  header: "44px",
  row: "36px",
  controlSm: "28px",
  control: "36px",
  controlLg: "44px",
  field: "36px",
  fieldLg: "48px",
  icon: "14px",
  iconLg: "16px",
  glyph: "24px",
  measure: "64ch",
  page: "1240px",
});

/** Line weights. Hair is every border; strong marks an underline or a stock-mode frame. */
export const stroke = stylex.defineVars({
  hair: "1px",
  strong: "2px",
  halo: "3px",
});
