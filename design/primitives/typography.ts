import * as stylex from "@stylexjs/stylex";
import { color } from "../tokens/color.stylex";
import { font, fontSize, leading, tracking, weight } from "../tokens/type.stylex";

/**
 * The type presets. Every piece of text in the system is one of these, optionally with a
 * face, ink or weight from below. Components compose them; nothing sets font-size itself.
 */
export const typo = stylex.create({
  display: {
    fontFamily: font.mono,
    fontSize: fontSize.display,
    lineHeight: leading.display,
    fontWeight: weight.heavy,
    letterSpacing: tracking.display,
    textWrap: "balance",
  },
  heading: {
    fontFamily: font.sans,
    fontSize: fontSize.heading,
    lineHeight: leading.heading,
    fontWeight: weight.semibold,
    letterSpacing: tracking.heading,
    textWrap: "balance",
  },
  lede: { fontFamily: font.sans, fontSize: fontSize.lede, lineHeight: leading.lede, fontWeight: weight.regular, textWrap: "pretty" },
  title: { fontFamily: font.sans, fontSize: fontSize.title, lineHeight: leading.title, fontWeight: weight.semibold, textWrap: "balance" },
  body: { fontFamily: font.sans, fontSize: fontSize.body, lineHeight: leading.body, fontWeight: weight.regular, textWrap: "pretty" },
  small: { fontFamily: font.sans, fontSize: fontSize.small, lineHeight: leading.small, fontWeight: weight.regular },
  caption: { fontFamily: font.sans, fontSize: fontSize.caption, lineHeight: leading.caption, fontWeight: weight.regular },
  label: {
    fontFamily: font.mono,
    fontSize: fontSize.label,
    lineHeight: leading.label,
    fontWeight: weight.medium,
    letterSpacing: tracking.caps,
    textTransform: "uppercase",
  },
});

export const face = stylex.create({
  sans: { fontFamily: font.sans },
  mono: { fontFamily: font.mono },
});

export const ink = stylex.create({
  text: { color: color["--text"] },
  muted: { color: color["--text-2"] },
  faint: { color: color["--text-3"] },
  accent: { color: color["--accent"] },
  onAccent: { color: color["--on-accent"] },
  ok: { color: color["--ok"] },
  warn: { color: color["--warn"] },
  err: { color: color["--err"] },
  inherit: { color: "inherit" },
});

export const heft = stylex.create({
  regular: { fontWeight: weight.regular },
  medium: { fontWeight: weight.medium },
  semibold: { fontWeight: weight.semibold },
});

export const numeric = stylex.create({ tabular: { fontVariantNumeric: "tabular-nums" } });

export type TypeVariant = keyof typeof typo;
export type Face = keyof typeof face;
export type Ink = keyof typeof ink;
export type Heft = keyof typeof heft;
