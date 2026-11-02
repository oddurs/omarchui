import { describe, expect, it } from "vitest";
import { ago } from "@/design/shell/Toast";
import { initialState, reducer, type State } from "@/demo/state";

const at = new Date(2026, 10, 2, 14, 0).getTime();
const min = 60_000;

describe("a notification's age, as Toast.qml:47-60 prints it", () => {
  it("is empty for the first five minutes", () => {
    expect(ago(at, at + 4 * min)).toBe("");
  });
  it("counts minutes under an hour", () => {
    expect(ago(at, at + 12 * min)).toBe("12m");
  });
  it("shows the time later the same day, then yesterday, then the weekday", () => {
    expect(ago(at, at + 3 * 60 * min)).toBe("14:00");
    expect(ago(at, at + 24 * 60 * min)).toBe("yesterday");
    expect(ago(at, at + 3 * 24 * 60 * min)).toBe("Mon");
  });
});

describe("notification urgency", () => {
  const desk = (): State => ({ ...initialState("tokyo-night"), phase: "desktop" });
  it("sends Omarchy's own messages at low urgency, others at normal, and critical as critical", () => {
    let s = reducer(desk(), { type: "notify", who: "Omarchy 4", title: "a", body: "" });
    s = reducer(s, { type: "notify", who: "notify-send", title: "b", body: "" });
    s = reducer(s, { type: "notify", who: "Battery", title: "c", body: "", critical: true });
    expect(s.toasts.map((t) => t.urgency)).toEqual(["low", "normal", "critical"]);
  });
  it("keeps more than four on screen", () => {
    let s = desk();
    for (let i = 0; i < 7; i++) s = reducer(s, { type: "notify", who: "notify-send", title: `n${i}`, body: "" });
    expect(s.toasts).toHaveLength(7);
  });
});
