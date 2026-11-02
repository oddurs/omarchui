"use client";

import * as stylex from "@stylexjs/stylex";
import { useMemo, useState } from "react";
import { Segmented } from "@/design/components/Segmented";
import { color } from "@/design/tokens/color.stylex";
import { Text } from "@/design/primitives/Text";
import { Screen } from "@/demo/Screen";
import { Splitter } from "@/demo/Splitter";
import type { View } from "@/lib/commands";
import { previewState } from "./preview-state";
import { useTheme } from "./use-theme";

const s = stylex.create({
  wrap: { display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 },
  controls: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px 20px" },
  frame: {
    position: "relative",
    width: "100%",
    aspectRatio: { default: "4 / 5", "@media (min-width: 720px)": "16 / 9.6" },
    overflow: "hidden",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color["--line"],
  },
  layer: { position: "absolute", inset: 0 },
  clip: { pointerEvents: "none" },
});

const clip = stylex.create({ left: (v: number) => ({ clipPath: `inset(0 ${(1 - v) * 100}% 0 0)` }) });

const noop = () => {};

export function HeroPreview() {
  const { slug } = useTheme();
  const state = useMemo(() => previewState(slug), [slug]);
  const [view, setView] = useState<View>("split");
  const [split, setSplit] = useState(0.5);

  return (
    <div {...stylex.props(s.wrap)}>
      <div {...stylex.props(s.controls)}>
        <Segmented<View>
          label="Compare stock and tuned"
          value={view}
          onChange={setView}
          options={[
            { id: "stock", label: "Stock" },
            { id: "split", label: "Split" },
            { id: "tuned", label: "Tuned" },
          ]}
        />
        <Text as="span" variant="small" tone="faint">
          Drag the divider. Stock is Omarchy 4 as shipped.
        </Text>
      </div>
      <div {...stylex.props(s.frame)}>
        <div inert aria-hidden {...stylex.props(s.layer)}>
          <Screen id="hero-a" state={state} dispatch={noop} exec={noop} mode={view === "stock" ? "stock" : "tuned"} interactive={false} />
        </div>
        {view === "split" && (
          <div inert aria-hidden {...stylex.props(s.layer, s.clip, clip.left(split))}>
            <Screen id="hero-b" state={state} dispatch={noop} exec={noop} mode="stock" interactive={false} />
          </div>
        )}
        {view === "split" && <Splitter value={split} onChange={(v) => setSplit(Math.min(0.96, Math.max(0.04, v)))} />}
      </div>
    </div>
  );
}
