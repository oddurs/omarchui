import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";
import { typo } from "@/design/primitives/typography";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { sourceUrl } from "./data";

const s = stylex.create({
  cite: { color: color["--text-3"], overflowWrap: "anywhere", textTransform: "none", letterSpacing: "normal" },
  link: {
    color: color["--text-3"],
    textDecorationLine: "underline",
    textDecorationColor: color["--line-2"],
    textUnderlineOffset: "2px",
    outline: "none",
    ":hover": { color: color["--accent"], textDecorationColor: color["--accent"] },
    ":focus-visible": { boxShadow: focus.ring },
  },
});

// Anything with a slash is a path in the repository, optionally followed by :lines.
const REF = /((?:[\w.-]+\/)+[\w.-]*)(?::([\d,-]+))?/g;

/** Source citations as links to the exact file and lines at the pinned commit. */
export function Cite({ source }: { source: string | null | undefined }) {
  if (!source) return null;
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of source.matchAll(REF)) {
    const [whole, path, lines] = m;
    if (!path) continue;
    const at = m.index ?? 0;
    if (at > last) parts.push(source.slice(last, at));
    parts.push(
      <a key={at} href={sourceUrl(path.replace(/\/$/, ""), lines)} target="_blank" rel="noopener noreferrer" {...stylex.props(s.link)}>
        {whole}
      </a>,
    );
    last = at + whole.length;
  }
  if (last < source.length) parts.push(source.slice(last));
  return (
    <span {...stylex.props(typo.label, s.cite)}>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </span>
  );
}
