"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
import { LockPanel } from "@/design/shell/LockPanel";
import { chromeLabel } from "@/design/primitives/typography";
import { chrome } from "@/design/tokens/chrome.stylex";
import { motion } from "@/design/tokens/motion.stylex";
import { space } from "@/design/tokens/space.stylex";
import { formatClock, useNow } from "@/lib/use-clock";

const s = stylex.create({
  root: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    padding: space.u6,
    backgroundColor: chrome.lockScrim,
    backdropFilter: chrome.lockBlur,
  },
  form: { display: "grid", gap: space.u2, width: "100%" },
  label: { display: chrome.lockLabel, textAlign: "left" },
  // The field follows the lock tokens rather than TextField: in the stock view it is Omarchy's
  // fixed 381x67 surface with a 3px outline, centred dots and no label. LockView.qml:24-42,144-222.
  input: {
    width: "100%",
    height: chrome.fieldLg,
    paddingInline: space.u4,
    textAlign: "center",
    fontFamily: chrome.lockFace,
    fontSize: chrome.lockText,
    letterSpacing: chrome.lockTrack,
    color: chrome.lockInk,
    backgroundColor: chrome.lockFieldBg,
    borderWidth: chrome.lockBorder,
    borderStyle: "solid",
    borderColor: chrome.lockBorderColor,
    outline: "none",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: motion.tick,
    "::placeholder": { color: chrome.lockPlaceholder, fontSize: chrome.lockHint, letterSpacing: "normal" },
    ":focus": { borderColor: chrome.lockFocusColor, boxShadow: chrome.halo },
  },
});

export function LockScreen({ interactive, mode = "tuned", onUnlock }: { interactive: boolean; mode?: "stock" | "tuned"; onUnlock: () => void }) {
  const c = formatClock(useNow());
  const [pw, setPw] = useState("");
  const id = useId();
  return (
    <div role="dialog" aria-label="Lock screen" {...stylex.props(s.root)}>
      <LockPanel time={c.time} date={c.date} hint="Any password unlocks the demo. Press Enter. It works best with a keyboard.">
        <form
          {...stylex.props(s.form)}
          onSubmit={(e) => {
            e.preventDefault();
            setPw("");
            onUnlock();
          }}
        >
          <label htmlFor={id} {...stylex.props(chromeLabel.base, s.label)}>
            Password
          </label>
          <input
            id={id}
            type="password"
            aria-label="Password"
            placeholder={mode === "stock" ? "Enter Password" : undefined}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            readOnly={!interactive}
            tabIndex={interactive ? 0 : -1}
            autoFocus={interactive}
            autoComplete="off"
            {...stylex.props(s.input)}
          />
        </form>
      </LockPanel>
    </div>
  );
}
