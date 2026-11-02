"use client";

import * as stylex from "@stylexjs/stylex";
import dynamic from "next/dynamic";
import { Mark } from "@/design/shell/Icon";
import { color } from "@/design/tokens/color.stylex";
import { face, typo } from "@/design/primitives/typography";
import { space } from "@/design/tokens/space.stylex";

const s = stylex.create({
  boot: {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: space.u3,
    backgroundColor: color["--wall"],
    color: color["--text-3"],
  },
});

function Boot() {
  return (
    <div role="status" {...stylex.props(typo.caption, face.mono, s.boot)}>
      <Mark large />
      Starting Hyprland…
    </div>
  );
}

// The desktop reads the viewport, the clock and storage from its first render, so it only
// ever renders in the browser.
const Desktop = dynamic(() => import("./Desktop").then((m) => m.Desktop), { ssr: false, loading: Boot });

export function DemoLoader() {
  return <Desktop />;
}
