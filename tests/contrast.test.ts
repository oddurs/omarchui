import { describe, expect, it } from "vitest";
import { contrast, grade } from "@/lib/contrast";
import { SLUGS, THEMES } from "@/lib/themes";

describe("contrast", () => {
  it("matches the WCAG reference values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  it("rejects colours it cannot parse", () => {
    expect(() => contrast("red", "#ffffff")).toThrow(/#rrggbb/);
  });

  it("grades by the WCAG thresholds", () => {
    expect([7, 4.5, 3, 2.9].map(grade)).toEqual(["AAA", "AA", "Large", "Decor"]);
  });

  // Labels, hints and timestamps use text-3, and people read them, so every ink level is
  // held to AA on every ground it can sit on.
  it.each(SLUGS)("%s keeps all three ink levels at AA on every ground", (slug) => {
    const t = THEMES[slug];
    for (const ground of [t.wall, t.sunken, t.surface, t.raised]) {
      for (const ink of [t.text, t["text-2"], t["text-3"]]) expect(contrast(ink, ground)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(SLUGS)("%s keeps every spectrum colour readable as text on every ground", (slug) => {
    const t = THEMES[slug];
    for (const ground of [t.wall, t.sunken, t.surface, t.raised]) {
      for (const k of ["red", "green", "yellow", "blue", "magenta", "cyan", "orange"] as const) expect(contrast(t[k], ground)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(SLUGS)("%s keeps the accent readable as text on every ground and as a fill", (slug) => {
    const t = THEMES[slug];
    for (const ground of [t.wall, t.sunken, t.surface, t.raised]) expect(contrast(t.accent, ground)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["on-accent"], t.accent)).toBeGreaterThanOrEqual(4.5);
  });
});
