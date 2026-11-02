"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, type Dispatch } from "react";
import { MenuPanel, rowId } from "@/design/shell/MenuPanel";
import { face, typo } from "@/design/primitives/typography";
import { color } from "@/design/tokens/color.stylex";
import type { Command } from "@/lib/commands";
import { openAt, overlayItems } from "./menu-state";
import type { Action, Overlay, State } from "./state";

const s = stylex.create({
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: color["--text"],
  },
});

type Props = {
  overlay: NonNullable<Overlay>;
  state: Pick<State, "theme" | "view">;
  interactive: boolean;
  listId: string;
  dispatch: Dispatch<Action>;
  exec: (c: Command) => void;
};

export function MenuOverlay({ overlay, state, interactive, listId, dispatch, exec }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const { items, trail } = overlayItems(overlay);
  const sel = Math.min(overlay.sel, Math.max(0, items.length - 1));

  useEffect(() => {
    if (interactive) input.current?.focus({ preventScroll: true });
  }, [interactive, overlay.path.length]);

  useEffect(() => {
    document.getElementById(rowId(listId, sel))?.scrollIntoView({ block: "nearest" });
  }, [listId, sel]);

  const set = (patch: Partial<NonNullable<Overlay>>) => dispatch({ type: "overlay", overlay: { ...overlay, ...patch } });
  const close = () => dispatch({ type: "overlay", overlay: null });

  const pick = (i: number) => {
    const item = items[i];
    if (!item) return;
    if (item.children) dispatch({ type: "overlay", overlay: openAt(overlay.root, [...overlay.path, item.id], state) });
    else if (item.command) exec(item.command);
  };

  const back = () => {
    if (!overlay.path.length) return close();
    const parent = overlay.path.slice(0, -1);
    const o = openAt(overlay.root, parent, state);
    const { items: up } = overlayItems(o);
    dispatch({
      type: "overlay",
      overlay: {
        ...o,
        sel: Math.max(
          0,
          up.findIndex((x) => x.id === overlay.path.at(-1)),
        ),
      },
    });
  };

  return (
    <MenuPanel
      label={trail.at(-1) ?? "Omarchy menu"}
      trail={trail}
      listId={listId}
      sel={sel}
      onPick={pick}
      onHover={(i) => set({ sel: i })}
      rows={items.map((it) => ({ key: it.id, glyph: it.glyph, name: it.name, desc: it.desc, hint: it.hint, more: Boolean(it.children) }))}
      search={
        <input
          ref={input}
          aria-label="Search the menu"
          placeholder={overlay.root === "launcher" ? "Launch an app" : "Search the menu"}
          value={overlay.q}
          readOnly={!interactive}
          tabIndex={interactive ? 0 : -1}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={items.length ? rowId(listId, sel) : undefined}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => set({ q: e.target.value, sel: 0 })}
          onKeyDown={(e) => {
            if (e.altKey || e.metaKey) return;
            switch (e.key) {
              case "ArrowDown":
                e.preventDefault();
                set({ sel: Math.min(sel + 1, items.length - 1) });
                break;
              case "ArrowUp":
                e.preventDefault();
                set({ sel: Math.max(sel - 1, 0) });
                break;
              case "Enter":
                e.preventDefault();
                pick(sel);
                break;
              case "ArrowRight":
                if (items[sel]?.children) {
                  e.preventDefault();
                  pick(sel);
                }
                break;
              case "ArrowLeft":
              case "Backspace":
                if (!overlay.q) {
                  e.preventDefault();
                  back();
                }
                break;
              case "Escape":
                e.preventDefault();
                close();
                break;
            }
          }}
          {...stylex.props(typo.small, face.ui, s.input)}
        />
      }
    />
  );
}
