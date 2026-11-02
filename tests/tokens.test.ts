import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_DARK, DEFAULT_LIGHT, ROLES, THEMES } from "@/lib/themes";

// The CSS defaults are what visitors see before any script runs, so they must equal the
// runtime palettes for the default light and dark themes.
const source = readFileSync(path.join(import.meta.dirname, "../design/tokens/color.stylex.ts"), "utf8");

describe("color tokens", () => {
  it.each(ROLES)("--%s defaults match the light and dark themes", (role) => {
    const m = new RegExp(`"--${role}": \\{ default: "(#[0-9a-f]{6})", \\[DARK\\]: "(#[0-9a-f]{6})" \\}`).exec(source);
    expect(m, `no token for --${role}`).not.toBeNull();
    expect(m?.[1]).toBe(THEMES[DEFAULT_LIGHT][role]);
    expect(m?.[2]).toBe(THEMES[DEFAULT_DARK][role]);
  });
});

describe("the chrome reference table", () => {
  it("reads stock values that carry a source comment", async () => {
    const { tokens } = await import("@/docs/tokens");
    const gapIn = tokens.chrome().find((r) => r.name === "gapIn");
    // `gapIn: "10px", // gaps_in 5 per side, looknfeel.lua:8` once fell back to the tuned 12px.
    expect(gapIn).toMatchObject({ value: "12px", stock: "10px" });
  });
});
