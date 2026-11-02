"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, type Dispatch } from "react";
import { MenuPanel, rowId } from "@/design/shell/MenuPanel";
import { face, typo } from "@/design/primitives/typography";
import { chrome } from "@/design/tokens/chrome.stylex";
import { shelltype } from "@/design/tokens/shelltype.stylex";
import type { Command } from "@/lib/commands";
import { openAt, overlayItems, type MenuContext } from "./menu-state";
import type { Action, Overlay } from "./state";

const s = stylex.create({
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    fontSize: shelltype.heading,
    color: chrome.menuInk,
    "::placeholder": { color: chrome.menuPlaceholder },
  },
});

type Props = {
  overlay: NonNullable<Overlay>;
  state: MenuContext;
  interactive: boolean;
  /** Stock follows Omarchy when going back; tuned returns the cursor to where you were. */
  mode?: "stock" | "tuned";
  listId: string;
  dispatch: Dispatch<Action>;
  exec: (c: Command) => void;
};

export function MenuOverlay({ overlay, state, interactive, mode = "tuned", listId, dispatch, exec }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const { items, trail } = overlayItems(overlay, state);
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
    if (item.children) dispatch({ type: "overlay", overlay: openAt(overlay.root, [...(item.path ?? overlay.path), item.id], state) });
    else if (item.command) exec(item.command);
  };

  const back = () => {
    if (!overlay.path.length) return close();
    const parent = overlay.path.slice(0, -1);
    const o = openAt(overlay.root, parent, state);
    // Omarchy puts the cursor on the first row, Menu.qml:845-858; tuned returns to where you were.
    if (mode === "stock") return dispatch({ type: "overlay", overlay: { ...o, sel: 0 } });
    const { items: up } = overlayItems(o, state);
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

  const here = trail.at(-1);
  // The field names the open menu, as Omarchy's does: "Go…" at the root. Menu.qml:1417-1428.
  const placeholder = `${here ?? "Go"}…`;

  return (
    <MenuPanel
      label={trail.at(-1) ?? "Omarchy menu"}
      listId={listId}
      sel={sel}
      onPick={pick}
      onHover={(i) => set({ sel: i })}
      empty={`No matches for “${overlay.q.trim()}”`}
      rows={items.map((it) => ({
        key: it.path ? [...it.path, it.id].join("/") : it.id,
        glyph: it.glyph,
        name: it.name,
        more: Boolean(it.children),
        detail: it.detail || undefined,
        divider: it.divider,
      }))}
      search={
        <input
          ref={input}
          aria-label="Search the menu"
          placeholder={placeholder}
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
              // Up and Down wrap at both ends; PageUp and PageDown move six, Menu.qml:807-818.
              case "ArrowDown":
              case "ArrowUp":
              case "PageDown":
              case "PageUp": {
                e.preventDefault();
                if (!items.length) break;
                const step = { ArrowDown: 1, ArrowUp: -1, PageDown: 6, PageUp: -6 }[e.key];
                set({ sel: (((sel + step) % items.length) + items.length) % items.length });
                break;
              }
              case "Enter":
                e.preventDefault();
                pick(sel);
                break;
              // Right activates any row, actions included, as Enter does.
              case "ArrowRight":
                if (items.length && e.currentTarget.selectionStart === overlay.q.length) {
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
              // Escape clears a filter first, then closes from any depth.
              case "Escape":
                e.preventDefault();
                if (overlay.q) set({ q: "", sel: 0 });
                else close();
                break;
            }
          }}
          {...stylex.props(typo.small, face.mono, s.input)}
        />
      }
    />
  );
}
