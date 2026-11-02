"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from "react-aria-components";
import { typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { motion } from "../tokens/motion.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";

const s = stylex.create({
  root: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: space.u3, color: color["--text"], cursor: "pointer" },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
  track: {
    position: "relative",
    flexShrink: 0,
    width: "34px",
    height: "18px",
    backgroundColor: color["--sunken"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    transitionProperty: "background-color, border-color",
    transitionDuration: motion.tick,
  },
  trackOn: { backgroundColor: color["--tint"], borderColor: color["--accent"] },
  trackFocus: { boxShadow: focus.ring },
  thumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: space.u3,
    height: space.u3,
    backgroundColor: color["--text-3"],
    transitionProperty: "transform, background-color",
    transitionDuration: motion.tick,
    transitionTimingFunction: motion.ease,
  },
  thumbOn: { transform: "translateX(16px)", backgroundColor: color["--accent"] },
});

export type SwitchProps = Omit<AriaSwitchProps, "children" | "className" | "style"> & { children: ReactNode };

/** A setting that takes effect immediately, like a toggle in the Trigger menu. */
export function Switch({ children, ...rest }: SwitchProps) {
  return (
    <AriaSwitch {...rest} {...stylex.props(s.root, typo.small)}>
      {({ isSelected, isFocusVisible, isDisabled }) => (
        <>
          <span {...stylex.props(isDisabled && s.disabled)}>{children}</span>
          <span aria-hidden {...stylex.props(s.track, isSelected && s.trackOn, isFocusVisible && s.trackFocus, isDisabled && s.disabled)}>
            <span {...stylex.props(s.thumb, isSelected && s.thumbOn)} />
          </span>
        </>
      )}
    </AriaSwitch>
  );
}
