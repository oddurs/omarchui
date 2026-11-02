"use client";

import * as stylex from "@stylexjs/stylex";
import { color } from "@/design/tokens/color.stylex";
import { shellspace } from "@/design/tokens/shellspace.stylex";
import { shelltype } from "@/design/tokens/shelltype.stylex";
import { motion } from "@/design/tokens/motion.stylex";
import type { AppProps } from "./types";

const s = stylex.create({
  // btop draws in foot's cell grid: foot's pad at the edge, a blank row between boxes, a cell between columns.
  root: { flex: 1, minHeight: 0, overflow: "auto", padding: shellspace.xxxl, display: "grid", gap: shelltype.termLine, alignContent: "start" },
  head: { display: "flex", justifyContent: "space-between", color: color["--text-3"] },
  title: { color: color["--accent"] },
  grid: { display: "grid", gridTemplateColumns: "3em 1fr 3.2em", alignItems: "center", columnGap: "1ch" },
  track: { position: "relative", height: "6px", backgroundColor: color["--sunken"], overflow: "hidden" },
  fill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: color["--green"],
    transitionProperty: "width, background-color",
    transitionDuration: "900ms",
    transitionTimingFunction: motion.ease,
  },
  mid: { backgroundColor: color["--yellow"] },
  hi: { backgroundColor: color["--red"] },
  val: { textAlign: "right", color: color["--text-2"], fontVariantNumeric: "tabular-nums" },
  faint: { color: color["--text-3"] },
  spark: { width: "100%", height: `calc(${shelltype.termLine} * 2)`, display: "block" },
  line: { fill: "none", stroke: color["--cyan"], strokeWidth: 1.5 },
  area: { fill: color["--tint"] },
  table: { width: "100%", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" },
  th: { textAlign: "left", fontWeight: 400, color: color["--text-3"] },
  num: { textAlign: "right" },
  sel: { backgroundColor: color["--tint"] },
});

const dyn = stylex.create({ w: (pct: number) => ({ width: `${pct}%` }) });

const PROCS = [
  { pid: 812, name: "Hyprland", w: 0.9 },
  { pid: 1024, name: "chromium", w: 1.4 },
  { pid: 977, name: "omarchy-shell", w: 0.6 },
  { pid: 1201, name: "nvim", w: 0.5 },
  { pid: 1188, name: "foot", w: 0.4 },
  { pid: 990, name: "herdr", w: 0.1 },
  { pid: 1302, name: "puma 7.1 (tcp://127.0.0.1:3000)", w: 0.8 },
];

function Bar({ v }: { v: number }) {
  return (
    <span {...stylex.props(s.track)}>
      <span {...stylex.props(s.fill, v > 80 ? s.hi : v > 50 ? s.mid : null, dyn.w(v))} />
    </span>
  );
}

export function Monitor({ metrics }: AppProps<"monitor">) {
  const avg = Math.round(metrics.cores.reduce((a, b) => a + b, 0) / metrics.cores.length);
  const max = Math.max(...metrics.net, 1);
  const pts = metrics.net.map((v, i) => `${(i / (metrics.net.length - 1)) * 100},${40 - (v / max) * 36}`).join(" ");
  return (
    <div {...stylex.props(s.root)}>
      <div>
        <div {...stylex.props(s.head)}>
          <span {...stylex.props(s.title)}>cpu</span>
          <span>{avg}%</span>
        </div>
        <div {...stylex.props(s.grid)}>
          {metrics.cores.map((v, i) => (
            <Row key={i} label={`c${i}`} v={v} value={`${Math.round(v)}%`} />
          ))}
        </div>
      </div>
      <div>
        <div {...stylex.props(s.head)}>
          <span {...stylex.props(s.title)}>mem</span>
          <span>{((metrics.mem / 100) * 32).toFixed(1)} / 32 G</span>
        </div>
        <div {...stylex.props(s.grid)}>
          <Row label="used" v={metrics.mem} value={`${Math.round(metrics.mem)}%`} />
        </div>
      </div>
      <div>
        <div {...stylex.props(s.head)}>
          <span {...stylex.props(s.title)}>net</span>
          <span>wlan0 ↓ {Math.round(metrics.net.at(-1) ?? 0)} KB/s</span>
        </div>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden {...stylex.props(s.spark)}>
          <polygon points={`0,40 ${pts} 100,40`} {...stylex.props(s.area)} />
          <polyline points={pts} vectorEffect="non-scaling-stroke" {...stylex.props(s.line)} />
        </svg>
      </div>
      <table {...stylex.props(s.table)}>
        <thead>
          <tr>
            <th {...stylex.props(s.th)}>pid</th>
            <th {...stylex.props(s.th)}>program</th>
            <th {...stylex.props(s.th, s.num)}>cpu%</th>
          </tr>
        </thead>
        <tbody>
          {PROCS.map((p, i) => (
            <tr key={p.pid} {...stylex.props(i === 0 && s.sel)}>
              <td {...stylex.props(s.faint)}>{p.pid}</td>
              <td>{p.name}</td>
              <td {...stylex.props(s.num)}>{((metrics.cores[i % metrics.cores.length] ?? 0) * p.w * 0.2).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, v, value }: { label: string; v: number; value: string }) {
  return (
    <>
      <span {...stylex.props(s.faint)}>{label}</span>
      <Bar v={v} />
      <span {...stylex.props(s.val)}>{value}</span>
    </>
  );
}
