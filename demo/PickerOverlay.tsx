"use client";

import * as stylex from "@stylexjs/stylex";
import type { Dispatch } from "react";
import { ImagePicker } from "@/design/shell/ImagePicker";
import { layer } from "@/design/tokens/layer.stylex";
import { backgroundSrc, previewSrc } from "@/lib/background-images";
import type { Command } from "@/lib/commands";
import { pickerItems } from "./picker-state";
import type { Action, Picker, State } from "./state";

const s = stylex.create({
  // Full screen and see-through: a click outside the carousel cancels. ImagePicker.qml:637-640.
  layer: { position: "absolute", inset: 0, zIndex: layer.overlay, display: "grid", alignItems: "center", paddingInline: "40px" },
});

type Props = {
  picker: NonNullable<Picker>;
  state: Pick<State, "theme">;
  interactive: boolean;
  listId: string;
  dispatch: Dispatch<Action>;
  exec: (c: Command) => void;
};

/** Omarchy's theme and background pickers. Enter applies, Escape clears the filter and then cancels. */
export function PickerOverlay({ picker, state, interactive, listId, dispatch, exec }: Props) {
  const items = pickerItems(picker, state);
  const sel = Math.min(picker.sel, Math.max(0, items.length - 1));
  const themes = picker.mode === "theme";
  const set = (patch: Partial<NonNullable<Picker>>) => dispatch({ type: "picker", picker: { ...picker, ...patch } });
  const close = () => dispatch({ type: "picker", picker: null });
  const apply = (i: number) => {
    const it = items[i];
    if (!it) return;
    if (themes) exec({ type: "theme", slug: it.theme });
    else dispatch({ type: "background", index: it.index });
  };
  const move = (d: number) => items.length && set({ sel: (sel + d + items.length) % items.length });

  return (
    <div
      {...stylex.props(s.layer)}
      onPointerDown={(e) => {
        if (interactive && e.target === e.currentTarget) close();
      }}
    >
      <ImagePicker
        label={themes ? "Themes" : "Backgrounds"}
        listId={listId}
        sel={sel}
        showLabels={themes}
        filter={themes ? picker.q : undefined}
        autoFocus={interactive}
        images={items.map((it) => ({
          key: it.key,
          label: it.label,
          src: themes ? previewSrc(it.theme) : backgroundSrc(it.theme, it.index, 384),
        }))}
        onSelect={interactive ? (i) => set({ sel: i }) : undefined}
        onPick={interactive ? apply : undefined}
        onKeyDown={(e) => {
          if (!interactive || e.altKey || e.metaKey || e.ctrlKey) return;
          const k = e.key;
          if (k === "Escape" && picker.q) set({ q: "", sel: 0 });
          else if (k === "Escape") close();
          else if (k === "Enter") apply(sel);
          else if (k === "ArrowLeft" || (k === "Tab" && e.shiftKey)) move(-1);
          else if (k === "ArrowRight" || k === "Tab") move(1);
          // Themes filter as you type; backgrounds do not. omarchy-theme-switcher:121.
          else if (themes && k === "Backspace") set({ q: picker.q.slice(0, -1), sel: 0 });
          else if (themes && k.length === 1) set({ q: picker.q + k, sel: 0 });
          else return;
          e.preventDefault();
        }}
      />
    </div>
  );
}
