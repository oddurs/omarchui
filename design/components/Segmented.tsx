"use client";

import * as stylex from "@stylexjs/stylex";
import { ToggleButton, ToggleButtonGroup, type Key } from "react-aria-components";
import { face as faces, typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { motion } from "../tokens/motion.stylex";
import { size, stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { tracking } from "../tokens/type.stylex";

const s = stylex.create({
  group: {
    display: "inline-flex",
    padding: "2px",
    backgroundColor: color["--sunken"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
  },
  item: {
    height: size.controlSm,
    paddingInline: space.u3,
    letterSpacing: tracking.normal,
    color: color["--text-2"],
    backgroundColor: "transparent",
    borderWidth: 0,
    cursor: "pointer",
    outline: "none",
    transitionProperty: "background-color, color",
    transitionDuration: motion.tick,
    ":hover": { color: color["--text"] },
    ":focus-visible": { boxShadow: focus.ring },
  },
  on: { color: color["--text"], backgroundColor: color["--surface"], boxShadow: `inset 0 0 0 1px ${color["--line-2"]}` },
});

export type SegmentedProps<T extends string> = {
  /** Names the group for assistive tech; it is not shown. */
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  /** mono inside a desktop window, where every other line is mono; sans on the page. */
  face?: "sans" | "mono";
};

/** One choice from two to four mutually exclusive views, like stock / split / tuned. */
export function Segmented<T extends string>({ label, value, options, onChange, face = "sans" }: SegmentedProps<T>) {
  return (
    <ToggleButtonGroup
      aria-label={label}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys: Set<Key>) => {
        const [k] = [...keys];
        if (k !== undefined) onChange(k as T);
      }}
      {...stylex.props(s.group)}
    >
      {options.map((o) => (
        <ToggleButton key={o.id} id={o.id} {...stylex.props(typo.caption, faces[face], s.item, o.id === value && s.on)}>
          {o.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
