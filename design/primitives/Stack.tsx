import * as stylex from "@stylexjs/stylex";
import type { ElementType, ReactNode } from "react";
import { space } from "../tokens/space.stylex";

export const gaps = stylex.create({
  u0: { gap: space.u0 },
  u1: { gap: space.u1 },
  u2: { gap: space.u2 },
  u3: { gap: space.u3 },
  u4: { gap: space.u4 },
  u5: { gap: space.u5 },
  u6: { gap: space.u6 },
  u8: { gap: space.u8 },
  u10: { gap: space.u10 },
  u12: { gap: space.u12 },
  u16: { gap: space.u16 },
});

export type Gap = keyof typeof gaps;

const s = stylex.create({
  stack: { display: "flex", flexDirection: "column", minWidth: 0 },
  inline: { display: "flex", flexDirection: "row", minWidth: 0 },
  wrap: { flexWrap: "wrap" },
  center: { alignItems: "center" },
  baseline: { alignItems: "baseline" },
  start: { alignItems: "flex-start" },
  end: { alignItems: "flex-end" },
  stretch: { alignItems: "stretch" },
  jStart: { justifyContent: "flex-start" },
  jBetween: { justifyContent: "space-between" },
  jEnd: { justifyContent: "flex-end" },
  jCenter: { justifyContent: "center" },
  grow: { flexGrow: 1 },
  list: { margin: 0, padding: 0, listStyle: "none" },
});

type Align = "center" | "baseline" | "start" | "end" | "stretch";
type Justify = "start" | "between" | "end" | "center";

const alignStyle = (a?: Align) =>
  a === "center" ? s.center : a === "baseline" ? s.baseline : a === "start" ? s.start : a === "end" ? s.end : a === "stretch" ? s.stretch : null;
const justifyStyle = (j?: Justify) => (j === "between" ? s.jBetween : j === "end" ? s.jEnd : j === "center" ? s.jCenter : j === "start" ? s.jStart : null);

const isList = (as: ElementType) => as === "ul" || as === "ol";

export type StackProps = {
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  /** Fill the remaining space in a parent flex row or column. */
  grow?: boolean;
  as?: ElementType;
  id?: string;
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
};

export type InlineProps = StackProps & {
  /** Let items flow onto further lines when they run out of room. */
  wrap?: boolean;
};

/** Vertical flow. Spacing between children comes from `gap` on the 4px scale, never margins. */
export function Stack({ gap = "u4", align, justify, grow, as: As = "div", children, ...rest }: StackProps) {
  return (
    <As {...rest} {...stylex.props(s.stack, gaps[gap], alignStyle(align), justifyStyle(justify), grow && s.grow, isList(As) && s.list)}>
      {children}
    </As>
  );
}

/** Horizontal flow, centred by default, optionally wrapping. */
export function Inline({ gap = "u2", align = "center", justify, wrap, grow, as: As = "div", children, ...rest }: InlineProps) {
  return (
    <As {...rest} {...stylex.props(s.inline, gaps[gap], alignStyle(align), justifyStyle(justify), wrap && s.wrap, grow && s.grow, isList(As) && s.list)}>
      {children}
    </As>
  );
}
