import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The system's rules, checked against the source so a shortcut fails the build instead of
// quietly becoming the second way to do something.
const root = path.join(import.meta.dirname, "..");
const DIRS = ["app", "site", "demo", "design", "docs"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(name) ? [p] : [];
  });
}

const files = DIRS.flatMap((d) => walk(path.join(root, d))).map((f) => ({ rel: path.relative(root, f), src: readFileSync(f, "utf8") }));
const outsideTokens = files.filter((f) => !f.rel.startsWith("design/tokens/"));

describe("system rules", () => {
  it("sets font sizes only in the type tokens", () => {
    // Form controls need font-size: inherit to join the type around them; that is allowed.
    // SVG figures size text in viewBox units, which the page scale cannot express.
    const allowed = new Set(["site/Geometry.tsx"]);
    const hits = outsideTokens.filter((f) => !allowed.has(f.rel) && /fontSize:\s*(?!"inherit")["'`{]/.test(f.src)).map((f) => f.rel);
    expect(hits).toEqual([]);
  });

  it("never writes a border shorthand", () => {
    // StyleX drops border shorthands whose value contains a variable, without an error:
    // the menu, notifications and overlay once rendered with no border at all.
    const hits = outsideTokens.filter((f) => /\bborder(Top|Bottom|Left|Right|Inline|Block)?:\s/.test(f.src)).map((f) => f.rel);
    expect(hits).toEqual([]);
  });

  it("names every z-index", () => {
    const hits = outsideTokens.filter((f) => /zIndex:\s*["']?\d/.test(f.src)).map((f) => f.rel);
    expect(hits).toEqual([]);
  });

  it("writes focus rings through the focus tokens", () => {
    const hits = outsideTokens.filter((f) => /0 0 0 [34]px/.test(f.src)).map((f) => f.rel);
    expect(hits).toEqual([]);
  });

  it("gives design-system components no style or className escape hatch", () => {
    const ds = files.filter((f) => /^design\/(components|shell|patterns)\//.test(f.rel));
    const hits = ds.filter((f) => /\b(style|className)\?:/.test(f.src)).map((f) => f.rel);
    expect(hits).toEqual([]);
  });

  it("keeps client-only exports out of server imports of style objects", () => {
    // A server component that imports styles from a "use client" module gets a reference,
    // not the styles, and renders unstyled. Style objects shared with servers live in
    // modules without the directive.
    const clientStyleExports = files.filter((f) => f.src.startsWith('"use client"') && /export const \w+ = stylex\.create/.test(f.src)).map((f) => f.rel);
    expect(clientStyleExports).toEqual([]);
  });
});
