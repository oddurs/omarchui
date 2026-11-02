import * as stylex from "@stylexjs/stylex";
import type { ElementType, ReactNode } from "react";
import { bp } from "../tokens/breakpoints.stylex";
import { color } from "../tokens/color.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";

const s = stylex.create({
  rows: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyle: "none",
    borderTopWidth: stroke.hair,
    borderTopStyle: "solid",
    borderTopColor: color["--line"],
  },
  row: {
    display: "grid",
    gap: `${space.u2} ${space.u6}`,
    alignItems: "baseline",
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
    minWidth: 0,
  },
  tight: { paddingBlock: space.u2 },
  normal: { paddingBlock: space.u4 },
  one: { gridTemplateColumns: "minmax(0, 1fr)" },
  keyed: { gridTemplateColumns: { default: "minmax(0, 1fr)", [bp.md]: "9rem minmax(0, 1fr)" } },
  compare: { gridTemplateColumns: { default: "minmax(0, 1fr)", [bp.md]: "9rem minmax(0, 1fr) minmax(0, 1.25fr)" } },
  meter: { gridTemplateColumns: "4.6rem 3.25rem minmax(0, 1fr)", alignItems: "center" },
  ledger: { gridTemplateColumns: "2.75rem minmax(0, 1fr) auto auto", alignItems: "center" },
  center: { alignItems: "center" },
  hideOnPhone: { display: { default: "none", [bp.md]: "grid" } },
});

export type RowLayout = "one" | "keyed" | "compare" | "meter" | "ledger";

/** A list separated by hairlines: specs, comparisons, ledgers. Rows lay out their own columns. */
export type RowsProps = { as?: ElementType; children: ReactNode; role?: string; "aria-label"?: string };

export function Rows({ as: As = "div", children, ...rest }: RowsProps) {
  return (
    <As {...rest} {...stylex.props(s.rows)}>
      {children}
    </As>
  );
}

export type RowProps = {
  /** Column layout: one, keyed (label + content), compare (label + two), meter, ledger. */
  layout?: RowLayout;
  density?: "tight" | "normal";
  /** Column headers that only make sense side by side. */
  desktopOnly?: boolean;
  as?: ElementType;
  role?: string;
  children: ReactNode;
};

export function Row({ layout = "one", density = "normal", desktopOnly, as: As = "div", children, ...rest }: RowProps) {
  return (
    <As {...rest} {...stylex.props(s.row, s[layout], density === "tight" ? s.tight : s.normal, desktopOnly && s.hideOnPhone)}>
      {children}
    </As>
  );
}
