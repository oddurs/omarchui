import { APP_TITLES, VIEWS, type AppKind, type Toggle, type View } from "@/lib/commands";
import { HOME, lookup, pretty, resolve } from "@/lib/fs";
import { dwindle, neighbor, type Dir } from "@/lib/layout";
import { prompt, run, type Line } from "@/lib/shell";
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

export type Win = { id: string; app: AppKind; ws: number; data: AppData };
export type Toast = { id: number; who: string; title: string; body: string; critical: boolean };
export type Overlay = { root: "launcher" | "omarchy"; path: string[]; q: string; sel: number } | null;
export type Osd = { kind: "volume" | "brightness"; value: number; muted: boolean; key: number } | null;
export type Metrics = { cores: number[]; mem: number; net: number[] };

export type State = {
  phase: "lock" | "desktop";
  view: View;
  split: number;
  theme: ThemeSlug;
  ws: number;
  windows: Win[];
  focus: Record<number, string | null>;
  fullscreen: Record<number, string | null>;
  flip: Record<number, boolean>;
  overlay: Overlay;
  toasts: Toast[];
  osd: Osd;
  volume: number;
  muted: boolean;
  brightness: number;
  night: boolean;
  dnd: boolean;
  idle: boolean;
  wallpaper: number;
  flash: number;
  aspect: number;
  metrics: Metrics;
  seq: number;
};

export type Action =
  | { type: "unlock" }
  | { type: "lock" }
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
  | { type: "fullscreen" }
  | { type: "flip" }
  | { type: "overlay"; overlay: Overlay }
  | { type: "notify"; who: string; title: string; body: string; critical?: boolean }
  | { type: "dismiss"; id: number }
  | { type: "volume"; delta: number }
  | { type: "mute" }
  | { type: "brightness"; delta: number }
  | { type: "osd-done"; key: number }
  | { type: "toggle"; what: Toggle }
  | { type: "wallpaper" }
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

export const WALLPAPERS = 4;

export function initialMetrics(): Metrics {
  return { cores: [12, 28, 9, 41, 17, 33, 6, 22], mem: 41, net: Array.from({ length: 24 }, (_, i) => 20 + ((i * 37) % 50)) };
}

export function initialState(theme: ThemeSlug): State {
  return {
    phase: "lock",
    view: "tuned",
    split: 0.5,
    theme,
    ws: 1,
    windows: [],
    focus: {},
    fullscreen: {},
    flip: {},
    overlay: null,
    toasts: [],
    osd: null,
    volume: 64,
    muted: false,
    brightness: 70,
    night: false,
    dnd: false,
    idle: true,
    wallpaper: 0,
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

function rectsFor(s: State, ws: number) {
  return dwindle(
    windowsOn(s, ws).map((w) => w.id),
    s.aspect,
    s.flip[ws] ?? false,
  );
}

function toast(s: State, t: Omit<Toast, "id">): State {
  if (s.dnd && !t.critical) return s;
  return { ...s, toasts: [...s.toasts, { ...t, id: s.seq }].slice(-4), seq: s.seq + 1 };
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
    focus: { ...s.focus, [win.ws]: nextFocus },
    fullscreen: s.fullscreen[win.ws] === id ? { ...s.fullscreen, [win.ws]: null } : s.fullscreen,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "unlock":
      return s.phase === "desktop"
        ? s
        : toast(
            { ...s, phase: "desktop" },
            {
              who: "Omarchui",
              title: "Welcome",
              body: "Alt works as Super here. Alt+Space opens the Omarchy menu; Alt+K lists every binding.",
              critical: false,
            },
          );
    case "lock":
      return { ...s, phase: "lock", overlay: null };
    case "restart":
      return { ...initialState(a.theme), view: s.view, split: s.split, aspect: s.aspect };
    case "view":
      return { ...s, view: a.view };
    case "view-cycle":
      return { ...s, view: VIEWS[(VIEWS.indexOf(s.view) + 1) % VIEWS.length] ?? "tuned" };
    case "split":
      return { ...s, split: clamp(a.value, 0.04, 0.96) };
    case "theme":
      return { ...s, theme: a.slug };
    case "open": {
      const id = `w${s.seq}`;
      let data = newData(a.app, a.file);
      if (a.run && data.kind === "terminal") {
        const res = run(a.run, { cwd: data.cwd, theme: s.theme, history: [], now: a.now });
        data = { ...data, lines: [...data.lines, [...prompt(data.cwd), { t: a.run }], ...res.out], history: [a.run] };
      }
      return {
        ...s,
        windows: [...s.windows, { id, app: a.app, ws: s.ws, data }],
        focus: { ...s.focus, [s.ws]: id },
        fullscreen: { ...s.fullscreen, [s.ws]: null },
        overlay: null,
        seq: s.seq + 1,
      };
    }
    case "close": {
      const id = a.id ?? s.focus[s.ws];
      return id ? removeWindow(s, id) : s;
    }
    case "focus": {
      const w = s.windows.find((x) => x.id === a.id);
      return w ? { ...s, ws: w.ws, focus: { ...s.focus, [w.ws]: w.id } } : s;
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
      const i = s.windows.findIndex((w) => w.id === from);
      const j = s.windows.findIndex((w) => w.id === to);
      const windows = [...s.windows];
      const wi = windows[i];
      const wj = windows[j];
      if (!wi || !wj) return s;
      windows[i] = wj;
      windows[j] = wi;
      return { ...s, windows };
    }
    case "workspace":
      return a.n >= 1 && a.n <= WORKSPACES ? { ...s, ws: a.n } : s;
    case "send": {
      const id = s.focus[s.ws];
      if (!id || a.n === s.ws || a.n < 1 || a.n > WORKSPACES) return s;
      const moved = removeWindow(s, id);
      const win = s.windows.find((w) => w.id === id);
      if (!win) return s;
      return {
        ...moved,
        windows: [...moved.windows, { ...win, ws: a.n }],
        focus: { ...moved.focus, [a.n]: id },
      };
    }
    case "fullscreen": {
      const id = s.focus[s.ws];
      if (!id) return s;
      return { ...s, fullscreen: { ...s.fullscreen, [s.ws]: s.fullscreen[s.ws] === id ? null : id } };
    }
    case "flip":
      return { ...s, flip: { ...s.flip, [s.ws]: !s.flip[s.ws] } };
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
    case "wallpaper":
      return { ...s, wallpaper: (s.wallpaper + 1) % WALLPAPERS };
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
