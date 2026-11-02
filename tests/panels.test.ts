import { describe, expect, it } from "vitest";
import { audioMood, displayMood, monthWeeks } from "@/demo/Panels";
import { formatClock, isoWeek } from "@/lib/use-clock";
import { initialState, reducer, type State } from "@/demo/state";

const desk = (): State => ({ ...initialState("tokyo-night"), phase: "desktop" });

describe("bar panels", () => {
  it("names the output level as audio/Model.js:50-62 does", () => {
    expect(audioMood(64, false)).toBe("Steady groove");
    expect(audioMood(100, false)).toBe("Concert hall");
    expect(audioMood(0, false)).toBe("Silenced");
    expect(audioMood(80, true)).toBe("Muted");
    expect(audioMood(10, false)).toBe("Whisper");
  });

  it("names the brightness band as monitor.hero.moodBands does", () => {
    expect(displayMood(60)).toBe("Even day");
    expect(displayMood(96)).toBe("Sun blast");
    expect(displayMood(5)).toBe("Night owl");
  });

  it("lays out six weeks from the Sunday on or before the 1st, with ISO week numbers", () => {
    const weeks = monthWeeks(2026, 10);
    expect(weeks).toHaveLength(6);
    expect(weeks[0]![0]!.getDate()).toBe(1);
    expect(weeks[0]![0]!.getDay()).toBe(0);
    expect(isoWeek(new Date(2026, 10, 2))).toBe(45);
    expect(isoWeek(new Date(2027, 0, 1))).toBe(53);
  });

  it("formats the clock's second format as d MMMM 'W'ww yyyy, the week in two digits", () => {
    expect(formatClock(new Date(2026, 10, 2, 14, 5)).alt).toBe("2 November W45 2026");
    expect(formatClock(new Date(2026, 0, 5, 9, 0)).alt).toBe("5 January W02 2026");
  });

  it("opens one panel at a time, and the open one again closes it (panel.single)", () => {
    let s = reducer(desk(), { type: "panel", id: "audio" });
    expect(s.panel).toBe("audio");
    s = reducer(s, { type: "panel", id: "network" });
    expect(s.panel).toBe("network");
    expect(reducer(s, { type: "panel", id: "network" }).panel).toBeNull();
  });

  it("sets volume and brightness from a slider without the OSD", () => {
    const s = reducer(reducer(desk(), { type: "set-volume", value: 41.6 }), { type: "set-brightness", value: 0 });
    expect(s.volume).toBe(42);
    expect(s.brightness).toBe(1);
    expect(s.osd).toBeNull();
  });
});

describe("a clear bar's ink", () => {
  it("averages the strip and keeps the foreground unless the background stands out more", async () => {
    const { meanHex, pickInk } = await import("@/lib/bar-ink");
    expect(meanHex([255, 0, 0, 255, 0, 0, 255, 255])).toBe("#800080");
    // bin/omarchy-bar-text-color: the background wins only when it contrasts strictly more.
    expect(pickInk("#f0e6d0", "#a9b1d6", "#1a1b26")).toBe("#1a1b26");
    expect(pickInk("#2a1f3d", "#a9b1d6", "#1a1b26")).toBe("#a9b1d6");
  });
});
