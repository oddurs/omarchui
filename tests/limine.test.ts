import { describe, expect, it } from "vitest";
import { defaultTree, lines, type Entry } from "@/demo/Limine";

const now = new Date(2026, 10, 2, 9, 0);
const text = (t: Entry[]) => lines(t).map((l) => l.text.trimEnd());

describe("Limine's tree, as limine.json menu.tree and entries describe it", () => {
  it("shows Omarchy open, its kernel, and Snapshots folded", () => {
    expect(text(defaultTree(now))).toEqual(["[-] Omarchy", " ├──► linux-omarchy", " └[+] Snapshots"]);
  });

  it("draws open snapshots under the last branch with spaces, not a guide", () => {
    const t = defaultTree(now);
    const omarchy = t[0]!;
    const snaps = { ...omarchy.kids![1]!, open: true };
    const opened = [{ ...omarchy, kids: [omarchy.kids![0]!, snaps] }];
    const out = text(opened);
    expect(out[2]).toBe(" └[-] Snapshots");
    expect(out[3]).toMatch(/^ {3}├\[\+\] ID=5 \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    expect(out.at(-1)).toMatch(/^ {3}└\[\+\] ID=1 /);
  });

  it("puts the selection over the space-padded name only", () => {
    const l = lines(defaultTree(now))[1]!;
    expect(l.text.slice(l.nameAt)).toBe(" linux-omarchy ");
  });
});
