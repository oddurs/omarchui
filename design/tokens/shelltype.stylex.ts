import * as stylex from "@stylexjs/stylex";

/**
 * Omarchy's shell type scale at base size 12, used by its panels in both views: the tune keeps
 * the sizes and changes only the face and weights. shell/Commons/Style.qml:271-341. The last
 * four are the few display sizes the clock and weather heroes set directly.
 */
export const shelltype = stylex.defineVars({
  caption: "10px",
  bodySmall: "11px",
  body: "12px",
  subtitle: "13px",
  title: "14px",
  heading: "16px",
  display: "24px",
  displayLarge: "28px",
  /** Clock hero: the calendar glyph and today's date. shell/plugins/panels/clock/Panel.qml. */
  clockGlyph: "48px",
  clockDate: "52px",
  /** Weather hero: the condition glyph and the temperature. shell/plugins/panels/weather/Panel.qml. */
  weatherGlyph: "64px",
  weatherTemp: "56px",
});
