import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BINDINGS } from "@/lib/keymap";

// research/omarchy/facts.json is extracted from Omarchy's source at a pinned commit.
// A binding marked `today` must exist there with the same modifiers and key.
type Fact = { mods: string[] | null; key: string; description: string | null; source: string };
const facts = JSON.parse(readFileSync(path.join(import.meta.dirname, "../research/omarchy/facts.json"), "utf8")) as { bindings: Fact[] };

const KEY: Record<string, string> = { Return: "RETURN", Space: "SPACE", Escape: "ESCAPE", Left: "LEFT", Right: "RIGHT", Up: "UP", Down: "DOWN" };
const norm = (mods: string[], key: string) =>
  `${[...mods]
    .map((m) => m.toUpperCase())
    .sort()
    .join("+")}|${key.toUpperCase()}`;

const shipped = new Map(facts.bindings.filter((b) => b.mods).map((b) => [norm(b.mods ?? [], b.key), b]));

describe("bindings marked as Omarchy's today", () => {
  for (const b of BINDINGS.filter((x) => x.today)) {
    it(`${b.chord} exists in Omarchy 4`, () => {
      const parts = b.chord.split("+");
      const key = parts.pop() ?? "";
      const hit = shipped.get(norm(parts, KEY[key] ?? key));
      expect(hit, `${b.chord} is not bound in Omarchy 4`).toBeDefined();
    });
  }
});
