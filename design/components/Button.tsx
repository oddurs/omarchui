"use client";

import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { buttonBase, buttonStyles, type ButtonSize, type ButtonVariant } from "./button-styles";

export type ButtonProps = Omit<AriaButtonProps, "style" | "className"> & {
  /** primary: the one main action in a view. secondary: everything else. ghost: in toolbars and docks. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the parent's width. */
  wide?: boolean;
};

const s = stylex.create({ wide: { width: "100%" } });

/** An action. Navigation is ButtonLink. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "secondary", size = "medium", wide, isDisabled, ...rest }, ref) {
  const { className } = stylex.props(...buttonStyles(variant, size, isDisabled), wide && s.wide, isDisabled && buttonBase.disabled);
  return <AriaButton ref={ref} {...rest} isDisabled={isDisabled} className={className} />;
});
