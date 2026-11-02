"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Button } from "@/design/components/Button";
import { Checkbox } from "@/design/components/Checkbox";
import { Row, Rows } from "@/design/components/Rows";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { color } from "@/design/tokens/color.stylex";
import { motion } from "@/design/tokens/motion.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";

export const SPEEDS = [
  ["tick", 120, "hover, focus, toggles"],
  ["move", 180, "open, close, resize"],
  ["travel", 240, "workspaces"],
] as const;

const s = stylex.create({
  track: {
    position: "relative",
    height: space.u6,
    backgroundColor: color["--sunken"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line"],
  },
  dot: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "18px",
    height: "18px",
    backgroundColor: color["--accent"],
    transitionProperty: "left",
    transitionTimingFunction: motion.ease,
  },
  end: { left: "calc(100% - 20px)" },
});

// Durations are literal here on purpose: the demo plays at the token speeds even under
// reduced motion, because the reader asked for it with the Play button.
const dyn = stylex.create({ dur: (ms: number) => ({ transitionDuration: `${ms}ms` }) });

export function Motion() {
  const [go, setGo] = useState(false);
  const [slow, setSlow] = useState(false);
  return (
    <Stack gap="u4">
      <Rows>
        {SPEEDS.map(([name, ms, use]) => (
          <Row key={name} layout="keyed" density="tight">
            <Stack gap="u0">
              <Text as="span" variant="caption" face="mono" weight="semibold">
                {name} · {ms}ms
              </Text>
              <Text as="span" variant="caption" tone="faint">
                {use}
              </Text>
            </Stack>
            <div {...stylex.props(s.track)}>
              <span {...stylex.props(s.dot, dyn.dur(ms * (slow ? 5 : 1)), go && s.end)} />
            </div>
          </Row>
        ))}
      </Rows>
      <Inline gap="u4" wrap>
        <Button onPress={() => setGo((g) => !g)}>Play</Button>
        <Checkbox isSelected={slow} onChange={setSlow}>
          Slow down 5×
        </Checkbox>
      </Inline>
    </Stack>
  );
}
