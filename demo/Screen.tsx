"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, type Dispatch } from "react";
import { face, typo } from "@/design/primitives/typography";
import { Bar, type BarModule } from "@/design/shell/Bar";
import { Osd } from "@/design/shell/Osd";
import { Toast } from "@/design/shell/Toast";
import { WindowFrame } from "@/design/shell/WindowFrame";
import { chrome, stock } from "@/design/tokens/chrome.stylex";
import { color } from "@/design/tokens/color.stylex";
import { layer } from "@/design/tokens/layer.stylex";
import { motion } from "@/design/tokens/motion.stylex";
import { font } from "@/design/tokens/type.stylex";
import type { Command } from "@/lib/commands";
import { dwindle } from "@/lib/layout";
import { formatClock, useNow } from "@/lib/use-clock";
import { Editor } from "./apps/Editor";
import { Git } from "./apps/Git";
import { Keys } from "./apps/Keys";
import { Monitor } from "./apps/Monitor";
import { Terminal } from "./apps/Terminal";
import type { AppProps } from "./apps/types";
import { LockScreen } from "./LockScreen";
import { MenuOverlay } from "./MenuOverlay";
import { BAR_WORKSPACES, windowsOn, windowTitle, WORKSPACES, type Action, type State, type Win } from "./state";

const popIn = stylex.keyframes({ from: { transform: "scale(0.97)" }, to: { transform: "scale(1)" } });
const flash = stylex.keyframes({ from: { opacity: 0.85 }, to: { opacity: 0 } });

const s = stylex.create({
  screen: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: font.mono,
    color: color["--text"],
    backgroundColor: color["--wall"],
  },
  wp0: {
    backgroundImage: `radial-gradient(110% 90% at 85% -10%, color-mix(in oklab, ${color["--accent"]} 14%, ${color["--wall"]}), transparent 60%), radial-gradient(80% 70% at 0% 110%, color-mix(in oklab, ${color["--magenta"]} 10%, ${color["--wall"]}), transparent 60%)`,
  },
  wp1: {
    backgroundImage: `repeating-linear-gradient(135deg, transparent 0 22px, color-mix(in oklab, ${color["--line"]} 60%, transparent) 22px 23px)`,
  },
  wp2: {
    backgroundImage: `radial-gradient(${color["--line-2"]} 1px, transparent 1px)`,
    backgroundSize: "24px 24px",
  },
  wp3: {
    backgroundImage: `linear-gradient(180deg, ${color["--surface"]}, ${color["--wall"]} 70%)`,
  },
  area: { position: "relative", flex: 1, minHeight: 0, overflow: "hidden" },
  ws: {
    position: "absolute",
    inset: 0,
    transitionProperty: "transform",
    transitionDuration: motion.travel,
    transitionTimingFunction: motion.ease,
  },
  tiles: { position: "absolute", inset: `calc(${chrome.gapOut} - ${chrome.gapIn} / 2)` },
  slot: {
    position: "absolute",
    padding: `calc(${chrome.gapIn} / 2)`,
    zIndex: layer.window,
    transitionProperty: "left, top, width, height",
    transitionDuration: motion.move,
    transitionTimingFunction: motion.ease,
  },
  slotFull: { zIndex: layer.fullscreen, padding: 0 },
  hidden: { visibility: "hidden" },
  pop: { animationName: popIn, animationDuration: motion.move, animationTimingFunction: motion.ease },
  empty: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: "8px",
    textAlign: "center",
    color: color["--text-3"],
    pointerEvents: "none",
  },
  emptyNum: { color: color["--line-2"] },
  toasts: {
    position: "absolute",
    top: chrome.gapOut,
    right: chrome.gapOut,
    zIndex: layer.toast,
    width: "min(320px, calc(100% - 24px))",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  osd: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "72px",
    display: "flex",
    justifyContent: "center",
    zIndex: layer.osd,
    pointerEvents: "none",
    paddingInline: "16px",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: layer.overlay,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "9vh",
    paddingInline: "16px",
    backgroundColor: color["--scrim"],
  },
  night: {
    position: "absolute",
    inset: 0,
    zIndex: layer.flash,
    pointerEvents: "none",
    backgroundColor: `color-mix(in oklab, ${color["--orange"]} 22%, transparent)`,
    mixBlendMode: "multiply",
  },
  flash: {
    position: "absolute",
    inset: 0,
    zIndex: layer.flash,
    pointerEvents: "none",
    backgroundColor: color["--text"],
    opacity: 0,
    animationName: flash,
    animationDuration: "420ms",
    animationTimingFunction: motion.ease,
  },
  lock: { position: "absolute", inset: 0, zIndex: layer.lock },
});

const pos = stylex.create({
  rect: (x: number, y: number, w: number, h: number) => ({
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: `${w * 100}%`,
    height: `${h * 100}%`,
  }),
  shift: (n: number) => ({ transform: `translateX(${n * 100}%)` }),
});

const WALLPAPER = [s.wp0, s.wp1, s.wp2, s.wp3];

type Props = {
  state: State;
  dispatch: Dispatch<Action>;
  exec: (c: Command) => void;
  mode: "stock" | "tuned";
  interactive: boolean;
  id: string;
};

function App(p: AppProps) {
  switch (p.win.data.kind) {
    case "terminal":
      return <Terminal {...(p as AppProps<"terminal">)} />;
    case "editor":
      return <Editor {...(p as AppProps<"editor">)} />;
    case "monitor":
      return <Monitor {...(p as AppProps<"monitor">)} />;
    case "git":
      return <Git {...(p as AppProps<"git">)} />;
    case "keys":
      return <Keys {...(p as AppProps<"keys">)} />;
  }
}

/** One complete desktop. Drawn twice under the before/after divider, once per mode. */
export function Screen({ state, dispatch, exec, mode, interactive, id }: Props) {
  const area = useRef<HTMLDivElement>(null);
  const clock = formatClock(useNow());

  useEffect(() => {
    const el = area.current;
    if (!el || !interactive) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (height > 0) dispatch({ type: "aspect", value: width / height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [dispatch, interactive]);

  const busy = new Set(state.windows.map((w) => w.ws));
  const shown = Math.max(BAR_WORKSPACES, state.ws, ...busy);
  const layers = Array.from({ length: WORKSPACES }, (_, i) => i + 1).filter((n) => n === state.ws || busy.has(n));
  const avg = Math.round(state.metrics.cores.reduce((a, b) => a + b, 0) / state.metrics.cores.length);

  const modules: BarModule[] = [
    { id: "cpu", icon: "cpu", label: "CPU", value: `${avg}%`, onPress: interactive ? () => exec({ type: "open", app: "monitor" }) : undefined },
    ...(state.dnd
      ? [
          {
            id: "dnd",
            icon: "bellOff",
            label: "Do not disturb on",
            onPress: interactive ? () => exec({ type: "toggle", what: "dnd" }) : undefined,
          } satisfies BarModule,
        ]
      : []),
    ...(state.night
      ? [
          {
            id: "night",
            icon: "moon",
            label: "Night light on",
            onPress: interactive ? () => exec({ type: "toggle", what: "night" }) : undefined,
          } satisfies BarModule,
        ]
      : []),
    { id: "bt", icon: "bluetooth", label: "Bluetooth" },
    { id: "wifi", icon: "wifi", label: "Wifi", value: "home" },
    {
      id: "vol",
      icon: state.muted ? "mute" : "volume",
      label: state.muted ? "Volume muted" : "Volume",
      value: state.muted ? "—" : String(state.volume),
      onPress: interactive ? () => dispatch({ type: "mute" }) : undefined,
      onWheel: interactive ? (e) => dispatch({ type: "volume", delta: e.deltaY < 0 ? 5 : -5 }) : undefined,
    },
    { id: "bat", icon: "battery", label: "Battery", value: "82", tone: "ok" },
  ];

  const renderWindow = (w: Win, rects: ReturnType<typeof dwindle>, full: string | null) => {
    const r = full === w.id ? { x: 0, y: 0, w: 1, h: 1 } : rects.get(w.id);
    if (!r) return null;
    const active = state.focus[w.ws] === w.id;
    const live = interactive && state.phase === "desktop" && !state.overlay && active && w.ws === state.ws;
    return (
      <div key={w.id} {...stylex.props(s.slot, pos.rect(r.x, r.y, r.w, r.h), s.pop, full === w.id && s.slotFull, full !== null && full !== w.id && s.hidden)}>
        <WindowFrame label={windowTitle(w)} active={active} onPointerDown={interactive ? () => dispatch({ type: "focus", id: w.id }) : undefined}>
          <App win={w} live={live} interactive={interactive} dispatch={dispatch} exec={exec} metrics={state.metrics} />
        </WindowFrame>
      </div>
    );
  };

  return (
    <div {...stylex.props(s.screen, WALLPAPER[state.wallpaper], mode === "stock" && stock)} data-mode={mode}>
      <Bar
        workspaces={Array.from({ length: shown }, (_, i) => ({ n: i + 1, busy: busy.has(i + 1), active: i + 1 === state.ws }))}
        clock={{ day: clock.day, time: clock.time }}
        modules={modules}
        onWorkspace={interactive ? (n) => exec({ type: "workspace", n }) : undefined}
        onMark={interactive ? () => exec({ type: "menu" }) : undefined}
      />
      <div ref={area} {...stylex.props(s.area)}>
        {layers.map((n) => {
          const wins = windowsOn(state, n);
          const rects = dwindle(
            wins.map((w) => w.id),
            state.aspect,
            state.flip[n] ?? false,
          );
          const full = state.fullscreen[n] ?? null;
          return (
            <div key={n} aria-hidden={n !== state.ws || undefined} inert={n !== state.ws || undefined} {...stylex.props(s.ws, pos.shift(n - state.ws))}>
              {wins.length === 0 && (
                <div {...stylex.props(typo.small, face.ui, s.empty)}>
                  <span {...stylex.props(typo.display, s.emptyNum)}>{n}</span>
                  <span>Empty workspace. Alt+Return opens a terminal, Alt+Space the Omarchy menu.</span>
                </div>
              )}
              <div {...stylex.props(s.tiles)}>{wins.map((w) => renderWindow(w, rects, full))}</div>
            </div>
          );
        })}

        <div {...stylex.props(s.toasts)} aria-live="polite">
          {state.toasts.map((t) => (
            <Toast
              key={t.id}
              who={t.who}
              title={t.title}
              body={t.body}
              critical={t.critical}
              onDismiss={interactive ? () => dispatch({ type: "dismiss", id: t.id }) : undefined}
            />
          ))}
        </div>

        {state.osd && (
          <div {...stylex.props(s.osd)}>
            <Osd
              icon={state.osd.kind === "volume" ? (state.osd.muted ? "mute" : "volume") : "sun"}
              value={state.osd.value}
              muted={state.osd.muted}
              label={state.osd.kind === "volume" ? "Volume" : "Brightness"}
            />
          </div>
        )}

        {state.overlay && state.phase === "desktop" && (
          <div
            {...stylex.props(s.overlay)}
            onPointerDown={(e) => {
              if (interactive && e.target === e.currentTarget) dispatch({ type: "overlay", overlay: null });
            }}
          >
            <MenuOverlay overlay={state.overlay} state={state} interactive={interactive} listId={`${id}-menu`} dispatch={dispatch} exec={exec} />
          </div>
        )}
      </div>

      {state.night && <div aria-hidden {...stylex.props(s.night)} />}
      {state.flash > 0 && <div key={state.flash} aria-hidden {...stylex.props(s.flash)} />}
      {state.phase === "lock" && (
        <div {...stylex.props(s.lock)}>
          <LockScreen interactive={interactive} onUnlock={() => dispatch({ type: "unlock" })} />
        </div>
      )}
    </div>
  );
}
