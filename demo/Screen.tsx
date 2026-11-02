"use client";

import * as stylex from "@stylexjs/stylex";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Bar, type BarModule } from "@/design/shell/Bar";
import { Osd } from "@/design/shell/Osd";
import { ToastDeck } from "@/design/shell/Toast";
import { WindowFrame } from "@/design/shell/WindowFrame";
import { chrome, stock } from "@/design/tokens/chrome.stylex";
import { color } from "@/design/tokens/color.stylex";
import { layer } from "@/design/tokens/layer.stylex";
import { motion } from "@/design/tokens/motion.stylex";
import { space } from "@/design/tokens/space.stylex";
import { font } from "@/design/tokens/type.stylex";
import type { Command } from "@/lib/commands";
import type { Rect } from "@/lib/layout";
import { REF_BAR } from "@/lib/reference.generated";
import { formatClock, useNow } from "@/lib/use-clock";
import { Editor } from "./apps/Editor";
import { Git } from "./apps/Git";
import { Keys } from "./apps/Keys";
import { Monitor } from "./apps/Monitor";
import { Terminal } from "./apps/Terminal";
import type { AppProps } from "./apps/types";
import { backgroundSrc } from "@/lib/background-images";
import { backgroundIndex } from "@/lib/backgrounds";
import { LockScreen } from "./LockScreen";
import { MenuOverlay } from "./MenuOverlay";
import { PickerOverlay } from "./PickerOverlay";
import { Wallpaper } from "./Wallpaper";
import { BAR_WORKSPACES, rectsFor, windowsOn, windowTitle, WORKSPACES, type Action, type Fullscreen, type State, type Win } from "./state";

// Hyprland's windowsIn/Out: pop from and to 87% of the window's size, with a fade alongside.
// default/hypr/looknfeel.lua:81-84.
const popIn = stylex.keyframes({ from: { transform: "scale(0.87)" }, to: { transform: "scale(1)" } });
const popOut = stylex.keyframes({ from: { transform: "scale(1)" }, to: { transform: "scale(0.87)" } });
const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const fadeOut = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });
const QUINT = "cubic-bezier(0.23, 1, 0.32, 1)";
const ALMOST_LINEAR = "cubic-bezier(0.5, 0.5, 0.75, 1)";
const flash = stylex.keyframes({ from: { opacity: 0.85 }, to: { opacity: 0 } });

const s = stylex.create({
  screen: {
    position: "absolute",
    inset: 0,
    // Keep each copy's overlays inside it, so under the divider the stock copy covers all of
    // the live one, menus and toasts included.
    isolation: "isolate",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: font.mono,
    color: color["--text"],
    backgroundColor: color["--wall"],
  },
  area: { position: "relative", flex: 1, minHeight: 0, overflow: "hidden" },
  // Workspace switches are instant: Omarchy turns the workspaces animation off. looknfeel.lua:92.
  ws: { position: "absolute", inset: 0 },
  away: { visibility: "hidden" },
  tiles: { position: "absolute", inset: `calc(${chrome.gapOut} - ${chrome.gapIn} / 2)` },
  slot: {
    position: "absolute",
    padding: `calc(${chrome.gapIn} / 2)`,
    zIndex: layer.window,
    // Moves and resizes: 303ms easeOutQuint. looknfeel.lua:80.
    transitionProperty: "left, top, width, height",
    transitionDuration: chrome.winMove,
    transitionTimingFunction: QUINT,
  },
  slotFull: { zIndex: layer.fullscreen, padding: 0 },
  hidden: { visibility: "hidden" },
  // Floating windows sit centred plus their offset, over the tiles, never wider than the workspace.
  floating: {
    position: "absolute",
    zIndex: layer.floating,
    maxWidth: `calc(100% - 2 * ${chrome.gapOut})`,
    maxHeight: `calc(100% - 2 * ${chrome.gapOut})`,
    transform: "translate(-50%, -50%)",
  },
  pop: { width: "100%", height: "100%", animationName: popIn, animationDuration: chrome.winOpen, animationTimingFunction: QUINT },
  fade: { width: "100%", height: "100%", animationName: fadeIn, animationDuration: chrome.winFadeIn, animationTimingFunction: ALMOST_LINEAR },
  gone: {
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    animationName: `${popOut}, ${fadeOut}`,
    animationDuration: `${chrome.winClose}, ${chrome.winFadeOut}`,
    animationTimingFunction: "linear, cubic-bezier(0.5, 0.5, 0.75, 1)",
    animationFillMode: "both",
  },
  noBar: { display: "none" },
  toasts: {
    position: "absolute",
    top: chrome.toastInset,
    right: chrome.toastInset,
    zIndex: layer.toast,
    width: `min(${chrome.toastWidth}, calc(100% - 24px))`,
  },
  osd: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: chrome.osdBottom,
    display: "flex",
    justifyContent: "center",
    zIndex: layer.osd,
    pointerEvents: "none",
    paddingInline: space.u4,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: layer.overlay,
    display: "flex",
    justifyContent: "center",
    // Centred on the screen when it opens. Menu.qml:1278-1312.
    alignItems: "center",
    paddingInline: "16px",
    backgroundColor: chrome.scrim,
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
  float: (f: { w: number; h: number; dx: number; dy: number }) => ({
    left: `calc(50% + ${f.dx}px)`,
    top: `calc(50% + ${f.dy}px)`,
    width: `${f.w}px`,
    height: `${f.h}px`,
  }),
  frozen: (top: number) => ({ alignItems: "flex-start", paddingTop: `${top}px` }),
});

type Props = {
  state: State;
  dispatch: Dispatch<Action>;
  exec: (c: Command) => void;
  mode: "stock" | "tuned";
  interactive: boolean;
  /** Told when a notification deck opens or closes, so timeouts can pause. */
  onToastsHeld?: (held: boolean) => void;
  id: string;
};

/**
 * The menu's full-screen layer. Omarchy centres the card when it opens, then freezes its top
 * edge at the first keystroke or submenu so the card grows and shrinks downward
 * (research/omarchy/spec/menu.json, menu.card.position.y). The layer remounts on every open.
 */
function MenuLayer({ moved, onScrim, children }: { moved: boolean; onScrim?: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const settled = useRef<number | null>(null);
  const [top, setTop] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (top !== null) return;
    const layer = ref.current;
    const card = layer?.firstElementChild;
    if (!layer || !card) return;
    const y = card.getBoundingClientRect().top - layer.getBoundingClientRect().top;
    if (!moved) settled.current = y;
    else setTop(settled.current ?? y);
  }, [top, moved]);
  return (
    <div
      ref={ref}
      {...stylex.props(s.overlay, top !== null && pos.frozen(top))}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onScrim?.();
      }}
    >
      {children}
    </div>
  );
}

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
export function Screen({ state, dispatch, exec, mode, interactive, id, onToastsHeld }: Props) {
  const area = useRef<HTMLDivElement>(null);
  const now = useNow();
  const clock = formatClock(now);

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

  // Both views draw Omarchy's widgets in shell.json's sections and order (REF_BAR); only tokens differ.
  const right: BarModule[] = REF_BAR.right.flatMap((id): BarModule[] => {
    switch (id) {
      case "omarchy.agents":
        return [{ id, icon: "agents", label: "Agents" }];
      case "omarchy.bluetooth":
        return [{ id, icon: "bluetooth", label: "Bluetooth" }];
      case "omarchy.network":
        return [{ id, icon: "wifi", label: "Network" }];
      case "omarchy.audio":
        return [
          {
            id,
            icon: state.muted ? "mute" : "volume",
            label: state.muted ? "Audio, muted" : `Audio ${state.volume}%`,
            onPress: interactive ? () => dispatch({ type: "mute" }) : undefined,
            onWheel: interactive ? (e) => dispatch({ type: "volume", delta: e.deltaY < 0 ? 5 : -5 }) : undefined,
          },
        ];
      case "omarchy.monitor":
        return [{ id, icon: "monitor", label: "Display", onPress: interactive ? () => exec({ type: "open", app: "monitor" }) : undefined }];
      // The battery icon is never tinted, research/omarchy/spec/bar.json omarchy.power.
      case "omarchy.power":
        return [{ id, icon: "battery", label: "Power", value: "82" }];
      default:
        return [];
    }
  });
  // centerBegin: an indicator per active state, in Indicators.qml's order (NightLight, Dnd, StayAwake).
  const toggle = (what: "night" | "dnd" | "idle") => (interactive ? () => exec({ type: "toggle", what }) : undefined);
  const before: BarModule[] = [
    ...(state.night ? [{ id: "night", icon: "moon", label: "Night light on", status: true, onPress: toggle("night") } as const] : []),
    ...(state.dnd ? [{ id: "dnd", icon: "bellOff", label: "Notifications silenced", status: true, onPress: toggle("dnd") } as const] : []),
    ...(!state.idle ? [{ id: "awake", icon: "coffee", label: "Staying awake", status: true, onPress: toggle("idle") } as const] : []),
  ];
  // centerEnd: the world clock and the weather.
  const after: BarModule[] = REF_BAR.centerEnd.flatMap((id): BarModule[] => {
    if (id === "omarchy.elsewhen") return [{ id, icon: "globe", label: "World clock", status: true }];
    if (id === "omarchy.weather") return [{ id, icon: "cloud", label: "Weather", status: true }];
    return [];
  });

  // Super+drag (Alt here) moves a window: a floating one follows the pointer, a tiled one swaps
  // with the tile it lands on. Super+right-drag resizes a floating one from its corner.
  // default/hypr/bindings/tiling.lua:84-85.
  const drag = (e: ReactPointerEvent<HTMLElement>, w: Win) => {
    if (!interactive || !e.altKey) return;
    e.preventDefault();
    const x0 = e.clientX;
    const y0 = e.clientY;
    const f = w.float;
    const resize = e.button === 2;
    const move = (ev: PointerEvent) => {
      if (!f) return;
      const dx = ev.clientX - x0;
      const dy = ev.clientY - y0;
      if (!resize) return dispatch({ type: "move-float", id: w.id, float: { dx: f.dx + dx, dy: f.dy + dy } });
      const width = Math.max(240, f.w + dx);
      const height = Math.max(160, f.h + dy);
      // The window is centred on its offset, so growing from a corner also moves the centre.
      dispatch({ type: "move-float", id: w.id, float: { w: width, h: height, dx: f.dx + (width - f.w) / 2, dy: f.dy + (height - f.h) / 2 } });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (f) return;
      const to = document.elementFromPoint(ev.clientX, ev.clientY)?.closest("[data-win]")?.getAttribute("data-win");
      if (to && to !== w.id) dispatch({ type: "swap-ids", a: w.id, b: to });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const frame = (w: Win) => {
    const active = state.focus[state.ws] === w.id || (!w.pinned && state.focus[w.ws] === w.id);
    const live = interactive && state.phase === "desktop" && !state.overlay && !state.picker && active && (w.ws === state.ws || Boolean(w.pinned));
    return (
      <div {...stylex.props(s.pop)}>
        <div {...stylex.props(s.fade)}>
          <WindowFrame
            label={windowTitle(w)}
            refKey={`win:${w.id}`}
            active={active}
            popped={w.pinned}
            bare={state.fullscreen[w.ws]?.id === w.id && state.fullscreen[w.ws]?.kind === "full"}
            onPointerDown={interactive ? () => dispatch({ type: "focus", id: w.id }) : undefined}
          >
            <App win={w} live={live} interactive={interactive} dispatch={dispatch} exec={exec} metrics={state.metrics} />
          </WindowFrame>
        </div>
      </div>
    );
  };

  // Focus follows the pointer (input.lua:72): moving onto a window focuses it.
  const hover = (w: Win) => () => {
    if (interactive && state.phase === "desktop" && !state.overlay && !state.picker && state.focus[state.ws] !== w.id) dispatch({ type: "focus", id: w.id });
  };
  const slotProps = (w: Win) => ({
    "data-win": w.id,
    onPointerEnter: hover(w),
    onPointerDownCapture: (e: ReactPointerEvent<HTMLElement>) => drag(e, w),
    onContextMenu: (e: ReactMouseEvent) => {
      if (e.altKey) e.preventDefault();
    },
  });

  const renderTile = (w: Win, rects: Map<string, Rect>, full: Fullscreen) => {
    const r = full?.id === w.id ? { x: 0, y: 0, w: 1, h: 1 } : rects.get(w.id);
    if (!r) return null;
    return (
      <div
        key={w.id}
        {...slotProps(w)}
        {...stylex.props(
          s.slot,
          pos.rect(r.x, r.y, r.w, r.h),
          full?.id === w.id && s.slotFull,
          full !== null && full !== undefined && full.id !== w.id && s.hidden,
        )}
      >
        {frame(w)}
      </div>
    );
  };

  const renderFloat = (w: Win, full: Fullscreen) => {
    if (!w.float) return null;
    if (full?.id === w.id) return renderTile(w, new Map(), full);
    return (
      <div key={w.id} {...slotProps(w)} {...stylex.props(s.floating, pos.float(w.float), full && s.hidden)}>
        {frame(w)}
      </div>
    );
  };

  const renderGone = ({ win, rect }: State["closing"][number]) => (
    <div
      key={`gone-${win.id}`}
      aria-hidden
      {...stylex.props(rect ? s.slot : s.floating, rect ? pos.rect(rect.x, rect.y, rect.w, rect.h) : win.float ? pos.float(win.float) : null)}
    >
      <div {...stylex.props(s.gone)}>
        <WindowFrame label={windowTitle(win)}>
          <App win={win} live={false} interactive={false} dispatch={dispatch} exec={exec} metrics={state.metrics} />
        </WindowFrame>
      </div>
    </div>
  );

  const pinned = state.windows.filter((w) => w.pinned);
  const barHidden = state.fullscreen[state.ws]?.kind === "full";

  return (
    <div {...stylex.props(s.screen, mode === "stock" && stock)} data-mode={mode} data-screen={id}>
      <Wallpaper src={backgroundSrc(state.theme, backgroundIndex(state.theme, state.bg[state.theme]))} />
      <div {...stylex.props(barHidden && s.noBar)}>
        <Bar
          workspaces={Array.from({ length: shown }, (_, i) => ({ n: i + 1, busy: busy.has(i + 1), active: i + 1 === state.ws }))}
          clock={{ day: clock.day, time: clock.time }}
          modules={right}
          beside={{ before, after }}
          onWorkspace={interactive ? (n) => exec({ type: "workspace", n }) : undefined}
          onMark={interactive ? () => exec({ type: "menu" }) : undefined}
        />
      </div>
      <div ref={area} {...stylex.props(s.area)}>
        {layers.map((n) => {
          const wins = windowsOn(state, n).filter((w) => !w.pinned);
          const rects = rectsFor(state, n);
          const full = state.fullscreen[n] ?? null;
          return (
            <div key={n} aria-hidden={n !== state.ws || undefined} inert={n !== state.ws || undefined} {...stylex.props(s.ws, n !== state.ws && s.away)}>
              <div {...stylex.props(s.tiles)}>
                {wins.filter((w) => !w.float).map((w) => renderTile(w, rects, full))}
                {state.closing.filter((c) => c.win.ws === n && !c.win.pinned).map(renderGone)}
              </div>
              {wins.filter((w) => w.float).map((w) => renderFloat(w, full))}
            </div>
          );
        })}
        {/* Pinned windows show on every workspace. */}
        <div {...stylex.props(s.ws)}>{pinned.map((w) => renderFloat(w, state.fullscreen[state.ws] ?? null))}</div>

        <div {...stylex.props(s.toasts)} aria-live="polite">
          <ToastDeck
            toasts={state.toasts}
            now={now?.getTime() ?? 0}
            onDismiss={interactive ? (id) => dispatch({ type: "dismiss", id }) : undefined}
            onOpenChange={interactive ? onToastsHeld : undefined}
          />
        </div>

        {state.osd && (
          <div {...stylex.props(s.osd)}>
            <Osd
              // Omarchy's brightness glyph is a monitor (U+F0379), OsdModel.js:18.
              icon={state.osd.kind === "volume" ? (state.osd.muted ? "mute" : "volume") : mode === "stock" ? "monitor" : "sun"}
              value={state.osd.value}
              muted={state.osd.muted}
              label={state.osd.kind === "volume" ? "Volume" : "Brightness"}
            />
          </div>
        )}
      </div>

      {/* Omarchy's menu is a full-screen overlay layer: its scrim covers the bar too, Menu.qml:1278-1299. */}
      {state.overlay && state.phase === "desktop" && (
        <MenuLayer
          moved={state.overlay.q !== "" || state.overlay.path.length > 0}
          onScrim={interactive ? () => dispatch({ type: "overlay", overlay: null }) : undefined}
        >
          <MenuOverlay overlay={state.overlay} state={state} interactive={interactive} mode={mode} listId={`${id}-menu`} dispatch={dispatch} exec={exec} />
        </MenuLayer>
      )}
      {state.picker && state.phase === "desktop" && (
        <PickerOverlay picker={state.picker} state={state} interactive={interactive} listId={`${id}-picker`} dispatch={dispatch} exec={exec} />
      )}
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
