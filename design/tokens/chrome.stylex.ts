import * as stylex from "@stylexjs/stylex";

const REDUCED = "@media (prefers-reduced-motion: reduce)";

/**
 * Structural tokens: how chrome is drawn, independent of colour. The defaults are the
 * tuned proposal. `stock` overrides them with Omarchy 4.0's shipped values, so before/after
 * is nothing more than a theme on these variables.
 */
export const chrome = stylex.defineVars({
  /** Window border width. */
  border: "2px",
  /** Border colour of windows without focus. */
  borderIdle: "var(--line-2)",
  /** Space between two tiled windows. */
  gapIn: "12px",
  /** Space between windows and the screen edge. */
  gapOut: "12px",
  /** Height of a menu row. */
  row: "48px",
  /** Edge of toasts and overlays. Width and colour are separate: StyleX drops border shorthands built from variables. */
  panelBorderWidth: "2px",
  panelBorderColor: "var(--line-2)",
  /** Fill of menus, toasts and overlays. */
  panelBg: "var(--raised)",
  /** Fill of the selected menu row. */
  selBg: "color-mix(in srgb, var(--text) 8%, transparent)",
  /** Ink of the active workspace number. */
  wsActive: "var(--accent)",
  /** Ink of workspaces that hold windows. */
  wsBusy: "var(--text)",
  /** Ink of empty workspaces. */
  wsIdle: "var(--text-3)",
  /** Height of the bar. */
  barHeight: "28px",
  /** Edge of the menu card. */
  menuBorderWidth: "2px",
  menuBorderColor: "var(--line-2)",
  /** Padding inside a notification. */
  toastPad: "12px",
  /** Width of the menu card. */
  menuWidth: "300px",
  /** Size of a menu row's name. */
  menuLabel: "16px",
  /** Ink of the selected menu row's name. */
  selText: "var(--accent)",
  /** Width of a notification. */
  toastWidth: "380px",
  /** Size and weight of a notification's title. */
  toastTitle: "14px",
  toastTitleWeight: "500",
  /** Thickness of the volume overlay's track, and its distance from the bottom edge. */
  osdTrack: "4px",
  osdBottom: "68px",
  /** The lock screen's password field. */
  lockFieldWidth: "380px",
  /** Height of the lock screen's password field. */
  lockHeight: "68px",
  /** Bar fill, ink and text size. */
  barBg: "var(--surface)",
  barInk: "var(--text-2)",
  barText: "12px",
  clockText: "12px",
  /** Toast: face, inks, body size, gap under the title, padding without a body, edge inset and stack gap. */
  toastFace: 'var(--font-mono), "JetBrains Mono", ui-monospace, monospace',
  toastInk: "var(--text)",
  toastBodyInk: "var(--text-2)",
  toastBody: "13px",
  toastGap: "4px",
  toastPadBare: "8px",
  toastInset: "4px",
  toastStack: "8px",
  /** Notification decks: the gap between decks, how far each card behind the front peeks out, and the leave duration. */
  deckGap: "12px",
  deckPeek: "8px",
  toastOut: { default: "200ms", [REDUCED]: "0ms" },
  /** Border of a critical notification: err (tuned) or no change (stock). */
  critBorder: "var(--err)",
  /** Toast arrival: distance dropped and duration. */
  toastDrop: "-8px",
  toastIn: { default: "180ms", [REDUCED]: "0ms" },
  /** OSD: columns, gap, padding, fill, track and fill colours, icon and value sizes. */
  osdCols: "28px 144px auto",
  osdGap: "16px",
  osdPad: "16px",
  osdBg: "var(--raised)",
  osdInk: "var(--text)",
  osdTrackBg: "var(--line-2)",
  osdFill: "var(--accent)",
  osdMutedFill: "var(--text-3)",
  osdIcon: "28px",
  osdValue: "14px",
  osdValueWeight: "500",
  /** Lock field: outline, fill, inks, sizes and the spacing of the dots. */
  lockBorder: "2px",
  lockBorderColor: "var(--line-2)",
  lockFocusColor: "var(--accent)",
  lockFieldBg: "color-mix(in srgb, var(--surface) 80%, transparent)",
  lockInk: "var(--text)",
  lockPlaceholder: "var(--text-3)",
  lockText: "20px",
  lockHint: "16px",
  lockTrack: "4px",
  /** Bar ink and fill on hover: the same light fill that marks the menu cursor. */
  barHover: "var(--text)",
  barHoverBg: "color-mix(in srgb, var(--text) 8%, transparent)",
  /** Clock ink, weight of bar text, size of bar icons. */
  clockInk: "var(--text-2)",
  barWeight: "400",
  barIcon: "12px",
  /** Clock padding each side, and the gap between weekday and time. */
  clockPad: "8px",
  clockGap: "1ch",
  /** Width of a status icon slot: indicators, the world clock, weather. */
  statusSlot: "20px",
  /** Workspace button width and the gap between buttons. */
  wsWidth: "20px",
  wsGap: "0px",
  /** Width of a bar widget's slot. */
  modSlot: "28px",
  /** Menu card fill, ink, padding, and the weight of row names. */
  menuBg: "var(--raised)",
  menuInk: "var(--text)",
  menuPad: "16px",
  menuWeight: "500",
  /** Menu header height, and the placeholder ink. */
  menuHeader: "32px",
  menuPlaceholder: "var(--text-3)",
  /** Gap between menu rows, and below the header. */
  rowGap: "4px",
  menuHeaderGap: "8px",
  /** Menu row geometry. */
  rowCols: "36px minmax(0, 1fr) 16px",
  rowColGap: "8px",
  rowPad: "8px",
  rowDetail: "56px",
  glyphCol: "36px",
  glyphText: "18px",
  /** Ink of a row's glyph. */
  glyphInk: "var(--text-2)",
  /** A search result's path and the submenu marker: ink, size and opacity. Tuned uses quieter roles; stock, opacity on the row ink. */
  detailInk: "var(--text-2)",
  chevInk: "var(--text-3)",
  detailText: "11px",
  detailOpacity: "1",
  chevOpacity: "1",
  /** The scrim behind the menu. */
  scrim: "var(--scrim)",
  /**
   * Hyprland's window animations, the same in both views: open (pop in from 87%), close (to 87%),
   * move and resize, and the border colour on focus. default/hypr/looknfeel.lua:79-84.
   */
  winOpen: { default: "328ms", [REDUCED]: "0ms" },
  winFadeIn: { default: "138ms", [REDUCED]: "0ms" },
  winClose: { default: "119ms", [REDUCED]: "0ms" },
  winFadeOut: { default: "117ms", [REDUCED]: "0ms" },
  winMove: { default: "303ms", [REDUCED]: "0ms" },
  winBorder: { default: "431ms", [REDUCED]: "0ms" },
  /** Window fill and border colours. */
  winBg: "var(--surface)",
  winActive: "var(--accent)",
  /** Image picker: the tint over unselected slices, label ink, the selected and resting edges, and the selected edge's width and the label's weight. */
  pickerDim: "var(--wall)",
  pickerInk: "var(--text)",
  pickerSel: "var(--accent)",
  pickerEdge: "color-mix(in srgb, var(--text) 28%, transparent)",
  pickerStroke: "2px",
  pickerWeight: "500",
  /** Image picker label and filter text sizes. */
  pickerLabel: "24px",
  pickerFilter: "14px",
  /** The active workspace shows its number (tuned) or its layout glyph (stock). */
  wsActiveNumber: "inline",
  wsActiveGlyph: "none",
});

// Omarchy 4.0.0.alpha at 175e63b, from research/omarchy (path:line in each comment).
export const stock = stylex.createTheme(chrome, {
  border: "2px", // default/hypr/looknfeel.lua:10
  borderIdle: "var(--o-inactive-border)", // default/themed/hyprland.lua.tpl:2, rgba(595959aa) unless the theme sets one
  gapIn: "10px", // gaps_in 5 per side, looknfeel.lua:8
  gapOut: "10px", // looknfeel.lua:9
  row: "50px", // menu rows, shell/plugins/menu/Menu.qml:126-134
  panelBorderWidth: "2px", // Toast.qml:28
  panelBorderColor: "var(--o-active-border)", // notifications and popups use the active border
  panelBg: "var(--o-background)", // shell.toml.tpl: popups and notifications are background at 1.0
  selBg: "color-mix(in srgb, var(--o-foreground) 8%, transparent)", // shell.toml.tpl:183-184
  wsActive: "var(--o-foreground)", // the active workspace shows a layout glyph and no marker
  wsBusy: "var(--o-foreground)",
  wsIdle: "color-mix(in srgb, var(--o-foreground) 50%, transparent)", // empty at 0.5, Workspaces.qml:274
  barHeight: "26px", // Style.qml:344
  menuBorderWidth: "2px", // Menu.qml:117
  menuBorderColor: "var(--o-foreground)", // shell.toml.tpl:179-180: active-border foreground, else foreground
  toastPad: "10px 12px", // padding-x 12, Toast.qml
  menuWidth: "300px", // shell/plugins/menu/Menu.qml:138
  menuLabel: "16px", // Menu.qml:1413
  selText: "var(--o-accent)", // shell.toml.tpl:185
  toastWidth: "380px", // shell/plugins/notifications/Service.qml:64
  toastTitle: "14px", // Toast.qml:321
  toastTitleWeight: "700",
  osdTrack: "6px", // shell/plugins/osd/Osd.qml:142-144
  osdBottom: "67px", // Osd.qml:172
  lockFieldWidth: "381px", // shell/plugins/lock/LockView.qml:24-26
  lockHeight: "67px", // LockView.qml:25
  wsActiveNumber: "none", // Workspaces.qml:138-142,273
  wsActiveGlyph: "inline-grid",
  // shell/plugins/image-picker/ImagePicker.qml and [image-picker] in shell.toml.tpl:226-235
  pickerDim: "var(--o-background)", // ImagePicker.qml:54
  pickerInk: "var(--o-foreground)",
  pickerSel: "var(--o-accent)",
  pickerEdge: "color-mix(in srgb, var(--o-foreground) 28%, transparent)",
  pickerStroke: "3px", // ImagePicker.qml:835
  pickerWeight: "600", // Font.DemiBold, ImagePicker.qml:867
  pickerLabel: "24px", // Style.font.display, ImagePicker.qml:866
  pickerFilter: "14px", // Style.font.title, ImagePicker.qml:884
  // research/omarchy/spec/bar.json
  barBg: "var(--o-background)", // shell/Commons/Color.qml:80
  barInk: "var(--o-foreground)", // Color.qml:81
  barText: "12px", // Style.qml:331, WidgetButton.qml:11
  clockText: "12px",
  // research/omarchy/spec/services.json: notifications
  toastFace: '"Liberation Sans", Arimo, Arial, sans-serif', // Toast.qml:399-401
  toastInk: "var(--o-foreground)", // shell.toml.tpl:146
  toastBodyInk: "var(--o-body-foreground)", // darker(fg, 1.15), Toast.qml:75
  toastBody: "14px", // Toast.qml:498-514
  toastGap: "3px", // Toast.qml:380
  toastPadBare: "7px", // Toast.qml:84
  toastInset: "5px", // gaps_out / 2, Delivery.js:95-96
  toastStack: "6px", // Service.qml:64
  deckGap: "11px", // Service.qml:535
  deckPeek: "10px", // Layout.js:6
  toastOut: { default: "200ms", [REDUCED]: "0ms" }, // Service.qml:443
  critBorder: "var(--o-active-border)", // urgency has no look, Toast.qml:73-77
  toastDrop: "-24px", // Service.qml:446
  toastIn: { default: "250ms", [REDUCED]: "0ms" }, // Service.qml:442
  // osd
  osdCols: "28px 142px auto", // glyph 28, track 142, value, Osd.qml:35,103-107
  osdGap: "16px", // Osd.qml:29
  osdPad: "16px", // Osd.qml:28
  osdBg: "color-mix(in srgb, var(--o-background) 97%, transparent)", // Osd.qml:143
  osdInk: "var(--o-foreground)", // Osd.qml:166,198
  osdTrackBg: "color-mix(in srgb, var(--o-foreground) 45%, transparent)", // Osd.qml:174
  osdFill: "var(--o-accent)", // Osd.qml:180
  osdMutedFill: "var(--o-accent)",
  osdIcon: "28px",
  osdValue: "14px", // Osd.qml:89-95
  osdValueWeight: "700",
  // lock
  lockBorder: "3px", // LockView.qml:26
  lockBorderColor: "var(--o-lock-border)", // shell.toml.tpl:219-221
  lockFocusColor: "var(--o-lock-border)",
  lockFieldBg: "color-mix(in srgb, var(--o-background) 80%, transparent)", // shell.toml.tpl:213-214
  lockInk: "var(--o-foreground)", // shell.toml.tpl:215
  lockPlaceholder: "var(--o-lock-placeholder)", // shell.toml.tpl:216
  lockText: "21px", // dots, LockView.qml:28
  lockHint: "18px", // placeholder, LockView.qml:27
  lockTrack: "3px", // LockView.qml:29
  barHover: "var(--o-foreground)", // no hover colour, WidgetButton.qml:169-189
  barHoverBg: "transparent", // no hover fill either
  clockInk: "var(--o-foreground)",
  barWeight: "400", // no widget sets a weight, WidgetButton.qml:117-136
  barIcon: "12px", // ink box of every bar glyph, Style.qml:356
  clockPad: "8.75px", // WidgetButton.qml:15, clock BarWidget.qml:154-167
  clockGap: "1ch", // "dddd HH:mm", config/omarchy/shell.json:25-29
  statusSlot: "21px", // Style.qml:357, BarIndicator.qml:51
  wsWidth: "20px", // Workspaces.qml:252
  wsGap: "1px", // Workspaces.qml:275-277
  modSlot: "27px", // Style.qml:353, BarIconButton.qml:9
  // research/omarchy/spec/menu.json
  menuBg: "var(--o-background)", // shell.toml.tpl:176-177
  menuInk: "var(--o-foreground)", // shell.toml.tpl:178
  menuPad: "18px", // Menu.qml:126
  menuWeight: "500", // Menu.qml:1562
  menuHeader: "34px", // Menu.qml:127
  menuPlaceholder: "color-mix(in srgb, var(--o-foreground) 58%, transparent)", // Menu.qml:1423-1424
  rowGap: "3px", // Menu.qml:134
  menuHeaderGap: "6px", // Menu.qml:128
  rowCols: "36px minmax(0, 1fr) 14px", // Menu.qml:1523-1527
  rowColGap: "6px",
  rowPad: "8px",
  rowDetail: "58px", // Menu.qml:130
  glyphCol: "36px",
  glyphText: "18px", // Menu.qml:1522
  glyphInk: "var(--o-foreground)", // Menu.qml:1520
  detailInk: "inherit",
  chevInk: "inherit",
  detailText: "11px", // Menu.qml:1575, Style.font.bodySmall
  detailOpacity: "0.52", // Menu.qml:1576
  chevOpacity: "0.36", // Menu.qml:1605-1606
  scrim: "color-mix(in srgb, var(--o-background) 50%, transparent)", // shell.toml.tpl:181-182
  winBg: "var(--o-background)",
  winActive: "var(--o-active-border)", // hyprland.lua.tpl:1
});
