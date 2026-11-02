import { BINDINGS } from "./keymap";
import { themeToml } from "./theme-file";
import { SLUGS } from "./themes";

export const HOME = "/home/you";

export type Node = { kind: "dir"; children: Record<string, Node> } | { kind: "file"; body: () => string };

const file = (body: string | (() => string)): Node => ({
  kind: "file",
  body: typeof body === "string" ? () => body : body,
});
const dir = (children: Record<string, Node>): Node => ({ kind: "dir", children });

// Omarchy 4 configures Hyprland in Lua (config/hypr/*.lua at 175e63b). These are the
// demo's tuned versions; the comments say what Omarchy ships.
const LOOKNFEEL = `-- Tuned look and feel. One unit (u) is 4px.
hl.config({
  general = {
    gaps_in = 4,       -- Omarchy ships 5; 4 per side gives 8px (2u) between windows
    gaps_out = 12,     -- ships 10; 3u to the screen edge
    border_size = 1,   -- ships 2; focus adds a 3px halo instead
    col = {
      active_border = theme.accent,
      inactive_border = theme.line,
    },
    layout = "dwindle",
  },

  decoration = {
    rounding = 0,      -- square stays
    shadow = { enabled = false },
  },
})
`;

const bindings = () =>
  [
    "-- Generated from the keymap. Modifiers are verbs:",
    "--   SUPER open or go · SUPER SHIFT move and launch",
    "--   SUPER ALT the other one · SUPER CTRL panels and toggles",
    "",
    ...BINDINGS.map((b) => `o.bind("${b.chord.toUpperCase().replaceAll("+", " + ")}", "${b.label}")`),
  ].join("\n");

const SHELL_JSON = `{
  "bar": {
    "position": "top",
    "background": "opaque",
    "left": ["omarchy.menu", "omarchy.workspaces"],
    "center": ["omarchy.clock"],
    "right": ["omarchy.network", "omarchy.audio", "omarchy.power"]
  }
}`;

const README = `# omarchui

A re-tuning of Omarchy 4's interface.

- One unit: 4px
- One focus ring: 1px accent + 3px halo
- Two faces: mono for machines, sans for people
- Eighteen colours, named by job
`;

// default/bashrc, which install copies to /etc/skel/.bashrc (docs/file-layout.md:124-125).
const BASHRC = `# Omarchy environment (OMARCHY_PATH + PATH), needed even for non-interactive shells
[[ -r /usr/share/omarchy/default/bash/env-bootstrap ]] && source /usr/share/omarchy/default/bash/env-bootstrap

# If not running interactively, don't do anything else (leave this above the rc source)
[[ $- != *i* ]] && return

# All the default Omarchy aliases and functions
# (don't mess with these directly, just overwrite them here!)
source "$OMARCHY_PATH/default/bash/rc"

# Add your own exports, aliases, and functions here.
#
# Make an alias for invoking commands you use constantly
# alias p='python'
`;

/**
 * A fresh user's home: Documents, Downloads, Music, Pictures, Videos and Work, with Work/tries
 * inside (bin/omarchy-provision-user:106-117; install/user/mise-work.sh:2-3). Dotfiles come
 * from /etc/skel. The one addition is this repository, as a project in Work, for lazygit
 * and the prompt's git segment.
 */
export const ROOT: Node = dir({
  home: dir({
    you: dir({
      ".bashrc": file(BASHRC),
      ".config": dir({
        hypr: dir({
          "hyprland.lua": file(
            'require("default.hypr.omarchy")\nrequire("hypr.monitors")\nrequire("hypr.input")\nrequire("hypr.bindings")\nrequire("hypr.looknfeel")\nrequire("hypr.autostart")',
          ),
          "bindings.lua": file(bindings),
          "looknfeel.lua": file(LOOKNFEEL),
          "input.lua": file('hl.config({\n  input = { kb_layout = "us", repeat_rate = 40, repeat_delay = 250 },\n})'),
          "monitors.lua": file('hl.config({ monitor = { ",preferred,auto,1" } })'),
          "autostart.lua": file('-- omarchy-shell runs the bar, menu, notifications, OSD and lock screen\nhl.exec_once("uwsm app -- omarchy-shell")'),
        }),
        omarchy: dir({
          "shell.json": file(SHELL_JSON),
          themes: dir(Object.fromEntries(SLUGS.map((s) => [s, dir({ "theme.toml": file(() => themeToml(s)) })]))),
        }),
        foot: dir({ "foot.ini": file("font=JetBrainsMono Nerd Font:size=9\npad=14x14") }),
      }),
      Documents: dir({}),
      Downloads: dir({}),
      Music: dir({}),
      Pictures: dir({}),
      Videos: dir({}),
      Work: dir({
        tries: dir({}),
        omarchui: dir({ ".git": dir({ HEAD: file("ref: refs/heads/main\n") }), "README.md": file(README) }),
      }),
    }),
  }),
});

/** Resolves `~`, `.`, `..` and relative segments against cwd into an absolute path. */
export function resolve(cwd: string, input: string): string {
  const raw = input === "~" || input.startsWith("~/") ? HOME + input.slice(1) : input;
  const start = raw.startsWith("/") ? [] : cwd.split("/").filter(Boolean);
  for (const seg of raw.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") start.pop();
    else start.push(seg);
  }
  return "/" + start.join("/");
}

export function lookup(path: string): Node | null {
  let node: Node = ROOT;
  for (const seg of path.split("/").filter(Boolean)) {
    if (node.kind !== "dir") return null;
    const next: Node | undefined = node.children[seg];
    if (!next) return null;
    node = next;
  }
  return node;
}

export function pretty(path: string): string {
  if (path === HOME) return "~";
  return path.startsWith(HOME + "/") ? "~" + path.slice(HOME.length) : path;
}

/** The nearest directory at or above path that holds a .git directory, with its branch. */
export function gitRepo(path: string): { root: string; branch: string } | null {
  const segs = path.split("/").filter(Boolean);
  for (let n = segs.length; n >= 0; n--) {
    const root = "/" + segs.slice(0, n).join("/");
    const head = lookup(root + "/.git/HEAD");
    if (head?.kind === "file")
      return {
        root,
        branch: head
          .body()
          .trim()
          .replace(/^ref: refs\/heads\//, ""),
      };
  }
  return null;
}

/** Every directory below path, breadth first, except git internals. */
export function directories(path: string): string[] {
  const out: string[] = [];
  const queue = [path];
  for (let p = queue.shift(); p !== undefined; p = queue.shift()) {
    const node = lookup(p);
    if (node?.kind !== "dir") continue;
    for (const [name, child] of Object.entries(node.children)) {
      if (child.kind !== "dir" || name === ".git") continue;
      const full = (p === "/" ? "" : p) + "/" + name;
      out.push(full);
      queue.push(full);
    }
  }
  return out;
}
