import { APP_TITLES, VIEWS, type AppKind, type Toggle, type View } from "@/lib/commands";
import { HOME, lookup, pretty, resolve } from "@/lib/fs";
import { insert, neighbor, rectsOf, remove, swapIds, toggleSplit, type Dir, type Node, type Rect } from "@/lib/layout";
import { prompt, run, type Line } from "@/lib/shell";
import { backgroundIndex, backgroundsOf } from "@/lib/backgrounds";
import type { ThemeSlug } from "@/lib/themes";

export const WORKSPACES = 9;
export const BAR_WORKSPACES = 5;

export type TermData = { kind: "terminal"; lines: Line[]; input: string; cwd: string; history: string[]; cursor: number | null };
export type EditorMode = "normal" | "insert" | "command";
export type EditorData = { kind: "editor"; path: string; text: string; mode: EditorMode; cmd: string; dirty: boolean; caret: number };
export type GitData = { kind: "git"; sel: number };
export type KeysData = { kind: "keys"; q: string };
export type MonitorData = { kind: "monitor" };
export type AppData = TermData | EditorData | GitData | KeysData | MonitorData;

/** A floating window: its size, and its offset from the workspace's centre, in pixels. */
export type Float = { w: number; h: number; dx: number; dy: number };
export type Win = { id: string; app: AppKind; ws: number; data: AppData; float?: Float; pinned?: boolean };
export type Fullscreen = { id: string; kind: "full" | "max" } | null;
/** Low lasts 5s, normal 8s, critical until dismissed. shell/plugins/notifications/Service.qml:141-148. */
export type Urgency = "low" | "normal" | "critical";
export type Toast = { id: number; who: string; title: string; body: string; critical: boolean; urgency: Urgency; at: number };
export type Overlay = { root: "launcher" | "omarchy"; path: string[]; q: string; sel: number } | null;
/** Omarchy's image picker, open on themes or on the current theme's backgrounds. */
export type Picker = { mode: "theme" | "background"; sel: number; q: string } | null;
/** The bar panels the demo draws; one is open at a time. research/omarchy/spec/panels.json. */
export type PanelId = "clock" | "weather" | "audio" | "network" | "bluetooth" | "monitor" | "power";
export type Profile = "power-saver" | "balanced" | "performance";
export type Osd = { kind: "volume" | "brightness"; value: number; muted: boolean; key: number } | null;
export type Metrics = { cores: number[]; mem: number; net: number[] };

export type State = {
  /** Omarchy's power states: off, the boot splash, the lock screen, the desktop. */
  phase: "off" | "boot" | "lock" | "desktop";
  /** Completed boots; each one fades the desktop in from black. */
  boots: number;
  view: View;
  split: number;
  theme: ThemeSlug;
  ws: number;
  windows: Win[];
  focus: Record<number, string | null>;
  /** Super+F covers the bar ("full"); Super+Alt+F fills the work area under it ("max"). */
  fullscreen: Record<number, Fullscreen>;
  /** Each workspace's tiled windows as Hyprland's dwindle tree; floating windows sit outside it. */
  trees: Record<number, Node | null>;
  /** Windows shrinking out after a close, with the tile they had. Hyprland's windowsOut. */
  closing: { win: Win; rect: Rect | null }[];
  overlay: Overlay;
  picker: Picker;
  panel: PanelId | null;
  /** The radios and power profile the panels switch. */
  wifi: boolean;
  bluetooth: boolean;
  profile: Profile;
  toasts: Toast[];
  osd: Osd;
  volume: number;
  muted: boolean;
  brightness: number;
  night: boolean;
  dnd: boolean;
  idle: boolean;
  /** The background last shown in each theme, by index; Omarchy remembers one per theme. */
  bg: Partial<Record<ThemeSlug, number>>;
  flash: number;
  aspect: number;
  metrics: Metrics;
  seq: number;
};

export type Action =
  | { type: "unlock" }
  | { type: "lock" }
  | { type: "power-on" }
  | { type: "shutdown" }
  | { type: "restart"; theme: ThemeSlug }
  | { type: "view"; view: View }
  | { type: "view-cycle" }
  | { type: "split"; value: number }
  | { type: "theme"; slug: ThemeSlug }
  | { type: "open"; app: AppKind; file?: string; run?: string; now: Date }
  | { type: "close"; id?: string }
  | { type: "focus"; id: string }
  | { type: "focus-dir"; dir: Dir }
  | { type: "swap"; dir: Dir }
  | { type: "workspace"; n: number }
  | { type: "send"; n: number }
  | { type: "fullscreen"; kind?: "full" | "max" }
  | { type: "closed"; id: string }
  | { type: "float" }
  | { type: "pop" }
  | { type: "move-float"; id: string; float: Partial<Float> }
  | { type: "swap-ids"; a: string; b: string }
  | { type: "flip" }
  | { type: "overlay"; overlay: Overlay }
  | { type: "picker"; picker: Picker }
  | { type: "panel"; id: PanelId | null }
  | { type: "radio"; what: "wifi" | "bluetooth"; on: boolean }
  | { type: "profile"; value: Profile }
  | { type: "set-volume"; value: number }
  | { type: "set-brightness"; value: number }
  | { type: "background"; index: number }
  | { type: "notify"; who: string; title: string; body: string; critical?: boolean }
  | { type: "dismiss"; id: number }
  | { type: "volume"; delta: number }
  | { type: "mute" }
  | { type: "brightness"; delta: number }
  | { type: "osd-done"; key: number }
  | { type: "toggle"; what: Toggle }
  | { type: "bg-next" }
  | { type: "screenshot" }
  | { type: "aspect"; value: number }
  | { type: "metrics"; metrics: Metrics }
  | { type: "term-input"; id: string; input: string }
  | { type: "term-submit"; id: string; now: Date }
  | { type: "term-history"; id: string; dir: -1 | 1 }
  | { type: "editor"; id: string; patch: Partial<Omit<EditorData, "kind">> }
  | { type: "editor-command"; id: string }
  | { type: "git-sel"; id: string; sel: number }
  | { type: "keys-q"; id: string; q: string };

export function initialMetrics(): Metrics {
  return { cores: [12, 28, 9, 41, 17, 33, 6, 22], mem: 41, net: Array.from({ length: 24 }, (_, i) => 20 + ((i * 37) % 50)) };
}

export function initialState(theme: ThemeSlug): State {
  return {
    phase: "boot",
    boots: 0,
    view: "tuned",
    split: 0.5,
    theme,
    ws: 1,
    windows: [],
    focus: {},
    fullscreen: {},
    trees: {},
    closing: [],
    overlay: null,
    picker: null,
    panel: null,
    wifi: true,
    bluetooth: true,
    profile: "balanced",
    toasts: [],
    osd: null,
    volume: 64,
    muted: false,
    brightness: 70,
    night: false,
    dnd: false,
    idle: true,
    bg: {},
    flash: 0,
    aspect: 16 / 9,
    metrics: initialMetrics(),
    seq: 1,
  };
}

const WELCOME: Line[] = [
  [
    { t: "Welcome to the Omarchui demo. Type ", c: "muted" },
    { t: "help", c: "accent" },
    { t: " to see what works.", c: "muted" },
  ],
];

export function newData(app: AppKind, file?: string): AppData {
  switch (app) {
    case "terminal":
      return { kind: "terminal", lines: WELCOME, input: "", cwd: HOME, history: [], cursor: null };
    case "editor": {
      const path = file ?? resolve(HOME, "~/.config/hypr/looknfeel.lua");
      const node = lookup(path);
      const text = node?.kind === "file" ? node.body() : "";
      return { kind: "editor", path, text, mode: "normal", cmd: "", dirty: false, caret: 0 };
    }
    case "git":
      return { kind: "git", sel: 0 };
    case "keys":
      return { kind: "keys", q: "" };
    case "monitor":
      return { kind: "monitor" };
  }
}

export function windowsOn(s: State, ws: number): Win[] {
  return s.windows.filter((w) => w.ws === ws);
}

export function focused(s: State): Win | null {
  const id = s.focus[s.ws];
  return s.windows.find((w) => w.id === id) ?? null;
}

export function windowTitle(w: Win): string {
  if (w.data.kind === "editor") return `${APP_TITLES.editor} · ${pretty(w.data.path)}`;
  return APP_TITLES[w.app];
}

export function rectsFor(s: Pick<State, "trees">, ws: number) {
  return rectsOf(s.trees[ws] ?? null);
}

// Windows Omarchy tags floating-window open centred at 875x600 (default/hypr/apps/system.lua:2-11);
// btop runs as org.omarchy.btop. Super+O pops a window out at 1300x900, pinned (tiling.lua:11).
const FLOATS: ReadonlySet<AppKind> = new Set(["monitor"]);
const FLOAT_SIZE = { w: 875, h: 600 };
const POP_SIZE = { w: 1300, h: 900 };

function tile(s: State, win: Win, ws: number): State["trees"] {
  return { ...s.trees, [ws]: insert(s.trees[ws] ?? null, s.focus[ws] ?? null, win.id, s.aspect) };
}

function untile(s: State, win: Win): State["trees"] {
  return { ...s.trees, [win.ws]: remove(s.trees[win.ws] ?? null, win.id) };
}

function setWin(s: State, id: string, patch: Partial<Win>): Win[] {
  return s.windows.map((w) => (w.id === id ? { ...w, ...patch } : w));
}

// Omarchy's own messages go out at low urgency (bin/omarchy-notification-send:12); others at normal.
function toast(s: State, t: Omit<Toast, "id" | "urgency" | "at"> & { urgency?: Urgency }): State {
  if (s.dnd && !t.critical) return s;
  const urgency = t.critical ? "critical" : (t.urgency ?? (t.who.startsWith("Omarchy") ? "low" : "normal"));
  // No cap on screen; Omarchy keeps up to 100 live. Service.qml:173.
  return { ...s, toasts: [...s.toasts, { ...t, urgency, at: Date.now(), id: s.seq }].slice(-100), seq: s.seq + 1 };
}

function updateData<K extends AppData["kind"]>(s: State, id: string, kind: K, fn: (d: Extract<AppData, { kind: K }>) => Extract<AppData, { kind: K }>): State {
  return {
    ...s,
    windows: s.windows.map((w) => (w.id === id && w.data.kind === kind ? { ...w, data: fn(w.data as Extract<AppData, { kind: K }>) } : w)),
  };
}

function removeWindow(s: State, id: string): State {
  const win = s.windows.find((w) => w.id === id);
  if (!win) return s;
  const siblings = windowsOn(s, win.ws);
  const idx = siblings.findIndex((w) => w.id === id);
  const rest = siblings.filter((w) => w.id !== id);
  const nextFocus = s.focus[win.ws] === id ? (rest[Math.max(0, idx - 1)]?.id ?? null) : (s.focus[win.ws] ?? null);
  return {
    ...s,
    windows: s.windows.filter((w) => w.id !== id),
    trees: untile(s, win),
    focus: { ...s.focus, [win.ws]: nextFocus },
    fullscreen: s.fullscreen[win.ws]?.id === id ? { ...s.fullscreen, [win.ws]: null } : s.fullscreen,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "unlock":
      if (s.phase === "desktop" || s.phase === "off") return s;
      if (s.phase === "lock") return { ...s, phase: "desktop" };
      return s.boots > 0
        ? { ...s, phase: "desktop", boots: s.boots + 1 }
        : toast(
            { ...s, phase: "desktop", boots: 1 },
            {
              who: "Omarchui",
              title: "Welcome",
              body: "Alt works as Super here. Alt+Space opens the Omarchy menu; Alt+K lists every binding.",
              critical: false,
            },
          );
    case "lock":
      return s.phase === "desktop" ? { ...s, phase: "lock", overlay: null, picker: null, panel: null } : s;
    // A restart boots a fresh session: windows go, the theme, view and backgrounds stay.
    case "restart":
      return { ...initialState(a.theme), view: s.view, split: s.split, aspect: s.aspect, bg: s.bg, boots: s.boots };
    case "shutdown":
      return { ...reducer(s, { type: "restart", theme: s.theme }), phase: "off" };
    case "power-on":
      return s.phase === "off" ? { ...s, phase: "boot" } : s;
    case "view":
      return { ...s, view: a.view };
    case "view-cycle":
      return { ...s, view: VIEWS[(VIEWS.indexOf(s.view) + 1) % VIEWS.length] ?? "tuned" };
    case "split":
      return { ...s, split: clamp(a.value, 0.04, 0.96) };
    // Choosing the theme already in use moves to its next background; another theme returns to
    // the background last used in it. omarchy-theme-set:163-196.
    case "theme": {
      if (a.slug !== s.theme) return { ...s, theme: a.slug, picker: null };
      const n = backgroundsOf(a.slug).length;
      return { ...s, picker: null, bg: { ...s.bg, [a.slug]: (backgroundIndex(a.slug, s.bg[a.slug]) + 1) % n } };
    }
    case "background":
      return { ...s, picker: null, bg: { ...s.bg, [s.theme]: a.index } };
    case "picker":
      return { ...s, picker: a.picker, overlay: a.picker ? null : s.overlay, panel: a.picker ? null : s.panel };
    // One panel per bar; asking for the open one again closes it. panel.single.
    case "panel":
      return { ...s, panel: a.id === s.panel ? null : a.id, overlay: a.id ? null : s.overlay };
    case "radio":
      return { ...s, [a.what]: a.on };
    case "profile":
      return { ...s, profile: a.value };
    // Panel sliders change the level without the OSD, which shows for key presses.
    case "set-volume":
      return { ...s, volume: clamp(Math.round(a.value), 0, 100), muted: false };
    case "set-brightness":
      return { ...s, brightness: clamp(Math.round(a.value), 1, 100) };
    case "open": {
      const id = `w${s.seq}`;
      let data = newData(a.app, a.file);
      if (a.run && data.kind === "terminal") {
        const res = run(a.run, { cwd: data.cwd, theme: s.theme, history: [], now: a.now });
        data = { ...data, lines: [...data.lines, [...prompt(data.cwd), { t: a.run }], ...res.out], history: [a.run] };
      }
      const win: Win = { id, app: a.app, ws: s.ws, data, ...(FLOATS.has(a.app) ? { float: { ...FLOAT_SIZE, dx: 0, dy: 0 } } : {}) };
      return {
        ...s,
        windows: [...s.windows, win],
        trees: win.float ? s.trees : tile(s, win, s.ws),
        focus: { ...s.focus, [s.ws]: id },
        fullscreen: { ...s.fullscreen, [s.ws]: null },
        overlay: null,
        seq: s.seq + 1,
      };
    }
    case "close": {
      const id = a.id ?? s.focus[s.ws];
      const win = s.windows.find((w) => w.id === id);
      if (!win) return s;
      return { ...removeWindow(s, win.id), closing: [...s.closing, { win, rect: rectsFor(s, win.ws).get(win.id) ?? null }] };
    }
    case "closed":
      return { ...s, closing: s.closing.filter((c) => c.win.id !== a.id) };
    // A pinned window shows on every workspace, so focusing it does not switch.
    case "focus": {
      const w = s.windows.find((x) => x.id === a.id);
      if (!w) return s;
      return w.pinned ? { ...s, focus: { ...s.focus, [s.ws]: w.id } } : { ...s, ws: w.ws, focus: { ...s.focus, [w.ws]: w.id } };
    }
    // Super+T: tiled to floating (centred, 875x600) and back into the tree. tiling.lua:7.
    case "float": {
      const win = s.windows.find((w) => w.id === s.focus[s.ws]);
      if (!win) return s;
      if (win.float) {
        const back = { ...win, float: undefined, pinned: false };
        return { ...s, windows: setWin(s, win.id, { float: undefined, pinned: false }), trees: tile(s, back, win.ws) };
      }
      return { ...s, windows: setWin(s, win.id, { float: { ...FLOAT_SIZE, dx: 0, dy: 0 } }), trees: untile(s, win) };
    }
    // Super+O: float at 1300x900, centred and pinned; again, back into its tile. bin/omarchy-hyprland-window-pop.
    case "pop": {
      const win = s.windows.find((w) => w.id === s.focus[s.ws]);
      if (!win) return s;
      if (win.pinned) {
        const back = { ...win, float: undefined, pinned: false, ws: s.ws };
        return { ...s, windows: setWin(s, win.id, { float: undefined, pinned: false, ws: s.ws }), trees: tile(s, back, s.ws) };
      }
      return { ...s, windows: setWin(s, win.id, { float: { ...POP_SIZE, dx: 0, dy: 0 }, pinned: true }), trees: win.float ? s.trees : untile(s, win) };
    }
    case "move-float": {
      const win = s.windows.find((w) => w.id === a.id);
      if (!win?.float) return s;
      return { ...s, windows: setWin(s, win.id, { float: { ...win.float, ...a.float } }) };
    }
    case "swap-ids": {
      const ws = s.windows.find((w) => w.id === a.a)?.ws;
      if (ws === undefined || a.a === a.b) return s;
      return { ...s, trees: { ...s.trees, [ws]: swapIds(s.trees[ws] ?? null, a.a, a.b) } };
    }
    case "focus-dir": {
      const from = s.focus[s.ws];
      if (!from || s.fullscreen[s.ws]) return s;
      const to = neighbor(rectsFor(s, s.ws), from, a.dir);
      return to ? { ...s, focus: { ...s.focus, [s.ws]: to } } : s;
    }
    case "swap": {
      const from = s.focus[s.ws];
      if (!from) return s;
      const to = neighbor(rectsFor(s, s.ws), from, a.dir);
      if (!to) return s;
      return { ...s, trees: { ...s.trees, [s.ws]: swapIds(s.trees[s.ws] ?? null, from, to) } };
    }
    case "workspace":
      return a.n >= 1 && a.n <= WORKSPACES ? { ...s, ws: a.n } : s;
    case "send": {
      const id = s.focus[s.ws];
      if (!id || a.n === s.ws || a.n < 1 || a.n > WORKSPACES) return s;
      const moved = removeWindow(s, id);
      const win = s.windows.find((w) => w.id === id);
      if (!win) return s;
      const sent = { ...win, ws: a.n };
      return {
        ...moved,
        windows: [...moved.windows, sent],
        trees: win.float ? moved.trees : tile(moved, sent, a.n),
        focus: { ...moved.focus, [a.n]: id },
      };
    }
    case "fullscreen": {
      const id = s.focus[s.ws];
      if (!id) return s;
      const kind = a.kind ?? "full";
      const cur = s.fullscreen[s.ws];
      return { ...s, fullscreen: { ...s.fullscreen, [s.ws]: cur?.id === id && cur.kind === kind ? null : { id, kind } } };
    }
    case "flip": {
      const id = s.focus[s.ws];
      return id ? { ...s, trees: { ...s.trees, [s.ws]: toggleSplit(s.trees[s.ws] ?? null, id) } } : s;
    }
    case "overlay":
      return { ...s, overlay: a.overlay };
    case "notify":
      return toast(s, { who: a.who, title: a.title, body: a.body, critical: Boolean(a.critical) });
    case "dismiss":
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case "volume": {
      const volume = clamp(s.volume + a.delta, 0, 100);
      return { ...s, volume, muted: false, osd: { kind: "volume", value: volume, muted: false, key: s.seq }, seq: s.seq + 1 };
    }
    case "mute":
      return { ...s, muted: !s.muted, osd: { kind: "volume", value: s.volume, muted: !s.muted, key: s.seq }, seq: s.seq + 1 };
    case "brightness": {
      const brightness = clamp(s.brightness + a.delta, 5, 100);
      return { ...s, brightness, osd: { kind: "brightness", value: brightness, muted: false, key: s.seq }, seq: s.seq + 1 };
    }
    case "osd-done":
      return s.osd?.key === a.key ? { ...s, osd: null } : s;
    case "toggle": {
      const on = !s[a.what];
      const names: Record<Toggle, string> = { night: "Night light", dnd: "Do not disturb", idle: "Idle lock" };
      // Confirm before do-not-disturb takes effect, or it would swallow its own notice.
      const shown = toast(a.what === "dnd" ? { ...s, dnd: false } : s, {
        who: "Omarchy",
        title: `${names[a.what]} ${on ? "on" : "off"}`,
        body: a.what === "dnd" && on ? "Only critical notifications will show." : "",
        critical: false,
      });
      return { ...shown, [a.what]: on };
    }
    // omarchy-theme-bg-next: the next background of the current theme, wrapping. bin/omarchy-theme-bg-next:19-48.
    case "bg-next":
      return reducer(s, { type: "background", index: (backgroundIndex(s.theme, s.bg[s.theme]) + 1) % backgroundsOf(s.theme).length });
    case "screenshot":
      return toast(
        { ...s, flash: s.flash + 1, overlay: null },
        {
          who: "Screenshot",
          title: "Saved to ~/Pictures",
          body: "screenshot-omarchui.png, copied to the clipboard.",
          critical: false,
        },
      );
    case "aspect":
      return Math.abs(a.value - s.aspect) < 0.01 ? s : { ...s, aspect: a.value };
    case "metrics":
      return { ...s, metrics: a.metrics };
    case "term-input":
      return updateData(s, a.id, "terminal", (d) => ({ ...d, input: a.input, cursor: null }));
    case "term-submit": {
      const win = s.windows.find((w) => w.id === a.id);
      if (!win || win.data.kind !== "terminal") return s;
      const d = win.data;
      const input = d.input;
      const history = input.trim() ? [...d.history, input] : d.history;
      const res = run(input, { cwd: d.cwd, theme: s.theme, history, now: a.now });
      const echo: Line = [...prompt(d.cwd), { t: input }];
      let next = updateData(s, a.id, "terminal", (t) => ({
        ...t,
        lines: res.clear ? [] : [...t.lines, echo, ...res.out].slice(-400),
        cwd: res.cwd,
        input: "",
        history,
        cursor: null,
      }));
      if (res.exit) next = removeWindow(next, a.id);
      return applyShellCommands(next, res.commands, a.now);
    }
    case "term-history":
      return updateData(s, a.id, "terminal", (d) => {
        if (!d.history.length) return d;
        const cur = d.cursor ?? d.history.length;
        const cursor = clamp(cur + a.dir, 0, d.history.length);
        return { ...d, cursor, input: cursor === d.history.length ? "" : (d.history[cursor] ?? "") };
      });
    case "editor":
      return updateData(s, a.id, "editor", (d) => ({ ...d, ...a.patch }));
    case "editor-command": {
      const win = s.windows.find((w) => w.id === a.id);
      if (!win || win.data.kind !== "editor") return s;
      const cmd = win.data.cmd.trim();
      const reset = updateData(s, a.id, "editor", (d) => ({ ...d, cmd: "", mode: "normal" }));
      const file = pretty(win.data.path);
      if (cmd === "w" || cmd === "wq" || cmd === "x") {
        const saved = toast(
          updateData(reset, a.id, "editor", (d) => ({ ...d, dirty: false })),
          {
            who: "Neovim",
            title: `"${file}" written`,
            body: `${win.data.text.split("\n").length} lines. The demo keeps it until you restart.`,
            critical: false,
          },
        );
        return cmd === "w" ? saved : removeWindow(saved, a.id);
      }
      if (cmd === "q" || cmd === "q!") {
        if (cmd === "q" && win.data.dirty) {
          return toast(reset, { who: "Neovim", title: "No write since last change", body: "Use :w to save or :q! to discard.", critical: false });
        }
        return removeWindow(reset, a.id);
      }
      return toast(reset, { who: "Neovim", title: `Not an editor command: ${cmd}`, body: "This demo knows :w, :q, :wq and :q!", critical: false });
    }
    case "git-sel":
      return updateData(s, a.id, "git", (d) => ({ ...d, sel: a.sel }));
    case "keys-q":
      return updateData(s, a.id, "keys", (d) => ({ ...d, q: a.q }));
  }
}

function applyShellCommands(s: State, cmds: ReturnType<typeof run>["commands"], now: Date): State {
  return cmds.reduce<State>((acc, c) => {
    switch (c.type) {
      case "theme":
        return reducer(acc, { type: "theme", slug: c.slug });
      case "view":
        return reducer(acc, { type: "view", view: c.view });
      case "open":
        return reducer(acc, { type: "open", app: c.app, file: c.file, now });
      case "lock":
        return reducer(acc, { type: "lock" });
      case "notify":
        return reducer(acc, { type: "notify", who: c.who ?? "notify-send", title: c.title, body: c.body, critical: c.critical });
      default:
        return acc;
    }
  }, s);
}
