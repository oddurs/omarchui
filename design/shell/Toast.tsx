"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { face, typo } from "../primitives/typography";
import { chrome } from "../tokens/chrome.stylex";
import { focus } from "../tokens/effect.stylex";
import { layer } from "../tokens/layer.stylex";
import { motion } from "../tokens/motion.stylex";

// Cards drop in and rise out along the same travel. shell/plugins/notifications/Service.qml:442-446.
const drop = stylex.keyframes({ from: { transform: `translateY(${chrome.toastDrop})`, opacity: 0 }, to: { transform: "none", opacity: 1 } });
const rise = stylex.keyframes({ from: { transform: "none", opacity: 1 }, to: { transform: `translateY(${chrome.toastDrop})`, opacity: 0 } });

// The scene's easing, cubic-bezier(0.23, 1, 0.32, 1). shell/Commons/Style.qml:371.
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

const s = stylex.create({
  toast: {
    position: "relative",
    display: "grid",
    gap: chrome.toastGap,
    width: "100%",
    padding: chrome.toastPad,
    textAlign: "left",
    backgroundColor: chrome.panelBg,
    borderWidth: chrome.panelBorderWidth,
    borderStyle: "solid",
    borderColor: chrome.panelBorderColor,
    color: chrome.toastInk,
    cursor: "default",
    animationName: drop,
    animationDuration: chrome.toastIn,
    animationTimingFunction: EASE,
    animationFillMode: "both",
  },
  leaving: { animationName: rise, animationDuration: chrome.toastOut, pointerEvents: "none" },
  clickable: { cursor: "pointer" },
  bare: { paddingBlock: chrome.toastPadBare },
  critical: { borderColor: chrome.critBorder },
  // Behind the front of a closed deck only the plate shows. Toast.qml:91.
  hidden: { visibility: "hidden" },
  head: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "start", columnGap: "8px" },
  title: {
    fontFamily: chrome.toastFace,
    fontSize: chrome.toastTitle,
    fontWeight: chrome.toastTitleWeight,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    overflow: "hidden",
  },
  body: {
    fontFamily: chrome.toastFace,
    fontSize: chrome.toastBody,
    color: chrome.toastBodyInk,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  },
  bodyOpen: { WebkitLineClamp: 8 },
  // The time and the close mark share one slot and crossfade on hover. Toast.qml:440-485.
  slot: { display: "grid", justifyItems: "end", minWidth: "20px" },
  time: { gridArea: "1 / 1", opacity: 1, transitionProperty: "opacity", transitionDuration: "150ms", color: chrome.toastBodyInk },
  close: {
    gridArea: "1 / 1",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: { default: chrome.toastBodyInk, ":hover": chrome.toastInk },
    cursor: "pointer",
    opacity: { default: 0, ":focus-visible": 1 },
    transitionProperty: "opacity",
    transitionDuration: "150ms",
    outline: "none",
    ":focus-visible": { boxShadow: focus.ring },
  },
  shown: { opacity: 1 },
  gone: { opacity: 0 },
});

export type ToastProps = {
  /** The app or subsystem that sent it; names it for assistive tech, and groups decks. */
  who: string;
  title: string;
  body?: string;
  /** Battery, failures: announced assertively, never times out. */
  critical?: boolean;
  /** Relative age, right of the title: empty for the first five minutes. */
  time?: string;
  /** Dismisses: a click on the card, or its close mark. */
  onDismiss?: () => void;
  /** Lets the body run to 8 lines instead of 2. */
  open?: boolean;
  /** Draw the plate only, as cards behind a closed deck do. */
  plate?: boolean;
  /** Rising out after a dismissal or timeout. */
  leaving?: boolean;
  /** Identifies this toast to the demo's reference inspector. */
  refKey?: string;
};

/**
 * A notification card, as Omarchy draws it (shell/plugins/notifications/Toast.qml): the title with
 * its age at the right, then the body one tone quieter. No app name, no countdown bar.
 */
export function Toast({ who, title, body, critical, time = "", onDismiss, open, plate, leaving, refKey }: ToastProps) {
  const [hover, setHover] = useState(false);
  return (
    <div
      role={critical ? "alert" : "status"}
      aria-label={`${who}: ${title}`}
      data-ref="toast"
      data-ref-key={refKey}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onClick={onDismiss}
      {...stylex.props(s.toast, !body && s.bare, critical && s.critical, onDismiss && s.clickable, leaving && s.leaving)}
    >
      <span {...stylex.props(s.head, plate && s.hidden)}>
        <span {...stylex.props(typo.small, s.title)}>{title}</span>
        <span {...stylex.props(s.slot)}>
          <span aria-hidden {...stylex.props(typo.caption, face.mono, s.time, hover && onDismiss && s.gone)}>
            {time}
          </span>
          {onDismiss && (
            <button
              type="button"
              aria-label={`Dismiss ${title}`}
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              {...stylex.props(typo.small, s.close, hover && s.shown)}
            >
              ✕
            </button>
          )}
        </span>
      </span>
      {body ? <span {...stylex.props(typo.caption, s.body, open && s.bodyOpen, plate && s.hidden)}>{body}</span> : null}
    </div>
  );
}

/** "" for five minutes, then "12m", then the time today, "yesterday", or the weekday. Toast.qml:47-60. */
export function ago(at: number, now: number): string {
  const min = (now - at) / 60_000;
  if (min < 5) return "";
  if (min < 60) return `${Math.round(min)}m`;
  const then = new Date(at);
  if (then.toDateString() === new Date(now).toDateString()) return then.toTimeString().slice(0, 5);
  if (then.toDateString() === new Date(now - 86_400_000).toDateString()) return "yesterday";
  return then.toLocaleDateString("en", { weekday: "short" });
}

export type DeckToast = { id: number; who: string; title: string; body?: string; critical?: boolean; at: number };

const d = stylex.create({
  decks: { display: "flex", flexDirection: "column", gap: chrome.deckGap, width: "100%" },
  // The hover region reaches 4px past the deck. shell/plugins/notifications/Service.qml:1558.
  deck: { position: "relative", isolation: "isolate", display: "flex", flexDirection: "column", gap: chrome.toastStack, margin: "-4px", padding: "4px" },
  // Front over the cards behind it, as z = 1000 - r does. Layout.js:49, 60.
  front: { position: "relative", zIndex: layer.cardFront },
  mid: { zIndex: layer.cardMid },
  back: { zIndex: layer.cardBack },
  behind: {
    position: "absolute",
    left: "4px",
    right: "4px",
    transformOrigin: "top center",
    transitionProperty: "transform, opacity",
    transitionDuration: motion.move,
  },
});

const place = stylex.create({
  // Card r of a closed deck sits r peeks lower, scaled by 1 - 0.035r, at 0.85 then 0.55. Layout.js:6-9, 54-60.
  behind: (r: number, k: number) => ({
    top: `calc(4px + ${r} * ${chrome.deckPeek})`,
    bottom: `calc(4px + ${k - r} * ${chrome.deckPeek})`,
    transform: `scale(${1 - r * 0.035})`,
    opacity: r === 1 ? 0.85 : 0.55,
  }),
  tail: (k: number) => ({ paddingBottom: `calc(4px + ${k} * ${chrome.deckPeek})` }),
});

type Shown = DeckToast & { leaving: boolean };

/** Cards still live keep their place; cards gone are marked leaving; new cards join. */
function merge(prev: Shown[], toasts: DeckToast[]): Shown[] {
  const live = new Map(toasts.map((t) => [t.id, t]));
  return [
    ...prev.map((p) => {
      const t = live.get(p.id);
      return t ? { ...t, leaving: false } : { ...p, leaving: true };
    }),
    ...toasts.filter((t) => !prev.some((p) => p.id === t.id)).map((t) => ({ ...t, leaving: false })),
  ];
}

/**
 * Omarchy's notification decks: cards grouped by sender, newest deck first. A closed deck shows
 * its front card with up to two peeking behind; hovering opens it and pauses every timer.
 * shell/plugins/notifications/Layout.js, Service.qml.
 */
export function ToastDeck({
  toasts,
  now,
  onDismiss,
  onOpenChange,
}: {
  toasts: DeckToast[];
  now: number;
  onDismiss?: (id: number) => void;
  /** Called with true while any deck is open, so the owner can pause timeouts. */
  onOpenChange?: (open: boolean) => void;
}) {
  // Departing cards stay drawn for their rise, then go.
  const [shown, setShown] = useState<Shown[]>(() => toasts.map((t) => ({ ...t, leaving: false })));
  const [seen, setSeen] = useState(toasts);
  if (toasts !== seen) {
    setSeen(toasts);
    setShown(merge(shown, toasts));
  }
  useEffect(() => {
    if (!shown.some((p) => p.leaving)) return;
    const timer = window.setTimeout(() => setShown((prev) => prev.filter((p) => !p.leaving)), 220);
    return () => window.clearTimeout(timer);
  }, [shown]);

  const [open, setOpen] = useState<string | null>(null);
  const grace = useRef(0);
  useEffect(() => onOpenChange?.(open !== null), [open, onOpenChange]);

  const groups = new Map<string, Shown[]>();
  for (const t of [...shown].sort((a, b) => b.id - a.id)) groups.set(t.who, [...(groups.get(t.who) ?? []), t]);

  return (
    <div {...stylex.props(d.decks)}>
      {[...groups].map(([who, cards]) => {
        const isOpen = open === who;
        const k = Math.min(cards.length - 1, 2);
        return (
          <div
            key={who}
            onPointerEnter={() => {
              window.clearTimeout(grace.current);
              setOpen(who);
            }}
            // Closing waits 120ms after the pointer leaves. Service.qml:223-232.
            onPointerLeave={() => {
              grace.current = window.setTimeout(() => setOpen((o) => (o === who ? null : o)), 120);
            }}
            {...stylex.props(d.deck, !isOpen && place.tail(k))}
          >
            {/* One order, open or closed, so cards keep their DOM nodes and never replay their arrival. */}
            {cards.map((t, r) => {
              if (!isOpen && r > 2) return null;
              const card = (
                <Toast
                  who={t.who}
                  title={t.title}
                  body={t.body}
                  critical={t.critical}
                  time={ago(t.at, now)}
                  open={isOpen}
                  plate={!isOpen && r > 0}
                  leaving={t.leaving}
                  refKey={`toast:${t.id}`}
                  onDismiss={onDismiss && !t.leaving ? () => onDismiss(t.id) : undefined}
                />
              );
              if (isOpen || r === 0)
                return (
                  <div key={t.id} {...stylex.props(r === 0 && d.front)}>
                    {card}
                  </div>
                );
              return (
                <div key={t.id} aria-hidden {...stylex.props(d.behind, r === 1 ? d.mid : d.back, place.behind(r, k))}>
                  {card}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
