import * as stylex from "@stylexjs/stylex";
import { Row, Rows } from "@/design/components/Rows";
import { Text } from "@/design/primitives/Text";
import { Intro } from "@/design/patterns/Intro";
import { Geometry } from "@/site/Geometry";
import { color } from "@/design/tokens/color.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Tile } from "../Tile";

export const SCALE = [
  [1, "Gap between menu rows, title to body, toast to the screen edge"],
  [2, "Menu row padding, the bar's edge, below the menu field"],
  [3, "Gaps between and around windows, toast padding"],
  [4, "Padding inside the menu card, the bar panels and the overlay"],
  [5, "A workspace slot"],
  [6, "A status icon slot"],
  [7, "Bar height, a widget slot"],
  [12, "A menu row"],
] as const;

const s = stylex.create({ bar: { height: space.u2, backgroundColor: color["--accent"] } });
const dyn = stylex.create({ w: (u: number) => ({ width: `calc(${u} * ${space.u1})` }) });

export function Space() {
  return (
    <Tile ws={5} span={5} labelledBy="h-space" aside="1u = 4px">
      <Intro id="h-space" title="One unit: four pixels">
        Omarchy spaces things in nine Style.space steps, most a pixel or two apart, so neighbouring gaps never read as different. The tune puts each step on
        4px, at most one unit from Omarchy&apos;s and never tighter: 2, 4, 8, 12, 16, 20. A menu row lines up with a bar widget, and a toast sits on the same
        edge as the window below it.
      </Intro>
      <Geometry />
      <Rows>
        {SCALE.map(([u, use]) => (
          <Row key={u} layout="meter" density="tight">
            <Text as="span" variant="caption" face="mono" tabular>
              {u}u{" "}
              <Text as="span" variant="caption" face="mono" tone="faint">
                {u * 4}px
              </Text>
            </Text>
            <span {...stylex.props(s.bar, dyn.w(u))} />
            <Text as="span" variant="small" tone="muted">
              {use}
            </Text>
          </Row>
        ))}
      </Rows>
    </Tile>
  );
}
