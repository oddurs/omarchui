import { describe, expect, it } from "vitest";
import { tokens } from "@/docs/tokens";

// The desktop's scale, held as rules rather than numbers: if a value here drifts, the rule it
// broke is named. design/tokens/shelltype.stylex.ts and shellspace.stylex.ts carry the reasons.

const px = (v: string) => {
  const m = /^(-?\d+(?:\.\d+)?)px$/.exec(v);
  if (!m?.[1]) throw new Error(`not a px length: ${v}`);
  return Number(m[1]);
};
const byName = <T extends { name: string }>(rows: T[]) => new Map(rows.map((r) => [r.name, r]));

// Style.qml:329-340: each size is fontPx(multiplier) = round(base × multiplier); the icons alias two of them.
const MULT = { caption: 0.833, bodySmall: 0.917, body: 1, subtitle: 1.083, title: 1.167, heading: 1.333, display: 2, displayLarge: 2.333, iconLarge: 1.5 };
const ALIAS = { iconSmall: "bodySmall", icon: "title" } as const;
const at = (base: number) => {
  const sizes: Record<string, number> = Object.fromEntries(Object.entries(MULT).map(([k, m]) => [k, Math.round(base * m)]));
  for (const [k, of] of Object.entries(ALIAS)) sizes[k] = sizes[of]!;
  return sizes;
};

// What the tune pins after base 13, and why. Anything not listed must be Omarchy's own base-13 value.
const PINS: Record<string, { to: (t: Record<string, number>) => number; why: string }> = {
  heading: { to: (t) => t.title!, why: "the menu's names stop shouting over everything else" },
  display: { to: () => 24, why: "display sizes do not grow with the text" },
  displayLarge: { to: () => 28, why: "display sizes do not grow with the text" },
  iconLarge: { to: (t) => t.title! + 1, why: "the menu glyph sits one step over its name" },
};
const HERO = { glyph: 40, text: 44 };

describe("the desktop type scale", () => {
  const type = byName(tokens.shelltype());

  it("stock is Omarchy's Style.font at base-size 12", () => {
    const want = at(12);
    for (const [name, size] of Object.entries(want)) expect(px(type.get(name)!.stock), name).toBe(size);
  });

  it("tuned is Omarchy's base-size 13, with only the declared pins", () => {
    const base = at(13);
    for (const [name, size] of Object.entries(base)) {
      const pin = PINS[name];
      expect(px(type.get(name)!.value), pin ? `${name}: ${pin.why}` : name).toBe(pin ? pin.to(base) : size);
    }
  });

  it("puts Omarchy's four raw hero sizes on one hero step", () => {
    expect(["clockGlyph", "weatherGlyph"].map((n) => px(type.get(n)!.value))).toEqual([HERO.glyph, HERO.glyph]);
    expect(["clockDate", "weatherTemp"].map((n) => px(type.get(n)!.value))).toEqual([HERO.text, HERO.text]);
  });

  it("sets window text at the body size, in rows of foot's cell height", () => {
    for (const side of ["value", "stock"] as const) {
      const term = px(type.get("term")![side]);
      expect(term, side).toBe(px(type.get("body")![side]));
      // JetBrains Mono's ascent + descent is 1.32 em; foot rounds a cell to whole pixels.
      expect(px(type.get("termLine")![side]), side).toBe(Math.round(term * 1.32));
    }
  });
});

describe("the desktop spacing scale", () => {
  const space = tokens.shellspace();
  // Hairlines are strokes, not space.
  const STROKES = new Set(["hairline", "xxs"]);

  it("stock is Omarchy's Style.spacing at scale 1.0", () => {
    const want = { hairline: 1, xxs: 2, xs: 3, sm: 4, md: 6, lg: 8, xl: 10, xxl: 12, xxxl: 14, huge: 18, controlGap: 8 };
    for (const [name, size] of Object.entries(want)) expect(px(space.find((r) => r.name === name)!.stock), name).toBe(size);
  });

  it("widens cards as Omarchy's scale-with-font would at base 13", () => {
    const card = space.find((r) => r.name === "cardScale")!;
    expect(Number(card.value)).toBeCloseTo(13 / 12, 4);
    expect(card.stock).toBe("1");
  });

  it.each(space.filter((r) => !STROKES.has(r.name) && r.value.endsWith("px")))(
    "tuned $name sits on the 4px unit, within one unit of Omarchy and never tighter",
    (r) => {
      const tuned = px(r.value);
      const stock = px(r.stock);
      expect(tuned % 4, `${r.name} ${tuned}`).toBe(0);
      expect(tuned - stock, `${r.name}: ${stock} → ${tuned}`).toBeGreaterThanOrEqual(0);
      expect(tuned - stock, `${r.name}: ${stock} → ${tuned}`).toBeLessThanOrEqual(4);
    },
  );

  it("collapses Omarchy's nine steps to a rhythm of six", () => {
    const steps = (side: "value" | "stock") =>
      [...new Set(space.filter((r) => /^(hairline|x*s|sm|md|lg|x*l|huge)$/.test(r.name)).map((r) => px(r[side])))].sort((a, b) => a - b);
    expect(steps("stock")).toEqual([1, 2, 3, 4, 6, 8, 10, 12, 14, 18]);
    expect(steps("value")).toEqual([1, 2, 4, 8, 12, 16, 20]);
  });
});

describe("tuned chrome", () => {
  const chrome = tokens.chrome();
  // Sizes of text and glyphs, held against the type scale instead of the unit.
  const type = byName(tokens.shelltype());
  const t = (n: string) => px(type.get(n)!.value);
  const TEXT: Record<string, number> = {
    toastBody: t("body"),
    // LockView.qml:27-28 derives both from heading.
    lockText: Math.round(t("heading") * 1.33),
    lockHint: Math.round(t("heading") * 1.125),
    // Style.bar.iconSize at base 13, Style.qml:356.
    barIcon: Math.round((12 * 13) / 12),
    osdIcon: t("displayLarge"),
  };

  it.each(["menuWidth", "toastWidth"])("%s widens with the text, as Omarchy's Style.space widths do", (name) => {
    const r = chrome.find((x) => x.name === name)!;
    expect(px(r.value)).toBe(4 * Math.round((px(r.stock) * 13) / 12 / 4));
  });

  it.each(Object.entries(TEXT))("%s is on the type scale", (name, size) => {
    expect(px(chrome.find((r) => r.name === name)!.value)).toBe(size);
  });

  it.each(chrome.filter((r) => !(r.name in TEXT) && /\dpx/.test(r.value)))("$name lies on the 4px unit", (r) => {
    // Every length in the value, so "36px minmax(0, 1fr) 16px" checks 36 and 16. Strokes (≤3) are exempt.
    for (const n of r.value.match(/-?\d+(?:\.\d+)?px/g) ?? []) {
      const v = Math.abs(px(n));
      if (v > 3) expect(v % 4, `${r.name}: ${n}`).toBe(0);
    }
  });
});
