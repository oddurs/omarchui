import * as stylex from "@stylexjs/stylex";

/**
 * Structural tokens: how chrome is drawn, independent of colour. The defaults are the
 * tuned proposal. `stock` overrides them with Omarchy 4.0's shipped values, so before/after
 * is nothing more than a theme on these variables.
 */
export const chrome = stylex.defineVars({
  /** Window and field border width. */
  border: "1px",
  /** Border colour of windows without focus. */
  borderIdle: "var(--line)",
  /** The glow outside a focused window or field. */
  halo: "0 0 0 3px var(--halo)",
  /** Space between two tiled windows. */
  gapIn: "8px",
  /** Space between windows and the screen edge. */
  gapOut: "12px",
  /** Face for human text in chrome: titles, menu names, the clock. */
  ui: 'var(--font-sans), "Instrument Sans", system-ui, sans-serif',
  /** Weight of names and titles in chrome. */
  uiWeight: "600",
  /** Whether chrome labels are set in capitals. */
  labelCase: "uppercase",
  /** Letter spacing of chrome labels. */
  labelTrack: "0.08em",
  /** Ink of chrome labels. */
  labelColor: "var(--text-3)",
  /** Ink of secondary chrome text: descriptions, toast bodies, the weekday. */
  quiet: "var(--text-2)",
  /** Whether menu descriptions, hints and toast times show. */
  desc: "block",
  /** Height of a menu row. */
  row: "36px",
  /** Edge of menus, toasts and overlays. */
  panelBorder: "1px solid var(--line-2)",
  /** Fill of menus, toasts and overlays. */
  panelBg: "var(--raised)",
  /** Fill of the selected menu row. */
  selBg: "var(--tint)",
  /** Ring on the selected menu row. */
  selRing: "inset 0 0 0 1px var(--accent)",
  /** Ink of the active workspace number. */
  wsActive: "var(--text)",
  /** Ink of workspaces that hold windows. */
  wsBusy: "var(--text-2)",
  /** Ink of empty workspaces. */
  wsIdle: "var(--text-3)",
  /** Height of the active workspace underline. */
  wsMark: "2px",
  /** The hairline under the bar. */
  barRule: "1px solid var(--line)",
  /** Height of the bar. */
  barHeight: "32px",
  /** Edge of the menu card. */
  menuBorder: "1px solid var(--line-2)",
  /** Whether bar modules show values beside icons. */
  barLabels: "inline",
  /** Fill behind menu glyphs. */
  iconBox: "var(--sunken)",
  /** Padding inside a notification. */
  toastPad: "12px 14px",
  /** Whether source dots and separators show. */
  dot: "inline-block",
});

// Omarchy 4.0.0.alpha at 175e63b, from research/omarchy (path:line in each comment).
export const stock = stylex.createTheme(chrome, {
  border: "2px", // default/hypr/looknfeel.lua:10
  borderIdle: "rgba(89, 89, 89, 0.667)", // rgba(595959aa), the fallback inactive border
  halo: "none",
  gapIn: "10px", // gaps_in 5 per side, looknfeel.lua:8
  gapOut: "10px", // looknfeel.lua:9
  ui: 'var(--font-mono), "JetBrains Mono", ui-monospace, monospace', // every shell surface is monospace, Style.qml:267-277
  uiWeight: "400",
  labelCase: "none",
  labelTrack: "0",
  labelColor: "var(--text)",
  quiet: "var(--text)",
  desc: "none",
  row: "50px", // menu rows, shell/plugins/menu/Menu.qml:126-134
  panelBorder: "2px solid var(--accent)", // notifications and popups use the active border
  panelBg: "var(--surface)",
  selBg: "color-mix(in oklab, var(--text) 8%, transparent)", // shell.toml.tpl:183-187
  selRing: "inset 0 0 0 2px color-mix(in oklab, var(--text) 25%, transparent)",
  wsActive: "var(--text)", // the active workspace shows a layout glyph and no marker
  wsBusy: "var(--text)",
  wsIdle: "color-mix(in oklab, var(--text) 50%, transparent)", // empty at 50%, Workspaces.qml:274
  wsMark: "0px",
  barRule: "0 solid transparent",
  barHeight: "26px", // Style.qml:344
  menuBorder: "2px solid var(--text)", // menu border is the active-border foreground
  barLabels: "none",
  iconBox: "transparent",
  toastPad: "10px 12px", // padding-x 12, Toast.qml
  dot: "none",
});
