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
  /** Edge of toasts and overlays. Width and colour are separate: StyleX drops border shorthands built from variables. */
  panelBorderWidth: "1px",
  panelBorderColor: "var(--line-2)",
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
  barRule: "1px",
  /** Height of the bar. */
  barHeight: "32px",
  /** Edge of the menu card. */
  menuBorderWidth: "1px",
  menuBorderColor: "var(--line-2)",
  /** Whether bar modules show values beside icons. */
  barLabels: "inline",
  /** Fill behind menu glyphs. */
  iconBox: "var(--sunken)",
  /** Padding inside a notification. */
  toastPad: "12px 14px",
  /** Whether source dots and separators show. */
  dot: "inline-block",
  /** Width of the menu card. */
  menuWidth: "460px",
  /** Size of a menu row's name. */
  menuLabel: "0.8125rem",
  /** Ink of the selected menu row's name. */
  selText: "var(--text)",
  /** Width of a notification. */
  toastWidth: "320px",
  /** Size and weight of a notification's title. */
  toastTitle: "0.8125rem",
  toastTitleWeight: "600",
  /** Thickness of the volume overlay's track, and its distance from the bottom edge. */
  osdTrack: "4px",
  osdBottom: "72px",
  /** The lock screen's password field. */
  lockFieldWidth: "260px",
  fieldLg: "48px",
  /** The active workspace shows its number (tuned) or its layout glyph (stock). */
  wsActiveNumber: "inline",
  wsActiveGlyph: "none",
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
  panelBorderWidth: "2px", // Toast.qml:28
  panelBorderColor: "var(--accent)", // notifications and popups use the active border
  panelBg: "var(--surface)",
  selBg: "color-mix(in oklab, var(--text) 8%, transparent)", // shell.toml.tpl:183-187
  selRing: "inset 0 0 0 2px color-mix(in oklab, var(--text) 25%, transparent)",
  wsActive: "var(--text)", // the active workspace shows a layout glyph and no marker
  wsBusy: "var(--text)",
  wsIdle: "color-mix(in oklab, var(--text) 50%, transparent)", // empty at 50%, Workspaces.qml:274
  wsMark: "0px",
  barRule: "0px",
  barHeight: "26px", // Style.qml:344
  menuBorderWidth: "2px", // Menu.qml:117
  menuBorderColor: "var(--text)", // the active-border foreground
  barLabels: "none",
  iconBox: "transparent",
  toastPad: "10px 12px", // padding-x 12, Toast.qml
  dot: "none",
  menuWidth: "300px", // shell/plugins/menu/Menu.qml:138
  menuLabel: "16px", // Menu.qml:1413
  selText: "var(--accent)", // shell.toml.tpl:183-187
  toastWidth: "380px", // shell/plugins/notifications/Service.qml:64
  toastTitle: "14px", // Toast.qml:321
  toastTitleWeight: "700",
  osdTrack: "6px", // shell/plugins/osd/Osd.qml:142-144
  osdBottom: "67px", // Osd.qml:172
  lockFieldWidth: "381px", // shell/plugins/lock/LockView.qml:24-26
  fieldLg: "67px",
  wsActiveNumber: "none", // Workspaces.qml:138-142,273
  wsActiveGlyph: "inline-grid",
});
