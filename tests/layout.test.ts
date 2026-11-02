import { describe, expect, it } from "vitest";
import { insert, leaves, neighbor, rectsOf, remove, swapIds, toggleSplit, type Node } from "@/lib/layout";

const WIDE = 16 / 9;
const build = (ids: string[], at: (i: number) => string | null = (i) => ids[i - 1] ?? null): Node | null =>
  ids.reduce<Node | null>((t, id, i) => insert(t, at(i), id, WIDE), null);

describe("dwindle, as Omarchy configures Hyprland", () => {
  it("gives a lone window the whole workspace", () => {
    expect(rectsOf(build(["a"])).get("a")).toEqual({ x: 0, y: 0, w: 1, h: 1 });
  });

  it("splits the focused tile in half, the new window right or below (force_split 2)", () => {
    const r = rectsOf(build(["a", "b", "c"]));
    expect(r.get("a")).toEqual({ x: 0, y: 0, w: 0.5, h: 1 });
    // b's tile is taller than wide on a 16:9 screen, so c stacks under it.
    expect(r.get("b")).toEqual({ x: 0.5, y: 0, w: 0.5, h: 0.5 });
    expect(r.get("c")).toEqual({ x: 0.5, y: 0.5, w: 0.5, h: 0.5 });
  });

  it("splits whichever window has focus, not the last one opened", () => {
    const t = build(["a", "b", "c"], (i) => (i === 2 ? "a" : (["a", "b", "c"][i - 1] ?? null)));
    const r = rectsOf(t);
    expect(r.get("a")).toEqual({ x: 0, y: 0, w: 0.5, h: 0.5 });
    expect(r.get("c")).toEqual({ x: 0, y: 0.5, w: 0.5, h: 0.5 });
    expect(r.get("b")).toEqual({ x: 0.5, y: 0, w: 0.5, h: 1 });
  });

  it("hands a closed window's tile to its sibling", () => {
    const t = remove(build(["a", "b", "c"]), "b");
    expect(leaves(t)).toEqual(["a", "c"]);
    expect(rectsOf(t).get("c")).toEqual({ x: 0.5, y: 0, w: 0.5, h: 1 });
  });

  it("flips only the split that holds the window (Super+J)", () => {
    const t = toggleSplit(build(["a", "b", "c"]), "c");
    const r = rectsOf(t);
    expect(r.get("a")).toEqual({ x: 0, y: 0, w: 0.5, h: 1 });
    expect(r.get("b")).toEqual({ x: 0.5, y: 0, w: 0.25, h: 1 });
  });

  it("swaps two windows without moving the splits", () => {
    const r = rectsOf(swapIds(build(["a", "b"]), "a", "b"));
    expect(r.get("b")).toEqual({ x: 0, y: 0, w: 0.5, h: 1 });
  });

  it("covers the workspace exactly, with no overlaps", () => {
    const rects = [...rectsOf(build(["a", "b", "c", "d", "e"])).values()];
    expect(rects.reduce((sum, r) => sum + r.w * r.h, 0)).toBeCloseTo(1);
  });
});

describe("moving focus", () => {
  const r = rectsOf(build(["a", "b", "c"]));
  it("finds the tile beside or below", () => {
    expect(neighbor(r, "a", "right")).toBe("b");
    expect(neighbor(r, "b", "down")).toBe("c");
    expect(neighbor(r, "c", "up")).toBe("b");
  });
  it("finds nothing past the edge", () => {
    expect(neighbor(r, "a", "left")).toBeNull();
    expect(neighbor(r, "a", "up")).toBeNull();
  });
});
