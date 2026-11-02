import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PARTS } from "@/lib/reference";
import { REF_BINDINGS, REF_MENU } from "@/lib/reference.generated";

const facts = readFileSync(path.join(import.meta.dirname, "../research/omarchy/facts.json"), "utf8");

describe("the demo's reference", () => {
  it("cites only sources the research recorded", () => {
    for (const part of Object.values(PARTS)) {
      for (const m of part.measures) {
        const first = m.src.split(";")[0]?.trim() ?? "";
        expect(facts, `${part.name} · ${m.label}: ${first}`).toContain(first.split(":")[0]);
      }
    }
  });

  it("states a stock value and a tuned value for every measure", () => {
    for (const part of Object.values(PARTS)) {
      for (const m of part.measures) {
        expect(m.omarchy, `${part.name} · ${m.label}`).not.toBe("");
        expect(m.tuned, `${part.name} · ${m.label}`).not.toBe("");
      }
    }
  });

  it("carries Omarchy's full menu and binding set", () => {
    const count = (ns: typeof REF_MENU): number => ns.reduce((n, x) => n + 1 + count(x.kids ?? []), 0);
    expect(count(REF_MENU)).toBe(JSON.parse(facts).menuEntryCount);
    expect(REF_BINDINGS).toHaveLength(JSON.parse(facts).bindings.length);
  });
});
