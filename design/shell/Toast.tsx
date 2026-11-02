import * as stylex from "@stylexjs/stylex";
import { typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { focus } from "../tokens/effect.stylex";
import { motion } from "../tokens/motion.stylex";

const drop = stylex.keyframes({ from: { transform: `translateY(${chrome.toastDrop})`, opacity: 0 }, to: { transform: "none", opacity: 1 } });

const s = stylex.create({
  toast: {
    display: "grid",
    gap: chrome.toastGap,
    width: "100%",
    padding: chrome.toastPad,
    textAlign: "left",
    backgroundColor: chrome.panelBg,
    borderWidth: chrome.panelBorderWidth,
    borderStyle: "solid",
    borderColor: chrome.panelBorderColor,
    color: chrome.toastInk,
    animationName: drop,
    animationDuration: chrome.toastIn,
    animationTimingFunction: motion.ease,
  },
  bare: { paddingBlock: chrome.toastPadBare },
  critical: { borderColor: chrome.critBorder },
  button: { cursor: "pointer", outline: "none", ":focus-visible": { boxShadow: focus.ring } },
  title: { fontFamily: chrome.toastFace, fontSize: chrome.toastTitle, fontWeight: chrome.toastTitleWeight },
  body: { fontFamily: chrome.toastFace, fontSize: chrome.toastBody, color: chrome.toastBodyInk },
});

export type ToastProps = {
  /** The app or subsystem that sent it. */
  who: string;
  title: string;
  body?: string;
  /** Battery, failures: draws in err and is announced assertively. */
  critical?: boolean;
  /** Makes the whole toast a button that dismisses it. */
  onDismiss?: () => void;
  /** Identifies this toast to the demo's reference inspector. */
  refKey?: string;
};

/**
 * A notification card, as Omarchy draws it (shell/plugins/notifications/Toast.qml): title, then
 * the body one tone quieter. The sender names it for assistive tech only.
 */
export function Toast({ who, title, body, critical, onDismiss, refKey }: ToastProps) {
  const content = (
    <>
      <span {...stylex.props(typo.small, s.title)}>{title}</span>
      {body ? <span {...stylex.props(typo.caption, s.body)}>{body}</span> : null}
    </>
  );
  if (onDismiss) {
    return (
      <button
        type="button"
        data-ref="toast"
        data-ref-key={refKey}
        onClick={onDismiss}
        aria-label={`${who}: ${title}. Dismiss`}
        {...stylex.props(s.toast, !body && s.bare, s.button, critical && s.critical)}
      >
        {content}
      </button>
    );
  }
  return (
    <div
      role={critical ? "alert" : "status"}
      aria-label={`${who}: ${title}`}
      data-ref="toast"
      data-ref-key={refKey}
      {...stylex.props(s.toast, !body && s.bare, critical && s.critical)}
    >
      {content}
    </div>
  );
}
