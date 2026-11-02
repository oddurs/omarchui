import * as stylex from "@stylexjs/stylex";
import type { PointerEvent, ReactNode } from "react";
import { face, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { color } from "../tokens/color.stylex";

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
    backgroundColor: chrome.winBg,
    borderWidth: chrome.border,
    borderStyle: "solid",
    borderColor: chrome.borderIdle,
    lineHeight: 1.62,
    color: color["--text"],
    // The border colour follows focus over 431ms on easeOutQuint. looknfeel.lua:70,79.
    transitionProperty: "border-color",
    transitionDuration: chrome.winBorder,
    transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
  },
  active: { borderColor: chrome.winActive },
  // Popped-out windows round their corners. default/hypr/apps/system.lua:32-33.
  popped: { borderRadius: "8px" },
  // True fullscreen draws no border and no gap. tiling.lua:8.
  bare: { borderWidth: 0 },
  urgent: { borderColor: color["--err"] },
});

export type WindowFrameProps = {
  /** The window's name for assistive tech; there is no visible title bar. */
  label: string;
  active?: boolean;
  /** The app asked for attention. Wins over nothing but focus. */
  urgent?: boolean;
  /** Popped out with Super+O: floating, pinned, rounded. */
  popped?: boolean;
  /** True fullscreen (Super+F): no border. */
  bare?: boolean;
  children?: ReactNode;
  onPointerDown?: (e: PointerEvent<HTMLElement>) => void;
  /** Identifies this window to the demo's reference inspector. */
  refKey?: string;
};

/** A tiled window. No title bar, as in Omarchy; state lives in the border alone. */
export function WindowFrame({ label, active, urgent, popped, bare, children, onPointerDown, refKey }: WindowFrameProps) {
  return (
    <section
      aria-label={label}
      data-active={active || undefined}
      data-ref="window"
      data-ref-key={refKey}
      onPointerDown={onPointerDown}
      {...stylex.props(typo.caption, face.mono, s.frame, urgent && s.urgent, active && s.active, popped && s.popped, bare && s.bare)}
    >
      {children}
    </section>
  );
}
