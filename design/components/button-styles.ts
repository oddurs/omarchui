import * as stylex from "@stylexjs/stylex";
import { typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { motion } from "../tokens/motion.stylex";
import { size, stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { fontSize, weight } from "../tokens/type.stylex";

/**
 * Button looks. Kept out of the client Button module so server components (links styled
 * as buttons) receive real styles rather than a client reference.
 */
export const buttonBase = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.u2,
    height: size.control,
    paddingInline: space.u4,
    fontWeight: weight.semibold,
    lineHeight: 1,
    whiteSpace: "nowrap",
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    backgroundColor: color["--surface"],
    color: color["--text"],
    cursor: "pointer",
    textDecoration: "none",
    outline: "none",
    userSelect: "none",
    transitionProperty: "border-color, background-color, box-shadow, color",
    transitionDuration: motion.tick,
    transitionTimingFunction: motion.ease,
    ":hover": { borderColor: color["--text-3"] },
    ":active": { backgroundColor: color["--sunken"] },
    ":focus-visible": { boxShadow: focus.ring },
  },
  primary: {
    backgroundColor: color["--accent"],
    borderColor: color["--accent"],
    color: color["--on-accent"],
    ":hover": { borderColor: color["--text"] },
    ":active": { backgroundColor: color["--accent"], borderColor: color["--text"] },
  },
  ghost: { backgroundColor: "transparent", borderColor: "transparent", ":hover": { borderColor: color["--line-2"] } },
  disabled: { opacity: 0.45, cursor: "not-allowed", ":hover": { borderColor: color["--line-2"] } },
  small: { height: size.controlSm, paddingInline: space.u3 },
  large: { height: size.controlLg, paddingInline: space.u5 },
});

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "small" | "medium" | "large";

export function buttonStyles(variant: ButtonVariant, sz: ButtonSize, disabled = false) {
  return [
    // The type preset comes first so the button's own weight and line height win.
    sz === "small" ? typo.caption : sz === "large" ? typo.body : typo.small,
    buttonBase.base,
    variant === "primary" && buttonBase.primary,
    variant === "ghost" && buttonBase.ghost,
    sz === "small" && buttonBase.small,
    sz === "large" && buttonBase.large,
    disabled && buttonBase.disabled,
  ];
}

/** Font size of the label tracks the control size; exported for docs. */
export const BUTTON_TEXT = { small: fontSize.caption, medium: fontSize.small, large: fontSize.body };
