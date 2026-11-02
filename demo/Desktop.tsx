"use client";

import * as stylex from "@stylexjs/stylex";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { color } from "@/design/tokens/color.stylex";
import type { Command } from "@/lib/commands";
import { match } from "@/lib/keymap";
import { choose, paint, readChosen, systemSlug } from "@/lib/theme-runtime";
import type { ThemeSlug } from "@/lib/themes";
import { Dock } from "./Dock";
import { Inspector } from "./Inspector";
import { openAt, overlayItems } from "./menu-state";
import { step } from "./metrics";
import { Screen } from "./Screen";
import { Splitter } from "./Splitter";
import { initialState, reducer } from "./state";

const s = stylex.create({
  root: { position: "fixed", inset: 0, overflow: "hidden", backgroundColor: color["--wall"] },
  clip: { position: "absolute", inset: 0, pointerEvents: "none" },
  sr: { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" },
});

const clip = stylex.create({ left: (v: number) => ({ clipPath: `inset(0 ${(1 - v) * 100}% 0 0)` }) });

export function Desktop() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(readChosen() ?? systemSlug()));
  const router = useRouter();
  const [inspect, setInspect] = useState(false);
  const ref = useRef(state);
  useLayoutEffect(() => {
    ref.current = state;
  });

  const exec = useCallback(
    (c: Command) => {
      const cur = ref.current;
      switch (c.type) {
        case "launcher":
          dispatch({ type: "overlay", overlay: cur.overlay?.root === "launcher" ? null : openAt("launcher", [], cur) });
          return;
        case "menu": {
          const path = c.path ?? [];
          const same = cur.overlay?.root === "omarchy" && cur.overlay.path.join("/") === path.join("/");
          dispatch({ type: "overlay", overlay: same ? null : openAt("omarchy", path, cur) });
          return;
        }
        case "open":
          dispatch({ type: "open", app: c.app, file: c.file, run: c.run, now: new Date() });
          return;
        case "close":
        case "fullscreen":
        case "flip":
        case "lock":
        case "screenshot":
        case "wallpaper":
        case "view-cycle":
          dispatch({ type: c.type });
          break;
        case "focus":
          dispatch({ type: "focus-dir", dir: c.dir });
          break;
        case "swap":
          dispatch({ type: "swap", dir: c.dir });
          break;
        case "workspace":
        case "send":
          dispatch({ type: c.type, n: c.n });
          break;
        case "toggle":
          dispatch({ type: "toggle", what: c.what });
          break;
        case "view":
          dispatch({ type: "view", view: c.view });
          break;
        case "theme":
          dispatch({ type: "theme", slug: c.slug });
          break;
        case "volume":
          dispatch({ type: "volume", delta: c.delta });
          break;
        case "brightness":
          dispatch({ type: "brightness", delta: c.delta });
          break;
        case "restart":
          dispatch({ type: "restart", theme: cur.theme });
          return;
        case "shutdown":
          router.push("/");
          return;
        case "notify":
          dispatch({ type: "notify", who: c.who ?? "Omarchy", title: c.title, body: c.body, critical: c.critical });
          break;
        case "link":
          window.open(c.href, "_blank", "noopener,noreferrer");
          break;
        case "inspect":
          setInspect((x) => !x);
          return;
      }
      if (cur.overlay) dispatch({ type: "overlay", overlay: null });
    },
    [router],
  );

  // Keybindings are caught before any app sees the key, as the compositor would.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ref.current.phase !== "desktop") return;
      const b = match(e);
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      exec(b.command);
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [exec]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) dispatch({ type: "metrics", metrics: step(ref.current.metrics) });
    }, 1500);
    return () => window.clearInterval(id);
  }, []);

  const scheduled = useRef(new Set<number>());
  useEffect(() => {
    for (const t of state.toasts) {
      if (scheduled.current.has(t.id)) continue;
      scheduled.current.add(t.id);
      window.setTimeout(() => dispatch({ type: "dismiss", id: t.id }), t.critical ? 9000 : 5000);
    }
  }, [state.toasts]);

  const osdKey = state.osd?.key;
  useEffect(() => {
    if (osdKey === undefined) return;
    const id = window.setTimeout(() => dispatch({ type: "osd-done", key: osdKey }), 1200);
    return () => window.clearTimeout(id);
  }, [osdKey]);

  // Persist only themes picked inside the demo, never the system default it started on.
  const firstTheme = useRef(true);
  useEffect(() => {
    if (firstTheme.current) {
      firstTheme.current = false;
      return;
    }
    choose(state.theme);
  }, [state.theme]);

  // The theme picker previews whichever row is highlighted.
  let preview: ThemeSlug | null = null;
  if (state.overlay?.root === "omarchy" && state.overlay.path.at(-1) === "appearance.theme") {
    const item = overlayItems(state.overlay, state).items[state.overlay.sel];
    if (item?.command?.type === "theme") preview = item.command.slug;
  }
  useEffect(() => {
    if (!preview) return;
    paint(preview);
    return () => paint(readChosen());
  }, [preview]);

  const split = state.view === "split";

  return (
    <main id="main" aria-label="Omarchui demo desktop" {...stylex.props(s.root)}>
      <h1 {...stylex.props(s.sr)}>Omarchui demo</h1>
      <Screen id="live" state={state} dispatch={dispatch} exec={exec} mode={state.view === "stock" ? "stock" : "tuned"} interactive />
      {split && (
        <div inert aria-hidden {...stylex.props(s.clip, clip.left(state.split))}>
          <Screen id="before" state={state} dispatch={dispatch} exec={exec} mode="stock" interactive={false} />
        </div>
      )}
      {split && <Splitter value={state.split} onChange={(v) => dispatch({ type: "split", value: v })} />}
      <Inspector enabled={inspect} split={split ? state.split : null} />
      <Dock view={state.view} onView={(v) => dispatch({ type: "view", view: v })} inspect={inspect} onInspect={() => setInspect((x) => !x)} />
    </main>
  );
}
