import * as stylex from "@stylexjs/stylex";
import { Text } from "@/design/primitives/Text";
import { Stack } from "@/design/primitives/Stack";
import { typo } from "@/design/primitives/typography";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { propsOf } from "../props";

const s = stylex.create({
  wrap: {
    overflowX: "auto",
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line"],
    outline: "none",
    ":focus-visible": { boxShadow: focus.ring },
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "560px" },
  th: {
    textAlign: "left",
    paddingBlock: space.u2,
    paddingInline: space.u3,
    color: color["--text-3"],
    backgroundColor: color["--sunken"],
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
  },
  td: {
    verticalAlign: "top",
    paddingBlock: space.u2,
    paddingInline: space.u3,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
  },
  name: { color: color["--text"], whiteSpace: "nowrap" },
  type: { color: color["--magenta"], overflowWrap: "anywhere" },
  req: { color: color["--accent"] },
});

const LIB: Record<string, string> = {
  "react-aria-components": "React Aria",
  "react-aria": "React Aria",
  "@react-types/shared": "React Aria",
};

/** Props generated from the component's exported type; see scripts/gen-props.mts. */
export function PropsTable({ name }: { name: string }) {
  const doc = propsOf(name);
  if (!doc) return null;
  const libs = [...new Set(doc.inherits.map((i) => LIB[i] ?? i))];
  return (
    <Stack gap="u2">
      <Text variant="caption" face="mono" tone="faint">
        {name} · {doc.type} in {doc.file}
      </Text>
      <div role="region" aria-label={`${name} props`} tabIndex={0} {...stylex.props(s.wrap)}>
        <table {...stylex.props(s.table)}>
          <thead>
            <tr>
              {["Prop", "Type", "Description"].map((h) => (
                <th key={h} scope="col" {...stylex.props(typo.label, s.th)}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doc.props.map((p) => (
              <tr key={p.name}>
                <td {...stylex.props(typo.caption, s.td)}>
                  <code {...stylex.props(typo.caption, s.name)}>{p.name}</code>
                  {p.required && <span {...stylex.props(s.req)}> *</span>}
                </td>
                <td {...stylex.props(s.td)}>
                  <code {...stylex.props(typo.caption, s.type)}>{p.type}</code>
                </td>
                <td {...stylex.props(typo.small, s.td)}>{p.doc || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {libs.length > 0 && (
        <Text variant="caption" tone="faint">
          Also accepts the {libs.join(", ")} props for this element: events, state and ARIA. * marks a required prop.
        </Text>
      )}
    </Stack>
  );
}
