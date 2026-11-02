import * as stylex from "@stylexjs/stylex";
import type { InputHTMLAttributes, ReactNode } from "react";
import { face, ink, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { motion } from "../tokens/motion.stylex";
import { space } from "../tokens/space.stylex";
import { font } from "../tokens/type.stylex";

const s = stylex.create({
  root: { display: "grid", justifyItems: "center", width: "100%", textAlign: "center" },
  hint: { margin: 0 },
  // Omarchy's fixed 381x67 surface with centred dots and no label, LockView.qml:24-42,144-222.
  input: {
    width: "100%",
    height: chrome.lockHeight,
    paddingInline: space.u4,
    textAlign: "center",
    fontFamily: font.mono,
    fontSize: chrome.lockText,
    letterSpacing: chrome.lockTrack,
    color: chrome.lockInk,
    backgroundColor: chrome.lockFieldBg,
    borderWidth: chrome.lockBorder,
    borderStyle: "solid",
    borderColor: chrome.lockBorderColor,
    outline: "none",
    transitionProperty: "border-color",
    transitionDuration: motion.tick,
    "::placeholder": { color: chrome.lockPlaceholder, fontSize: chrome.lockHint, letterSpacing: "normal" },
    ":focus": { borderColor: chrome.lockFocusColor },
  },
  field: { display: "grid", gap: space.u3, justifyItems: "stretch", width: `min(100%, ${chrome.lockFieldWidth})` },
});

export type LockPanelProps = {
  /** The password field (LockField); it should already have focus. */
  children: ReactNode;
  hint?: string;
};

/**
 * The lock screen, as Omarchy draws it: one centred field and nothing else. No clock, no
 * date, no name. shell/plugins/lock/LockView.qml:105-263.
 */
export function LockPanel({ children, hint }: LockPanelProps) {
  return (
    <div {...stylex.props(s.root)}>
      <div data-ref="lock-field" {...stylex.props(s.field)}>
        {children}
        {hint && <p {...stylex.props(typo.caption, face.mono, ink.faint, s.hint)}>{hint}</p>}
      </div>
    </div>
  );
}

export type LockFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "className" | "type" | "placeholder">;

/** The lock screen's password field. Labelled for assistive tech; Omarchy shows only its placeholder. */
export function LockField(props: LockFieldProps) {
  return <input type="password" aria-label="Password" placeholder="Enter Password" autoComplete="off" {...props} {...stylex.props(s.input)} />;
}
