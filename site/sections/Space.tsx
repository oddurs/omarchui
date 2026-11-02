import * as stylex from "@stylexjs/stylex";
import { Row, Rows } from "@/design/components/Rows";
import { Text } from "@/design/primitives/Text";
import { Intro } from "@/design/patterns/Intro";
import { Geometry } from "@/site/Geometry";
import { color } from "@/design/tokens/color.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Tile } from "../Tile";

export const SCALE = [
  [1, "Icon to value, label to field"],
  [2, "Inner gap between windows, list padding"],
  [3, "Outer gap to the screen edge, control padding"],
  [4, "Padding inside fields and toasts"],
  [6, "Padding inside menus and dialogs"],
  [8, "Bar height, gaps between blocks"],
  [12, "Lock-screen field, page padding"],
] as const;

const s = stylex.create({ bar: { height: space.u2, backgroundColor: color["--accent"] } });
const dyn = stylex.create({ w: (u: number) => ({ width: `calc(${u} * ${space.u1})` }) });

export function Space() {
  return (
    <Tile ws={5} span={5} labelledBy="h-space" aside="1u = 4px">
      <Intro id="h-space" title="One unit: four pixels">
        Everything measures in units, so a launcher row lines up with a bar module and a toast sits on the same edge as the window below it.
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
