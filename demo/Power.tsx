"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { face, typo } from "@/design/primitives/typography";
import { layer } from "@/design/tokens/layer.stylex";
import { machine } from "@/design/tokens/machine.stylex";

const REDUCED = "@media (prefers-reduced-motion: reduce)";

const lift = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });

const s = stylex.create({
  off: {
    position: "fixed",
    inset: 0,
    zIndex: layer.boot,
    display: "grid",
    placeItems: "center",
    width: "100%",
    padding: 0,
    borderWidth: 0,
    backgroundColor: machine.black,
    color: machine.ink,
    cursor: "pointer",
    outline: "none",
  },
  // A fresh login: black over the bar and wallpaper, lifted over 420ms OutCubic once they are
  // ready. shell/services/BackgroundIntro.qml:167-188, 301-332.
  cover: {
    position: "fixed",
    inset: 0,
    zIndex: layer.boot,
    backgroundColor: machine.black,
    pointerEvents: "none",
    animationName: lift,
    animationDuration: { default: "420ms", [REDUCED]: "0ms" },
    animationTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
    animationFillMode: "both",
  },
});

/** The machine switched off. Any key or a click starts it again. */
export function PowerOff({ onPowerOn }: { onPowerOn: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  // The key that chose Shutdown is still going down when this mounts; without a pause it
  // would press this button too and start the machine again at once.
  const armed = useRef(false);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    const arm = window.setTimeout(() => (armed.current = true), 400);
    const onKey = (e: KeyboardEvent) => {
      if (!armed.current || e.metaKey || e.altKey || e.ctrlKey) return;
      e.preventDefault();
      onPowerOn();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(arm);
      window.removeEventListener("keydown", onKey);
    };
  }, [onPowerOn]);
  return (
    <button ref={ref} type="button" onClick={() => armed.current && onPowerOn()} {...stylex.props(typo.caption, face.mono, s.off)}>
      Powered off. Press any key to start.
    </button>
  );
}

/** Fades the desktop in from black after each boot. */
export function StartupCover({ boot }: { boot: number }) {
  const [done, setDone] = useState(0);
  if (boot === 0 || done === boot) return null;
  return <div aria-hidden key={boot} onAnimationEnd={() => setDone(boot)} {...stylex.props(s.cover)} />;
}
