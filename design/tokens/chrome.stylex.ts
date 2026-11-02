import * as stylex from "@stylexjs/stylex";

const REDUCED = "@media (prefers-reduced-motion: reduce)";

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
  /** Bar fill, ink and text size. */
  barBg: "var(--wall)",
  barInk: "var(--text-2)",
  barText: "0.6875rem",
  clockText: "0.75rem",
  /** Toast: the source line, face, inks, body size, gap, padding without a body, edge inset and stack gap. */
  toastHead: "flex",
  toastFace: 'var(--font-sans), "Instrument Sans", system-ui, sans-serif',
  toastInk: "var(--text)",
  toastBodyInk: "var(--text-2)",
  toastBody: "0.75rem",
  toastGap: "2px",
  toastPadBare: "12px",
  toastInset: "12px",
  toastStack: "8px",
  /** Stack order: oldest first (tuned) or newest on top (stock). */
  toastFlow: "column",
  critBorder: "var(--err)",
  /** Toast arrival: distance dropped, starting opacity, duration. */
  toastDrop: "-6px",
  toastFade: "1",
  toastIn: { default: "180ms", [REDUCED]: "0ms" },
  /** OSD: columns, gap, padding, width, fill, track and fill colours, icon and value sizes. */
  osdCols: "16px minmax(0, 1fr) 2.6em",
  osdGap: "12px",
  osdPad: "12px 16px",
  osdWidth: "100%",
  osdBg: "var(--raised)",
  osdInk: "var(--text)",
  osdTrackBg: "var(--sunken)",
  osdFill: "var(--accent)",
  osdMutedFill: "var(--text-3)",
  osdIcon: "16px",
  osdValue: "0.75rem",
  osdValueWeight: "600",
  /** OSD value while muted: a dash (tuned) or the stored level (stock), and the unit after it. */
  osdMuteNum: "none",
  osdMuteDash: "inline",
  osdUnit: '""',
  /** Lock: whether the clock shows, the field's outline, fill, inks, sizes, and the backdrop. */
  lockClock: "block",
  lockLabel: "block",
  lockBorder: "1px",
  lockBorderColor: "var(--line-2)",
  lockFocusColor: "var(--accent)",
  lockFieldBg: "var(--sunken)",
  lockInk: "var(--text)",
  lockPlaceholder: "var(--text-3)",
  lockFace: 'var(--font-sans), "Instrument Sans", system-ui, sans-serif',
  lockText: "0.8125rem",
  lockHint: "0.8125rem",
  lockTrack: "normal",
  lockScrim: "var(--scrim)",
  lockBlur: "blur(18px)",
  /** Bar ink on hover, clock ink, weight of bar text, size of bar icons. */
  barHover: "var(--text)",
  clockInk: "var(--text)",
  barWeight: "500",
  barIcon: "14px",
  /** Clock padding each side, and the gap between weekday and time. */
  clockPad: "0px",
  clockGap: "8px",
  /** Width of a status icon slot: indicators, the world clock, weather. */
  statusSlot: "auto",
  /** Workspace button width and the gap between buttons. */
  wsWidth: "24px",
  wsGap: "2px",
  /** Bar widgets: slot width (auto sizes to content), padding inside, gap between, gap after the logo. */
  modSlot: "auto",
  modPad: "4px",
  modGap: "4px",
  markGap: "6px",
  /** Menu card fill, ink, padding, and the weight of row names. */
  menuBg: "var(--raised)",
  menuInk: "var(--text)",
  menuPad: "0px",
  menuWeight: "600",
  /** Menu header: height, side padding, the rule under it, and whether the search icon and trail show. */
  menuHeader: "44px",
  menuSearchPad: "16px",
  menuHeaderRule: "1px",
  menuChrome: "inline-flex",
  menuPlaceholder: "var(--text-3)",
  /** Menu list: padding, gap between rows, gap below the header. */
  menuListPad: "4px",
  rowGap: "0px",
  menuHeaderGap: "0px",
  /** Menu row geometry. */
  rowCols: "24px auto minmax(0, 1fr) auto",
  rowColGap: "12px",
  rowPad: "12px",
  rowDetail: "36px",
  glyphCol: "24px",
  glyphText: "0.75rem",
  descCol: "3",
  hintCol: "4",
  /** Ink of a row's glyph, and the size and opacity of its detail line. */
  glyphInk: "var(--text-2)",
  detailText: "0.6875rem",
  detailOpacity: "1",
  /** Submenu marker: an icon (tuned) or a "›" at reduced opacity (stock). */
  chevIcon: "inline-flex",
  chevText: "none",
  chevOpacity: "1",
  /** The search path under a row name: shown in the stock view, folded into the description when tuned. */
  detailLine: "none",
  /** Where the menu sits on screen, and the scrim behind it. */
  menuAlign: "flex-start",
  menuTop: "9vh",
  scrim: "var(--scrim)",
  /** Window fill and border colours. */
  winBg: "var(--surface)",
  winActive: "var(--accent)",
  /** The active workspace shows its number (tuned) or its layout glyph (stock). */
  wsActiveNumber: "inline",
  wsActiveGlyph: "none",
});

// Omarchy 4.0.0.alpha at 175e63b, from research/omarchy (path:line in each comment).
export const stock = stylex.createTheme(chrome, {
  border: "2px", // default/hypr/looknfeel.lua:10
  borderIdle: "var(--o-inactive-border)", // default/themed/hyprland.lua.tpl:2, rgba(595959aa) unless the theme sets one
  halo: "none",
  gapIn: "10px", // gaps_in 5 per side, looknfeel.lua:8
  gapOut: "10px", // looknfeel.lua:9
  ui: 'var(--font-mono), "JetBrains Mono", ui-monospace, monospace', // every shell surface is monospace, Style.qml:267-277
  uiWeight: "400",
  labelCase: "none",
  labelTrack: "0",
  labelColor: "var(--o-foreground)",
  quiet: "var(--o-foreground)",
  desc: "none",
  row: "50px", // menu rows, shell/plugins/menu/Menu.qml:126-134
  panelBorderWidth: "2px", // Toast.qml:28
  panelBorderColor: "var(--o-active-border)", // notifications and popups use the active border
  panelBg: "var(--o-background)", // shell.toml.tpl: popups and notifications are background at 1.0
  selBg: "color-mix(in srgb, var(--o-foreground) 8%, transparent)", // shell.toml.tpl:183-184
  selRing: "none", // the selected border has a colour but width 0, Menu.qml:1501-1502
  wsActive: "var(--o-foreground)", // the active workspace shows a layout glyph and no marker
  wsBusy: "var(--o-foreground)",
  wsIdle: "color-mix(in srgb, var(--o-foreground) 50%, transparent)", // empty at 0.5, Workspaces.qml:274
  wsMark: "0px",
  barRule: "0px",
  barHeight: "26px", // Style.qml:344
  menuBorderWidth: "2px", // Menu.qml:117
  menuBorderColor: "var(--o-foreground)", // shell.toml.tpl:179-180: active-border foreground, else foreground
  barLabels: "none",
  iconBox: "transparent",
  toastPad: "10px 12px", // padding-x 12, Toast.qml
  dot: "none",
  menuWidth: "300px", // shell/plugins/menu/Menu.qml:138
  menuLabel: "16px", // Menu.qml:1413
  selText: "var(--o-accent)", // shell.toml.tpl:185
  toastWidth: "380px", // shell/plugins/notifications/Service.qml:64
  toastTitle: "14px", // Toast.qml:321
  toastTitleWeight: "700",
  osdTrack: "6px", // shell/plugins/osd/Osd.qml:142-144
  osdBottom: "67px", // Osd.qml:172
  lockFieldWidth: "381px", // shell/plugins/lock/LockView.qml:24-26
  fieldLg: "67px",
  wsActiveNumber: "none", // Workspaces.qml:138-142,273
  wsActiveGlyph: "inline-grid",
  // research/omarchy/spec/bar.json
  barBg: "var(--o-background)", // shell/Commons/Color.qml:80
  barInk: "var(--o-foreground)", // Color.qml:81
  barText: "12px", // Style.qml:331, WidgetButton.qml:11
  clockText: "12px",
  // research/omarchy/spec/services.json: notifications
  toastHead: "none", // no app-name line, Toast.qml:380-514
  toastFace: '"Liberation Sans", Arimo, Arial, sans-serif', // Toast.qml:399-401
  toastInk: "var(--o-foreground)", // shell.toml.tpl:146
  toastBodyInk: "var(--o-body-foreground)", // darker(fg, 1.15), Toast.qml:75
  toastBody: "14px", // Toast.qml:498-514
  toastGap: "3px", // Toast.qml:380
  toastPadBare: "7px", // Toast.qml:84
  toastInset: "5px", // gaps_out / 2, Delivery.js:95-96
  toastStack: "6px", // Service.qml:64
  toastFlow: "column-reverse", // newest on top, Layout.js:49-60
  critBorder: "var(--o-active-border)", // urgency has no look, Toast.qml:73-77
  toastDrop: "-24px", // Service.qml:446
  toastFade: "0",
  toastIn: { default: "250ms", [REDUCED]: "0ms" }, // Service.qml:442
  // osd
  osdCols: "28px 142px auto", // glyph 28, track 142, value, Osd.qml:35,103-107
  osdGap: "16px", // Osd.qml:29
  osdPad: "16px", // Osd.qml:28
  osdWidth: "auto",
  osdBg: "color-mix(in srgb, var(--o-background) 97%, transparent)", // Osd.qml:143
  osdInk: "var(--o-foreground)", // Osd.qml:166,198
  osdTrackBg: "color-mix(in srgb, var(--o-foreground) 45%, transparent)", // Osd.qml:174
  osdFill: "var(--o-accent)", // Osd.qml:180
  osdMutedFill: "var(--o-accent)",
  osdIcon: "28px",
  osdValue: "14px", // Osd.qml:89-95
  osdValueWeight: "700",
  osdMuteNum: "inline",
  osdMuteDash: "none",
  osdUnit: '"%"', // OsdModel.js:45
  // lock
  lockClock: "none", // no clock, date or user, LockView.qml:105-263
  lockLabel: "none",
  lockBorder: "3px", // LockView.qml:26
  lockBorderColor: "var(--o-lock-border)", // shell.toml.tpl:219-221
  lockFocusColor: "var(--o-lock-border)",
  lockFieldBg: "color-mix(in srgb, var(--o-background) 80%, transparent)", // shell.toml.tpl:213-214
  lockInk: "var(--o-foreground)", // shell.toml.tpl:215
  lockPlaceholder: "var(--o-lock-placeholder)", // shell.toml.tpl:216
  lockFace: 'var(--font-mono), "JetBrains Mono", ui-monospace, monospace',
  lockText: "21px", // dots, LockView.qml:28
  lockHint: "18px", // placeholder, LockView.qml:27
  lockTrack: "3px", // LockView.qml:29
  lockScrim: "transparent",
  lockBlur: "blur(48px) contrast(0.92)", // blurMax 128, contrast -0.08, LockView.qml:124-133
  barHover: "var(--o-foreground)", // no hover colour, WidgetButton.qml:169-189
  clockInk: "var(--o-foreground)",
  barWeight: "400", // no widget sets a weight, WidgetButton.qml:117-136
  barIcon: "12px", // ink box of every bar glyph, Style.qml:356
  clockPad: "8.75px", // WidgetButton.qml:15, clock BarWidget.qml:154-167
  clockGap: "1ch", // "dddd HH:mm", config/omarchy/shell.json:25-29
  statusSlot: "21px", // Style.qml:357, BarIndicator.qml:51
  wsWidth: "20px", // Workspaces.qml:252
  wsGap: "1px", // Workspaces.qml:275-277
  modSlot: "27px", // Style.qml:353, BarIconButton.qml:9
  modPad: "0px",
  modGap: "0px", // Bar.qml:2589-2590
  markGap: "0px",
  // research/omarchy/spec/menu.json
  menuBg: "var(--o-background)", // shell.toml.tpl:176-177
  menuInk: "var(--o-foreground)", // shell.toml.tpl:178
  menuPad: "18px", // Menu.qml:126
  menuWeight: "500", // Menu.qml:1562
  menuHeader: "34px", // Menu.qml:127
  menuSearchPad: "0px", // the filter input spans the content width, Menu.qml:1397-1430
  menuHeaderRule: "0px",
  menuChrome: "none", // no search glyph, no breadcrumb
  menuPlaceholder: "color-mix(in srgb, var(--o-foreground) 58%, transparent)", // Menu.qml:1423-1424
  menuListPad: "0px",
  rowGap: "3px", // Menu.qml:134
  menuHeaderGap: "6px", // Menu.qml:128
  rowCols: "36px minmax(0, 1fr) 14px", // Menu.qml:1523-1527
  rowColGap: "6px",
  rowPad: "8px",
  rowDetail: "58px", // Menu.qml:130
  glyphCol: "36px",
  glyphText: "18px", // Menu.qml:1522
  descCol: "2",
  hintCol: "3",
  glyphInk: "var(--o-foreground)", // Menu.qml:1520
  detailText: "11px", // Menu.qml:1575, Style.font.bodySmall
  detailOpacity: "0.52", // Menu.qml:1576
  chevIcon: "none",
  chevText: "inline",
  chevOpacity: "0.36", // Menu.qml:1605-1606
  detailLine: "block", // Menu.qml:1575-1576
  menuAlign: "center", // Menu.qml:1278-1295
  menuTop: "0px",
  scrim: "color-mix(in srgb, var(--o-background) 50%, transparent)", // shell.toml.tpl:181-182
  winBg: "var(--o-background)",
  winActive: "var(--o-active-border)", // hyprland.lua.tpl:1
});
