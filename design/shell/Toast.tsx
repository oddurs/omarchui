import * as stylex from "@stylexjs/stylex";
import { chromeLabel, face, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { motion } from "../tokens/motion.stylex";
import { space } from "../tokens/space.stylex";
import { weight } from "../tokens/type.stylex";

const drop = stylex.keyframes({ from: { transform: "translateY(-6px)" }, to: { transform: "none" } });

const s = stylex.create({
  toast: {
    display: "grid",
    gap: "2px",
    width: "100%",
    padding: chrome.toastPad,
    textAlign: "left",
    backgroundColor: chrome.panelBg,
    border: chrome.panelBorder,
    color: color["--text"],
    animationName: drop,
    animationDuration: motion.move,
    animationTimingFunction: motion.ease,
  },
  critical: { borderColor: color["--err"] },
  button: { cursor: "pointer", outline: "none", ":focus-visible": { boxShadow: focus.ring } },
  head: { display: "flex", justifyContent: "space-between", gap: space.u3 },
  who: { display: "inline-flex", alignItems: "center", gap: space.u2 },
  dot: { display: chrome.dot, width: "6px", height: "6px", backgroundColor: color["--info"] },
  dotCritical: { backgroundColor: color["--err"] },
  whoCritical: { color: color["--err"] },
  title: { fontWeight: chrome.uiWeight },
  body: { color: chrome.quiet },
  time: { display: chrome.desc, fontWeight: weight.regular },
});

export type ToastProps = {
  /** The app or subsystem that sent it. */
  who: string;
  title: string;
  body?: string;
  time?: string;
  /** Battery, failures: draws in err and is announced assertively. */
  critical?: boolean;
  /** Makes the whole toast a button that dismisses it. */
  onDismiss?: () => void;
};

/** A notification card: source and time as a label, title in the UI face, body one tone quieter. */
export function Toast({ who, title, body, time = "now", critical, onDismiss }: ToastProps) {
  const content = (
    <>
      <span {...stylex.props(chromeLabel.base, s.head)}>
        <span {...stylex.props(s.who, critical && s.whoCritical)}>
          <span aria-hidden {...stylex.props(s.dot, critical && s.dotCritical)} />
          {who}
        </span>
        <span {...stylex.props(s.time)}>{time}</span>
      </span>
      <span {...stylex.props(typo.small, face.ui, s.title)}>{title}</span>
      {body ? <span {...stylex.props(typo.caption, face.ui, s.body)}>{body}</span> : null}
    </>
  );
  if (onDismiss) {
    return (
      <button type="button" onClick={onDismiss} aria-label={`${who}: ${title}. Dismiss`} {...stylex.props(s.toast, s.button, critical && s.critical)}>
        {content}
      </button>
    );
  }
  return (
    <div role={critical ? "alert" : "status"} {...stylex.props(s.toast, critical && s.critical)}>
      {content}
    </div>
  );
}
