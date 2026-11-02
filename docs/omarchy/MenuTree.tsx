import * as stylex from "@stylexjs/stylex";
import { Text } from "@/design/primitives/Text";
import { typo } from "@/design/primitives/typography";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Cite } from "./Cite";
import type { MenuNode } from "./data";

const s = stylex.create({
  list: { listStyle: "none", margin: 0, paddingLeft: 0 },
  nested: { paddingLeft: space.u5, borderLeftWidth: stroke.hair, borderLeftStyle: "solid", borderLeftColor: color["--line"], marginLeft: space.u2 },
  summary: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: `${space.u1} ${space.u3}`,
    paddingBlock: space.u1,
    cursor: "pointer",
    outline: "none",
    ":focus-visible": { boxShadow: focus.ring },
  },
  leaf: { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: `${space.u1} ${space.u3}`, paddingBlock: space.u1 },
  cmd: { color: color["--text-2"], overflowWrap: "anywhere" },
  nestedMeta: { paddingLeft: space.u5, marginLeft: space.u2 },
});

function Name({ n }: { n: MenuNode }) {
  return (
    <>
      <Text as="span" variant="small" weight={n.children.length ? "semibold" : undefined}>
        {n.name}
      </Text>
      {n.iconCodepoint && (
        <Text as="span" variant="caption" face="mono" tone="faint">
          {n.iconCodepoint}
        </Text>
      )}
    </>
  );
}

// Links (citations) stay out of <summary>: a link inside a disclosure button is unreachable.
function Detail({ n }: { n: MenuNode }) {
  return (
    <>
      {n.command && <code {...stylex.props(typo.caption, s.cmd)}>{n.command.length > 90 ? `${n.command.slice(0, 90)}…` : n.command}</code>}
      {n.provider && (
        <Text as="span" variant="caption" tone="faint">
          provider: {n.provider}
        </Text>
      )}
      <Cite source={n.source} />
    </>
  );
}

function Entry({ n }: { n: MenuNode }) {
  if (!n.children.length) {
    return (
      <li {...stylex.props(s.leaf)}>
        <Name n={n} />
        <Detail n={n} />
      </li>
    );
  }
  return (
    <li>
      <details>
        <summary {...stylex.props(s.summary)}>
          <Name n={n} />
          <Text as="span" variant="caption" tone="faint">
            {n.children.length} items
          </Text>
        </summary>
        <div {...stylex.props(s.leaf, s.nestedMeta)}>
          <Detail n={n} />
        </div>
        <ul {...stylex.props(s.list, s.nested)}>
          {n.children.map((c) => (
            <Entry key={c.id} n={c} />
          ))}
        </ul>
      </details>
    </li>
  );
}

/** The whole Omarchy menu as data: every entry, its icon codepoint, command and source. */
export function MenuTree({ nodes }: { nodes: MenuNode[] }) {
  return (
    <ul {...stylex.props(s.list)}>
      {nodes.map((n) => (
        <Entry key={n.id} n={n} />
      ))}
    </ul>
  );
}
