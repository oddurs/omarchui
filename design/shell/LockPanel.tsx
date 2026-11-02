import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { face, ink, numeric, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { space } from "../tokens/space.stylex";

const s = stylex.create({
  root: { display: "grid", justifyItems: "center", gap: space.u2, width: "100%", textAlign: "center" },
  hint: { margin: 0 },
  date: { color: chrome.quiet },
  field: { marginTop: space.u6, display: "grid", gap: space.u3, justifyItems: "stretch", width: `min(100%, ${chrome.lockFieldWidth})` },
});

export type LockPanelProps = {
  time: string;
  date: string;
  /** The password field; it should already have focus. */
  children: ReactNode;
  hint?: string;
};

/** The lock screen: the one place display type is used at scale. Time, date, one field. */
export function LockPanel({ time, date, children, hint }: LockPanelProps) {
  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(typo.display, numeric.tabular)}>{time}</div>
      <div {...stylex.props(typo.body, face.ui, s.date)}>{date || " "}</div>
      <div data-ref="lock-field" {...stylex.props(s.field)}>
        {children}
        {hint && <p {...stylex.props(typo.caption, face.ui, ink.faint, s.hint)}>{hint}</p>}
      </div>
    </div>
  );
}
