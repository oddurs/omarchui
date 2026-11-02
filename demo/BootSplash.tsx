"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { face, typo } from "@/design/primitives/typography";
import { Mark } from "@/design/shell/Icon";
import { layer } from "@/design/tokens/layer.stylex";
import { omarchy } from "@/design/tokens/omarchy.stylex";

// Omarchy's Plymouth splash (default/plymouth/omarchy.script): the logo centred on the theme
// background; 40px below it a 286x48 password field with a lock to its left; once the password
// is in, a 300x10 progress bar in the field's place. Omarchui shows its own mark, not Omarchy's logo.
const s = stylex.create({
  root: {
    position: "fixed",
    inset: 0,
    zIndex: layer.boot,
    display: "grid",
    placeItems: "center",
    backgroundColor: omarchy["--o-background"],
    color: omarchy["--o-foreground"],
  },
  // The logo sits on the centre line; what is below it hangs from its bottom edge. omarchy.script:216-241.
  logo: { position: "relative", display: "grid", placeItems: "center" },
  below: { position: "absolute", top: "calc(100% + 40px)", left: "50%", transform: "translateX(-50%)", display: "grid", placeItems: "center" },
  field: { position: "relative", width: "286px", height: "48px" },
  input: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    padding: 0,
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: omarchy["--o-foreground"],
    backgroundColor: "transparent",
    // The typed text is drawn as dots below; the real characters stay invisible.
    color: "transparent",
    caretColor: "transparent",
    outline: "none",
    ":focus-visible": { borderColor: omarchy["--o-accent"] },
  },
  // Lock at 80% of the field's height, 15px to its left. omarchy.script:122-128, 227-229.
  lock: { position: "absolute", right: "calc(100% + 15px)", top: "50%", transform: "translateY(-50%)", width: "34px", height: "38px" },
  dots: { position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "5px", pointerEvents: "none" },
  dot: { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: omarchy["--o-foreground"] },
  box: { position: "relative", width: "300px", height: "10px", backgroundColor: omarchy["--o-lighter-background"] },
  bar: { position: "absolute", inset: 0, transformOrigin: "left", backgroundColor: omarchy["--o-foreground"] },
  hint: { position: "absolute", top: "calc(100% + 24px)", margin: 0, whiteSpace: "nowrap", color: omarchy["--o-foreground"], opacity: 0.6 },
});

const fill = stylex.create({ to: (p: number) => ({ transform: `scaleX(${p})` }) });

// Omarchy eases its stand-in progress toward 70% (ease-out quadratic) until real progress
// overtakes it. omarchy.script:10-54. Here the real work is the first wallpaper loading.
const FAKE_LIMIT = 0.7;
const FAKE_MS = 1600;

type Props = {
  /** The first background, decoded while the splash is up so the desktop arrives complete. */
  wallpaper?: string;
  interactive: boolean;
  onDone: () => void;
};

export function BootSplash({ wallpaper, interactive, onDone }: Props) {
  const [pw, setPw] = useState("");
  const [booting, setBooting] = useState(false);
  const [progress, setProgress] = useState(0);
  const ready = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!wallpaper) return;
    const img = new Image();
    img.src = wallpaper;
    ready.current = img.decode().catch(() => undefined);
  }, [wallpaper]);

  useEffect(() => {
    if (!booting) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let live = true;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / FAKE_MS);
      setProgress(FAKE_LIMIT * (1 - (1 - t) * (1 - t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    if (!reduced) raf = requestAnimationFrame(tick);
    const minimum = new Promise((r) => setTimeout(r, reduced ? 0 : 700));
    // Never wait on a slow image for long; the desktop draws the theme colour until it lands.
    // Omarchy's own startup cover gives up after 10s. BackgroundIntro.qml:167-188.
    const loaded = Promise.race([ready.current, new Promise((r) => setTimeout(r, 4000))]);
    Promise.all([loaded, minimum]).then(() => {
      if (!live) return;
      cancelAnimationFrame(raf);
      setProgress(1);
      setTimeout(() => live && onDone(), reduced ? 0 : 180);
    });
    return () => {
      live = false;
      cancelAnimationFrame(raf);
    };
  }, [booting, onDone]);

  return (
    <div role="dialog" aria-label="Boot" {...stylex.props(s.root)}>
      <div {...stylex.props(s.logo)}>
        <Mark display />
        <div {...stylex.props(s.below)}>
          {booting ? (
            <div
              role="progressbar"
              aria-label="Starting"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              {...stylex.props(s.box)}
            >
              <div {...stylex.props(s.bar, fill.to(progress))} />
            </div>
          ) : (
            <form
              {...stylex.props(s.field)}
              onSubmit={(e) => {
                e.preventDefault();
                if (interactive) setBooting(true);
              }}
            >
              <svg viewBox="0 0 84 96" aria-hidden {...stylex.props(s.lock)}>
                <path
                  fill="currentColor"
                  d="M42 0a28 28 0 0 0-28 28v12H8a8 8 0 0 0-8 8v40a8 8 0 0 0 8 8h68a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8h-6V28A28 28 0 0 0 42 0zm0 12a16 16 0 0 1 16 16v12H26V28a16 16 0 0 1 16-16zm0 44a8 8 0 0 1 4 15v9h-8v-9a8 8 0 0 1 4-15z"
                />
              </svg>
              <input
                type="password"
                aria-label="Password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                readOnly={!interactive}
                tabIndex={interactive ? 0 : -1}
                autoFocus={interactive}
                autoComplete="off"
                {...stylex.props(s.input)}
              />
              <span aria-hidden {...stylex.props(s.dots)}>
                {Array.from({ length: Math.min(pw.length, 21) }, (_, i) => (
                  <span key={i} {...stylex.props(s.dot)} />
                ))}
              </span>
            </form>
          )}
          {!booting && <p {...stylex.props(typo.caption, face.mono, s.hint)}>Any password, then Enter. Alt stands in for Super.</p>}
        </div>
      </div>
    </div>
  );
}
