import type { Command, View } from "./commands";
import { fastfetch, INSTALLED_DAYS_AGO } from "./fastfetch";
import { directories, gitRepo, HOME, lookup, pretty, resolve, type Node } from "./fs";
import { completeOmarchy, knownBinary, omarchy, runBinary } from "./omarchy-cli";
import type { ThemeSlug } from "./themes";

export type Tone = "accent" | "green" | "red" | "yellow" | "blue" | "magenta" | "cyan" | "orange" | "dim" | "muted";
/**
 * One run of styled text. `block` draws it as solid cells, since box glyphs are not in every
 * monospace subset. `nowrap` on any segment clips its line at the terminal's edge instead of
 * wrapping it, as a program that turns off auto-wrap gets.
 */
export type Seg = { t: string; c?: Tone; block?: boolean; bold?: boolean; italic?: boolean; underline?: boolean; nowrap?: boolean };
export type Line = Seg[];

/** What a command can see of the desktop: the theme, its background index, and whether idling is allowed. */
export type ShellCtx = { cwd: string; theme: ThemeSlug; bg: number; idle: boolean; history: readonly string[]; now: Date };
/** `code` is the exit status: anything but 0 turns the next prompt's chevron into ✗. */
export type ShellResult = { out: Line[]; cwd: string; commands: Command[]; code: number; clear?: boolean; exit?: boolean };

const plain = (t: string): Line => [{ t }];
const tone = (t: string, c: Tone): Line => [{ t, c }];
const text = (s: string): Line[] => s.split("\n").map(plain);
const note = (what: string): Partial<ShellResult> => ({ out: [tone(`${what}: not in this demo`, "dim")] });

/**
 * Starship with config/starship.toml: the directory cut to its last two components behind
 * "…/" (lines 10-11), in starship's default bold cyan; inside a repository the root name in
 * bold cyan and the branch in italic cyan (12-17); then ❯, or ✗ after a failure, in bold cyan
 * (6-7). In the home folder that reads `~ ❯ `.
 */
export function prompt(cwd: string, code = 0): Line {
  const char: Seg = { t: code === 0 ? "❯" : "✗", c: "cyan", bold: true };
  const repo = gitRepo(cwd);
  if (repo) {
    const name = repo.root.split("/").pop() ?? "";
    return [
      { t: name, c: "cyan", bold: true },
      { t: truncate(cwd.slice(repo.root.length)), c: "cyan", bold: true },
      { t: " " },
      { t: repo.branch, c: "cyan", italic: true },
      { t: " " },
      char,
      { t: " " },
    ];
  }
  return [{ t: truncate(pretty(cwd)), c: "cyan", bold: true }, { t: " " }, char, { t: " " }];
}

/** truncation_length = 2, truncation_symbol = "…/". config/starship.toml:10-11. */
function truncate(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts.length > 2 ? "…/" + parts.slice(-2).join("/") : path;
}

/** Splits on whitespace, honouring "double" and 'single' quotes. */
export function tokenize(input: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  for (const m of input.matchAll(re)) out.push(m[1] ?? m[2] ?? m[3] ?? "");
  return out;
}

type Handler = (args: string[], ctx: ShellCtx) => Partial<ShellResult>;

const VIEWS: View[] = ["stock", "tuned", "split"];

// eza -lh: permissions, size, user, date and name under a header row (-h is --header in
// eza), directories first. default/bash/aliases:3. Columns and colours are eza's defaults.
const PERM_TONE: Record<string, Tone | undefined> = { d: "blue", r: "yellow", w: "red", x: "green", "-": "dim" };
const USER = "you";

/** eza's sizes: bytes, then one decimal under ten and none above, in decimal units. */
function size(bytes: number): string {
  if (bytes < 1000) return String(bytes);
  const k = bytes / 1000;
  return (k < 10 ? k.toFixed(1) : String(Math.round(k))) + "k";
}

/** Recent files read "%e %b %H:%M". The demo dates everything to the install. */
function stamp(now: Date): string {
  const d = new Date(now.getTime() - INSTALLED_DAYS_AGO * 86_400_000);
  const month = d.toLocaleDateString("en-GB", { month: "short" }).slice(0, 3);
  return `${String(d.getDate()).padStart(2)} ${month} 09:41`;
}

function eza(entries: [string, Node][], now: Date): Line[] {
  const rows = entries.map(([name, n]) => {
    const isDir = n.kind === "dir";
    return { name, isDir, perms: isDir ? "drwxr-xr-x" : ".rw-r--r--", size: isDir ? "-" : size(n.body().length) };
  });
  const sizeW = Math.max(4, ...rows.map((r) => r.size.length));
  const userW = Math.max(4, USER.length);
  const head = (t: string): Seg => ({ t, underline: true });
  const gap = (n: number): Seg => ({ t: " ".repeat(n) });
  return [
    [head("Permissions"), gap(1 + sizeW - 4), head("Size"), gap(1), head("User"), gap(1 + userW - 4), head("Date Modified"), gap(1), head("Name")],
    ...rows.map((r): Line => [
      ...[...r.perms].map((ch, i): Seg => ({ t: ch, c: PERM_TONE[ch], bold: i === 0 && ch === "d" })),
      gap(2 + sizeW - r.size.length),
      r.size === "-" ? { t: "-", c: "dim" } : { t: r.size, c: "green", bold: true },
      gap(1),
      { t: USER, c: "yellow", bold: true },
      gap(1 + userW - USER.length),
      { t: stamp(now).padEnd(13), c: "blue" },
      gap(1),
      // The demo's font has no Nerd Font icons: ▸ stands in for eza's folder glyph, · for a file's.
      { t: (r.isDir ? "▸" : "·") + " " + r.name, c: r.isDir ? "blue" : undefined, bold: r.isDir },
    ]),
  ];
}

/** `cd` is zoxide's zd: home, a real directory, or else a jump that prints where it landed. default/bash/aliases:17-34. */
function zd(a: string[], ctx: ShellCtx): Partial<ShellResult> {
  if (!a.length) return { cwd: HOME };
  const path = resolve(ctx.cwd, a[0]!);
  if (lookup(path)?.kind === "dir") return { cwd: path };
  // zoxide matches the last keyword against the last path component. The demo's database
  // holds every directory in the home folder.
  const key = a.at(-1)!.toLowerCase();
  const hit = directories(HOME).find((d) => d !== ctx.cwd && (d.split("/").pop() ?? "").toLowerCase().includes(key));
  if (!hit) return { out: text("zoxide: no match found\nError: Directory not found"), code: 1 };
  // U+F17A9, a folder glyph the demo's font lacks; ▸ stands in as it does in `ls`.
  return { cwd: hit, out: [plain(`▸ ${hit}`)] };
}

/**
 * A bash function that prints its usage when its arguments are wrong. With the right ones it
 * runs `then`, or says the demo cannot go further. default/bash/fns/*.
 */
const usage =
  (name: string, ok: (a: string[]) => boolean, msg: string, then?: Handler): Handler =>
  (a, ctx) =>
    !ok(a) ? { out: text(msg), code: 1 } : then ? then(a, ctx) : note(name);

/** default/bash/fns/tmux: every layout needs a running tmux first. */
const needsTmux = (name: string) => (): Partial<ShellResult> => ({ out: text(`You must start tmux to use ${name}.`), code: 1 });

const nvim: Handler = (a, ctx) => ({ commands: [{ type: "open", app: "editor", file: a[0] ? resolve(ctx.cwd, a[0]) : undefined }] });

const HANDLERS: Record<string, Handler> = {
  help: () => ({
    out: [
      tone("This demo's commands; help itself is the demo's, not Omarchy's. Super is Alt in the browser.", "muted"),
      ...(
        [
          ["ls, lsa, cd, pwd, cat", "look around the home folder"],
          ["omarchy", "Omarchy's command center"],
          ["omarchy theme set <name>", "change the theme"],
          ["omarchy theme list", "list themes"],
          ["omarchy theme bg next", "next background"],
          ["omarchy toggle nightlight", "night light"],
          ["omarchy menu", "the Omarchy menu"],
          ["omarchy system lock", "lock the screen"],
          ["n, btop, lazygit", "open the editor, monitor or git"],
          ["fastfetch", "system summary"],
          ["notify-send <title> [body]", "send a notification"],
          ["omarchui-view <stock|split|tuned>", "before / after"],
          ["clear, history, exit", ""],
        ] as const
      ).map(([c, d]): Line => [
        { t: "  " + c.padEnd(34), c: "accent" },
        { t: d, c: "muted" },
      ]),
    ],
  }),
  clear: () => ({ clear: true }),
  pwd: (_a, ctx) => ({ out: [plain(ctx.cwd)] }),
  whoami: () => ({ out: [plain(USER)] }),
  echo: (a) => ({ out: [plain(a.join(" "))] }),
  date: (_a, ctx) => ({
    out: [
      plain(
        ctx.now.toLocaleString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      ),
    ],
  }),
  uname: (a) => ({ out: [plain(a.includes("-a") ? "Linux omarchui 6.17.1-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" : "Linux")] }),
  history: (_a, ctx) => ({
    out: ctx.history.map((h, i): Line => [{ t: String(i + 1).padStart(4) + "  ", c: "dim" }, { t: h }]),
  }),
  ls: (a, ctx) => {
    const all = a.some((x) => /^-[^-]*a/.test(x));
    const target = a.find((x) => !x.startsWith("-"));
    const node = lookup(resolve(ctx.cwd, target ?? "."));
    if (!node) return { out: [plain(`"${target}": No such file or directory (os error 2)`)], code: 2 };
    if (node.kind === "file") return { out: eza([[target ?? "", node]], ctx.now) };
    const entries = Object.entries(node.children)
      .filter(([n]) => all || !n.startsWith("."))
      .sort(([a, x], [b, y]) => (x.kind !== y.kind ? (x.kind === "dir" ? -1 : 1) : a.toLowerCase() < b.toLowerCase() ? -1 : 1));
    return { out: entries.length ? eza(entries, ctx.now) : [] };
  },
  cd: zd,
  "..": (_a, ctx) => zd([".."], ctx),
  "...": (_a, ctx) => zd(["../.."], ctx),
  "....": (_a, ctx) => zd(["../../.."], ctx),
  cat: (a, ctx) => {
    if (!a.length) return { out: [plain("cat: missing file operand")], code: 1 };
    const out: Line[] = [];
    let code = 0;
    for (const f of a) {
      const node = lookup(resolve(ctx.cwd, f));
      if (node?.kind === "file") out.push(...node.body().split("\n").map(colorLine));
      else {
        out.push(plain(`cat: ${f}: ${node ? "Is a directory" : "No such file or directory"}`));
        code = 1;
      }
    }
    return { out, code };
  },
  omarchy: (a, ctx) => omarchy(a, ctx),
  "omarchui-view": (a) => {
    const v = a[0] as View | undefined;
    if (!v || !VIEWS.includes(v)) return { out: [tone("Usage: omarchui-view stock | split | tuned", "muted")], code: 1 };
    return { commands: [{ type: "view", view: v }], out: [plain(`View: ${v}`)] };
  },
  nvim,
  // nvim on the current folder with no arguments, else on them. default/bash/aliases:58.
  n: nvim,
  btop: () => ({ commands: [{ type: "open", app: "monitor" }] }),
  lazygit: () => ({ commands: [{ type: "open", app: "git" }] }),
  "notify-send": (a) => {
    if (!a[0]) return { out: [tone("Usage: notify-send <title> [body]", "muted")], code: 1 };
    return { commands: [{ type: "notify", who: "notify-send", title: a[0], body: a.slice(1).join(" ") }] };
  },
  fastfetch: (_a, ctx) => ({ out: fastfetch(ctx) }),
  sudo: () => ({ out: [tone("you is not in the sudoers file. This incident will be reported to the demo.", "yellow")], code: 1 }),
  exit: () => ({ exit: true }),

  // Omarchy's functions as far as the demo can take them: their usage and empty-state lines
  // are Omarchy's own. default/bash/fns/{rsyncing,ssh-port-forwarding,tmux,worktrees,drives}.
  rsw: usage("rsw", (a) => a.length === 2, "Usage: rsw <source> <destination>"),
  lsw: () => ({ out: text("No active watches") }),
  dsw: () => ({ out: text("No active watches") }),
  fip: usage("fip", (a) => a.length >= 2, "Usage: fip <host> <port1> [port2] ..."),
  dip: usage(
    "dip",
    (a) => a.length > 0,
    "Usage: dip <port1> [port2] ...",
    (a) => ({ out: a.map((p) => plain(`No forwarding on port ${p}`)) }),
  ),
  lip: () => ({ out: text("No active forwards") }),
  tdl: usage("tdl", (a) => a.length > 0, "Usage: tdl <c|cx|codex|other_ai> [<second_ai>]", needsTmux("tdl")),
  tdlm: usage("tdlm", (a) => a.length > 0, "Usage: tdlm <c|cx|codex|other_ai> [<second_ai>]", needsTmux("tdlm")),
  tds: usage("tds", (a) => a.length === 0, "Usage: tds", needsTmux("tds")),
  tsl: usage("tsl", (a) => a.length >= 2, "Usage: tsl <pane_count> <command>", needsTmux("tsl")),
  ga: usage("ga", (a) => a.length > 0, "Usage: ga [branch name]"),
  iso2sd: usage(
    "iso2sd",
    (a) => a.length > 0,
    "Usage: iso2sd <input_file> [output_device]\nExample: iso2sd ~/Downloads/ubuntu-25.04-desktop-amd64.iso /dev/sda",
  ),
  sff: usage("sff", (a) => a.length > 0, "Usage: sff <destination> (e.g. sff host:/tmp/)"),
};

/** Omarchy's aliases the demo can run, as what they expand to. default/bash/aliases:4,54-56. */
const ALIASES: Record<string, string> = {
  lsa: "ls -a",
  ic: "tdl c",
  ix: "tdl cx",
  icx: "tdl c cx",
};

/** Omarchy's other aliases and functions: real, but they start programs the demo does not have. */
const ELSEWHERE = [
  "lt",
  "lta",
  "ff",
  "eff",
  "open",
  "a",
  "c",
  "cx",
  "cy",
  "d",
  "r",
  "t",
  "h",
  "mup",
  "g",
  "gcm",
  "gcam",
  "gcad",
  "compress",
  "decompress",
  "gd",
  "hdl",
  "hds",
  "hdlm",
  "hsl",
  "format-drive",
];

const COMMAND_NAMES = [...Object.keys(HANDLERS), ...Object.keys(ALIASES), ...ELSEWHERE].sort();

function colorLine(text: string): Line {
  const hash = text.indexOf("#");
  if (hash === -1) return [{ t: text }];
  return [{ t: text.slice(0, hash) }, { t: text.slice(hash), c: "dim" }];
}

export function run(input: string, ctx: ShellCtx): ShellResult {
  const [first, ...rest] = tokenize(input.trim());
  const base: ShellResult = { out: [], cwd: ctx.cwd, commands: [], code: 0 };
  if (!first) return base;
  const expanded = ALIASES[first];
  const [name = first, ...args] = expanded ? [...tokenize(expanded), ...rest] : [first, ...rest];
  const handler = HANDLERS[name];
  if (handler) return { ...base, ...handler(args, ctx) };
  if (name.startsWith("omarchy-") && knownBinary(name)) return { ...base, ...runBinary(name, args, ctx) };
  if (ELSEWHERE.includes(name)) return { ...base, ...note(name) };
  return { ...base, out: [plain(`bash: ${name}: command not found`)], code: 127 };
}

/**
 * Tab completion, case-insensitive up to the common prefix (default/bash/inputrc:5-47).
 * omarchy-* binaries are hidden from the first word (default/bash/completions:127-129);
 * `omarchy` completes its own words; anything else completes paths.
 */
export function complete(input: string, cwd: string): string {
  const parts = input.split(" ");
  const last = parts[parts.length - 1] ?? "";
  const paths = () => {
    const slash = last.lastIndexOf("/");
    const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
    const node = lookup(resolve(cwd, dirPart || "."));
    return node?.kind === "dir" ? Object.entries(node.children).map(([n, c]) => dirPart + n + (c.kind === "dir" ? "/" : "")) : [];
  };
  let pool: string[];
  if (parts.length === 1) pool = COMMAND_NAMES;
  else if (parts[0] === "omarchy") pool = completeOmarchy(parts.slice(1, -1)) ?? paths();
  else if (parts[0] === "omarchui-view") pool = VIEWS;
  else pool = paths();
  const low = last.toLowerCase();
  const hits = pool.filter((p) => p.toLowerCase().startsWith(low));
  if (!hits.length) return input;
  let common = hits[0]!;
  for (const h of hits) while (!h.toLowerCase().startsWith(common.toLowerCase())) common = common.slice(0, -1);
  parts[parts.length - 1] = common + (hits.length === 1 && !common.endsWith("/") ? " " : "");
  return parts.join(" ");
}
