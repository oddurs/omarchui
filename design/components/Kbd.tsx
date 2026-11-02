import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";
import { typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { font, weight } from "../tokens/type.stylex";

const s = stylex.create({
  kbd: {
    display: "inline-block",
    paddingBlock: "3px 2px",
    paddingInline: "6px",
    fontFamily: font.mono,
    fontWeight: weight.medium,
    lineHeight: 1,
    color: color["--text"],
    backgroundColor: color["--sunken"],
    borderStyle: "solid",
    borderColor: color["--line-2"],
    borderTopWidth: stroke.hair,
    borderInlineWidth: stroke.hair,
    borderBottomWidth: stroke.strong,
    whiteSpace: "nowrap",
  },
  chord: { display: "inline-flex", alignItems: "center", gap: space.u1, whiteSpace: "nowrap" },
  plus: { color: color["--text-3"] },
});

/** One key cap. */
export type KbdProps = { children: React.ReactNode };
export type ChordProps = {
  /** Keys joined with "+", e.g. "Super+Shift+1". Arrow and Escape names become symbols. */
  chord: string;
};

export function Kbd({ children }: KbdProps) {
  return <kbd {...stylex.props(typo.label, s.kbd)}>{children}</kbd>;
}

const NAMES: Record<string, string> = { Return: "Return", Escape: "Esc", Minus: "−", Equal: "=", Left: "←", Right: "→", Up: "↑", Down: "↓" };

/** A key combination written as "Super+Shift+1". Reads aloud as words, not symbols. */
export function Chord({ chord }: ChordProps) {
  const keys = chord.split("+");
  return (
    <span {...stylex.props(s.chord)} aria-label={chord.replaceAll("+", " ")}>
      {keys.map((k, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden {...stylex.props(typo.label, s.plus)}>
              +
            </span>
          )}
          <Kbd>{NAMES[k] ?? k}</Kbd>
        </Fragment>
      ))}
    </span>
  );
}
