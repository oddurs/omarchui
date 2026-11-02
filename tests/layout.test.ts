import { describe, expect, it } from "vitest";
import { dwindle, neighbor, type Rect } from "@/lib/layout";

const area = (r: Rect) => r.w * r.h;
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w - 1e-9 && b.x < a.x + a.w - 1e-9 && a.y < b.y + b.h - 1e-9 && b.y < a.y + a.h - 1e-9;

describe("dwindle", () => {
  it("gives a lone window the whole workspace", () => {
    expect(dwindle(["a"], 16 / 9).get("a")).toEqual({ x: 0, y: 0, w: 1, h: 1 });
  });

  it("splits side by side on a wide screen, then stacks the right half", () => {
    const r = dwindle(["a", "b", "c"], 16 / 9);
    expect(r.get("a")).toEqual({ x: 0, y: 0, w: 0.5, h: 1 });
    expect(r.get("b")).toEqual({ x: 0.5, y: 0, w: 0.5, h: 0.5 });
    expect(r.get("c")).toEqual({ x: 0.5, y: 0.5, w: 0.5, h: 0.5 });
  });

  it("flip swaps the first split axis", () => {
    expect(dwindle(["a", "b"], 16 / 9, true).get("a")).toEqual({ x: 0, y: 0, w: 1, h: 0.5 });
  });

  it.each([1, 2, 3, 5, 8])("tiles %i windows with no overlap and no gaps", (n) => {
    const ids = Array.from({ length: n }, (_, i) => `w${i}`);
    const rects = [...dwindle(ids, 16 / 10).values()];
    expect(rects.reduce((sum, r) => sum + area(r), 0)).toBeCloseTo(1, 10);
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) expect(overlaps(rects[i]!, rects[j]!)).toBe(false);
  });
});

describe("neighbor", () => {
  const r = dwindle(["a", "b", "c"], 16 / 9);

  it("moves right from the master to the nearest stacked tile", () => {
    expect(neighbor(r, "a", "right")).toBe("b");
  });

  it("moves down and back up within the stack", () => {
    expect(neighbor(r, "b", "down")).toBe("c");
    expect(neighbor(r, "c", "up")).toBe("b");
  });

  it("returns null at the edge", () => {
    expect(neighbor(r, "a", "left")).toBeNull();
    expect(neighbor(r, "a", "up")).toBeNull();
  });
});
