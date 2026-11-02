import * as stylex from "@stylexjs/stylex";
import type { ElementType, PointerEvent, ReactNode } from "react";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { motion } from "../tokens/motion.stylex";
import { space } from "../tokens/space.stylex";
import { stroke } from "../tokens/size.stylex";

const tones = stylex.create({
  wall: { backgroundColor: color["--wall"] },
  sunken: { backgroundColor: color["--sunken"] },
  surface: { backgroundColor: color["--surface"] },
  raised: { backgroundColor: color["--raised"] },
});

const borders = stylex.create({
  line: { borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--line"] },
  "line-2": { borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--line-2"] },
  accent: { borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--accent"] },
  err: { borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--err"] },
});

const pads = stylex.create({
  u0: { padding: space.u0 },
  u2: { padding: space.u2 },
  u3: { padding: space.u3 },
  u4: { padding: space.u4 },
  u5: { padding: space.u5 },
  u6: { padding: space.u6 },
  u8: { padding: space.u8 },
  u12: { padding: space.u12 },
  page: { padding: `clamp(${space.u5}, 3.4vw, ${space.u12})` },
});

const s = stylex.create({
  box: { minWidth: 0, position: "relative" },
  halo: { boxShadow: focus.halo, borderColor: color["--accent"] },
  animate: {
    transitionProperty: "border-color, box-shadow",
    transitionDuration: motion.move,
    transitionTimingFunction: motion.ease,
  },
  clip: { overflow: "hidden" },
});

export type BoxTone = keyof typeof tones;
export type BoxBorder = keyof typeof borders;
export type BoxPad = keyof typeof pads;

export type BoxProps = {
  /** The ground this box sits on. Depth is tone, never shadow: wall < sunken < surface < raised. */
  tone?: BoxTone;
  border?: BoxBorder;
  pad?: BoxPad;
  /** Draw the focus halo, as the focused window or section does. */
  focused?: boolean;
  clip?: boolean;
  as?: ElementType;
  id?: string;
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  onPointerEnter?: (e: PointerEvent<HTMLElement>) => void;
  children?: ReactNode;
} & { [data: `data-${string}`]: string | number | undefined };

/** A surface: tone, border and padding from the scale, and the halo when focused. */
export function Box({ tone, border, pad, focused, clip, as: As = "div", children, ...rest }: BoxProps) {
  return (
    <As {...rest} {...stylex.props(s.box, tone && tones[tone], border && borders[border], pad && pads[pad], s.animate, focused && s.halo, clip && s.clip)}>
      {children}
    </As>
  );
}
