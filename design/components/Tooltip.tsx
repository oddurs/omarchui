"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactElement, ReactNode } from "react";
import { Tooltip as AriaTooltip, TooltipTrigger } from "react-aria-components";
import { typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { layer } from "../tokens/layer.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";

const s = stylex.create({
  tip: {
    zIndex: layer.popover,
    paddingBlock: space.u1,
    paddingInline: space.u2,
    color: color["--text"],
    backgroundColor: color["--raised"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    pointerEvents: "none",
  },
});

export type TooltipProps = {
  /** A short label, never the only way to learn what a control does. */
  content: ReactNode;
  /** A focusable React Aria element, such as Button. */
  children: ReactElement;
  placement?: "top" | "bottom";
};

/** A name for an icon or a number. Shows on hover after a short delay, and on keyboard focus at once. */
export function Tooltip({ content, children, placement = "bottom" }: TooltipProps) {
  return (
    <TooltipTrigger delay={400} closeDelay={0}>
      {children}
      <AriaTooltip placement={placement} offset={6} {...stylex.props(typo.caption, s.tip)}>
        {content}
      </AriaTooltip>
    </TooltipTrigger>
  );
}
