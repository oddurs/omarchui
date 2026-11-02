import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { typo } from "@/design/primitives/typography";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Cite } from "./Cite";
import type { Dict, Json } from "./data";

const s = stylex.create({
  scroll: {
    overflowX: "auto",
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line"],
    outline: "none",
    ":focus-visible": { boxShadow: focus.ring },
  },
  table: { borderCollapse: "collapse", width: "100%" },
  th: {
    textAlign: "left",
    verticalAlign: "bottom",
    paddingBlock: space.u2,
    paddingInline: space.u3,
    color: color["--text-3"],
    backgroundColor: color["--sunken"],
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
    whiteSpace: "nowrap",
  },
  td: {
    verticalAlign: "top",
    paddingBlock: space.u2,
    paddingInline: space.u3,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
  },
  key: { color: color["--text-2"], whiteSpace: "nowrap" },
  mono: { overflowWrap: "anywhere" },
});

/** A table of facts with a citation column; scrolls sideways on phones. */
export function FactTable({ label, head, rows }: { label: string; head: string[]; rows: ReactNode[][] }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} {...stylex.props(s.scroll)}>
      <table {...stylex.props(s.table)}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" {...stylex.props(typo.label, s.th)}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} {...stylex.props(typo.small, s.td)}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const human = (k: string) =>
  k
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\bPx\b/, "px")
    .replace(/\bMs\b/, "ms");

function value(v: Json): ReactNode {
  if (v === null)
    return (
      <Text as="span" variant="small" tone="faint">
        none
      </Text>
    );
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "number" || typeof v === "string") return String(v);
  if (Array.isArray(v)) return v.map((x) => (typeof x === "object" && x !== null ? JSON.stringify(x) : String(x))).join(", ");
  return Object.entries(v)
    .filter(([k]) => !/source$/i.test(k))
    .map(([k, x]) => `${human(k)}: ${typeof x === "object" && x !== null ? (Array.isArray(x) ? x.join(", ") : JSON.stringify(x)) : String(x)}`)
    .join(" · ");
}

/** Every field of a fact object as a row, with the nearest source beside it. */
export function FactDict({ label, data, skip = [] }: { label: string; data: Dict; skip?: string[] }) {
  const rows = Object.entries(data).filter(([k]) => !/source$/i.test(k) && !skip.includes(k));
  const fallback = typeof data.source === "string" ? data.source : null;
  return (
    <FactTable
      label={label}
      head={["Property", "Value", "Source"]}
      rows={rows.map(([k, v]) => {
        const own = data[`${k}Source`];
        return [
          <span key="k" {...stylex.props(typo.caption, s.key)}>
            {human(k)}
          </span>,
          <span key="v" {...stylex.props(s.mono)}>
            {value(v)}
          </span>,
          <Cite key="c" source={typeof own === "string" ? own : fallback} />,
        ];
      })}
    />
  );
}

export function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="u3">
      <Text as="h3" variant="small" weight="semibold">
        {title}
      </Text>
      {children}
    </Stack>
  );
}
