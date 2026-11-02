"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { Text } from "@/design/primitives/Text";
import { typo } from "@/design/primitives/typography";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { layer } from "@/design/tokens/layer.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { isPart, PARTS, REF_COMMIT, REF_VERSION, type Measure, type PartId, type Probe } from "@/lib/reference";

const s = stylex.create({
  outline: {
    position: "fixed",
    zIndex: layer.flash,
    pointerEvents: "none",
    outlineWidth: stroke.strong,
    outlineStyle: "dashed",
    outlineColor: color["--accent"],
    outlineOffset: "2px",
  },
  card: {
    position: "fixed",
    zIndex: layer.flash,
    width: "min(420px, calc(100vw - 24px))",
    padding: space.u4,
    display: "grid",
    gap: space.u3,
    backgroundColor: color["--raised"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
    pointerEvents: "none",
  },
  pinned: { pointerEvents: "auto", borderColor: color["--accent"], boxShadow: focus.halo },
  head: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: space.u3 },
  side: { color: color["--accent"] },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontWeight: 500,
    color: color["--text-3"],
    paddingBlock: space.u1,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
  },
  td: {
    verticalAlign: "top",
    paddingBlock: space.u1,
    paddingRight: space.u2,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
  },
  match: { color: color["--ok"] },
  off: { color: color["--warn"] },
  link: { color: color["--text-3"], textDecorationLine: "underline", textDecorationColor: color["--line-2"], ":hover": { color: color["--accent"] } },
});

const pos = stylex.create({
  box: (x: number, y: number, w: number, h: number) => ({ left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` }),
  at: (x: number, y: number) => ({ left: `${x}px`, top: `${y}px` }),
});

type Hit = { part: PartId; side: "stock" | "tuned"; rect: DOMRect; values: (string | null)[]; x: number; y: number };

function read(el: Element, probe: Probe): string {
  const cs = getComputedStyle(el);
  const v = cs[probe];
  if (probe === "fontFamily")
    return (
      v
        .split(",")[0]
        ?.replace(/["']/g, "")
        .replace(/^var\(.*\)$/, "") ?? v
    );
  if (probe === "boxShadow") return v === "none" ? "none" : "halo";
  if (probe === "fontWeight") return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? `${Math.round(n * 10) / 10}px` : v;
}

const same = (rendered: string | null, ref: string) => rendered !== null && parseFloat(rendered) === parseFloat(ref);

/** The first path:lines in a source string, linked at the pinned commit. */
function Source({ src }: { src: string }) {
  const m = /((?:[\w.-]+\/)+[\w.-]+)(?::(\d+)(?:[-,](\d+))?)?/.exec(src);
  if (!m?.[1]) return <span>{src}</span>;
  const href = `https://github.com/basecamp/omarchy/blob/${REF_COMMIT}/${m[1]}${m[2] ? `#L${m[2]}${m[3] ? `-L${m[3]}` : ""}` : ""}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...stylex.props(s.link)}>
      {m[0]}
    </a>
  );
}

function measure(target: Element, ms: Measure[]): (string | null)[] {
  return ms.map((x) => {
    if (!x.probe) return null;
    const el = (x.in && target.querySelector(x.in)) || target;
    return read(el, x.probe);
  });
}

type Props = { enabled: boolean; split: number | null };

/**
 * Reference mode: hover any part of the desktop to compare what is rendered with what
 * Omarchy ships (stock) or what the tuned token says. Click pins the card; Escape releases it.
 */
export function Inspector({ enabled, split }: Props) {
  const [hit, setHit] = useState<Hit | null>(null);
  const [pinned, setPinned] = useState(false);
  const pinnedRef = useRef(false);

  useEffect(() => {
    pinnedRef.current = pinned;
  }, [pinned]);

  useEffect(() => {
    if (!enabled) return;
    const locate = (x: number, y: number): Hit | null => {
      const live = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-screen=live] [data-ref]");
      if (!live || !isPart(live.dataset.ref)) return null;
      let target: HTMLElement = live;
      // Under the divider, the stock copy is drawn over the live one but takes no pointer.
      if (split !== null && x < window.innerWidth * split) {
        const key = live.dataset.refKey;
        const sel = key ? `[data-ref-key="${CSS.escape(key)}"]` : `[data-ref="${live.dataset.ref}"]`;
        target = document.querySelector<HTMLElement>(`[data-screen=before] ${sel}`) ?? live;
      }
      const side = target.closest<HTMLElement>("[data-mode]")?.dataset.mode === "stock" ? "stock" : "tuned";
      const part = live.dataset.ref as PartId;
      return { part, side, rect: target.getBoundingClientRect(), values: measure(target, PARTS[part].measures), x, y };
    };
    const onMove = (e: PointerEvent) => {
      if (!pinnedRef.current) setHit(locate(e.clientX, e.clientY));
    };
    const onClick = (e: MouseEvent) => {
      if (exempt(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      if (pinnedRef.current) {
        setPinned(false);
        setHit(locate(e.clientX, e.clientY));
      } else {
        const h = locate(e.clientX, e.clientY);
        setHit(h);
        setPinned(h !== null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pinnedRef.current) {
        e.stopPropagation();
        setPinned(false);
        setHit(null);
      }
    };
    window.addEventListener("pointermove", onMove, { capture: true });
    window.addEventListener("click", onClick, { capture: true });
    window.addEventListener("pointerdown", stopIfInside, { capture: true });
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      window.removeEventListener("pointermove", onMove, { capture: true });
      window.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("pointerdown", stopIfInside, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
      setHit(null);
      setPinned(false);
    };
  }, [enabled, split]);

  if (!enabled || !hit) return null;
  const part = PARTS[hit.part];
  const r = hit.rect;
  const cardX = Math.min(Math.max(12, hit.x + 16), window.innerWidth - 432);
  const cardY = hit.y + 16 + 260 > window.innerHeight ? Math.max(12, hit.y - 276) : hit.y + 16;

  return (
    <>
      <div aria-hidden {...stylex.props(s.outline, pos.box(r.left, r.top, r.width, r.height))} />
      <div data-inspector role="dialog" aria-label={`${part.name} reference`} {...stylex.props(s.card, pinned && s.pinned, pos.at(cardX, cardY))}>
        <div {...stylex.props(s.head)}>
          <Text as="span" variant="title">
            {part.name}
          </Text>
          <span {...stylex.props(typo.label, s.side)}>{hit.side === "stock" ? `Omarchy ${REF_VERSION}` : "Tuned"}</span>
        </div>
        <table {...stylex.props(typo.caption, s.table)}>
          <thead>
            <tr>
              <th {...stylex.props(s.th)}>Measure</th>
              <th {...stylex.props(s.th)}>Rendered</th>
              <th {...stylex.props(s.th)}>{hit.side === "stock" ? "Omarchy source" : "Token"}</th>
            </tr>
          </thead>
          <tbody>
            {part.measures.map((x, i) => {
              const v = hit.values[i] ?? null;
              const ref = hit.side === "stock" ? x.omarchy : x.tuned;
              return (
                <tr key={x.label}>
                  <td {...stylex.props(s.td)}>{x.label}</td>
                  <td {...stylex.props(s.td, v !== null && (same(v, ref) ? s.match : s.off))}>{v ?? "—"}</td>
                  <td {...stylex.props(s.td)}>
                    {hit.side === "stock" ? (
                      <>
                        {x.omarchy} · <Source src={x.src} />
                      </>
                    ) : (
                      x.tuned
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Text variant="caption" tone="faint">
          {pinned ? "Pinned. Click anywhere or press Esc to release." : "Click to pin."} Green matches the reference; amber differs.
        </Text>
      </div>
    </>
  );
}

/** The card itself and the demo's dock keep working while inspecting. */
function exempt(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("[data-inspector], [data-dock]") !== null;
}

function stopIfInside(e: PointerEvent) {
  // While inspecting, a press must not focus windows or press buttons on the desktop.
  if (!exempt(e.target)) e.stopPropagation();
}
