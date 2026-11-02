"use client";

import * as stylex from "@stylexjs/stylex";
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { face } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { shelltype } from "../tokens/shelltype.stylex";

// Omarchy's carousel geometry, in pixels. shell/plugins/image-picker/ImagePicker.qml:58-64.
const CARD_W = 768;
const CARD_H = 475;
const SLICE_W = 108;
const SLICE_H = 432;
const SPACING = -30;
const SKEW = 28;
const TOP = 30;
const STEP = SLICE_W + SPACING;
// Slices beyond this many on either side are not drawn.
const RADIUS = 12;

export type PickerImage = { key: string; src: string; label: string };

const s = stylex.create({
  // Drawn straight over the desktop: no card surface, no backdrop wash. shell.toml.tpl:226-229.
  root: { position: "relative", width: "100%", outline: "none" },
  stage: { position: "relative", height: `${CARD_H}px`, marginTop: `${TOP}px`, transformOrigin: "top center" },
  item: { position: "absolute", top: 0, cursor: "pointer" },
  shape: { position: "absolute", inset: 0, backgroundColor: chrome.pickerDim },
  image: { position: "absolute", inset: 0, backgroundSize: "cover", backgroundPosition: "center" },
  dim: { position: "absolute", inset: 0, backgroundColor: `color-mix(in srgb, ${chrome.pickerDim} 42%, transparent)` },
  edge: { position: "absolute", inset: 0, overflow: "visible", fill: "none", stroke: chrome.pickerEdge, strokeWidth: 1 },
  edgeSel: { stroke: chrome.pickerSel, strokeWidth: chrome.pickerStroke },
  label: {
    marginTop: "16px",
    textAlign: "center",
    fontSize: shelltype.display,
    fontWeight: chrome.pickerWeight,
    color: chrome.pickerInk,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    // Qt's Text.Outline in the dim colour at 0.7, so the label reads over any wallpaper.
    textShadow: `0 0 2px color-mix(in srgb, ${chrome.pickerDim} 70%, transparent), 0 0 1px ${chrome.pickerDim}`,
  },
  filter: { marginTop: "8px", textAlign: "center", fontSize: shelltype.title, color: chrome.pickerInk, opacity: 0.85 },
});

const pos = stylex.create({
  at: (left: number, top: number, width: number, height: number, z: number) => ({
    left: `calc(50% + ${left}px)`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: z,
  }),
  clip: (width: number, height: number) => ({ clipPath: `polygon(${SKEW}px 0, ${width}px 0, ${width - SKEW}px ${height}px, 0 ${height}px)` }),
  scale: (k: number) => ({ transform: `scale(${k})`, marginBottom: `${(k - 1) * CARD_H}px` }),
  bg: (url: string) => ({ backgroundImage: `url("${url}")` }),
});

export type ImagePickerProps = {
  label: string;
  images: PickerImage[];
  sel: number;
  /** Names under the carousel: on for themes, off for backgrounds. */
  showLabels?: boolean;
  /** Text typed to filter, shown under the label. */
  filter?: string;
  listId?: string;
  onSelect?: (i: number) => void;
  onPick?: (i: number) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  /** Focus the carousel when it mounts. */
  autoFocus?: boolean;
};

export function pickerOptionId(listId: string, i: number) {
  return `${listId}-${i}`;
}

/**
 * Omarchy's image picker: the selected image as a large card, its neighbours as skewed slices
 * either side. Used for themes (their preview images) and backgrounds. ImagePicker.qml:725-900.
 */
export function ImagePicker({ label, images, sel, showLabels, filter, listId = "picker", onSelect, onPick, onKeyDown, autoFocus }: ImagePickerProps) {
  const root = useRef<HTMLDivElement>(null);
  // The card keeps Omarchy's pixel geometry and scales down as a whole on narrow screens,
  // leaving 40px each side as the picker does. ImagePicker.qml:665.
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (autoFocus) el.focus({ preventScroll: true });
    const ro = new ResizeObserver(([e]) => setK(Math.min(1, ((e?.contentRect.width ?? CARD_W) - 80) / CARD_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [autoFocus]);

  return (
    <div
      ref={root}
      role="listbox"
      id={listId}
      aria-label={label}
      tabIndex={0}
      aria-activedescendant={images.length ? pickerOptionId(listId, sel) : undefined}
      onKeyDown={onKeyDown}
      data-ref="picker"
      {...stylex.props(s.root)}
    >
      <div {...stylex.props(s.stage, pos.scale(k))}>
        {images.map((im, i) => {
          const rel = i - sel;
          if (Math.abs(rel) > RADIUS) return null;
          const selected = rel === 0;
          const w = selected ? CARD_W : SLICE_W;
          const h = selected ? CARD_H : SLICE_H;
          const left = selected ? -CARD_W / 2 : rel < 0 ? -CARD_W / 2 + rel * STEP : CARD_W / 2 + SPACING + (rel - 1) * STEP;
          const top = selected ? 0 : (CARD_H - SLICE_H) / 2;
          return (
            <div
              key={im.key}
              id={pickerOptionId(listId, i)}
              role="option"
              aria-selected={selected}
              aria-label={im.label}
              onPointerDown={(e) => {
                e.preventDefault();
                if (selected) onPick?.(i);
                else onSelect?.(i);
              }}
              {...stylex.props(s.item, pos.at(left, top, w, h, selected ? 100 : 50 - Math.abs(rel)))}
            >
              <div {...stylex.props(s.shape, pos.clip(w, h))}>
                <div {...stylex.props(s.image, pos.bg(im.src))} />
                {!selected && <div {...stylex.props(s.dim)} />}
              </div>
              <svg aria-hidden width={w} height={h} {...stylex.props(s.edge, selected && s.edgeSel)}>
                <polygon points={`${SKEW},0 ${w},0 ${w - SKEW},${h} 0,${h}`} />
              </svg>
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div aria-hidden {...stylex.props(face.mono, s.label)}>
          {images[sel]?.label ?? (filter ? "No matches" : "")}
        </div>
      )}
      {filter ? <div {...stylex.props(face.mono, s.filter)}>{filter}</div> : null}
    </div>
  );
}
