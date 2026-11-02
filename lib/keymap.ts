import type { Command } from "./commands";

export type Group = "Open or go" | "Move and launch" | "Alternates" | "Panels and toggles";

export type Binding = {
  /** Canonical chord: modifiers in the order Super, Alt, Ctrl, Shift, then the key. */
  chord: string;
  label: string;
  group: Group;
  command: Command;
  /** Omarchy 4 binds this exact chord today; tests/keymap-omarchy.test.ts checks it against the source. */
  today?: boolean;
  /** Collapsed into one row on sheets, e.g. Super+1 … Super+9 shown as Super+1–9. */
  sheet?: { chord: string } | false;
};

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const BINDINGS: Binding[] = [
  { chord: "Super+Return", label: "Terminal", group: "Open or go", today: true, command: { type: "open", app: "terminal" } },
  { chord: "Super+Space", label: "Omarchy menu", group: "Open or go", today: true, command: { type: "menu" } },
  { chord: "Super+K", label: "Keybindings", group: "Open or go", today: true, command: { type: "open", app: "keys" } },
  { chord: "Super+Escape", label: "System menu", group: "Open or go", today: true, command: { type: "menu", path: ["system"] } },
  ...digits.map((n): Binding => ({
    chord: `Super+${n}`,
    label: "Go to workspace",
    group: "Open or go",
    today: true,
    command: { type: "workspace", n },
    sheet: n === 1 ? { chord: "Super+1–9" } : false,
  })),
  { chord: "Super+Left", label: "Move focus", group: "Open or go", today: true, command: { type: "focus", dir: "left" }, sheet: { chord: "Super+Arrows" } },
  { chord: "Super+Right", label: "Move focus", group: "Open or go", today: true, command: { type: "focus", dir: "right" }, sheet: false },
  { chord: "Super+Up", label: "Move focus", group: "Open or go", today: true, command: { type: "focus", dir: "up" }, sheet: false },
  { chord: "Super+Down", label: "Move focus", group: "Open or go", today: true, command: { type: "focus", dir: "down" }, sheet: false },
  { chord: "Super+W", label: "Close window", group: "Open or go", today: true, command: { type: "close" } },
  { chord: "Super+F", label: "Fullscreen", group: "Open or go", today: true, command: { type: "fullscreen" } },
  { chord: "Super+J", label: "Flip split direction", group: "Open or go", today: true, command: { type: "flip" } },

  ...digits.map((n): Binding => ({
    chord: `Super+Shift+${n}`,
    label: "Send window to workspace",
    group: "Move and launch",
    today: true,
    command: { type: "send", n },
    sheet: n === 1 ? { chord: "Super+Shift+1–9" } : false,
  })),
  {
    chord: "Super+Shift+Left",
    label: "Swap with neighbour",
    group: "Move and launch",
    today: true,
    command: { type: "swap", dir: "left" },
    sheet: { chord: "Super+Shift+Arrows" },
  },
  { chord: "Super+Shift+Right", label: "Swap with neighbour", group: "Move and launch", today: true, command: { type: "swap", dir: "right" }, sheet: false },
  { chord: "Super+Shift+Up", label: "Swap with neighbour", group: "Move and launch", today: true, command: { type: "swap", dir: "up" }, sheet: false },
  { chord: "Super+Shift+Down", label: "Swap with neighbour", group: "Move and launch", today: true, command: { type: "swap", dir: "down" }, sheet: false },
  { chord: "Super+Shift+N", label: "Editor", group: "Move and launch", today: true, command: { type: "open", app: "editor" } },
  { chord: "Super+Shift+T", label: "Activity (btop)", group: "Move and launch", today: true, command: { type: "open", app: "monitor" } },

  { chord: "Super+Alt+Space", label: "Apps", group: "Alternates", today: true, command: { type: "launcher" } },
  { chord: "Super+Alt+B", label: "Before / after", group: "Alternates", command: { type: "view-cycle" } },
  { chord: "Super+Alt+R", label: "Reference mode", group: "Alternates", command: { type: "inspect" } },

  { chord: "Super+Ctrl+T", label: "Theme picker", group: "Panels and toggles", today: true, command: { type: "picker", mode: "theme" } },
  { chord: "Super+Ctrl+W", label: "Background picker", group: "Panels and toggles", today: true, command: { type: "picker", mode: "background" } },
  { chord: "Super+Ctrl+O", label: "Toggle menu", group: "Panels and toggles", today: true, command: { type: "menu", path: ["trigger", "trigger.toggle"] } },
  { chord: "Super+Ctrl+I", label: "Idle lock", group: "Panels and toggles", today: true, command: { type: "toggle", what: "idle" } },
  { chord: "Super+Ctrl+L", label: "Lock now", group: "Panels and toggles", today: true, command: { type: "lock" } },
];

export const GROUPS: { group: Group; verb: string; mods: string; rule: string }[] = [
  { group: "Open or go", verb: "Open or go", mods: "Super", rule: "The thing itself: a terminal, the menu, a workspace, the next window." },
  { group: "Move and launch", verb: "Move and launch", mods: "Super+Shift", rule: "Take the window somewhere, or start a named app." },
  { group: "Alternates", verb: "The other one", mods: "Super+Alt", rule: "The variant of the same key: apps beside the menu, back beside forward." },
  { group: "Panels and toggles", verb: "Panels and toggles", mods: "Super+Ctrl", rule: "Settings that take effect at once, and the panels that hold them." },
];

/** One row per binding as a person reads it, with ranges collapsed. */
export function sheet(group?: Group): { chord: string; label: string; today: boolean }[] {
  return BINDINGS.filter((b) => b.sheet !== false && (!group || b.group === group)).map((b) => ({
    chord: b.sheet ? b.sheet.chord : b.chord,
    label: b.label,
    today: Boolean(b.today),
  }));
}

const KEY_NAMES: Record<string, string> = {
  Enter: "Return",
  NumpadEnter: "Return",
  Space: "Space",
  Escape: "Escape",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  ArrowUp: "Up",
  ArrowDown: "Down",
  Minus: "Minus",
  Equal: "Equal",
  Slash: "Slash",
};

export function keyName(code: string): string | null {
  if (KEY_NAMES[code]) return KEY_NAMES[code];
  const letter = /^Key([A-Z])$/.exec(code);
  if (letter?.[1]) return letter[1];
  const digit = /^(?:Digit|Numpad)([0-9])$/.exec(code);
  if (digit?.[1]) return digit[1];
  return null;
}

export type KeyLike = Pick<KeyboardEvent, "code" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey">;

/**
 * Browsers keep the real Super key for themselves, so Alt stands in for it. With Alt as
 * Super there is no Alt left for Super+Alt chords, so Alt+Ctrl also reads as Super+Alt.
 */
export function chords(e: KeyLike): string[] {
  const key = keyName(e.code);
  if (!key) return [];
  const shift = e.shiftKey ? "+Shift" : "";
  if (e.metaKey) {
    return [`Super${e.altKey ? "+Alt" : ""}${e.ctrlKey ? "+Ctrl" : ""}${shift}+${key}`];
  }
  if (e.altKey) {
    const out = [`Super${e.ctrlKey ? "+Ctrl" : ""}${shift}+${key}`];
    if (e.ctrlKey) out.push(`Super+Alt${shift}+${key}`);
    return out;
  }
  return [];
}

const byChord = new Map(BINDINGS.map((b) => [b.chord, b]));

export function match(e: KeyLike): Binding | null {
  for (const c of chords(e)) {
    const b = byChord.get(c);
    if (b) return b;
  }
  return null;
}
