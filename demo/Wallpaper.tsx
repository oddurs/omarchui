"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const REDUCED = "@media (prefers-reduced-motion: reduce)";

// The new still appears inside a slanted band centred on the screen whose half-width grows
// until it covers everything: top edge centred at w/2 + 0.09h, bottom at w/2 - 0.09h, reach
// w/2 + 0.09h + 4px. shell/plugins/background/Background.qml:498-550 (slant -0.18).
const reveal = stylex.keyframes({
  from: { clipPath: "polygon(calc(50cqw + 9cqh) 0, calc(50cqw + 9cqh) 0, calc(50cqw - 9cqh) 100%, calc(50cqw - 9cqh) 100%)" },
  to: { clipPath: "polygon(-4px 0, calc(100cqw + 18cqh + 4px) 0, calc(100cqw + 4px) 100%, calc(-18cqh - 4px) 100%)" },
});

const s = stylex.create({
  root: { position: "absolute", inset: 0, containerType: "size", pointerEvents: "none" },
  // Scale to cover, centre-cropped: Qt's PreserveAspectCrop. shell/Ui/BackgroundMedia.qml:38-47.
  layer: { position: "absolute", inset: 0, backgroundSize: "cover", backgroundPosition: "center" },
  revealing: {
    animationName: reveal,
    // 840ms OutCubic; instant when motion is reduced, as with Hyprland animations off.
    animationDuration: { default: "840ms", [REDUCED]: "0ms" },
    animationTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
    animationFillMode: "both",
  },
});

const img = stylex.create({ src: (url: string) => ({ backgroundImage: `url("${url}")` }) });

/**
 * One screen's background. A new image is decoded first, then revealed over the old one,
 * so a change never flashes an empty frame. Background.qml:195-204, 354-375.
 */
export function Wallpaper({ src }: { src: string }) {
  const [shown, setShown] = useState({ cur: src, prev: null as string | null });

  useEffect(() => {
    if (src === shown.cur) return;
    let live = true;
    const next = new Image();
    next.src = src;
    // A failed decode still swaps, so the theme's colour shows rather than the old image.
    next
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (live) setShown((v) => ({ cur: src, prev: v.cur }));
      });
    return () => {
      live = false;
    };
  }, [src, shown.cur]);

  return (
    <div aria-hidden data-wallpaper {...stylex.props(s.root)}>
      {shown.prev && <div {...stylex.props(s.layer, img.src(shown.prev))} />}
      <div
        key={shown.cur}
        onAnimationEnd={() => setShown((v) => ({ ...v, prev: null }))}
        {...stylex.props(s.layer, img.src(shown.cur), shown.prev !== null && s.revealing)}
      />
    </div>
  );
}
