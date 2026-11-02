"use client";

import * as stylex from "@stylexjs/stylex";
import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from "react-aria-components";
import { typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { motion } from "../tokens/motion.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";

const s = stylex.create({
  root: { display: "inline-flex", alignItems: "center", gap: space.u2, color: color["--text"], cursor: "pointer" },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
  box: {
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: space.u4,
    height: space.u4,
    backgroundColor: color["--sunken"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    color: color["--on-accent"],
    transitionProperty: "background-color, border-color",
    transitionDuration: motion.tick,
  },
  on: { backgroundColor: color["--accent"], borderColor: color["--accent"] },
  focus: { boxShadow: focus.ring },
  mark: { width: space.u3, height: space.u3, fill: "none", stroke: "currentColor", strokeWidth: 2.5 },
});

export type CheckboxProps = Omit<AriaCheckboxProps, "style" | "className" | "children"> & { children: React.ReactNode };

/** An independent on/off choice that takes effect with a form or right away. Use Switch for system settings. */
export function Checkbox({ children, ...rest }: CheckboxProps) {
  return (
    <AriaCheckbox {...rest} {...stylex.props(s.root, typo.small)}>
      {({ isSelected, isFocusVisible, isDisabled }) => (
        <>
          <span aria-hidden {...stylex.props(s.box, isSelected && s.on, isFocusVisible && s.focus, isDisabled && s.disabled)}>
            {isSelected && (
              <svg viewBox="0 0 12 12" {...stylex.props(s.mark)}>
                <path d="M2 6.5l2.5 2.5L10 3" />
              </svg>
            )}
          </span>
          <span {...stylex.props(isDisabled && s.disabled)}>{children}</span>
        </>
      )}
    </AriaCheckbox>
  );
}
