"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Button, Menu as AriaMenu, MenuItem, MenuTrigger, Popover, Separator, type Key, type Selection } from "react-aria-components";
import { typo } from "../primitives/typography";
import { color } from "../tokens/color.stylex";
import { focus } from "../tokens/effect.stylex";
import { layer } from "../tokens/layer.stylex";
import { motion } from "../tokens/motion.stylex";
import { size, stroke } from "../tokens/size.stylex";
import { space } from "../tokens/space.stylex";
import { tracking } from "../tokens/type.stylex";

const s = stylex.create({
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.u2,
    height: size.controlSm,
    paddingInline: space.u3,
    whiteSpace: "nowrap",
    color: color["--text"],
    backgroundColor: color["--surface"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    cursor: "pointer",
    outline: "none",
    transitionProperty: "border-color",
    transitionDuration: motion.tick,
    ":hover": { borderColor: color["--text-3"] },
    ":focus-visible": { boxShadow: focus.ring },
  },
  popover: {
    zIndex: layer.popover,
    minWidth: "280px",
    maxHeight: "min(70vh, 640px)",
    overflowY: "auto",
    padding: space.u1,
    backgroundColor: color["--raised"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    outline: "none",
  },
  menu: { outline: "none", display: "flex", flexDirection: "column" },
  item: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    alignItems: "center",
    gap: space.u3,
    height: size.row,
    paddingInline: space.u3,
    color: color["--text"],
    cursor: "pointer",
    outline: "none",
  },
  focused: { backgroundColor: color["--sunken"] },
  selected: { backgroundColor: color["--tint"], boxShadow: focus.inset },
  detail: { color: color["--text-3"], letterSpacing: tracking.caps, textTransform: "uppercase" },
  sep: { height: stroke.hair, marginBlock: space.u1, backgroundColor: color["--line"], borderWidth: 0 },
});

export type MenuOption = { id: string; label: string; detail?: string; lead?: ReactNode; separatorBefore?: boolean };

export type MenuProps = {
  /** Names the menu for assistive tech. */
  label: string;
  /** What the trigger button shows. */
  trigger: ReactNode;
  triggerLabel?: string;
  options: MenuOption[];
  /** Set for a single-choice menu (a picker); leave out for a menu of actions. */
  selected?: string;
  onAction: (id: string) => void;
};

/** A button that opens a list of actions or one-of-many choices. Arrow keys, type-ahead and Escape included. */
export function Menu({ label, trigger, triggerLabel, options, selected, onAction }: MenuProps) {
  const itemClass = ({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) =>
    stylex.props(typo.small, s.item, isFocused && s.focused, isSelected && s.selected).className ?? "";
  return (
    <MenuTrigger>
      <Button aria-label={triggerLabel} {...stylex.props(typo.caption, s.trigger)}>
        {trigger}
      </Button>
      <Popover placement="bottom end" offset={6} {...stylex.props(s.popover)}>
        <AriaMenu
          aria-label={label}
          selectionMode={selected === undefined ? "none" : "single"}
          disallowEmptySelection
          selectedKeys={selected === undefined ? undefined : [selected]}
          onSelectionChange={(keys: Selection) => {
            if (keys === "all") return;
            const [k] = [...keys];
            if (k !== undefined) onAction(String(k));
          }}
          onAction={selected === undefined ? (k: Key) => onAction(String(k)) : undefined}
          {...stylex.props(s.menu)}
        >
          {options.flatMap((o) => [
            ...(o.separatorBefore ? [<Separator key={`${o.id}-sep`} {...stylex.props(s.sep)} />] : []),
            <MenuItem key={o.id} id={o.id} textValue={o.label} className={itemClass}>
              <span aria-hidden>{o.lead}</span>
              <span>{o.label}</span>
              <span {...stylex.props(typo.label, s.detail)}>{o.detail}</span>
            </MenuItem>,
          ])}
        </AriaMenu>
      </Popover>
    </MenuTrigger>
  );
}
