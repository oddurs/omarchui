import type { Metrics } from "./state";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** A random walk that looks like a desktop at rest: mostly idle, the odd spike. */
export function step(m: Metrics, rand: () => number = Math.random): Metrics {
  return {
    cores: m.cores.map((v) => clamp(v + (rand() - 0.55) * 24 + (rand() > 0.94 ? 40 : 0), 2, 97)),
    mem: clamp(m.mem + (rand() - 0.5) * 2.5, 30, 72),
    net: [...m.net.slice(1), clamp((m.net.at(-1) ?? 30) + (rand() - 0.5) * 40, 2, 120)],
  };
}
