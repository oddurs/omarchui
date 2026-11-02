import type { Command, View } from "./commands";
import { HOME, lookup, pretty, resolve } from "./fs";
import { isSlug, SLUGS, THEMES, type ThemeSlug } from "./themes";

export type Tone = "accent" | "green" | "red" | "yellow" | "blue" | "magenta" | "cyan" | "orange" | "dim" | "muted";
/** `block` draws the text as solid cells; box glyphs are not in every monospace subset. */
export type Seg = { t: string; c?: Tone; block?: boolean };
export type Line = Seg[];

export type ShellCtx = { cwd: string; theme: ThemeSlug; history: readonly string[]; now: Date };
export type ShellResult = { out: Line[]; cwd: string; commands: Command[]; clear?: boolean; exit?: boolean };

const plain = (t: string): Line => [{ t }];
const tone = (t: string, c: Tone): Line => [{ t, c }];

export function prompt(cwd: string): Line {
  return [
    { t: pretty(cwd), c: "accent" },
    { t: " ❯ ", c: "magenta" },
  ];
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

const HANDLERS: Record<string, Handler> = {
  help: () => ({
    out: [
      tone("Commands in this demo", "muted"),
      ...(
        [
          ["ls, cd, pwd, cat", "look around the home folder"],
          ["omarchy-theme-set <name>", "change the theme"],
          ["omarchy-theme-list", "list themes"],
          ["omarchui-view <stock|split|tuned>", "before / after"],
          ["nvim [file]", "open the editor"],
          ["btop, lazygit", "open the monitor or git"],
          ["fastfetch", "system summary"],
          ["notify-send <title> [body]", "send a notification"],
          ["omarchy-lock-screen", "lock the screen"],
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
  whoami: () => ({ out: [plain("you")] }),
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
    const all = a.includes("-a") || a.includes("-la");
    const target = a.find((x) => !x.startsWith("-"));
    const path = resolve(ctx.cwd, target ?? ".");
    const node = lookup(path);
    if (!node) return { out: [tone(`ls: cannot access '${target}': No such file or directory`, "red")] };
    if (node.kind === "file") return { out: [plain(target ?? path)] };
    const names = Object.keys(node.children)
      .filter((n) => all || !n.startsWith("."))
      .sort();
    if (!names.length) return { out: [] };
    const line: Line = [];
    names.forEach((n, i) => {
      const isDir = node.children[n]?.kind === "dir";
      line.push({ t: n + (isDir ? "/" : ""), c: isDir ? "blue" : undefined });
      if (i < names.length - 1) line.push({ t: "  " });
    });
    return { out: [line] };
  },
  cd: (a, ctx) => {
    const path = resolve(ctx.cwd, a[0] ?? HOME);
    const node = lookup(path);
    if (!node) return { out: [tone(`cd: ${a[0]}: No such file or directory`, "red")] };
    if (node.kind !== "dir") return { out: [tone(`cd: ${a[0]}: Not a directory`, "red")] };
    return { cwd: path };
  },
  cat: (a, ctx) => {
    if (!a.length) return { out: [tone("cat: missing file operand", "red")] };
    const out: Line[] = [];
    for (const f of a) {
      const node = lookup(resolve(ctx.cwd, f));
      if (!node) out.push(tone(`cat: ${f}: No such file or directory`, "red"));
      else if (node.kind === "dir") out.push(tone(`cat: ${f}: Is a directory`, "red"));
      else out.push(...node.body().split("\n").map(colorLine));
    }
    return { out };
  },
  "omarchy-theme-list": (_a, ctx) => ({
    out: SLUGS.map((s): Line => [{ t: s === ctx.theme ? "● " : "  ", c: "accent" }, { t: s.padEnd(18) }, { t: THEMES[s].mode, c: "muted" }]),
  }),
  "omarchy-theme-set": (a) => {
    const slug = a[0]?.toLowerCase().replace(/\s+/g, "-");
    if (!isSlug(slug)) {
      return { out: [tone(`No theme named "${a[0] ?? ""}". Try omarchy-theme-list.`, "red")] };
    }
    return { out: [[{ t: "Theme set to " }, { t: THEMES[slug].name, c: "accent" }]], commands: [{ type: "theme", slug }] };
  },
  "omarchui-view": (a) => {
    const v = a[0] as View | undefined;
    if (!v || !VIEWS.includes(v)) return { out: [tone("Usage: omarchui-view stock | split | tuned", "muted")] };
    return { commands: [{ type: "view", view: v }], out: [plain(`View: ${v}`)] };
  },
  nvim: (a, ctx) => ({ commands: [{ type: "open", app: "editor", file: a[0] ? resolve(ctx.cwd, a[0]) : undefined }] }),
  btop: () => ({ commands: [{ type: "open", app: "monitor" }] }),
  lazygit: () => ({ commands: [{ type: "open", app: "git" }] }),
  "omarchy-lock-screen": () => ({ commands: [{ type: "lock" }] }),
  "notify-send": (a) => {
    if (!a[0]) return { out: [tone("Usage: notify-send <title> [body]", "muted")] };
    return { commands: [{ type: "notify", who: "notify-send", title: a[0], body: a.slice(1).join(" ") }] };
  },
  fastfetch: (_a, ctx) => {
    const t = THEMES[ctx.theme];
    // The mark, in cells: a tall focused tile and two stacked ones.
    const art: Line[] = [0, 1, 2, 3, 4, 5, 6].map((row) => [
      { t: "        ", c: "accent", block: true },
      { t: "  " },
      row === 3 ? { t: "    " } : { t: "    ", c: "accent", block: true },
    ]);
    const info: Line[] = [
      [{ t: "you", c: "accent" }, { t: "@" }, { t: "omarchui", c: "accent" }],
      tone("-------------", "dim"),
      [{ t: "OS      ", c: "accent" }, { t: "Omarchy (tuned study)" }],
      [{ t: "WM      ", c: "accent" }, { t: "Hyprland" }],
      [{ t: "Theme   ", c: "accent" }, { t: t.name }],
      [{ t: "Font    ", c: "accent" }, { t: "JetBrains Mono · Instrument Sans" }],
      [{ t: "Unit    ", c: "accent" }, { t: "4px" }],
    ];
    const swatches: Line = (["red", "green", "yellow", "blue", "magenta", "cyan", "orange"] as const).map((c) => ({ t: "   ", c, block: true }));
    const out: Line[] = art.map((a, i): Line => [...a, { t: "   " }, ...(info[i] ?? [])]);
    out.push([{ t: " ".repeat(17) }, ...swatches]);
    return { out };
  },
  sudo: () => ({ out: [tone("you is not in the sudoers file. This incident will be reported to the demo.", "yellow")] }),
  exit: () => ({ exit: true }),
};

const ALIASES: Record<string, string> = {
  vim: "nvim",
  vi: "nvim",
  top: "btop",
  htop: "btop",
  neofetch: "fastfetch",
  lg: "lazygit",
  ll: "ls",
  "omarchy-theme": "omarchy-theme-list",
};

export const COMMAND_NAMES = Object.keys(HANDLERS).sort();

function colorLine(text: string): Line {
  const hash = text.indexOf("#");
  if (hash === -1) return [{ t: text }];
  return [{ t: text.slice(0, hash) }, { t: text.slice(hash), c: "dim" }];
}

export function run(input: string, ctx: ShellCtx): ShellResult {
  const [name, ...args] = tokenize(input.trim());
  const base: ShellResult = { out: [], cwd: ctx.cwd, commands: [] };
  if (!name) return base;
  const key = ALIASES[name] ?? name;
  const handler = HANDLERS[key];
  if (!handler) return { ...base, out: [tone(`bash: ${name}: command not found. Try help.`, "red")] };
  const extra = key === "ls" && name === "ll" ? ["-la"] : [];
  return { ...base, ...handler([...extra, ...args], ctx) };
}

/** Tab completion: commands in first position, theme names after theme-set, paths otherwise. */
export function complete(input: string, cwd: string): string {
  const parts = input.split(" ");
  const last = parts[parts.length - 1] ?? "";
  let pool: string[];
  if (parts.length === 1) pool = [...COMMAND_NAMES, ...Object.keys(ALIASES)];
  else if (parts[0] === "omarchy-theme-set") pool = SLUGS;
  else if (parts[0] === "omarchui-view") pool = VIEWS;
  else {
    const slash = last.lastIndexOf("/");
    const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
    const node = lookup(resolve(cwd, dirPart || "."));
    pool = node?.kind === "dir" ? Object.entries(node.children).map(([n, c]) => dirPart + n + (c.kind === "dir" ? "/" : "")) : [];
  }
  const hits = pool.filter((p) => p.startsWith(last));
  if (!hits.length) return input;
  let common = hits[0] ?? last;
  for (const h of hits) while (!h.startsWith(common)) common = common.slice(0, -1);
  const done = hits.length === 1 && !common.endsWith("/") ? " " : "";
  parts[parts.length - 1] = common + done;
  return parts.join(" ");
}
