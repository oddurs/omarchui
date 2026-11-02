import * as stylex from "@stylexjs/stylex";
import type { ElementType, ReactNode } from "react";
import { bp } from "../tokens/breakpoints.stylex";
import { gaps, type Gap } from "./Stack";

const s = stylex.create({
  grid: { display: "grid", minWidth: 0 },
  /** Items at least this wide, as many per row as fit. */
  fitSm: { gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 150px), 1fr))" },
  fitMd: { gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))" },
  fitLg: { gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" },
  one: { gridTemplateColumns: "minmax(0, 1fr)" },
  two: { gridTemplateColumns: { default: "minmax(0, 1fr)", [bp.md]: "repeat(2, minmax(0, 1fr))" } },
  three: { gridTemplateColumns: { default: "minmax(0, 1fr)", [bp.md]: "repeat(3, minmax(0, 1fr))" } },
  five: { gridTemplateColumns: { default: "repeat(2, minmax(0, 1fr))", [bp.md]: "repeat(5, minmax(0, 1fr))" } },
  six: { gridTemplateColumns: { default: "repeat(2, minmax(0, 1fr))", [bp.md]: "repeat(4, minmax(0, 1fr))", [bp.lg]: "repeat(6, minmax(0, 1fr))" } },
  twelve: { gridTemplateColumns: "repeat(12, minmax(0, 1fr))" },
  /** A narrow label column beside content, stacking on phones. */
  aside: { gridTemplateColumns: { default: "minmax(0, 1fr)", [bp.md]: "9rem minmax(0, 1fr)" } },
  /** Text beside a wider figure. */
  split: { gridTemplateColumns: { default: "minmax(0, 1fr)", [bp.lg]: "minmax(0, 1fr) minmax(0, 1.5fr)" } },
  halves: { gridTemplateColumns: { default: "minmax(0, 1fr)", [bp.lg]: "minmax(0, 1fr) minmax(0, 1fr)" } },
  alignEnd: { alignItems: "end" },
  alignStart: { alignItems: "start" },
  alignBaseline: { alignItems: "baseline" },
  list: { margin: 0, padding: 0, listStyle: "none" },
});

export type GridLayout = "fitSm" | "fitMd" | "fitLg" | "one" | "two" | "three" | "five" | "six" | "twelve" | "aside" | "split" | "halves";

export type GridProps = {
  /** One of the named layouts; each defines its own phone behaviour. */
  layout: GridLayout;
  gap?: Gap;
  align?: "end" | "start" | "baseline";
  as?: ElementType;
  id?: string;
  role?: string;
  "aria-label"?: string;
  children?: ReactNode;
};

/** Columns from a fixed set of layouts, each with its own phone behaviour. */
export function Grid({ layout, gap = "u2", align, as: As = "div", children, ...rest }: GridProps) {
  return (
    <As
      {...rest}
      {...stylex.props(
        s.grid,
        s[layout],
        gaps[gap],
        align === "end" && s.alignEnd,
        align === "start" && s.alignStart,
        align === "baseline" && s.alignBaseline,
        (As === "ul" || As === "ol") && s.list,
      )}
    >
      {children}
    </As>
  );
}
