import * as stylex from "@stylexjs/stylex";

/**
 * The desktop's type scale, named as Omarchy names it: Style.font, shell/Commons/Style.qml:329-340.
 * The defaults are the tune; `stockType` restores Omarchy's values and is applied beside `stock`.
 *
 * The tune is Omarchy's own roomier setting, `[font] base-size = 13` (docs/omarchy-shell.md:347-375),
 * run through Style.qml's multipliers, so the small end that reads too small on a 1x screen gains a
 * pixel. Base 13 would grow the loud end as well, so that end is pinned back: heading (the menu's
 * names) to the title, the two display sizes to where they were, the large icon one step over the
 * title. The heroes are the only raw sizes Omarchy sets; the tune puts them on one hero step.
 * tests/scale.test.ts derives every value here from that rule.
 */
export const shelltype = stylex.defineVars({
  caption: "11px",
  bodySmall: "12px",
  body: "13px",
  subtitle: "14px",
  title: "15px",
  heading: "15px",
  display: "24px",
  displayLarge: "28px",
  iconSmall: "12px",
  icon: "15px",
  iconLarge: "16px",
  /** Clock hero: the calendar glyph and today's date. */
  clockGlyph: "40px",
  clockDate: "44px",
  /** Weather hero: the condition glyph and the temperature. */
  weatherGlyph: "40px",
  weatherTemp: "44px",
  /** Text inside windows, and one terminal row: foot sizes a cell from the font, 1.32 em for JetBrains Mono. */
  term: "13px",
  termLine: "17px",
  /** Leading of text that wraps, such as a notification's body. A single line keeps the font's own. */
  copy: "1.5",
});

// Omarchy 4.0.0.alpha at 175e63b, base-size 12.
export const stockType = stylex.createTheme(shelltype, {
  caption: "10px", // fontPx(0.833), Style.qml:329
  bodySmall: "11px", // fontPx(0.917), Style.qml:330
  body: "12px", // fontPx(1.0), Style.qml:331
  subtitle: "13px", // fontPx(1.083), Style.qml:332
  title: "14px", // fontPx(1.167), Style.qml:333
  heading: "16px", // fontPx(1.333), Style.qml:334
  display: "24px", // fontPx(2.0), Style.qml:335
  displayLarge: "28px", // fontPx(2.333), Style.qml:336
  iconSmall: "11px", // bodySmall, Style.qml:338
  icon: "14px", // title, Style.qml:339
  iconLarge: "18px", // fontPx(1.5), Style.qml:340
  clockGlyph: "48px", // shell/plugins/panels/clock/Panel.qml:331
  clockDate: "52px", // clock/Panel.qml:343
  weatherGlyph: "64px", // shell/plugins/panels/weather/Panel.qml:597
  weatherTemp: "56px", // weather/Panel.qml:615
  term: "12px", // JetBrainsMono Nerd Font:size=9 at 96 dpi, config/foot/foot.ini:4
  termLine: "16px", // 12px × (ascent 1020 + descent 300) / 1000, rounded as foot rounds a cell
  copy: "normal", // Qt lays text at the font's own line height
});
