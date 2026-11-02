import * as stylex from "@stylexjs/stylex";

/**
 * The desktop's spacing, named as Omarchy names it: Style.spacing, shell/Commons/Style.qml:236-262.
 * The defaults are the tune; `stockSpace` restores Omarchy's values and is applied beside `stock`.
 *
 * Omarchy's steps are 2 3 4 6 8 10 12 14 18, a pixel or two apart, so neighbouring gaps never
 * read as different. The tune puts every token on the 4px unit, one step at most from Omarchy's,
 * which collapses the steps to 2 4 8 12 16 20: a rhythm the eye can count. Hairlines (1, 2) are
 * strokes, not space, and stay. tests/scale.test.ts holds both rules.
 */
export const shellspace = stylex.defineVars({
  hairline: "1px",
  xxs: "2px",
  xs: "4px",
  sm: "4px",
  md: "8px",
  lg: "8px",
  xl: "12px",
  xxl: "12px",
  xxxl: "16px",
  huge: "20px",
  controlGap: "8px",
  controlPadX: "12px",
  controlPadY: "8px",
  inputPadY: "8px",
  controlHeight: "32px",
  popupRow: "32px",
  rowGap: "8px",
  rowPadX: "12px",
  labelGap: "4px",
  panelGap: "16px",
  panelPadding: "20px",
  popupPadding: "16px",
  /**
   * How a card's fixed width grows with the text. Omarchy writes widths as Style.space(n), which
   * scale-with-font multiplies by base-size / 12 (Style.qml:210-219), so base 13 widens a 380px
   * panel to 412. Read by the panel layer, which snaps the product to the unit.
   */
  cardScale: "1.0833",
});

// Omarchy 4.0.0.alpha at 175e63b, spacing scale 1.0 at base-size 12.
export const stockSpace = stylex.createTheme(shellspace, {
  hairline: "1px", // Style.qml:236
  xxs: "2px", // Style.qml:237
  xs: "3px", // Style.qml:238
  sm: "4px", // Style.qml:239
  md: "6px", // Style.qml:240
  lg: "8px", // Style.qml:241
  xl: "10px", // Style.qml:242
  xxl: "12px", // Style.qml:243
  xxxl: "14px", // Style.qml:244
  huge: "18px", // Style.qml:245
  controlGap: "8px", // Style.qml:247
  controlPadX: "10px", // Style.qml:248
  controlPadY: "6px", // Style.qml:249
  inputPadY: "7px", // Style.qml:250
  controlHeight: "28px", // Style.qml:251
  popupRow: "28px", // Style.qml:252
  rowGap: "8px", // Style.qml:257
  rowPadX: "12px", // Style.qml:258
  labelGap: "4px", // Style.qml:259
  panelGap: "14px", // Style.qml:260
  panelPadding: "18px", // Style.qml:261
  popupPadding: "14px", // Style.qml:262
  cardScale: "1", // base-size 12 / 12
});
