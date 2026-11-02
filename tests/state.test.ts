import { describe, expect, it } from "vitest";
import { focused, initialState, reducer, windowsOn, type Action, type State } from "@/demo/state";

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
