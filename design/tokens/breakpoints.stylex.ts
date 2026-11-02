import * as stylex from "@stylexjs/stylex";

/** Three widths: below sm is a phone; md is a tablet or split window; lg is a desktop. */
export const bp = stylex.defineConsts({
  phone: "@media (max-width: 559px)",
  md: "@media (min-width: 720px)",
  lg: "@media (min-width: 1000px)",
});
