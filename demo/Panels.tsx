"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type ReactNode, type RefObject } from "react";
import { Icon } from "@/design/shell/Icon";
import { PanelCard, PanelHero, PanelPills, PanelRow, PanelRule, PanelSection, PanelSlider, PanelSwitch } from "@/design/shell/Panel";
import { chrome } from "@/design/tokens/chrome.stylex";
import { isoWeek } from "@/lib/use-clock";
import { shellspace } from "@/design/tokens/shellspace.stylex";
import { layer } from "@/design/tokens/layer.stylex";
import { shelltype } from "@/design/tokens/shelltype.stylex";
import type { Action, PanelId, Profile, State } from "./state";

// Every value and string here comes from research/omarchy/spec/panels.json unless marked as
// sample data; the devices, networks and weather are a plausible laptop on a home network.

/** Outer card widths. panel.sizes: 380 for most, clock 560, weather 480. */
const WIDTH: Record<PanelId, number> = { clock: 560, weather: 480, audio: 380, network: 380, bluetooth: 380, monitor: 380, power: 380 };
const LABEL: Record<PanelId, string> = {
  clock: "Calendar",
  weather: "Weather",
  audio: "Audio",
  network: "Network",
  bluetooth: "Bluetooth",
  monitor: "Display",
  power: "Battery",
};
/** Tab moves through the panels of one bar region, wrapping. panel.trigger.tab. */
const REGIONS: PanelId[][] = [
  ["clock", "weather"],
  ["bluetooth", "network", "audio", "monitor", "power"],
];

const s = stylex.create({
  // A full-screen, see-through surface below the bar: no scrim. A press outside the card closes.
  layer: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: layer.popover },
  place: { position: "absolute", top: chrome.toastInset },
  // Shared text styles for panel bodies, sized from Omarchy's shell scale.
  small: { fontSize: shelltype.bodySmall },
  body: { fontSize: shelltype.body },
  caption: { fontSize: shelltype.caption },
  dim: { color: chrome.panelDim },
  faint: { opacity: 0.6, whiteSpace: "nowrap" },
  strong: { fontWeight: chrome.panelBold },
  grid: { display: "grid", gridTemplateColumns: "auto 1fr auto 1fr", columnGap: "20px", rowGap: shellspace.sm },
  value: { textAlign: "right", whiteSpace: "nowrap" },
  list: { display: "flex", flexDirection: "column", gap: shellspace.sm },
  contents: { display: "contents" },
  // Clock.
  clockHero: { display: "flex", justifyContent: "center", alignItems: "baseline", gap: "22px" },
  clockDate: { fontSize: shelltype.clockDate, fontWeight: chrome.panelBold, lineHeight: 1 },
  rail: { display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", columnGap: shellspace.xxl, width: "426px", marginInline: "auto" },
  railTrack: { position: "relative", height: "6px", backgroundColor: chrome.panelLine },
  railFill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: chrome.panelInk },
  month: {
    display: "grid",
    gridTemplateColumns: "32px 14px repeat(7, 52px)",
    rowGap: shellspace.xs,
    columnGap: shellspace.xxs,
    width: "426px",
    marginInline: "auto",
  },
  weekday: { fontSize: shelltype.caption, fontWeight: chrome.panelBold, letterSpacing: "1px", textAlign: "center", color: chrome.panelDim, height: "16px" },
  week: { fontSize: shelltype.caption, display: "grid", placeItems: "center", height: "34px", color: chrome.panelDim, opacity: 0.8 },
  gutter: { justifySelf: "center", width: "1px", height: "100%", backgroundColor: chrome.panelLine },
  day: {
    display: "grid",
    placeItems: "center",
    height: "34px",
    fontSize: shelltype.body,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
  },
  weekend: { color: chrome.panelDim },
  other: { opacity: 0.45 },
  today: { borderColor: chrome.panelEdge, fontWeight: chrome.panelBold },
  nav: { display: "grid", gridTemplateColumns: "23px 1fr 23px", alignItems: "center", width: "426px", marginInline: "auto" },
  navLabel: { textAlign: "center", fontSize: shelltype.body, letterSpacing: "1px", color: chrome.panelDim },
  navButton: {
    display: "grid",
    placeItems: "center",
    width: "23px",
    height: "23px",
    padding: 0,
    borderWidth: 0,
    backgroundColor: { default: "transparent", ":hover": chrome.selBg },
    color: "inherit",
    cursor: "pointer",
  },
  flip: { transform: "rotate(180deg)" },
  // Battery.
  pct: { fontSize: shelltype.displayLarge, fontWeight: chrome.panelBold },
  bar: { position: "relative", height: "8px", borderRadius: "4px", backgroundColor: chrome.panelLine, overflow: "hidden" },
  barFill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: "4px", backgroundColor: chrome.panelInk },
  stats: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "20px" },
  stat: { display: "flex", justifyContent: "space-between", fontSize: shelltype.bodySmall, lineHeight: 1.6 },
  // Weather.
  wxHero: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: "16px 20px" },
  wxNow: { display: "flex", alignItems: "flex-start", gap: "16px" },
  temp: { fontSize: shelltype.weatherTemp, fontWeight: chrome.panelBold, lineHeight: 1 },
  unit: { fontSize: shelltype.display, marginTop: shellspace.xl },
  wxSide: { display: "flex", flexDirection: "column", gap: shellspace.xxl },
  wxPlace: { display: "flex", alignItems: "center", gap: shellspace.md, fontSize: shelltype.body, letterSpacing: "1px", color: chrome.panelDim },
  wxStats: { display: "flex", gap: "36px" },
  wxStat: { display: "flex", flexDirection: "column", gap: "5px" },
  wxLabel: { fontSize: shelltype.bodySmall, letterSpacing: "1px", color: chrome.panelDim },
  wxValue: { fontSize: shelltype.title },
  forecast: { display: "flex", justifyContent: "center", gap: "44px" },
  fday: { display: "flex", alignItems: "center", gap: shellspace.xl },
  fcol: { display: "flex", flexDirection: "column", gap: shellspace.md },
});

const dyn = stylex.create({
  left: (x: number) => ({ left: `${x}px` }),
  top: (y: number) => ({ top: `${y}px` }),
  width: (f: number) => ({ width: `${Math.round(f * 1000) / 10}%` }),
});

/** Cycles a status phrase every 2.8s, as each panel's hero does. panels.json *.hero.*.rotate. */
function useRotation(phrases: readonly string[], on: boolean): string {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!on || phrases.length < 2) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % phrases.length), 2800);
    return () => window.clearInterval(t);
  }, [on, phrases.length]);
  return phrases[i % phrases.length] ?? "";
}

// --- Audio ------------------------------------------------------------------------------

/** The output level's name. shell/plugins/panels/audio/Model.js:50-62. */
export function audioMood(volume: number, muted: boolean): string {
  if (muted) return "Muted";
  if (volume === 0) return "Silenced";
  if (volume >= 100) return "Concert hall";
  if (volume >= 85) return "Party mode";
  if (volume >= 70) return "Cranked up";
  if (volume >= 50) return "Steady groove";
  if (volume >= 30) return "Easy listening";
  if (volume >= 15) return "Murmur";
  return "Whisper";
}

function Audio({ state, dispatch }: PanelProps) {
  const [output, setOutput] = useState("speakers");
  const [mic, setMic] = useState(0.7);
  const outputs = [
    { id: "speakers", name: "Built-in Speakers" },
    { id: "headset", name: "WH-1000XM5" },
  ];
  return (
    <>
      <PanelHero
        glyph={<Icon name={state.muted ? "mute" : "volume"} panel="hero" />}
        title="Audio"
        meta={audioMood(state.volume, state.muted)}
        dim={state.muted}
        end={<PanelSwitch label="Mute" checked={!state.muted && state.volume > 0} onChange={() => dispatch({ type: "mute" })} />}
      />
      <PanelRule />
      <PanelSection title="OUTPUT" value={`${state.volume}%`}>
        <PanelSlider label="Output volume" value={state.volume / 100} onChange={(v) => dispatch({ type: "set-volume", value: v * 100 })} />
        <div {...stylex.props(s.list)}>
          {outputs.map((o) => (
            <PanelRow
              key={o.id}
              glyph={<Icon name="volume" />}
              name={o.name}
              strong={output === o.id}
              current={output === o.id}
              onPress={() => setOutput(o.id)}
            />
          ))}
        </div>
      </PanelSection>
      <PanelRule />
      <PanelSection title="INPUT" value={`${Math.round(mic * 100)}%`}>
        <PanelSlider label="Input volume" value={mic} onChange={setMic} />
        <PanelRow glyph={<Icon name="mic" />} name="Built-in Microphone" strong current />
      </PanelSection>
      <PanelRule />
      <PanelSection title="SOURCES">
        <PanelRow glyph={<Icon name="volume" />} name="Chromium" end={<span {...stylex.props(s.caption, s.strong)}>100%</span>} />
      </PanelSection>
    </>
  );
}

// --- Network ----------------------------------------------------------------------------

const NET_PHRASES = ["Wiring bits", "Handling packets", "Sorting frames", "Hauling bytes", "Routing crumbs", "Counting collisions", "Bending light"];

// Sample data: a home network, a phone hotspot, and the neighbours.
const NETWORKS = [
  { ssid: "Homenet", signal: 4, secure: true, known: true },
  { ssid: "Pixel 9", signal: 3, secure: true, known: true },
  { ssid: "NETGEAR-5G", signal: 3, secure: true, known: false },
  { ssid: "Starbucks WiFi", signal: 2, secure: false, known: false },
  { ssid: "DIRECT-printer", signal: 1, secure: true, known: false },
];

function Network({ state, dispatch }: PanelProps) {
  const [current, setCurrent] = useState("Homenet");
  const [dns, setDns] = useState<"dhcp" | "cloudflare" | "google" | "custom">("dhcp");
  const phrase = useRotation(NET_PHRASES, state.wifi);
  const on = state.wifi;
  const detail: [string, string][] = [
    ["Ping", "12 ms"],
    ["Packet Loss", "0%"],
    ["Receiving", "1.2 KB/s"],
    ["Sending", "312 B/s"],
    ["Downloaded", "1.84 GB"],
    ["Uploaded", "210.5 MB"],
    ["IP Address", "192.168.1.42"],
    ["Gateway", "192.168.1.1"],
  ];
  const known = NETWORKS.filter((n) => n.known);
  const other = NETWORKS.filter((n) => !n.known);
  const row = (n: (typeof NETWORKS)[number]) => (
    <PanelRow
      key={n.ssid}
      glyph={<Icon name="wifi" />}
      name={n.ssid}
      sub={n.ssid === current ? "Connected" : undefined}
      current={n.ssid === current}
      end={n.secure ? <Icon name="lock" /> : undefined}
      onPress={() => setCurrent(n.ssid)}
    />
  );
  return (
    <>
      <PanelHero
        glyph={<Icon name="wifi" panel="hero" />}
        title={on ? current : "Wi-Fi"}
        meta={on ? phrase : "Not connected"}
        dim={!on}
        end={<PanelSwitch label={on ? "Turn Wi-Fi off" : "Turn Wi-Fi on"} checked={on} onChange={(v) => dispatch({ type: "radio", what: "wifi", on: v })} />}
      />
      {on && (
        <div {...stylex.props(s.grid, s.small)}>
          {detail.map(([k, v]) => (
            <span key={k} {...stylex.props(s.contents)}>
              <span {...stylex.props(s.faint)}>{k}</span>
              <span {...stylex.props(s.value)}>{v}</span>
            </span>
          ))}
        </div>
      )}
      <PanelRule />
      <PanelSection title="DNS PROVIDER">
        <PanelPills
          label="DNS provider"
          value={dns}
          onChange={setDns}
          options={[
            { value: "dhcp", label: "DHCP" },
            { value: "cloudflare", label: "Cloudflare" },
            { value: "google", label: "Google" },
            { value: "custom", label: "Custom" },
          ]}
        />
      </PanelSection>
      {on && (
        <>
          <PanelRule />
          <PanelSection title="KNOWN NETWORKS">
            <div {...stylex.props(s.list)}>{known.map(row)}</div>
          </PanelSection>
          <PanelSection title="OTHER NETWORKS">
            <div {...stylex.props(s.list)}>{other.map(row)}</div>
          </PanelSection>
        </>
      )}
    </>
  );
}

// --- Bluetooth --------------------------------------------------------------------------

const BT_PHRASES = [
  "Untangling wires",
  "Streaming vikings",
  "Pairing mysteries",
  "Herding headsets",
  "Taming radios",
  "Summoning speakers",
  "Wrangling codecs",
  "Polishing packets",
];

function Bluetooth({ state, dispatch }: PanelProps) {
  const on = state.bluetooth;
  const phrase = useRotation(BT_PHRASES, on);
  const [connected, setConnected] = useState<string | null>("WH-1000XM5");
  const paired = ["WH-1000XM5", "MX Master 3S", "AirPods Pro"];
  const available = ["JBL Flip 6", "Pixel Buds Pro"];
  const device = (name: string) => (
    <PanelRow
      key={name}
      glyph={<Icon name="bluetooth" />}
      name={name}
      sub={name === connected ? "80%" : undefined}
      current={name === connected}
      onPress={() => setConnected(name === connected ? null : name)}
    />
  );
  return (
    <>
      <PanelHero
        glyph={<Icon name="bluetooth" panel="hero" />}
        title="Bluetooth"
        meta={on ? phrase : "Off"}
        dim={!on}
        end={
          <PanelSwitch
            label={on ? "Turn Bluetooth off" : "Turn Bluetooth on"}
            checked={on}
            onChange={(v) => dispatch({ type: "radio", what: "bluetooth", on: v })}
          />
        }
      />
      <PanelRule />
      {on ? (
        <>
          {connected && <PanelSection title="CONNECTED">{device(connected)}</PanelSection>}
          <PanelSection title="PAIRED">
            <div {...stylex.props(s.list)}>{paired.filter((p) => p !== connected).map(device)}</div>
          </PanelSection>
          <PanelSection title="AVAILABLE">
            <div {...stylex.props(s.list)}>{available.map(device)}</div>
          </PanelSection>
        </>
      ) : (
        <span {...stylex.props(s.small, s.dim)}>Turn Bluetooth on to scan</span>
      )}
    </>
  );
}

// --- Display ----------------------------------------------------------------------------

/** The brightness band's name. panels.json monitor.hero.moodBands. */
export function displayMood(b: number): string {
  if (b >= 95) return "Sun blast";
  if (b >= 80) return "Solar flare";
  if (b >= 65) return "Golden hour";
  if (b >= 45) return "Even day";
  if (b >= 30) return "Soft glow";
  if (b >= 20) return "Lamp light";
  if (b >= 10) return "Candlelit";
  return "Night owl";
}

const TEXT_STOPS = [9, 10, 11, 12, 14, 16, 20];

function Monitor({ state, dispatch }: PanelProps) {
  const [text, setText] = useState(3);
  const [scale, setScale] = useState<"1" | "1.25" | "1.5" | "2">("2");
  return (
    <>
      <PanelHero glyph={<Icon name="laptop" panel="hero" />} title="Built-in Display" meta={displayMood(state.brightness)} />
      <PanelRule />
      <PanelSection title="BRIGHTNESS" value={`${state.brightness}%`}>
        <PanelSlider label="Brightness" value={state.brightness / 100} step={0.01} onChange={(v) => dispatch({ type: "set-brightness", value: v * 100 })} />
      </PanelSection>
      <PanelRule />
      <PanelSection title="TEXT SIZE" value={`${TEXT_STOPS[text]}px`}>
        <PanelSlider
          label="Text size"
          value={text / (TEXT_STOPS.length - 1)}
          step={1 / (TEXT_STOPS.length - 1)}
          onChange={(v) => setText(Math.round(v * (TEXT_STOPS.length - 1)))}
        />
      </PanelSection>
      <PanelRule />
      <PanelSection title="SCALE">
        <PanelPills
          label="Scale"
          value={scale}
          onChange={setScale}
          options={[
            { value: "1", label: "1x" },
            { value: "1.25", label: "1.25x" },
            { value: "1.5", label: "1.5x" },
            { value: "2", label: "2x" },
          ]}
        />
      </PanelSection>
    </>
  );
}

// --- Battery ----------------------------------------------------------------------------

const DRAIN = [
  "Slurping power",
  "Spending joules",
  "Draining watts",
  "Burning electrons",
  "Sipping juice",
  "Spending coulombs",
  "Bleeding amps",
  "Guzzling volts",
  "Munching reserves",
];

function Power({ state, dispatch }: PanelProps) {
  const phrase = useRotation(DRAIN, true);
  const charge = 0.87;
  return (
    <>
      <PanelHero glyph={<Icon name="battery" panel="hero" />} title="Battery" meta={phrase} end={<span {...stylex.props(s.pct)}>87%</span>} />
      <div {...stylex.props(s.bar)}>
        <div {...stylex.props(s.barFill, dyn.width(charge))} />
      </div>
      <div {...stylex.props(s.stats)}>
        {[
          [
            ["Battery size", "53Wh"],
            ["Charge cycles", "112"],
          ],
          [
            ["Time left", "3h 12m"],
            ["Discharging", "13.1W"],
          ],
        ].map((col, i) => (
          <div key={i}>
            {col.map(([k, v]) => (
              <div key={k} {...stylex.props(s.stat)}>
                <span {...stylex.props(s.faint)}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <PanelRule />
      <PanelSection title="POWER PROFILE">
        <PanelPills<Profile>
          label="Power profile"
          value={state.profile}
          onChange={(v) => dispatch({ type: "profile", value: v })}
          options={[
            { value: "power-saver", label: "Power-saver", glyph: <Icon name="leaf" /> },
            { value: "balanced", label: "Balanced", glyph: <Icon name="gauge" /> },
            { value: "performance", label: "Performance", glyph: <Icon name="bolt" /> },
          ]}
        />
      </PanelSection>
    </>
  );
}

// --- Calendar ---------------------------------------------------------------------------

/** Six weeks starting on the Sunday on or before the 1st (weeks start Sunday by default). clock.grid.weekStart. */
export function monthWeeks(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d)));
}

function Clock({ now }: { now: Date }) {
  const [shift, setShift] = useState(0);
  const view = new Date(now.getFullYear(), now.getMonth() + shift, 1);
  const weeks = monthWeeks(view.getFullYear(), view.getMonth());
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const done = (now.getTime() - start) / (new Date(now.getFullYear() + 1, 0, 1).getTime() - start);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  return (
    <>
      <div {...stylex.props(s.clockHero)}>
        <Icon name="calendar" panel="clock" />
        <span {...stylex.props(s.clockDate)}>{now.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
      </div>
      <div {...stylex.props(s.rail, s.small)}>
        <span {...stylex.props(s.dim)}>{now.getFullYear()}</span>
        <span {...stylex.props(s.railTrack)}>
          <span {...stylex.props(s.railFill, dyn.width(done))} />
        </span>
        <span>{Math.floor(done * 100)}%</span>
      </div>
      <div role="grid" aria-label={view.toLocaleDateString("en-US", { month: "long", year: "numeric" })} {...stylex.props(s.month)}>
        <span {...stylex.props(s.weekday)}>W</span>
        <span />
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
          <span key={d} {...stylex.props(s.weekday)}>
            {d}
          </span>
        ))}
        {weeks.map((week) => (
          <span key={week[0]!.toISOString()} role="row" {...stylex.props(s.contents)}>
            <span {...stylex.props(s.week)}>{isoWeek(week[4]!)}</span>
            <span aria-hidden {...stylex.props(s.gutter)} />
            {week.map((d, i) => (
              <span
                key={d.toISOString()}
                role="gridcell"
                aria-current={same(d, now) ? "date" : undefined}
                {...stylex.props(s.day, (i === 0 || i === 6) && s.weekend, d.getMonth() !== view.getMonth() && s.other, same(d, now) && s.today)}
              >
                {d.getDate()}
              </span>
            ))}
          </span>
        ))}
      </div>
      <div {...stylex.props(s.nav)}>
        <button type="button" aria-label="Previous month" onClick={() => setShift((n) => n - 1)} {...stylex.props(s.navButton)}>
          <span {...stylex.props(s.flip)}>
            <Icon name="chevron" />
          </span>
        </button>
        <span {...stylex.props(s.navLabel)}>{view.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()}</span>
        <button type="button" aria-label="Next month" onClick={() => setShift((n) => n + 1)} {...stylex.props(s.navButton)}>
          <Icon name="chevron" />
        </button>
      </div>
    </>
  );
}

// --- Weather ----------------------------------------------------------------------------

function Weather() {
  // Sample data: an overcast November afternoon.
  const days = [
    { d: "TUE", hi: "8°", lo: "2°", icon: "cloud" as const },
    { d: "WED", hi: "6°", lo: "1°", icon: "cloud" as const },
    { d: "THU", hi: "9°", lo: "4°", icon: "sun" as const },
  ];
  return (
    <>
      <div {...stylex.props(s.wxHero)}>
        <div {...stylex.props(s.wxNow)}>
          <Icon name="cloud" panel="weather" />
          <span {...stylex.props(s.temp)}>3</span>
          <span {...stylex.props(s.unit)}>°C</span>
        </div>
        <div {...stylex.props(s.wxSide)}>
          <span {...stylex.props(s.wxPlace)}>
            <Icon name="pin" /> REYKJAVIK
          </span>
          <div {...stylex.props(s.wxStats)}>
            {[
              ["FEELS", "-1°C"],
              ["WIND", "15 km/h"],
              ["HUMID", "81%"],
            ].map(([k, v]) => (
              <span key={k} {...stylex.props(s.wxStat)}>
                <span {...stylex.props(s.wxLabel)}>{k}</span>
                <span {...stylex.props(s.wxValue)}>{v}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <PanelRule />
      <div {...stylex.props(s.forecast)}>
        {days.map((f) => (
          <span key={f.d} {...stylex.props(s.fday)}>
            <Icon name={f.icon} panel="hero" />
            <span {...stylex.props(s.fcol)}>
              <span {...stylex.props(s.caption, s.dim)}>{f.d}</span>
              <span {...stylex.props(s.body)}>
                {f.hi} <span {...stylex.props(s.dim)}>{f.lo}</span>
              </span>
            </span>
          </span>
        ))}
      </div>
    </>
  );
}

// --- The layer --------------------------------------------------------------------------

type PanelProps = { state: State; dispatch: Dispatch<Action> };

function Content({ id, state, dispatch, now }: PanelProps & { id: PanelId; now: Date }): ReactNode {
  switch (id) {
    case "clock":
      return <Clock now={now} />;
    case "weather":
      return <Weather />;
    case "audio":
      return <Audio state={state} dispatch={dispatch} />;
    case "network":
      return <Network state={state} dispatch={dispatch} />;
    case "bluetooth":
      return <Bluetooth state={state} dispatch={dispatch} />;
    case "monitor":
      return <Monitor state={state} dispatch={dispatch} />;
    case "power":
      return <Power state={state} dispatch={dispatch} />;
  }
}

/**
 * The open panel, placed as Omarchy's KeyboardPanel places it: just under the bar, centred on
 * its widget, and kept 5px inside the screen. Esc or a press outside closes it; Tab moves to
 * the next panel in the same bar region. research/omarchy/spec/panels.json, container.
 */
export function PanelLayer({
  id,
  state,
  dispatch,
  interactive,
  screen,
  now,
}: PanelProps & { id: PanelId; interactive: boolean; screen: RefObject<HTMLDivElement | null>; now: Date }) {
  const [at, setAt] = useState<{ left: number; origin: number; top: number; w: number } | null>(null);
  const width = WIDTH[id];
  useLayoutEffect(() => {
    const root = screen.current;
    const anchor = root?.querySelector<HTMLElement>(`[data-panel="${id}"]`);
    if (!root || !anchor) return;
    const r = root.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    const bar = root.querySelector<HTMLElement>("[data-ref=bar]")?.getBoundingClientRect();
    // The view's card scale is a token on the screen; StyleX names it var(--hash).
    const scale = Number(getComputedStyle(root).getPropertyValue(shellspace.cardScale.slice(4, -1))) || 1;
    const w = Math.min(4 * Math.round((width * scale) / 4), r.width - 10);
    const cx = a.left + a.width / 2 - r.left;
    const left = Math.round(Math.min(Math.max(cx - w / 2, 5), r.width - w - 5));
    // Placing the card needs the widget's measured position, so it lands in a second render
    // before paint: the measuring case useLayoutEffect exists for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAt({ left, w, origin: Math.min(Math.max(cx - left, 0), w), top: bar ? bar.bottom - r.top : 0 });
  }, [id, width, screen]);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!interactive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dispatch({ type: "panel", id: null });
      } else if (e.key === "Tab" && ref.current?.contains(document.activeElement ?? null) === false) {
        const region = REGIONS.find((g) => g.includes(id)) ?? [];
        const i = region.indexOf(id);
        const next = region[(i + (e.shiftKey ? -1 : 1) + region.length) % region.length];
        if (next && next !== id) {
          e.preventDefault();
          dispatch({ type: "panel", id: next });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interactive, id, dispatch]);

  if (!at) return null;
  return (
    <div
      ref={ref}
      data-dock
      onPointerDown={(e) => {
        if (interactive && e.target === e.currentTarget) dispatch({ type: "panel", id: null });
      }}
      {...stylex.props(s.layer, dyn.top(at.top))}
    >
      <div {...stylex.props(s.place, dyn.left(at.left))}>
        <PanelCard key={id} label={LABEL[id]} width={at.w} origin={at.origin}>
          <Content id={id} state={state} dispatch={dispatch} now={now} />
        </PanelCard>
      </div>
    </div>
  );
}
