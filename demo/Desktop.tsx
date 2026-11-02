"use client";

import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { color } from "@/design/tokens/color.stylex";
import { backgroundSrc } from "@/lib/background-images";
import { backgroundIndex } from "@/lib/backgrounds";
import type { Command } from "@/lib/commands";
import { match } from "@/lib/keymap";
import { choose, readChosen, systemSlug } from "@/lib/theme-runtime";
import { BootSplash } from "./BootSplash";
import { Dock } from "./Dock";
import { Inspector } from "./Inspector";
import { openPicker } from "./picker-state";
import { openAt } from "./menu-state";
import { step } from "./metrics";
import { PowerOff, StartupCover } from "./Power";
import { Screen } from "./Screen";
import { SiteNav } from "./SiteNav";
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
  const [inspect, setInspect] = useState(false);
  const ref = useRef(state);
  useLayoutEffect(() => {
    ref.current = state;
  });

  const exec = useCallback((c: Command) => {
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
      case "bg-next":
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
      case "picker":
        dispatch({ type: "picker", picker: cur.picker?.mode === c.mode ? null : openPicker(c.mode, cur) });
        return;
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
        dispatch({ type: "shutdown" });
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
  }, []);

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

  // Each notification counts down by its urgency; every countdown pauses while a deck is open.
  // shell/plugins/notifications/Service.qml:141-151, 1647.
  const [held, setHeld] = useState(false);
  const timers = useRef(new Map<number, { left: number; started: number; handle?: number }>());
  useEffect(() => {
    const m = timers.current;
    const live = new Set(state.toasts.map((t) => t.id));
    for (const [id, e] of m) {
      if (live.has(id)) continue;
      window.clearTimeout(e.handle);
      m.delete(id);
    }
    for (const t of state.toasts) {
      if (t.urgency === "critical") continue;
      let e = m.get(t.id);
      if (!e) {
        e = { left: t.urgency === "low" ? 5000 : 8000, started: 0 };
        m.set(t.id, e);
      }
      if (held && e.handle !== undefined) {
        window.clearTimeout(e.handle);
        e.left -= performance.now() - e.started;
        e.handle = undefined;
      } else if (!held && e.handle === undefined) {
        const id = t.id;
        e.started = performance.now();
        e.handle = window.setTimeout(() => dispatch({ type: "dismiss", id }), Math.max(0, e.left));
      }
    }
  }, [state.toasts, held]);

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

  const unlock = useCallback(() => dispatch({ type: "unlock" }), []);
  const powerOn = useCallback(() => dispatch({ type: "power-on" }), []);

  const split = state.view === "split";

  return (
    <main id="main" aria-label="Omarchui demo desktop" {...stylex.props(s.root)}>
      <h1 {...stylex.props(s.sr)}>Omarchui demo</h1>
      <Screen id="live" state={state} dispatch={dispatch} exec={exec} mode={state.view === "stock" ? "stock" : "tuned"} interactive onToastsHeld={setHeld} />
      {split && (
        <div inert aria-hidden {...stylex.props(s.clip, clip.left(state.split))}>
          <Screen id="before" state={state} dispatch={dispatch} exec={exec} mode="stock" interactive={false} />
        </div>
      )}
      {split && <Splitter value={state.split} onChange={(v) => dispatch({ type: "split", value: v })} />}
      <Inspector enabled={inspect} split={split ? state.split : null} />
      {state.phase === "boot" && (
        <BootSplash wallpaper={backgroundSrc(state.theme, backgroundIndex(state.theme, state.bg[state.theme]))} interactive onDone={unlock} />
      )}
      {state.phase === "off" && <PowerOff onPowerOn={powerOn} />}
      <StartupCover boot={state.boots} />
      <SiteNav />
      <Dock view={state.view} onView={(v) => dispatch({ type: "view", view: v })} inspect={inspect} onInspect={() => setInspect((x) => !x)} />
    </main>
  );
}
