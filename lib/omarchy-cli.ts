import { backgroundName, backgroundsOf } from "./backgrounds";
import type { Command } from "./commands";
import { REF_MENU, REF_VERSION, type RefMenu } from "./reference.generated";
import type { Line, ShellCtx } from "./shell";
import { isSlug, SLUGS } from "./themes";

/**
 * The `omarchy` dispatcher (bin/omarchy at 175e63b): words map to omarchy-* binaries, each
 * described by its `# omarchy:` header. The demo knows the routes below and runs the ones it
 * can perform; spec: research/omarchy/spec/terminal.json, section omarchy_cli.
 */

export type CliResult = { out: Line[]; commands: Command[]; code: number };

/** `omarchy <group>` descriptions, as the main help lists them. bin/omarchy:29-101. */
const GROUPS: [string, string][] = [
  ["agent", "AI coding agents, their usage, and subscription accounts"],
  ["ascii", "Text drawn as ASCII art"],
  ["audio", "Audio input and output controls"],
  ["bar", "Omarchy shell bar layout and settings"],
  ["battery", "Battery status helpers"],
  ["bluetooth", "Bluetooth device controls"],
  ["branch", "Omarchy git branch management"],
  ["branding", "About and screensaver branding"],
  ["brightness", "Display and keyboard brightness"],
  ["capture", "Screenshots and screen recording"],
  ["channel", "Omarchy release channel management"],
  ["clipboard", "Clipboard helpers"],
  ["cmd", "Command and shortcut helpers"],
  ["config", "System configuration helpers"],
  ["crash", "Crash notification controls"],
  ["debug", "Diagnostics and support logs"],
  ["default", "Default application selection"],
  ["dev", "Omarchy development tools"],
  ["dictation", "Dictation recording"],
  ["disk", "Disk performance helpers"],
  ["display", "Display and text scaling"],
  ["dns", "DNS resolver configuration"],
  ["dock", "Dock shown on floating workspaces"],
  ["drive", "Drive selection and encryption"],
  ["file", "File selection helpers"],
  ["finalize", "Finalize user setup"],
  ["font", "Font management"],
  ["games", "Game launchers and helpers"],
  ["hibernation", "Hibernation setup and removal"],
  ["hook", "User hook runner"],
  ["hw", "Hardware detection and controls"],
  ["hyprland", "Hyprland window, monitor, and toggle controls"],
  ["install", "Optional software installers"],
  ["installed", "Installed optional service checks"],
  ["kernel", "Default boot kernel selection"],
  ["keyboard", "Keyboard top row and Fn-lock"],
  ["language", "Display language and system locale"],
  ["launch", "Application launchers"],
  ["menu", "Omarchy menu commands"],
  ["migrate", "Migration runner"],
  ["mise", "Mise tool wrappers"],
  ["monitor", "Monitor status helpers"],
  ["network", "Network status helpers"],
  ["notification", "Notification helpers"],
  ["openclaw", "OpenClaw agent platform setup"],
  ["osd", "On-screen display status helpers"],
  ["pkg", "Package management helpers"],
  ["plugin", "Omarchy shell plugin and bar widget management"],
  ["plymouth", "Plymouth boot theme management"],
  ["power", "Power supply detection"],
  ["powerprofiles", "Power profile management"],
  ["refresh", "Reset config to defaults"],
  ["reinstall", "Reinstall and reset workflows"],
  ["reminder", "Desktop notification reminders"],
  ["remove", "Removal workflows"],
  ["restart", "Restart Omarchy components"],
  ["setup", "Interactive setup wizards"],
  ["shell", "Omarchy shell IPC helpers"],
  ["snapshot", "System snapshots"],
  ["sudo", "Sudo configuration helpers"],
  ["system", "System status, reboot, shutdown, logout, and lock"],
  ["tailscale", "Tailscale helpers"],
  ["theme", "Theme management"],
  ["toggle", "Toggle Omarchy features"],
  ["transcode", "Image and video transcoding"],
  ["tui", "Terminal UI launchers"],
  ["update", "Omarchy and system updates"],
  ["version", "Version and channel information"],
  ["voxtype", "Voxtype dictation"],
  ["weather", "Weather status"],
  ["webapp", "Web app launchers"],
  ["wifi", "Wi-Fi helpers"],
  ["windows", "Windows VM management"],
];
const GROUP_TITLE = new Map(GROUPS);

/** Groups whose every route is below, so their tables print in full. */
const FULL_GROUPS = new Set(["theme", "font", "toggle", "restart", "system"]);

type Route = { b: string; usage: string; summary: string; args?: string; examples?: string; aliases?: string };

/** Each row is the `# omarchy:` header of bin/<b>; usage is route plus args, as bin/omarchy:261-279 builds it. */
const ROUTES: Route[] = [
  { b: "omarchy-theme-bg-cache", usage: "omarchy theme bg cache", summary: "Cache background switcher thumbnails for the current theme" },
  { b: "omarchy-theme-bg-current", usage: "omarchy theme bg current", summary: "Show current background", examples: "omarchy theme bg current" },
  { b: "omarchy-theme-bg-install", usage: "omarchy theme bg install", summary: "Open the current theme's user background folder" },
  {
    b: "omarchy-theme-bg-intro",
    usage: "omarchy theme bg intro <enable|disable|toggle|status>",
    summary: "Enable or disable background intros",
    args: "<enable|disable|toggle|status>",
    examples: "omarchy theme bg intro toggle | omarchy theme bg intro disable",
  },
  {
    b: "omarchy-theme-bg-next",
    usage: "omarchy theme bg next",
    summary: "Cycle to the next background for the current theme",
    examples: "omarchy theme bg next",
  },
  {
    b: "omarchy-theme-bg-set",
    usage: "omarchy theme bg set <path-to-media>",
    summary: "Set the current background image or video",
    args: "<path-to-media>",
    examples: "omarchy theme bg set ~/Pictures/background.png",
  },
  { b: "omarchy-theme-bg-switcher", usage: "omarchy theme bg-switcher", summary: "Open the Omarchy background switcher", aliases: "omarchy background" },
  { b: "omarchy-theme-current", usage: "omarchy theme current", summary: "Show current theme", examples: "omarchy theme current" },
  {
    b: "omarchy-theme-dir",
    usage: "omarchy theme dir <theme-name>",
    summary: "Print the directory holding a theme, preferring a user-installed copy",
    args: "<theme-name>",
    examples: "omarchy theme dir tokyo-night",
  },
  {
    b: "omarchy-theme-extras",
    usage: "omarchy theme extras",
    summary: "List the user-installed themes that came from a git clone",
    examples: "omarchy theme extras",
  },
  {
    b: "omarchy-theme-install",
    usage: "omarchy theme install [git-repo-url]",
    summary: "Install a theme from a git repository",
    args: "[git-repo-url]",
    examples: "omarchy theme install git@github.com:example/omarchy-example-theme.git",
  },
  { b: "omarchy-theme-list", usage: "omarchy theme list", summary: "List available themes", examples: 'omarchy theme list | omarchy theme set "Tokyo Night"' },
  { b: "omarchy-theme-refresh", usage: "omarchy theme refresh", summary: "Refresh the current theme from its templates." },
  {
    b: "omarchy-theme-remove",
    usage: "omarchy theme remove [theme-name]",
    summary: "Remove a user-installed theme",
    args: "[theme-name]",
    examples: 'omarchy theme remove "Tokyo Night"',
  },
  {
    b: "omarchy-theme-set",
    usage: "omarchy theme set <theme-name>",
    summary: "Apply an Omarchy theme",
    args: "<theme-name>",
    examples: 'omarchy theme list | omarchy theme set "Tokyo Night"',
  },
  { b: "omarchy-theme-switcher", usage: "omarchy theme switcher", summary: "Open the Omarchy theme switcher" },
  { b: "omarchy-theme-update", usage: "omarchy theme update", summary: "Update user-installed git themes" },
  {
    b: "omarchy-font-cjk",
    usage: "omarchy font cjk [jp|kr|sc|tc|hk|default]",
    summary: "Show or set the glyph forms for Chinese, Japanese, and Korean text",
    args: "[jp|kr|sc|tc|hk|default]",
    examples: "omarchy font cjk | omarchy font cjk jp | omarchy font cjk default",
  },
  { b: "omarchy-font-current", usage: "omarchy font current", summary: "Show current monospace font", examples: "omarchy font current" },
  {
    b: "omarchy-font-list",
    usage: "omarchy font list",
    summary: "List available monospace fonts",
    examples: 'omarchy font list | omarchy font set "CaskaydiaMono Nerd Font"',
  },
  {
    b: "omarchy-font-set",
    usage: "omarchy font set <font-name>",
    summary: "Set the system monospace font",
    args: "<font-name>",
    examples: 'omarchy font list | omarchy font set "CaskaydiaMono Nerd Font"',
  },
  {
    b: "omarchy-toggle",
    usage: "omarchy toggle <flag-name> [toggle|on|off]",
    summary: "Toggle Omarchy features between enabled and disabled",
    args: "<flag-name> [toggle|on|off]",
  },
  {
    b: "omarchy-toggle-animations",
    usage: "omarchy toggle animations [toggle|on|off]",
    summary: "Toggle animations, blur and shadows, which are slow without a GPU",
    args: "[toggle|on|off]",
    examples: "omarchy toggle animations | omarchy toggle animations off | omarchy toggle animations on",
  },
  {
    b: "omarchy-toggle-bar",
    usage: "omarchy toggle bar [toggle|on|off]",
    summary: "Toggle bar visibility without killing the Omarchy shell (on hides the bar, off shows it)",
    args: "[toggle|on|off]",
    examples: "omarchy toggle bar | omarchy toggle bar off | omarchy toggle bar on",
  },
  { b: "omarchy-toggle-crash-capture", usage: "omarchy toggle crash capture", summary: "Toggle crash capture notifications" },
  { b: "omarchy-toggle-enabled", usage: "omarchy toggle enabled <flag-name>", summary: "Check if a toggle is enabled (flag file exists)", args: "<flag-name>" },
  {
    b: "omarchy-toggle-fullscreen-desktop",
    usage: "omarchy toggle fullscreen desktop [toggle|on|off]",
    summary: "Toggle a full screen desktop: hide the top bar and remove the window gaps together",
    args: "[toggle|on|off]",
    examples: "omarchy toggle fullscreen desktop | omarchy toggle fullscreen desktop off | omarchy toggle fullscreen desktop on",
  },
  {
    b: "omarchy-toggle-hybrid-gpu",
    usage: "omarchy toggle hybrid gpu",
    summary: "Toggle dedicated vs integrated GPU mode via supergfxd (for hybrid gpu laptops, like Asus G14).",
  },
  {
    b: "omarchy-toggle-idle",
    usage: "omarchy toggle idle [toggle|stay-awake|allow-idle|status]",
    summary: "Toggle idle behavior so the system either idles normally or stays awake",
    args: "[toggle|stay-awake|allow-idle|status]",
    examples: "omarchy toggle idle | omarchy toggle idle stay-awake | omarchy-toggle-idle --status",
  },
  {
    b: "omarchy-toggle-nightlight",
    usage: "omarchy toggle nightlight [--status]",
    summary: "Toggle nightlight screen temperature",
    args: "[--status]",
    examples: "omarchy toggle nightlight",
  },
  { b: "omarchy-toggle-notification-silencing", usage: "omarchy toggle notification silencing", summary: "Toggle notification do-not-disturb mode" },
  { b: "omarchy-toggle-screensaver", usage: "omarchy toggle screensaver", summary: "Toggle screensaver availability" },
  { b: "omarchy-toggle-suspend", usage: "omarchy toggle suspend", summary: "Toggle suspend availability in the system menu" },
  { b: "omarchy-toggle-theme-sync", usage: "omarchy toggle theme sync", summary: "Toggle mirroring theme changes to and from your herdr machines" },
  {
    b: "omarchy-toggle-touchpad",
    usage: "omarchy toggle touchpad [on|off|toggle]",
    summary: "Enable, disable, or toggle the touchpad",
    args: "[on|off|toggle]",
  },
  {
    b: "omarchy-toggle-touchscreen",
    usage: "omarchy toggle touchscreen [on|off|toggle]",
    summary: "Enable, disable, or toggle the touch functionality of the screen",
    args: "[on|off|toggle]",
  },
  {
    b: "omarchy-restart-app",
    usage: "omarchy restart app <application-name> [application-args...]",
    summary: "Restart an application by killing it and relaunching via uwsm.",
    args: "<application-name> [application-args...]",
  },
  {
    b: "omarchy-restart-audio",
    usage: "omarchy restart audio",
    summary: "Restart audio services and recover stuck USB audio devices.",
    examples: "omarchy restart audio | omarchy-restart-audio",
  },
  { b: "omarchy-restart-bluetooth", usage: "omarchy restart bluetooth", summary: "Unblock and restart the bluetooth service." },
  { b: "omarchy-restart-btop", usage: "omarchy restart btop", summary: "Reload btop configuration (used by the Omarchy theme switching)." },
  { b: "omarchy-restart-helix", usage: "omarchy restart helix", summary: "Reload Helix configuration" },
  { b: "omarchy-restart-herdr", usage: "omarchy restart herdr", summary: "Reload herdr if running with the latest configuration" },
  { b: "omarchy-restart-hyprctl", usage: "omarchy restart hyprctl", summary: "Reload hyprland configuration (used by the Omarchy theme switching)." },
  {
    b: "omarchy-restart-hyprsunset",
    usage: "omarchy restart hyprsunset",
    summary: "Restart the hyprsunset service (used for blue light filtering/night light).",
  },
  { b: "omarchy-restart-opencode", usage: "omarchy restart opencode", summary: "Reload opencode configuration (used by the Omarchy theme switching)." },
  { b: "omarchy-restart-shell", usage: "omarchy restart shell", summary: "Restart the Omarchy shell", examples: "omarchy restart shell" },
  { b: "omarchy-restart-terminal", usage: "omarchy restart terminal", summary: "Reload supported terminal emulators after config changes" },
  { b: "omarchy-restart-tmux", usage: "omarchy restart tmux", summary: "Restart tmux if running with the latest configuration" },
  { b: "omarchy-restart-trackpad", usage: "omarchy restart trackpad", summary: "Reset the trackpad by unbinding and rebinding its driver." },
  { b: "omarchy-restart-wifi", usage: "omarchy restart wifi", summary: "Unblock and restart the Wi-Fi service." },
  {
    b: "omarchy-restart-xcompose",
    usage: "omarchy restart xcompose",
    summary: "Restart the XCompose input method service (fcitx5) to apply new compose key settings.",
  },
  {
    b: "omarchy-system",
    usage: "omarchy system <logout|reboot|shutdown>",
    summary: "Log out, reboot, or shut down after closing applications",
    args: "<logout|reboot|shutdown>",
    examples: "omarchy system logout | omarchy system reboot | omarchy system shutdown",
    aliases: "omarchy logout | omarchy reboot | omarchy shutdown",
  },
  {
    b: "omarchy-system-factory-reset",
    usage: "omarchy system factory reset",
    summary: "Factory-reset this machine back to its freshly-installed state",
    examples: "sudo omarchy-system-factory-reset",
  },
  { b: "omarchy-system-lock", usage: "omarchy system lock", summary: "Lock the computer and turn off the display", examples: "omarchy system lock" },
  { b: "omarchy-system-stats", usage: "omarchy system stats [--bar-widget]", summary: "Print CPU and memory stats for the shell", args: "[--bar-widget]" },
  { b: "omarchy-system-wake", usage: "omarchy system wake", summary: "Wake displays and restore brightness after idle", examples: "omarchy system wake" },
  {
    b: "omarchy-menu",
    usage: "omarchy menu [toggle|summon|close|refresh|ping] [route]",
    summary: "Control the Omarchy menu (toggle / summon / close / refresh)",
    args: "[toggle|summon|close|refresh|ping] [route]",
    examples: "omarchy menu | omarchy menu toggle system | omarchy menu summon appearance.theme | omarchy menu refresh",
  },
  {
    b: "omarchy-capture-screenshot",
    usage: "omarchy capture screenshot [smart|region|windows|fullscreen|scroll] [copy|save]",
    summary: "Take a screenshot",
    args: "[smart|region|windows|fullscreen|scroll] [copy|save]",
    examples: "omarchy screenshot | omarchy capture screenshot region",
    aliases: "omarchy screenshot",
  },
  {
    b: "omarchy-launch-editor",
    usage: "omarchy launch editor [--inline] <path>",
    summary: "Launch the default editor selected via Omarchy defaults.",
    args: "[--inline] <path>",
  },
  {
    b: "omarchy-launch-terminal",
    usage: "omarchy launch terminal [--pid=<terminal-pid>] [command...]",
    summary: "Launch a terminal in the active terminal's current directory",
    args: "[--pid=<terminal-pid>] [command...]",
  },
  {
    b: "omarchy-launch-tui",
    usage: "omarchy launch tui [--app-id=<app-id>] <command> [args...]",
    summary: "Launch a TUI command in the default terminal with Omarchy styling",
    args: "[--app-id=<app-id>] <command> [args...]",
  },
  { b: "omarchy-version", usage: "omarchy version", summary: "Print the installed Omarchy version" },
];

const wordsOf = (usage: string) => {
  const out: string[] = [];
  for (const w of usage.split(" ").slice(1)) {
    if (/^[<[]/.test(w)) break;
    out.push(w);
  }
  return out;
};
const INDEX = ROUTES.map((r) => ({ ...r, words: wordsOf(r.usage) }));
type Indexed = (typeof INDEX)[number];
const BY_BINARY = new Map(INDEX.map((r) => [r.b, r]));

/** `omarchy screenshot` and `omarchy background`, from the routes' aliases. */
const ALIASES = new Map(
  INDEX.flatMap((r) =>
    (r.aliases ?? "")
      .split("|")
      .map((a) => a.trim().split(" ").slice(1))
      .filter((w) => w.length === 1)
      .map((w) => [w[0]!, r] as const),
  ),
);

/** An argument is required when something is left after dropping the [optional] parts. bin/omarchy:400-410. */
const requiresArgs = (r: Route) => (r.args ?? "").replace(/\[[^\][]*\]/g, "").trim() !== "";
const lines = (text: string): Line[] => text.split("\n").map((t) => [{ t }]);
const done = (out: Line[] = [], commands: Command[] = [], code = 0): CliResult => ({ out, commands, code });
const note = (what: string): CliResult => done([[{ t: `${what}: not in this demo`, c: "dim" }]]);

const MAIN_HEAD = `Omarchy command center

Usage:
  omarchy <command> [args...]
  omarchy commands [--all] [--json] [--check]
  omarchy <group> --help
  omarchy <group> <command> --help

Common commands:
  omarchy update              Update Omarchy and system packages
  omarchy theme list          List available themes
  omarchy theme set <name>    Apply a theme
  omarchy font list           List available fonts
  omarchy screenshot          Take a screenshot
  omarchy debug               Print debugging information

Groups:`;

const MAIN_TAIL = `
Discovery:
  omarchy commands            List all commands
  omarchy commands --all      Include commands explicitly marked hidden
  omarchy commands --json     Machine-readable command list
  omarchy commands --check    Validate command metadata and routes`;

/** bin/omarchy:578-616: a heredoc, the sorted groups printed '  %-14s %s', another heredoc. */
export function mainHelp(): string {
  const groups = [...GROUPS].sort(([a], [b]) => (a < b ? -1 : 1)).map(([g, d]) => `  ${g.padEnd(14)} ${d}`);
  return [MAIN_HEAD, ...groups, MAIN_TAIL].join("\n");
}

/** bin/omarchy:633-652: '  %-*s  %s' over the widest usage. */
function table(rows: [string, string][]): string[] {
  const w = Math.max(...rows.map(([u]) => u.length));
  return rows.map(([u, s]) => `  ${u.padEnd(w)}  ${s}`);
}

const sortedRows = (rs: Indexed[]): [string, string][] => rs.map((r): [string, string] => [r.usage, r.summary]).sort(([a], [b]) => (a < b ? -1 : 1));

/** bin/omarchy:868-891. */
export function groupHelp(group: string): string {
  const head = `${group[0]!.toUpperCase()}${group.slice(1)} commands — ${GROUP_TITLE.get(group)}:`;
  return [head, ...table(sortedRows(INDEX.filter((r) => r.words[0] === group)))].join("\n");
}

/** bin/omarchy:932-978. Group roots (omarchy-<group>) also list their group. */
export function commandHelp(r: Indexed): string {
  const out = ["Usage:", `  ${r.usage}`, "", r.summary];
  const list = (title: string, v?: string) => {
    if (v) out.push("", `${title}:`, ...v.split("|").map((x) => `  ${x.trim()}`));
  };
  if (r.args) out.push("", "Arguments:", `  ${r.args}`);
  list("Examples", r.examples);
  list("Aliases", r.aliases);
  out.push("", "Binary:", `  ${r.b}`);
  const fallback = "omarchy " + r.b.slice("omarchy-".length).replaceAll("-", " ");
  if (fallback !== ["omarchy", ...r.words].join(" ")) out.push("", "Filename route:", `  ${fallback}`);
  const group = r.words[0]!;
  if (r.words.length === 1 && FULL_GROUPS.has(group)) {
    out.push("", "Related commands:", ...table(sortedRows(INDEX.filter((x) => x.words[0] === group && x !== r))));
  }
  return out.join("\n");
}

/** bin/omarchy:893-912: every route under a partial one, e.g. `omarchy theme bg`. */
function prefixHelp(words: string[]): string | null {
  const prefix = ["omarchy", ...words].join(" ") + " ";
  const rows = INDEX.filter((r) => r.usage.startsWith(prefix));
  return rows.length ? [`${words.join(" ")} commands:`, ...table(sortedRows(rows))].join("\n") : null;
}

/** bin/omarchy:1003-1016 offers the first route whose first word starts with the typed one. */
function unknown(args: string[]): CliResult {
  const typed = args[0] ?? "";
  const hit = [...GROUPS.map(([g]) => g), ...ALIASES.keys()].find((g) => g.startsWith(typed));
  return done(
    [
      [{ t: `Unknown Omarchy command: omarchy ${args.join(" ")}` }],
      ...(hit ? [[{ t: `Did you mean: omarchy ${hit} ?` }]] : []),
      [{ t: "Run 'omarchy commands --all' to discover available commands." }],
    ],
    [],
    127,
  );
}

const isHelp = (a: string) => a === "--help" || a === "-h";

/** The longest known route the arguments start with. */
function resolveRoute(args: string[]): Indexed | null {
  let best: Indexed | null = null;
  for (const r of INDEX) {
    if (r.words.every((w, i) => args[i] === w) && r.words.length > (best?.words.length ?? 0)) best = r;
  }
  return best;
}

/** `omarchy ...`, as bin/omarchy's main and dispatch_or_help route it. bin/omarchy:1101-1175. */
export function omarchy(args: string[], ctx: ShellCtx): CliResult {
  if (!args.length || isHelp(args[0]!)) return done(lines(mainHelp()));
  const [first, ...rest] = args;
  if (first === "logout" || first === "reboot" || first === "shutdown") return omarchy(["system", ...args], ctx);
  if (first === "commands") return note("omarchy commands");
  const alias = ALIASES.get(first!);
  const words = alias ? [...alias.words, ...rest] : args;

  const route = resolveRoute(words);
  if (route) {
    const remaining = words.slice(route.words.length);
    if (remaining.some(isHelp)) return done(lines(commandHelp(route)));
    if (!remaining.length && requiresArgs(route)) {
      const group = route.words[0]!;
      return done(lines(route.words.length === 1 && FULL_GROUPS.has(group) ? groupHelp(group) : commandHelp(route)));
    }
    return binary(route.b, remaining, ctx) ?? note(["omarchy", ...words].join(" "));
  }

  const group = words[0]!;
  if (GROUP_TITLE.has(group)) {
    if (!FULL_GROUPS.has(group)) return note(["omarchy", ...words].join(" "));
    if (words.length === 1 || isHelp(words[1]!)) return done(lines(groupHelp(group)));
  }
  const prefix = prefixHelp(words);
  return prefix ? done(lines(prefix)) : unknown(words);
}

/** Whether a name is an omarchy-* binary the demo knows, or one in a group it does not model. */
export function knownBinary(name: string): boolean {
  return BY_BINARY.has(name) || GROUP_TITLE.has(name.split("-")[1] ?? "");
}

/** Runs an omarchy-* binary directly, without the dispatcher's help. */
export function runBinary(name: string, args: string[], ctx: ShellCtx): CliResult {
  return binary(name, args, ctx) ?? note(name);
}

/** "tokyo-night" reads "Tokyo Night", as omarchy-theme-list:9 and omarchy-theme-current:10 print it. */
export const titleCase = (slug: string) => slug.replace(/(^|-)([a-z])/g, (_m, a: string, b: string) => a + b.toUpperCase()).replaceAll("-", " ");

/** A menu route (an item id such as setup.power, or its last segment) as the path of ids to it. */
function menuPath(route: string): string[] {
  if (route === "root") return [];
  const find = (nodes: RefMenu[], trail: string[]): string[] | null => {
    for (const n of nodes) {
      const path = [...trail, n.id];
      if (n.id === route || n.id.endsWith("." + route)) return path;
      const hit = find(n.kids ?? [], path);
      if (hit) return hit;
    }
    return null;
  };
  return find(REF_MENU, []) ?? [];
}

const MENU_USAGE = `Usage: omarchy menu [verb] [route]

Verbs:
  toggle [route]   Open the menu at <route>, or close it if already open. Default verb.
  summon [route]   Always open the menu (no close-if-visible toggle).
  close            Close the menu if it is visible.
  refresh          Re-parse the menu JSONC files.
  ping             Health check.

Route is an item id (e.g. setup.power) or alias (e.g. power). Defaults to
"root", which opens the top-level menu.`;

const TUI_APPS: Record<string, Command> = {
  btop: { type: "open", app: "monitor" },
  lazygit: { type: "open", app: "git" },
  nvim: { type: "open", app: "editor" },
};

function binary(name: string, args: string[], ctx: ShellCtx): CliResult | null {
  const [a] = args;
  switch (name) {
    // bin/omarchy-theme-set:7-10, 379-393. Silent on success.
    case "omarchy-theme-set": {
      if (!a) return done(lines("Usage: omarchy-theme-set <theme-name>"), [], 1);
      const slug = a
        .replace(/<[^>]+>/g, "")
        .toLowerCase()
        .replaceAll(" ", "-");
      if (!slug || slug.startsWith(".") || slug.includes("/")) return done(lines(`Invalid theme name: ${a}`), [], 1);
      if (!isSlug(slug)) return done(lines(`Theme '${slug}' does not exist`), [], 1);
      return done([], [{ type: "theme", slug }]);
    }
    case "omarchy-theme-list":
      return done([...SLUGS].sort().map((s) => [{ t: titleCase(s) }]));
    case "omarchy-theme-current":
      return done(lines(titleCase(ctx.theme)));
    case "omarchy-theme-bg-next":
      return done([], [{ type: "bg-next" }]);
    case "omarchy-theme-bg-current": {
      const file = backgroundsOf(ctx.theme)[ctx.bg]?.file;
      return done(lines(file ? backgroundName(file) : "Unknown"));
    }
    case "omarchy-theme-switcher":
      return done([], [{ type: "picker", mode: "theme" }]);
    case "omarchy-theme-bg-switcher":
      return done([], [{ type: "picker", mode: "background" }]);
    // fc-match monospace on a fresh install. default/fontconfig/conf.avail/50-omarchy.conf:332-335.
    case "omarchy-font-current":
    case "omarchy-font-list":
      return done(lines("JetBrainsMono Nerd Font"));
    case "omarchy-toggle-nightlight":
      return done([], [{ type: "toggle", what: "night" }]);
    case "omarchy-toggle-notification-silencing":
      return done([], [{ type: "toggle", what: "dnd" }]);
    // Prints the state it leaves behind: 'disabled' while staying awake. bin/omarchy-toggle-idle:23-62.
    case "omarchy-toggle-idle": {
      const awake = !ctx.idle;
      const flip = (to: boolean): CliResult => done(lines(to ? "disabled" : "enabled"), to === awake ? [] : [{ type: "toggle", what: "idle" }]);
      switch (a ?? "toggle") {
        case "toggle":
          return flip(!awake);
        case "stay-awake":
        case "awake":
        case "on":
          return flip(true);
        case "allow-idle":
        case "idle":
        case "off":
          return flip(false);
        case "status":
        case "--status":
          return done(
            lines(
              awake
                ? '{"enabled":true,"class":"enabled","tooltip":"Allow Idle Lock & Screensaver"}'
                : '{"enabled":false,"class":"disabled","tooltip":"Stay Awake"}',
            ),
          );
        default:
          return done(lines("Usage: omarchy-toggle-idle [toggle|stay-awake|allow-idle|status]"), [], 1);
      }
    }
    // bin/omarchy-system:8-24: each prints nothing and ends the session its own way.
    case "omarchy-system":
      if (a === "reboot") return done([], [{ type: "restart" }]);
      if (a === "shutdown") return done([], [{ type: "shutdown" }]);
      if (a === "logout") return done([], [{ type: "logout" }]);
      return done(lines("Usage: omarchy-system <logout|reboot|shutdown>"), [], 2);
    case "omarchy-system-lock":
      return done([], [{ type: "lock" }]);
    // bin/omarchy-menu:12-51.
    case "omarchy-menu": {
      const verb = a ?? "toggle";
      if (verb === "toggle" || verb === "summon") return done([], [{ type: "menu", path: menuPath(args[1] ?? "root") }]);
      if (verb === "close" || verb === "refresh" || verb === "ping") return done();
      if (verb === "help" || isHelp(verb)) return done(lines(MENU_USAGE));
      return done(lines(`omarchy-menu: unknown verb '${verb}'. Try 'omarchy menu --help'.`), [], 2);
    }
    case "omarchy-capture-screenshot":
      return done([], [{ type: "screenshot" }]);
    case "omarchy-launch-editor": {
      const file = args.find((x) => x !== "--inline");
      return done([], [{ type: "open", app: "editor", file }]);
    }
    case "omarchy-launch-terminal":
      return done([], [{ type: "open", app: "terminal" }]);
    case "omarchy-launch-tui": {
      const app = TUI_APPS[args.find((x) => !x.startsWith("--")) ?? ""];
      return app ? done([], [app]) : null;
    }
    // pacman's version of the package; the repo's version file reads 4.0.0.alpha (version:1).
    case "omarchy-version":
      return done(lines(REF_VERSION));
  }
  return null;
}

/**
 * Tab completion for `omarchy`, after default/bash/completions:1-125: the next word of known
 * binaries (every group at the first position, plus `commands`), else the alternatives the
 * command's args list at that position. Null leaves it to filename completion (-o default).
 */
export function completeOmarchy(words: string[]): string[] | null {
  const typed = words.filter((w) => w && !w.startsWith("-"));
  const prefix = ["omarchy", ...typed].join("-") + "-";
  const next = new Set(INDEX.filter((r) => r.b.startsWith(prefix)).map((r) => r.b.slice(prefix.length).split("-")[0]!));
  if (!typed.length) for (const g of [...GROUP_TITLE.keys(), "commands"]) next.add(g);
  if (next.size) return [...next];
  for (let n = typed.length; n > 0; n--) {
    const r = BY_BINARY.get(["omarchy", ...typed.slice(0, n)].join("-"));
    if (!r) continue;
    const at = typed.length - n;
    const alts = (r.args ?? "")
      .split(" | ")
      .map((alt) => alt.split(" "))
      .filter((spec) => typed.slice(n).every((w, i) => fits(spec[i], w)))
      .flatMap((spec) => choices(spec[at]));
    return alts.length ? [...new Set(alts)] : null;
  }
  return null;
}

const inner = (token: string) => token.replace(/^[<[]/, "").replace(/[>\]]$/, "");
const choices = (token?: string) => (!token ? [] : /^[<[]/.test(token) ? (inner(token).includes("|") ? inner(token).split("|") : []) : [token]);
const fits = (token: string | undefined, w: string) =>
  !!token && (/^[<[]/.test(token) ? !inner(token).includes("|") || inner(token).split("|").includes(w) : token === w);
