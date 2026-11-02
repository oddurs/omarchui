import { describe, expect, it } from "vitest";
import { audioMood, displayMood, isoWeek, monthWeeks } from "@/demo/Panels";
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
