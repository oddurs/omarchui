import { APP_TITLES, type AppKind, type Command, type Toggle } from "./commands";
import { REF_BINDINGS, REF_MENU, type RefMenu } from "./reference.generated";

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
  /** Ids of this entry's ancestors, set on search results. */
  path?: string[];
  /** A search result's ancestors by name, from the top level down: Omarchy's detail line. */
  detail?: string;
  /** The first deeper match after the direct children: Omarchy draws a hairline above it. */
  divider?: boolean;
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
  "appearance.theme": { type: "picker", mode: "theme" },
  "appearance.background": { type: "picker", mode: "background" },
  "trigger.capture.screenshot": { type: "screenshot" },
  about: { type: "open", app: "terminal", run: "fastfetch" },
  "system.lock": { type: "lock" },
  "system.reboot": { type: "restart" },
  // Omarchy logs back in automatically, so logging out is a fresh session.
  "system.logout": { type: "restart" },
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

/** How well one entry matches, lower first. Omarchy's tiers, MenuModel.js:367-389. */
function score(i: MenuItem, q: string, terms: string[], top: boolean): number | null {
  const label = i.name.toLowerCase();
  // The last id segment counts as name text, with ._- read as spaces, MenuModel.js:325-345.
  const name = `${label} ${(i.id.split(".").at(-1) ?? "").replace(/[._-]/g, " ")}`;
  const words = i.desc.toLowerCase().split(/[^a-z0-9]+/);
  if (!terms.every((t) => name.includes(t) || words.includes(t))) return null;
  const tier =
    label === q ? (top ? 2 : 0) : label.startsWith(q) ? 10 : label.includes(q) ? 30 : name.includes(q) ? 40 : terms.every((t) => words.includes(t)) ? 60 : 80;
  return tier - (i.children ? 2 : 0);
}

/**
 * Omarchy's menu search: every descendant of the open menu, direct children first, then
 * deeper ones, each group by score, depth and definition order. Menu.qml:722-749.
 */
export function search(root: MenuItem[], path: readonly string[], q: string): MenuItem[] {
  const query = q.trim().toLowerCase().replace(/\s+/g, " ");
  const { items, trail } = at(root, path);
  if (!query) return items;
  const terms = query.split(" ");
  const hits: { item: MenuItem; deep: boolean; key: number }[] = [];
  let order = 0;
  const walk = (list: MenuItem[], names: string[], ids: string[], depth: number) => {
    for (const i of list) {
      const n = order++;
      const sc = score(i, query, terms, ids.length === 0);
      if (sc !== null) hits.push({ item: { ...i, path: ids, detail: names.join(" › ") }, deep: depth > 0, key: sc * 1000 + depth * 25 + n });
      if (i.children) walk(i.children, [...names, i.name], [...ids, i.id], depth + 1);
    }
  };
  walk(items, trail, [...path], 0);
  hits.sort((a, b) => Number(a.deep) - Number(b.deep) || a.key - b.key);
  const split = hits.findIndex((h) => h.deep);
  return hits.map((h, k) => (k === split && split > 0 ? { ...h.item, divider: true } : h.item));
}
