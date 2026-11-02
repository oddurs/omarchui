import { describe, expect, it } from "vitest";
import { focused, initialState, rectsFor, reducer, windowsOn, type Action, type State } from "@/demo/state";

const now = new Date(2026, 10, 1, 14, 32);
const play = (s: State, ...actions: Action[]) => actions.reduce(reducer, s);
const desktop = () => play(initialState("tokyo-night"), { type: "unlock" });

describe("desktop state", () => {
  it("welcomes the user on unlock", () => {
    const s = desktop();
    expect(s.phase).toBe("desktop");
    expect(s.toasts).toHaveLength(1);
  });

  it("opens windows on the current workspace and focuses the newest", () => {
    const s = play(desktop(), { type: "open", app: "terminal", now }, { type: "open", app: "editor", now });
    expect(windowsOn(s, 1).map((w) => w.app)).toEqual(["terminal", "editor"]);
    expect(focused(s)?.app).toBe("editor");
  });

  it("closing the focused window hands focus to its predecessor", () => {
    const s = play(desktop(), { type: "open", app: "terminal", now }, { type: "open", app: "editor", now }, { type: "close" });
    expect(windowsOn(s, 1)).toHaveLength(1);
    expect(focused(s)?.app).toBe("terminal");
  });

  it("sends a window to another workspace and follows focus there", () => {
    const s = play(desktop(), { type: "open", app: "terminal", now }, { type: "send", n: 3 });
    expect(windowsOn(s, 1)).toHaveLength(0);
    expect(windowsOn(s, 3)).toHaveLength(1);
    expect(s.focus[3]).toBe(windowsOn(s, 3)[0]?.id);
  });

  it("moves focus by direction using the tiling layout", () => {
    let s = play(desktop(), { type: "open", app: "terminal", now }, { type: "open", app: "editor", now });
    const [term, editor] = windowsOn(s, 1);
    s = reducer(s, { type: "focus-dir", dir: "left" });
    expect(s.focus[1]).toBe(term?.id);
    s = reducer(s, { type: "focus-dir", dir: "right" });
    expect(s.focus[1]).toBe(editor?.id);
  });

  it("runs shell commands that change the theme and the view", () => {
    let s = play(desktop(), { type: "open", app: "terminal", now });
    const id = windowsOn(s, 1)[0]!.id;
    s = play(s, { type: "term-input", id, input: "omarchy-theme-set gruvbox" }, { type: "term-submit", id, now });
    expect(s.theme).toBe("gruvbox");
    s = play(s, { type: "term-input", id, input: "omarchui-view stock" }, { type: "term-submit", id, now });
    expect(s.view).toBe("stock");
  });

  it("opens a terminal with nothing before the prompt (rc.silent)", () => {
    const s = play(desktop(), { type: "open", app: "terminal", now });
    const term = windowsOn(s, 1)[0]!.data;
    expect(term.kind === "terminal" && term.lines).toEqual([]);
  });

  it("puts a blank line above every prompt but the first, and ✗ after a failure (starship.add_newline, starship.error)", () => {
    const type = (s: State, id: string, input: string) => play(s, { type: "term-input", id, input }, { type: "term-submit", id, now });
    let s = play(desktop(), { type: "open", app: "terminal", now });
    const id = windowsOn(s, 1)[0]!.id;
    s = type(type(s, id, "nope"), id, "pwd");
    const term = s.windows[0]!.data;
    if (term.kind !== "terminal") throw new Error("not a terminal");
    const rows = term.lines.map((l) => l.map((x) => x.t).join(""));
    expect(rows).toEqual(["~ ❯ nope", "bash: nope: command not found", "", "~ ✗ pwd", "/home/you"]);
    expect(term.code).toBe(0);
  });

  it("carries omarchy commands to the desktop: background, toggles, menu and pickers", () => {
    const type = (s: State, input: string) => {
      const id = s.windows[0]!.id;
      return play(s, { type: "term-input", id, input }, { type: "term-submit", id, now });
    };
    let s = play(desktop(), { type: "open", app: "terminal", now });
    s = type(s, "omarchy theme bg next");
    expect(s.bg["tokyo-night"]).toBe(1);
    s = type(s, "omarchy toggle nightlight");
    expect(s.night).toBe(true);
    s = type(s, "omarchy theme switcher");
    expect(s.picker?.mode).toBe("theme");
    s = play(s, { type: "picker", picker: null });
    s = type(s, "omarchy menu");
    expect(s.overlay?.root).toBe("omarchy");
  });

  it("exit closes the terminal it ran in", () => {
    let s = play(desktop(), { type: "open", app: "terminal", now });
    const id = windowsOn(s, 1)[0]!.id;
    s = play(s, { type: "term-input", id, input: "exit" }, { type: "term-submit", id, now });
    expect(s.windows).toHaveLength(0);
  });

  it("cycles stock, split, tuned", () => {
    const s = desktop();
    expect(s.view).toBe("tuned");
    expect(reducer(s, { type: "view-cycle" }).view).toBe("stock");
  });

  it("do-not-disturb confirms itself, then holds back ordinary notifications", () => {
    let s = play(desktop(), { type: "dismiss", id: 1 }, { type: "toggle", what: "dnd" });
    expect(s.dnd).toBe(true);
    expect(s.toasts.map((t) => t.title)).toEqual(["Do not disturb on"]);
    s = play(s, { type: "notify", who: "x", title: "quiet", body: "" }, { type: "notify", who: "x", title: "loud", body: "", critical: true });
    expect(s.toasts.map((t) => t.title)).toEqual(["Do not disturb on", "loud"]);
  });

  it("refuses to quit a modified buffer without a bang", () => {
    let s = play(desktop(), { type: "open", app: "editor", now });
    const id = windowsOn(s, 1)[0]!.id;
    s = play(s, { type: "editor", id, patch: { text: "changed", dirty: true, cmd: "q", mode: "command" } }, { type: "editor-command", id });
    expect(s.windows).toHaveLength(1);
    s = play(s, { type: "editor", id, patch: { cmd: "q!", mode: "command" } }, { type: "editor-command", id });
    expect(s.windows).toHaveLength(0);
  });

  it("clamps the divider and volume", () => {
    const s = play(desktop(), { type: "split", value: 2 }, { type: "volume", delta: 500 });
    expect(s.split).toBe(0.96);
    expect(s.volume).toBe(100);
  });
});

describe("power states", () => {
  it("starts at the boot splash", () => {
    expect(initialState("tokyo-night").phase).toBe("boot");
  });

  it("counts each boot, and welcomes only the first", () => {
    const first = desktop();
    expect(first.boots).toBe(1);
    const again = play(first, { type: "shutdown" }, { type: "power-on" }, { type: "unlock" });
    expect(again.phase).toBe("desktop");
    expect(again.boots).toBe(2);
    expect(again.toasts).toHaveLength(0);
  });

  it("unlocking the lock screen is not a boot", () => {
    const s = play(desktop(), { type: "lock" }, { type: "unlock" });
    expect(s.phase).toBe("desktop");
    expect(s.boots).toBe(1);
  });

  it("shutting down closes everything but keeps the theme, view and backgrounds", () => {
    const s = play(desktop(), { type: "open", app: "terminal", now }, { type: "view", view: "stock" }, { type: "background", index: 2 }, { type: "shutdown" });
    expect(s.phase).toBe("off");
    expect(s.windows).toHaveLength(0);
    expect(s.view).toBe("stock");
    expect(s.bg["tokyo-night"]).toBe(2);
  });

  it("ignores unlock and lock while powered off", () => {
    const off = play(desktop(), { type: "shutdown" });
    expect(play(off, { type: "unlock" }).phase).toBe("off");
    expect(play(off, { type: "lock" }).phase).toBe("off");
    expect(play(off, { type: "power-on" }).phase).toBe("boot");
  });
});

describe("windows, as Omarchy's Hyprland handles them", () => {
  const two = () => play(desktop(), { type: "open", app: "terminal", now }, { type: "open", app: "editor", now });

  it("opens btop floating, centred at 875x600 (default/hypr/apps/system.lua:2-11)", () => {
    const s = play(desktop(), { type: "open", app: "monitor", now });
    expect(focused(s)?.float).toEqual({ w: 875, h: 600, dx: 0, dy: 0 });
    expect(s.trees[1] ?? null).toBeNull();
  });

  it("Super+T floats the focused window and tiles it again", () => {
    const floated = play(two(), { type: "float" });
    expect(focused(floated)?.float).toEqual({ w: 875, h: 600, dx: 0, dy: 0 });
    expect(rectsFor(floated, 1).size).toBe(1);
    const back = play(floated, { type: "float" });
    expect(focused(back)?.float).toBeUndefined();
    expect(rectsFor(back, 1).size).toBe(2);
  });

  it("Super+O pops a window out at 1300x900, pinned to every workspace, and back", () => {
    const popped = play(two(), { type: "pop" });
    expect(focused(popped)).toMatchObject({ pinned: true, float: { w: 1300, h: 900 } });
    const elsewhere = play(popped, { type: "workspace", n: 3 }, { type: "focus", id: focused(popped)!.id });
    expect(elsewhere.ws).toBe(3);
    const back = play(popped, { type: "pop" });
    expect(focused(back)?.pinned).toBe(false);
    expect(rectsFor(back, 1).size).toBe(2);
  });

  it("tells true fullscreen from full width (Super+F, Super+Alt+F)", () => {
    const full = play(two(), { type: "fullscreen", kind: "full" });
    expect(full.fullscreen[1]?.kind).toBe("full");
    const max = play(full, { type: "fullscreen", kind: "max" });
    expect(max.fullscreen[1]?.kind).toBe("max");
    expect(play(max, { type: "fullscreen", kind: "max" }).fullscreen[1]).toBeNull();
  });

  it("keeps a closed window drawn, in its tile, until it has shrunk out", () => {
    const s = play(two(), { type: "close" });
    expect(s.windows).toHaveLength(1);
    expect(s.closing).toHaveLength(1);
    expect(s.closing[0]?.rect).toEqual({ x: 0.5, y: 0, w: 0.5, h: 1 });
    expect(play(s, { type: "closed", id: s.closing[0]!.win.id }).closing).toHaveLength(0);
  });

  it("swaps two tiles when one is dragged onto the other", () => {
    const s = two();
    const [a, b] = s.windows.map((w) => w.id);
    const swapped = play(s, { type: "swap-ids", a: a!, b: b! });
    expect(rectsFor(swapped, 1).get(b!)).toEqual({ x: 0, y: 0, w: 0.5, h: 1 });
  });
});
