import * as stylex from "@stylexjs/stylex";
import type { PointerEvent, ReactNode } from "react";
import { face, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { color } from "../tokens/color.stylex";
import { motion } from "../tokens/motion.stylex";

const s = stylex.create({
  frame: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: color["--surface"],
    borderWidth: chrome.border,
    borderStyle: "solid",
    borderColor: chrome.borderIdle,
    lineHeight: 1.62,
    color: color["--text"],
    transitionProperty: "border-color, box-shadow",
    transitionDuration: motion.move,
    transitionTimingFunction: motion.ease,
  },
  active: { borderColor: color["--accent"], boxShadow: chrome.halo },
  urgent: { borderColor: color["--err"] },
});

export type WindowFrameProps = {
  /** The window's name for assistive tech; there is no visible title bar. */
  label: string;
  active?: boolean;
  /** The app asked for attention. Wins over nothing but focus. */
  urgent?: boolean;
  children?: ReactNode;
  onPointerDown?: (e: PointerEvent<HTMLElement>) => void;
};

/** A tiled window. No title bar, as in Omarchy; state lives in the border alone. */
export function WindowFrame({ label, active, urgent, children, onPointerDown }: WindowFrameProps) {
  return (
    <section
      aria-label={label}
      data-active={active || undefined}
      onPointerDown={onPointerDown}
      {...stylex.props(typo.caption, face.mono, s.frame, urgent && s.urgent, active && s.active)}
    >
      {children}
    </section>
  );
}
