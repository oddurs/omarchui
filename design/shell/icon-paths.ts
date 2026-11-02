/**
 * The system's icons: 24-unit stroke paths, square caps, and the ink of each as the browser
 * measures it. Plain data, so tests outside the StyleX build can read it too.
 */
const PATHS = {
  wifi: "M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01",
  volume: "M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12",
  // Omarchy steps the speaker by volume: two waves from 67%, one from 34%, none above 0. Audio BarWidget.
  volumeMid: "M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7",
  volumeLow: "M4 9v6h4l5 4V5L8 9z",
  mute: "M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6",
  // Upright, as MDI draws it; the charge is a second path, drawn from the level. Power BarWidget.
  battery: "M7 5h10v16H7zM10 2h4v3",
  bluetooth: "M7 7l10 10-5 4V3l5 4L7 17",
  cpu: "M6 6h12v12H6zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5 21 21",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20h4",
  bellOff: "M6 16V11a6 6 0 0 1 9-5.2M18 11v5l2 2H8M10 20h4M3 3l18 18",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  exit: "M14 4h6v16h-6M10 8l-4 4 4 4M6 12h10",
  chevron: "M9 6l6 6-6 6",
  dwindle: "M3 4h8v16H3zM14 4h7v7h-7zM14 14h7v6h-7z",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18",
  cloud: "M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z",
  monitor: "M3 4h18v12H3zM8 20h8M12 16v4",
  agents: "M5 8h14v11H5zM12 4v4M9 13h.01M15 13h.01M2 12v3M22 12v3",
  coffee: "M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2",
  calendar: "M3 5h18v16H3zM3 10h18M8 2v5M16 2v5",
  mic: "M9 3h6v10H9zM5 11a7 7 0 0 0 14 0M12 18v3",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  laptop: "M4 5h16v11H4zM2 19h20",
  pin: "M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  close: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6",
  leaf: "M5 19C5 9 11 5 20 4c-1 9-5 15-15 15zM5 19l7-7",
  gauge: "M4 17a8 8 0 1 1 16 0M12 17l4-6",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  power: "M12 3v9M7 6a8 8 0 1 0 10 0",
  reboot: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5",
  // Indicators Omarchy can show beside the clock. shell/plugins/bar/indicators.
  key: "M7.5 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM11 12h10M17.5 12v3M21 12v3",
  record: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  remote: "M3 4h18v12H3zM8 20h8M12 16v4M9 13l6-6M11 7h4v4",
} as const;

export type IconName = keyof typeof PATHS;
export const ICON_PATHS: Record<IconName, string> = PATHS;

/**
 * Each path's ink, [x, y, width, height] in its 24-unit box, as the browser measures it
 * (getBBox). e2e/bar.spec.ts measures them again and fails if a path changes without this.
 */
export const ICON_INK: Record<IconName, readonly [number, number, number, number]> = {
  wifi: [2, 5.18, 20, 14.32],
  volume: [4, 5, 17.48, 14],
  volumeMid: [4, 5, 13.93, 14],
  volumeLow: [4, 5, 9, 14],
  mute: [4, 5, 18, 14],
  battery: [7, 2, 10, 19],
  bluetooth: [7, 3, 10, 18],
  cpu: [2, 2, 20, 20],
  search: [4, 4, 17, 17],
  sun: [2, 2, 20, 20],
  moon: [4.64, 4, 15.36, 15.36],
  bell: [4, 5, 16, 15],
  bellOff: [3, 3, 18, 18],
  expand: [4, 4, 16, 16],
  exit: [6, 4, 14, 16],
  chevron: [9, 6, 6, 12],
  dwindle: [3, 4, 18, 16],
  globe: [3, 3, 18, 18],
  cloud: [2.62, 5.44, 18.64, 12.56],
  monitor: [3, 4, 18, 16],
  agents: [2, 4, 20, 15],
  coffee: [4, 3, 17, 16],
  calendar: [3, 2, 18, 19],
  mic: [5, 3, 14, 18],
  lock: [5, 3, 14, 18],
  laptop: [2, 5, 20, 14],
  pin: [5, 2, 14, 19],
  close: [3, 3, 18, 18],
  leaf: [5, 4, 15, 15],
  gauge: [4, 9, 16, 8],
  bolt: [4, 2, 15, 20],
  power: [4, 3, 16, 17.24],
  reboot: [4, 3.91, 16, 16],
  key: [4, 8.5, 17, 7],
  record: [3, 3, 18, 18],
  remote: [3, 4, 18, 16],
};
