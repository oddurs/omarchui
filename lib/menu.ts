import { APP_TITLES, type AppKind, type Command } from "./commands";
import { SLUGS, THEMES } from "./themes";

export type MenuItem = {
  id: string;
  glyph: string;
  name: string;
  desc: string;
  hint?: string;
  children?: MenuItem[];
  command?: Command;
};

const notInDemo = (what: string, where: string): Command => ({
  type: "notify",
  who: "Omarchy",
  title: what,
  body: `Not part of the demo. In Omarchy 4 this is ${where}.`,
});

export const APPS: { app: AppKind; glyph: string; desc: string; hint?: string }[] = [
  { app: "terminal", glyph: "❯", desc: "A shell with a few real commands", hint: "Super Return" },
  { app: "editor", glyph: "✎", desc: "Neovim, editing looknfeel.lua", hint: "Super Shift N" },
  { app: "monitor", glyph: "▤", desc: "btop: CPU, memory, processes", hint: "Super Shift T" },
  { app: "git", glyph: "±", desc: "lazygit on this repository" },
  { app: "keys", glyph: "⌘", desc: "Every keybinding, searchable", hint: "Super K" },
];

export const LAUNCHER: MenuItem[] = APPS.map((a) => ({
  id: a.app,
  glyph: a.glyph,
  name: APP_TITLES[a.app],
  desc: a.desc,
  hint: a.hint,
  command: { type: "open", app: a.app },
}));

/**
 * The Omarchy 4 menu's top level, in its order (default/omarchy/omarchy-menu.jsonc:24-33),
 * with the branches the demo can act on filled in.
 */
export const OMARCHY_MENU: MenuItem[] = [
  { id: "apps", glyph: "▦", name: "Apps", desc: "Launch an application", hint: "Super Alt Space", command: { type: "launcher" } },
  {
    id: "learn",
    glyph: "¶",
    name: "Learn",
    desc: "Keybindings and the manuals",
    children: [
      { id: "keys", glyph: "⌘", name: "Keybindings", desc: "Every binding, grouped by verb", hint: "Super K", command: { type: "open", app: "keys" } },
      { id: "omarchy", glyph: "↗", name: "Omarchy", desc: "The manual at omarchy.org", command: { type: "link", href: "https://omarchy.org" } },
      { id: "hyprland", glyph: "↗", name: "Hyprland", desc: "The Hyprland wiki", command: { type: "link", href: "https://wiki.hypr.land" } },
      { id: "arch", glyph: "↗", name: "Arch", desc: "The Arch wiki", command: { type: "link", href: "https://wiki.archlinux.org" } },
    ],
  },
  {
    id: "appearance",
    glyph: "◐",
    name: "Appearance",
    desc: "Theme, background, before and after",
    children: [
      {
        id: "theme",
        glyph: "◐",
        name: "Theme",
        desc: "Previews as you move",
        hint: "Super Ctrl T",
        children: SLUGS.map((s) => ({
          id: s,
          glyph: THEMES[s].mode === "dark" ? "●" : "○",
          name: THEMES[s].name,
          desc: THEMES[s].mode,
          command: { type: "theme", slug: s },
        })),
      },
      { id: "background", glyph: "▨", name: "Background", desc: "Next wallpaper", command: { type: "wallpaper" } },
      {
        id: "view",
        glyph: "◧",
        name: "Before and after",
        desc: "Omarchui only: stock, split or tuned",
        hint: "Super Alt B",
        children: [
          { id: "stock", glyph: "◧", name: "Stock", desc: "Omarchy 4 as shipped", command: { type: "view", view: "stock" } },
          { id: "split", glyph: "◫", name: "Split", desc: "Drag the divider to compare", command: { type: "view", view: "split" } },
          { id: "tuned", glyph: "◨", name: "Tuned", desc: "The proposal", command: { type: "view", view: "tuned" } },
        ],
      },
      {
        id: "font",
        glyph: "A",
        name: "Font",
        desc: "Change the monospace face",
        command: notInDemo("Font", "Appearance › Font, which changes every shell surface at once"),
      },
    ],
  },
  {
    id: "trigger",
    glyph: "◎",
    name: "Trigger",
    desc: "Toggle, capture, remind",
    children: [
      {
        id: "toggle",
        glyph: "◑",
        name: "Toggle",
        desc: "Night light, notifications, idle",
        hint: "Super Ctrl O",
        children: [
          { id: "night", glyph: "◑", name: "Night light", desc: "Warm the screen", command: { type: "toggle", what: "night" } },
          { id: "dnd", glyph: "◌", name: "Silence notifications", desc: "Only critical ones show", command: { type: "toggle", what: "dnd" } },
          { id: "idle", glyph: "◷", name: "Idle lock", desc: "Lock after five idle minutes", hint: "Super Ctrl I", command: { type: "toggle", what: "idle" } },
        ],
      },
      { id: "capture", glyph: "▣", name: "Capture", desc: "Screenshot the screen", command: { type: "screenshot" } },
      {
        id: "critical",
        glyph: "!",
        name: "Test a critical notification",
        desc: "See how urgency looks",
        command: { type: "notify", who: "Battery", title: "Battery at 9%", body: "Plug in within 15 minutes to avoid suspending.", critical: true },
      },
    ],
  },
  {
    id: "setup",
    glyph: "≡",
    name: "Setup",
    desc: "Keyboard, input, network, defaults",
    children: [
      { id: "keyboard", glyph: "⌨", name: "Keyboard", desc: "Layout and repeat", command: notInDemo("Keyboard", "a Setup page") },
      {
        id: "network",
        glyph: "≋",
        name: "Network",
        desc: "DNS and sharing",
        command: notInDemo("Network", "a Setup page; Wi-Fi itself is a bar panel on Super Ctrl N"),
      },
      { id: "defaults", glyph: "★", name: "Defaults", desc: "Terminal, browser, editor", command: notInDemo("Defaults", "a Setup page") },
    ],
  },
  { id: "install", glyph: "+", name: "Install", desc: "Packages, web apps, fonts", command: notInDemo("Install", "a searchable package menu") },
  { id: "remove", glyph: "−", name: "Remove", desc: "Uninstall what you added", command: notInDemo("Remove", "a searchable removal menu") },
  { id: "update", glyph: "↻", name: "Update", desc: "Omarchy, kernel, firmware", command: notInDemo("Update", "omarchy-update in a terminal") },
  { id: "about", glyph: "i", name: "About", desc: "Version and hardware", command: { type: "open", app: "terminal", run: "fastfetch" } },
  {
    id: "system",
    glyph: "◇",
    name: "System",
    desc: "Lock, reboot, leave the demo",
    hint: "Super Esc",
    children: [
      { id: "lock", glyph: "◇", name: "Lock", desc: "Back to the lock screen", hint: "Super Ctrl L", command: { type: "lock" } },
      { id: "reboot", glyph: "↻", name: "Reboot", desc: "Reset every window", command: { type: "restart" } },
      { id: "shutdown", glyph: "⏻", name: "Shutdown", desc: "Leave the demo", command: { type: "shutdown" } },
    ],
  },
];

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
