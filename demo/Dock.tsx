"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/design/components/Button";
import { ButtonLink } from "@/design/components/ButtonLink";
import { Chord } from "@/design/components/Kbd";
import { Segmented } from "@/design/components/Segmented";
import { Icon } from "@/design/shell/Icon";
import { bp } from "@/design/tokens/breakpoints.stylex";
import { color } from "@/design/tokens/color.stylex";
import { layer } from "@/design/tokens/layer.stylex";
import { motion } from "@/design/tokens/motion.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import type { View } from "@/lib/commands";

const s = stylex.create({
  dock: {
    position: "absolute",
    left: "50%",
    bottom: `max(${space.u3}, env(safe-area-inset-bottom, 0px))`,
    zIndex: layer.dock,
    display: "flex",
    alignItems: "center",
    gap: space.u2,
    padding: space.u1,
    maxWidth: `calc(100% - ${space.u6})`,
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: color["--raised"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    transform: "translate(-50%, 0)",
    transitionProperty: "transform",
    transitionDuration: motion.move,
    transitionTimingFunction: motion.ease,
  },
  away: { transform: `translate(-50%, calc(100% + ${space.u4}))` },
  hint: { display: { default: "inline-flex", [bp.phone]: "none" }, paddingInline: space.u1 },
  sep: { width: stroke.hair, alignSelf: "stretch", backgroundColor: color["--line"] },
});

type Props = { view: View; onView: (v: View) => void };

const IDLE_MS = 2500;

/** Site chrome, not desktop chrome: always tuned, so it reads the same in every view. */
export function Dock({ view, onView }: Props) {
  const [shown, setShown] = useState(true);
  const dock = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer = window.setTimeout(() => setShown(false), 6000);
    const onMove = (e: PointerEvent) => {
      if (e.clientY < window.innerHeight - 96) return;
      setShown(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!dock.current?.matches(":focus-within, :hover")) setShown(false);
      }, IDLE_MS);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(timer);
    };
  }, []);

  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await document.documentElement.requestFullscreen();
      // In Chromium, a keyboard lock lets the real Super key through while fullscreen.
      const kb = (navigator as Navigator & { keyboard?: { lock?: () => Promise<void> } }).keyboard;
      await kb?.lock?.();
    } catch {
      // Fullscreen is optional; the demo works the same in a window.
    }
  };

  return (
    <div ref={dock} role="region" aria-label="Demo controls" onFocus={() => setShown(true)} {...stylex.props(s.dock, !shown && s.away)}>
      <Segmented<View>
        label="Before and after"
        value={view}
        onChange={onView}
        options={[
          { id: "stock", label: "Stock" },
          { id: "split", label: "Split" },
          { id: "tuned", label: "Tuned" },
        ]}
      />
      <span {...stylex.props(s.hint)}>
        <Chord chord="Alt+Ctrl+B" />
      </span>
      <span aria-hidden {...stylex.props(s.sep)} />
      <Button variant="ghost" size="small" onPress={fullscreen}>
        <Icon name="expand" /> Fullscreen
      </Button>
      <ButtonLink href="/" variant="ghost" size="small">
        <Icon name="exit" /> Leave
      </ButtonLink>
    </div>
  );
}
