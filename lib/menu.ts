import { APP_TITLES, type AppKind, type Command, type Toggle } from "./commands";
import { REF_BINDINGS, REF_MENU, type RefMenu } from "./reference.generated";
import { SLUGS, THEMES } from "./themes";

export type MenuItem = {
  id: string;
  glyph: string;
  name: string;
  desc: string;
  hint?: string;
  children?: MenuItem[];
  command?: Command;
  /** Where Omarchy defines this entry, as path:line. */
  src?: string;
  /** Ids of this entry's ancestors, set on results of a search from the root. */
  path?: string[];
};

/** What the demo needs to decide which of Omarchy's on/off pairs to show. */
export type MenuState = { night: boolean; dnd: boolean; idle: boolean };

export const APPS: { app: AppKind; glyph: string; desc: string; hint?: string }[] = [
  { app: "terminal", glyph: "❯", desc: "A shell with a few real commands", hint: "Super Return" },
  { app: "editor", glyph: "✎", desc: "Neovim, editing looknfeel.lua", hint: "Super Shift N" },
  { app: "monitor", glyph: "▤", desc: "btop: CPU, memory, processes", hint: "Super Shift T" },
  { app: "git", glyph: "±", desc: "lazygit on this repository" },
  { app: "keys", glyph: "⌘", desc: "Every keybinding, Omarchy's and the tuned grammar", hint: "Super K" },
];

export const LAUNCHER: MenuItem[] = APPS.map((a) => ({
  id: a.app,
  glyph: a.glyph,
  name: APP_TITLES[a.app],
  desc: a.desc,
  hint: a.hint,
  command: { type: "open", app: a.app },
}));

const TOP_GLYPHS: Record<string, string> = {
  apps: "▦",
  learn: "¶",
  appearance: "◐",
  trigger: "◎",
  setup: "≡",
  install: "+",
  remove: "−",
  update: "↻",
  about: "i",
  system: "◇",
};

/** Entries the demo can actually perform. Everything else reports what Omarchy would run. */
const ACTIONS: Record<string, Command> = {
  apps: { type: "launcher" },
  "learn.keybindings": { type: "open", app: "keys" },
  "appearance.background": { type: "wallpaper" },
  "trigger.capture.screenshot": { type: "screenshot" },
  about: { type: "open", app: "terminal", run: "fastfetch" },
  "system.lock": { type: "lock" },
  "system.reboot": { type: "restart" },
  "system.logout": { type: "shutdown" },
  "system.shutdown": { type: "shutdown" },
};

/** Omarchy shows one entry of each pair, guarded by `when`; the demo uses its own state. */
const PAIRS: Record<string, { what: Toggle; showWhen: boolean }> = {
  "trigger.toggle.nightlight-on": { what: "night", showWhen: false },
  "trigger.toggle.nightlight-off": { what: "night", showWhen: true },
  "trigger.toggle.notifications-off": { what: "dnd", showWhen: false },
  "trigger.toggle.notifications-on": { what: "dnd", showWhen: true },
  // "Stay Awake" turns idle locking off; "Allow Sleep" turns it back on.
  "trigger.toggle.idle-lock-on": { what: "idle", showWhen: true },
  "trigger.toggle.idle-lock-off": { what: "idle", showWhen: false },
};

/** A binding that runs the same command, shown as the row's shortcut hint. */
function hintFor(cmd: string | undefined, id: string): string | undefined {
  if (id === "apps") return "Super Alt Space";
  if (!cmd) return undefined;
  const b = REF_BINDINGS.find((x) => x.action.includes(cmd) && x.chord.startsWith("Super"));
  return b?.chord.replaceAll("+", " ");
}

function program(cmd: string): string {
  const words = cmd
    .replace(/^[a-z_]+=\$\(/, "")
    .split(/\s+/)
    .filter((w) => w && !/^(xdg-terminal-exec|--app-id=\S+|omarchy-launch-floating-terminal-with-presentation)$/.test(w));
  return (words[0] ?? cmd).replace(/['")]/g, "");
}

function describe(n: RefMenu): string {
  if (n.kids?.length) return `${n.kids.length} ${n.kids.length === 1 ? "item" : "items"}`;
  if (n.provider) return `Lists ${n.provider}`;
  const url = n.cmd && /https?:\/\/[^'"\s]+/.exec(n.cmd)?.[0];
  if (url) return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return n.cmd ? program(n.cmd) : "";
}

function commandFor(n: RefMenu): Command | undefined {
  const pair = PAIRS[n.id];
  if (pair) return { type: "toggle", what: pair.what };
  const own = ACTIONS[n.id];
  if (own) return own;
  const url = n.cmd && /https?:\/\/[^'"\s]+/.exec(n.cmd)?.[0];
  if (url) return { type: "link", href: url };
  if (n.kids?.length) return undefined;
  return {
    type: "notify",
    who: "Omarchy 4",
    title: n.name,
    body: n.cmd ? `Not in the demo. Omarchy runs ${program(n.cmd)}.` : n.provider ? `Not in the demo. Omarchy lists ${n.provider} here.` : "Not in the demo.",
  };
}

const THEME_ITEMS: MenuItem[] = SLUGS.map((s) => ({
  id: s,
  glyph: THEMES[s].mode === "dark" ? "●" : "○",
  name: THEMES[s].name,
  desc: THEMES[s].mode,
  command: { type: "theme", slug: s },
}));

/** Omarchui's own entry, added under Appearance and labelled as not Omarchy's. */
const BEFORE_AFTER: MenuItem = {
  id: "omarchui.view",
  glyph: "◧",
  name: "Before and after",
  desc: "Omarchui only: stock, split or tuned",
  hint: "Super Alt B",
  children: [
    { id: "stock", glyph: "◧", name: "Stock", desc: "Omarchy 4 as shipped", command: { type: "view", view: "stock" } },
    { id: "split", glyph: "◫", name: "Split", desc: "Drag the divider to compare", command: { type: "view", view: "split" } },
    { id: "tuned", glyph: "◨", name: "Tuned", desc: "The proposal", command: { type: "view", view: "tuned" } },
  ],
};

function toItem(n: RefMenu, depth: number, state: MenuState): MenuItem | null {
  const pair = PAIRS[n.id];
  if (pair && state[pair.what] !== pair.showWhen) return null;
  const kids = n.kids?.map((k) => toItem(k, depth + 1, state)).filter((x): x is MenuItem => x !== null);
  const item: MenuItem = {
    id: n.id,
    glyph: depth === 0 ? (TOP_GLYPHS[n.id] ?? "•") : kids?.length ? "▸" : "·",
    name: n.name,
    desc: describe(n),
    hint: hintFor(n.cmd, n.id),
    command: commandFor(n),
    src: n.src,
  };
  if (n.id === "appearance.theme") return { ...item, desc: `${THEME_ITEMS.length} themes`, hint: "Super Ctrl T", command: undefined, children: THEME_ITEMS };
  if (n.id === "appearance" && kids) return { ...item, children: [...kids, BEFORE_AFTER] };
  return kids?.length ? { ...item, children: kids } : item;
}

/** Omarchy 4's menu, entry for entry, from default/omarchy/omarchy-menu.jsonc. */
export function omarchyMenu(state: MenuState): MenuItem[] {
  return REF_MENU.map((n) => toItem(n, 0, state)).filter((x): x is MenuItem => x !== null);
}

/** Walks a path of ids; returns the list shown at that depth and the trail of names. */
export function at(root: MenuItem[], path: readonly string[]): { items: MenuItem[]; trail: string[] } {
  let items = root;
  const trail: string[] = [];
  for (const id of path) {
    const hit = items.find((i) => i.id === id);
    if (!hit?.children) break;
    trail.push(hit.name);
    items = hit.children;
  }
  return { items, trail };
}

export function filter(items: MenuItem[], q: string): MenuItem[] {
  const s = q.trim().toLowerCase();
  if (!s) return items;
  return items.filter((i) => `${i.name} ${i.desc}`.toLowerCase().includes(s));
}

/** Search from the root covers every label in the tree, as Omarchy's does. */
export function searchAll(root: MenuItem[], q: string): MenuItem[] {
  const s = q.trim().toLowerCase();
  if (!s) return root;
  const out: MenuItem[] = [];
  const walk = (items: MenuItem[], trail: string[], ids: string[]) => {
    for (const i of items) {
      if (i.name.toLowerCase().includes(s)) out.push({ ...i, path: ids, desc: trail.length ? `${trail.join(" › ")} · ${i.desc}` : i.desc });
      if (i.children) walk(i.children, [...trail, i.name], [...ids, i.id]);
    }
  };
  walk(root, [], []);
  return out;
}
