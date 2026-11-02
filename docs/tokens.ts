import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Token values read straight from the .stylex.ts sources at build time. StyleX compiles
 * variables to opaque references, so the source is the only place the literal values live,
 * and reading it means the reference pages cannot disagree with the tokens.
 */
export type TokenRow = { name: string; value: string; dark?: string; doc?: string };

const read = (file: string) => readFileSync(path.join(process.cwd(), "design/tokens", file), "utf8");

function block(src: string, start: string): string {
  const i = src.indexOf(start);
  if (i < 0) throw new Error(`tokens: no block starting "${start}"`);
  const open = src.indexOf("{", i + start.length - 1);
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}" && --depth === 0) return src.slice(open + 1, j);
  }
  throw new Error(`tokens: unclosed block "${start}"`);
}

function rows(body: string): TokenRow[] {
  const out: TokenRow[] = [];
  let pendingDoc: string | undefined;
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    const doc = /^\/\*\*?\s*(.*?)\s*\*\/$/.exec(line) ?? /^\/\/\s*(.*)$/.exec(line);
    if (doc) {
      pendingDoc = doc[1];
      continue;
    }
    // A value may carry a trailing source comment, as every stock override does.
    const themed = /^"?([\w-]+)"?:\s*\{\s*default:\s*("[^"]*"|'[^']*'),\s*\[\w+\]:\s*("[^"]*"|'[^']*')\s*\},?\s*(?:\/\/.*)?$/.exec(line);
    const plain = /^"?([\w-]+)"?:\s*("[^"]*"|'[^']*'),?\s*(?:\/\/.*)?$/.exec(line);
    const m = themed ?? plain;
    if (!m?.[1] || !m[2]) continue;
    out.push({ name: m[1], value: m[2].slice(1, -1), dark: themed?.[3]?.slice(1, -1), doc: pendingDoc });
    pendingDoc = undefined;
  }
  return out;
}

export const tokens = {
  color: () => rows(block(read("color.stylex.ts"), "stylex.defineVars({")),
  space: () => rows(block(read("space.stylex.ts"), "stylex.defineVars({")),
  size: () => rows(block(read("size.stylex.ts"), "export const size = stylex.defineVars({")),
  stroke: () => rows(block(read("size.stylex.ts"), "export const stroke = stylex.defineVars({")),
  fontSize: () => rows(block(read("type.stylex.ts"), "export const fontSize = stylex.defineVars({")),
  leading: () => rows(block(read("type.stylex.ts"), "export const leading = stylex.defineVars({")),
  weight: () => rows(block(read("type.stylex.ts"), "export const weight = stylex.defineVars({")),
  tracking: () => rows(block(read("type.stylex.ts"), "export const tracking = stylex.defineVars({")),
  font: () => rows(block(read("type.stylex.ts"), "export const font = stylex.defineVars({")),
  motion: () => rows(block(read("motion.stylex.ts"), "stylex.defineVars({")),
  layer: () => rows(block(read("layer.stylex.ts"), "stylex.defineVars({")),
  focus: () => rows(block(read("effect.stylex.ts"), "stylex.defineVars({")),
  breakpoints: () => rows(block(read("breakpoints.stylex.ts"), "stylex.defineConsts({")),
  /** Tuned values beside the stock override, for chrome and the shell's type and spacing scales. */
  chrome: () => paired("chrome.stylex.ts", "chrome", "stock"),
  shelltype: () => paired("shelltype.stylex.ts", "shelltype", "stockType"),
  shellspace: () => paired("shellspace.stylex.ts", "shellspace", "stockSpace"),
};

function paired(file: string, vars: string, theme: string): (TokenRow & { stock: string })[] {
  const src = read(file);
  const tuned = rows(block(src, `export const ${vars} = stylex.defineVars({`));
  const stock = new Map(rows(block(src, `export const ${theme} = stylex.createTheme(${vars}, {`)).map((r) => [r.name, r.value]));
  return tuned.map((r) => ({ ...r, stock: stock.get(r.name) ?? r.value }));
}
