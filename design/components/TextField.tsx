"use client";

import * as stylex from "@stylexjs/stylex";
import { FieldError, Input, Label, Text, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps } from "react-aria-components";
import { face, ink, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { color } from "../tokens/color.stylex";
import { motion } from "../tokens/motion.stylex";
import { size } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";

const s = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: space.u2, minWidth: 0 },
  label: { color: chrome.labelColor, letterSpacing: chrome.labelTrack, textTransform: chrome.labelCase },
  input: {
    width: "100%",
    height: size.field,
    paddingInline: space.u3,
    color: color["--text"],
    backgroundColor: color["--sunken"],
    borderWidth: chrome.border,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    outline: "none",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: motion.tick,
    "::placeholder": { color: color["--text-3"] },
    ":hover": { borderColor: color["--text-3"] },
    ":focus": { borderColor: color["--accent"], boxShadow: chrome.halo },
  },
  large: { height: size.fieldLg, textAlign: "center" },
  invalid: { borderColor: color["--err"], ":hover": { borderColor: color["--err"] }, ":focus": { borderColor: color["--err"] } },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
  error: { display: "flex", alignItems: "center", gap: space.u1 },
});

export type TextFieldProps = Omit<AriaTextFieldProps, "style" | "className" | "children"> & {
  label: string;
  /** Shown under the field, wired to it with aria-describedby. */
  description?: string;
  /** Overrides the browser's validation message. */
  errorMessage?: string;
  placeholder?: string;
  /** Machine values (hostnames, paths, keys) are set in mono. */
  mono?: boolean;
  size?: "medium" | "large";
};

/** A labelled single-line input. The label, description and error are wired for you. */
export function TextField({ label, description, errorMessage, placeholder, mono, size: sz = "medium", ...rest }: TextFieldProps) {
  return (
    <AriaTextField {...rest} {...stylex.props(s.root)}>
      {({ isInvalid, isDisabled }) => (
        <>
          <Label {...stylex.props(typo.label, s.label)}>{label}</Label>
          <Input
            placeholder={placeholder}
            {...stylex.props(typo.small, mono && face.mono, s.input, sz === "large" && s.large, isInvalid && s.invalid, isDisabled && s.disabled)}
          />
          {description && !isInvalid && (
            <Text slot="description" {...stylex.props(typo.caption, ink.faint)}>
              {description}
            </Text>
          )}
          <FieldError {...stylex.props(typo.caption, ink.err, s.error)}>{errorMessage ? <>✕ {errorMessage}</> : undefined}</FieldError>
        </>
      )}
    </AriaTextField>
  );
}
