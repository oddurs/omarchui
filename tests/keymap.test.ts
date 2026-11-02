import { describe, expect, it } from "vitest";
import { BINDINGS, chords, match, sheet } from "@/lib/keymap";

const key = (code: string, mods: Partial<Record<"metaKey" | "altKey" | "ctrlKey" | "shiftKey", boolean>> = {}) => ({
  code,
  metaKey: false,
  altKey: false,
  ctrlKey: false,
  shiftKey: false,
  ...mods,
});

describe("chords", () => {
  it("reads Alt as Super in the browser", () => {
    expect(chords(key("Enter", { altKey: true }))).toEqual(["Super+Return"]);
  });

  it("reads Alt+Ctrl as both Super+Ctrl and Super+Alt", () => {
    expect(chords(key("Space", { altKey: true, ctrlKey: true }))).toEqual(["Super+Ctrl+Space", "Super+Alt+Space"]);
  });

  it("uses the real Super key when the browser passes it through", () => {
    expect(chords(key("KeyT", { metaKey: true, altKey: true }))).toEqual(["Super+Alt+T"]);
  });

  it("ignores keys without a modifier", () => {
    expect(chords(key("KeyW"))).toEqual([]);
  });
});

describe("match", () => {
  it("opens the Omarchy menu on Super+Space, as Omarchy 4 does", () => {
    expect(match(key("Space", { altKey: true }))?.label).toBe("Omarchy menu");
  });

  it("reaches Super+Alt+Space through the Alt+Ctrl stand-in", () => {
    expect(match(key("Space", { altKey: true, ctrlKey: true }))?.label).toBe("Apps");
  });

  it("finds send-to-workspace with Shift", () => {
    expect(match(key("Digit3", { altKey: true, shiftKey: true }))?.command).toEqual({ type: "send", n: 3 });
  });
});

describe("bindings", () => {
  it("has no duplicate chords", () => {
    const chordsSeen = BINDINGS.map((b) => b.chord);
    expect(new Set(chordsSeen).size).toBe(chordsSeen.length);
  });

  it("collapses ranges on the sheet", () => {
    const rows = sheet("Open or go").map((r) => r.chord);
    expect(rows).toContain("Super+1–9");
    expect(rows).not.toContain("Super+2");
  });

  it("keeps every Super+Alt chord distinct from Super+Ctrl chords on the same key", () => {
    const ctrlKeys = new Set(BINDINGS.filter((b) => b.chord.startsWith("Super+Ctrl+")).map((b) => b.chord.split("+").pop()));
    const altKeys = BINDINGS.filter((b) => b.chord.startsWith("Super+Alt+")).map((b) => b.chord.split("+").pop());
    for (const k of altKeys) expect(ctrlKeys.has(k)).toBe(false);
  });
});
