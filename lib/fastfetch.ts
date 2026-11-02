import { titleCase } from "./omarchy-cli";
import { REF_VERSION } from "./reference.generated";
import type { Line, Seg, ShellCtx, Tone } from "./shell";
import { THEMES } from "./themes";

/**
 * fastfetch with /etc/fastfetch/config.jsonc (etc/fastfetch/config.jsonc at 175e63b; spec section
 * fastfetch). The layout, keys and colours are Omarchy's; the values are the machine's, so the
 * ones below are a plausible Framework laptop.
 */

/** The About logo, ~/.config/omarchy/branding/about.txt as seeded from icon.txt:1-26, in green. */
const LOGO = [
  "██████████████████████████████████████████████████████",
  "██████████████████████████████████████████████████████",
  "████                     ████                     ████",
  "████                     ████                     ████",
  "████    █████████████████████         ████████    ████",
  "████    █████████████████████         ████████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████████████                              ████    ████",
  "████████████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ████                              ████    ████",
  "████    ██████████████████████████████████████    ████",
  "████    ██████████████████████████████████████    ████",
  "████                     ████                     ████",
  "████                     ████                     ████",
  "█████████████████████████████     ████████████████████",
  "█████████████████████████████     ████████████████████",
];

/** Logo padding top, left and right, in cells. etc/fastfetch/config.jsonc:7-11. */
const PAD = { top: 2, left: 2, right: 6 };

/**
 * The keys' Nerd Font icons, which the demo's JetBrains Mono cannot draw, each swapped for the
 * nearest plain character. The codepoints are Omarchy's, from etc/fastfetch/config.jsonc.
 */
const ICON = {
  laptop: "▭", // U+F109
  cpu: "▣", // U+F4BC
  gpu: "▤", // U+E266
  display: "▢", // U+F1104
  disk: "◍", // U+F02CA
  memory: "▥", // U+EFC5
  swap: "⇄", // U+F04E1
  omarchy: "◩", // U+E900, the Omarchy mark from its private font
  channel: "◈", // U+F052B
  kernel: "✲", // U+F013
  wm: "▦", // U+F488
  terminal: "›", // U+F489
  packages: "▧", // U+F03D6
  wmtheme: "◐", // U+F027C
  palette: "◑", // U+F0E0C
  font: "ƒ", // U+F031
  age: "◷", // U+F199F
  uptime: "◴", // U+F1AD0
  update: "↻", // U+EB29
};

const DAY = 86_400_000;
/** Days since the install, which the demo fixes; `ls` dates its folders from the same moment. */
export const INSTALLED_DAYS_AGO = 12;

const frame = (t: string): Line => [{ t, c: "dim" }];
const BOTTOM = frame("└────────────────────────────────────────────────────┘");

/** Key in its colour, fastfetch's default ": " separator, then the value. */
const row = (key: string, c: Tone, value: Seg[] | string): Line => [{ t: key, c }, { t: ": " }, ...(typeof value === "string" ? [{ t: value }] : value)];

/** "Friday 30 October 2026 at 21:14", omarchy-version-pkgs:8-10 with about.updatedAt "%1 at %2". */
function updatedAt(d: Date): string {
  const day = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${day} ${String(d.getDate()).padStart(2, "0")} ${month} ${d.getFullYear()} at ${time}`;
}

/** The module column. etc/fastfetch/config.jsonc:16-161. */
function modules(ctx: ShellCtx): Line[] {
  const theme = THEMES[ctx.theme];
  const updated = new Date(ctx.now.getTime() - 3 * DAY);
  updated.setHours(21, 14);
  // `echo -e "$theme \e[38m●\e[37m●…\e[31m●"`: the first SGR is incomplete, so that dot keeps
  // the default colour; 37 is white, which foot draws in the theme foreground. config.jsonc:122.
  const swatch: Seg[] = [
    { t: titleCase(ctx.theme) + " " },
    { t: "●●" },
    ...(["cyan", "magenta", "blue", "yellow", "green", "red"] as const).map((c): Seg => ({ t: "●", c })),
  ];
  return [
    [],
    [],
    frame("┌──────────────────────Hardware──────────────────────┐"),
    row(`${ICON.laptop} PC`, "green", "Framework Laptop 13 (AMD Ryzen 7040Series)"),
    row(`│ ├${ICON.cpu}`, "green", "AMD Ryzen 7 7840U (16) @ 5.13 GHz"),
    row(`│ ├${ICON.gpu}`, "green", "AMD Radeon 780M Graphics"),
    row(`│ ├${ICON.display}`, "green", '2256x1504 @ 1.5x in 13", 60 Hz [Built-in]'),
    row(`│ ├${ICON.disk}`, "green", "48.21 GiB / 930.51 GiB (5%) - btrfs"),
    row(`│ ├${ICON.memory}`, "green", "6.41 GiB / 30.66 GiB (21%)"),
    row(`└ └${ICON.swap}`, "green", "0 B / 30.66 GiB (0%)"),
    BOTTOM,
    [],
    frame("┌──────────────────────Software──────────────────────┐"),
    row(`${ICON.omarchy} OS`, "blue", `Omarchy ${REF_VERSION}`),
    // The dev-branch row (U+F062C) is absent: omarchy-version-branch exits 1 on a packaged
    // install (bin/omarchy-version-branch:9) and fastfetch hides a failed module.
    row(`│ ├${ICON.channel}`, "blue", "stable"),
    row(`│ ├${ICON.kernel}`, "blue", "Linux 6.17.1-arch1-1"),
    row(`│ ├${ICON.wm}`, "blue", "Hyprland (Wayland)"),
    row(`${ICON.wm} DE`, "blue", "Hyprland"),
    row(`│ ├${ICON.terminal}`, "blue", "foot 1.24.0"),
    row(`│ ├${ICON.packages}`, "blue", "1112 (pacman)"),
    // The GTK theme omarchy-theme-set-gnome:22-25 picks for the theme's mode.
    row(`│ ├${ICON.wmtheme}`, "blue", theme.mode === "light" ? "Adwaita" : "Adwaita-dark"),
    row(`│ ├${ICON.palette}`, "blue", swatch),
    row(`└ └${ICON.font}`, "blue", "JetBrainsMono Nerd Font (9pt)"),
    BOTTOM,
    [],
    frame("┌────────────────Age / Uptime / Update───────────────┐"),
    row(`${ICON.age} OS Age`, "magenta", `${INSTALLED_DAYS_AGO} days`),
    row(`${ICON.uptime} Uptime`, "magenta", "2h 14m"),
    row(`${ICON.update} Update`, "magenta", updatedAt(updated)),
    BOTTOM,
    [],
  ];
}

/** Runs of the logo's full blocks become solid cells, so rows meet without seams. */
function logoRow(text: string): Seg[] {
  return [...text.matchAll(/█+| +/g)].map(([run]): Seg => (run.startsWith("█") ? { t: run, c: "green", block: true } : { t: run }));
}

/**
 * Logo left, modules right, row by row. disableLinewrap (config.jsonc:14) turns off the
 * terminal's auto-wrap, so a narrow terminal clips each row rather than folding it.
 */
export function fastfetch(ctx: ShellCtx): Line[] {
  const mods = modules(ctx);
  const width = PAD.left + LOGO[0]!.length + PAD.right;
  const height = Math.max(mods.length, PAD.top + LOGO.length);
  return Array.from({ length: height }, (_, i): Line => {
    const logo = LOGO[i - PAD.top];
    const left: Seg[] = logo
      ? [{ t: " ".repeat(PAD.left), nowrap: true }, ...logoRow(logo), { t: " ".repeat(PAD.right) }]
      : [{ t: " ".repeat(width), nowrap: true }];
    return [...left, ...(mods[i] ?? [])];
  });
}
