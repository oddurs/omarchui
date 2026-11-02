import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { tracking } from "../tokens/type.stylex";

const s = stylex.create({
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.u2,
    paddingBlock: space.u1,
    paddingInline: space.u2,
    color: color["--text-2"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line"],
    letterSpacing: tracking.normal,
    textTransform: "none",
    whiteSpace: "nowrap",
  },
  dot: { width: "6px", height: "6px", flexShrink: 0, backgroundColor: color["--accent"] },
  token: { borderColor: "transparent", paddingInline: 0, color: color["--text-3"] },
});

export type TagProps = {
  children: ReactNode;
  /** marked: a fact with an accent dot. token: a design token name, bare. */
  variant?: "marked" | "token";
};

/** A short, non-interactive fact: a principle kept, a role read. Not a button and never a filter. */
export function Tag({ children, variant = "marked" }: TagProps) {
  return (
    <span {...stylex.props(typo.label, s.tag, variant === "token" && s.token)}>
      {variant === "marked" && <span aria-hidden {...stylex.props(s.dot)} />}
      {variant === "token" ? <>--{children}</> : children}
    </span>
  );
}
