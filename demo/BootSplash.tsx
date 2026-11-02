"use client";

import * as stylex from "@stylexjs/stylex";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { layer } from "@/design/tokens/layer.stylex";
import { machine } from "@/design/tokens/machine.stylex";
import { OMARCHY_COMMIT } from "@/lib/themes.generated";
import { LimineMenu } from "./Limine";

// Omarchy's boot, stage by stage, from its source at the pinned commit:
//   bootloader  Limine, quiet: nothing drawn for its 1s timeout; a key reveals its menu.  limine.conf:2-3
//   logo        Plymouth's logo alone, centred on the screen.          default/plymouth/omarchy.script:6-8,220-221
//   password    the disk passphrase: lock, entry, one bullet a key.    omarchy.script:112-128,133-189,223-232
//   progress    the bar, easing toward 70% until real progress leads.  omarchy.script:10-12,37-54,137-147,195-212
// The disk password is the login: encrypted installs autologin into Hyprland
// (bin/omarchy-provision-owner:765-774), where the shell lifts a black cover (demo/Power.tsx).
// The images are Omarchy's own, read from its repository at the pinned commit, not copied here.
const ASSETS = `https://raw.githubusercontent.com/basecamp/omarchy/${OMARCHY_COMMIT}/default/plymouth`;

const LOGO = { w: 800, h: 188 };
const ENTRY = { w: 286, h: 48 };
// The 84x96 lock is scaled to 80% of the entry's height. omarchy.script:122-127.
const LOCK = { h: ENTRY.h * 0.8, w: 84 * ((ENTRY.h * 0.8) / 96) };
const BAR = { w: 300, h: 10 };
const BULLET = 7;
const MAX_BULLETS = 21;

/** How long each stage before the password holds, in ms. Limine's timeout is 1s. */
const LOADER_MS = 1000;
const LOGO_MS = 700;
const HANDOFF_MS = 400;
// Fake progress eases (1 - (1 - t)^2) toward 70% over 15s. omarchy.script:10-12, 46-51.
const FAKE_LIMIT = 0.7;
const FAKE_MS = 15_000;
// Never wait on a slow image for long; Omarchy's own startup cover gives up after 10s.
const READY_CAP_MS = 4000;

// A key pressed while the server-rendered placeholder holds the bootloader stage still counts:
// the live splash mounts straight into Limine's menu.
let revealPending = false;

export type BootStage = "bootloader" | "limine" | "handoff" | "logo" | "password" | "progress";

const s = stylex.create({
  root: { position: "fixed", inset: 0, zIndex: layer.boot, overflow: "hidden", backgroundColor: machine.boot },
  // Quiet Limine paints nothing, so the firmware's image (black here) stays until Plymouth draws.
  // limine.json quiet.screen-kept, hand.quiet.
  dark: { backgroundColor: machine.black },
  stage: { position: "absolute", left: "50%", top: "50%", width: `${LOGO.w}px`, height: `${LOGO.h}px` },
  img: { position: "absolute", display: "block", userSelect: "none", pointerEvents: "none" },
  input: {
    position: "absolute",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    // Plymouth shows only bullets; the characters themselves are never drawn.
    color: "transparent",
    caretColor: "transparent",
    outline: "none",
    cursor: "default",
  },
});

const at = stylex.create({
  // Plymouth draws at the images' own pixel size; only a screen narrower than the logo scales down.
  stage: (k: number) => ({ transform: `translate(-50%, -50%) scale(${k})` }),
  box: (x: number, y: number, w: number, h: number) => ({ left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` }),
});

// Positions inside the logo's own box, which is centred on the screen. omarchy.script:216-241.
const entryX = LOGO.w / 2 - ENTRY.w / 2;
const entryY = LOGO.h + 40;
const lockX = entryX - LOCK.w - 15;
const lockY = entryY + ENTRY.h / 2 - LOCK.h / 2;
const barX = LOGO.w / 2 - BAR.w / 2;
const barY = entryY + ENTRY.h / 2 - BAR.h / 2;

/** Scale for screens narrower than the logo; 1 everywhere else, and on the server. */
function fit(): number {
  return typeof window === "undefined" ? 1 : Math.min(1, (window.innerWidth - 32) / LOGO.w);
}

type Props = {
  /** The first background, decoded while the splash is up so the desktop arrives complete. */
  wallpaper?: string;
  interactive: boolean;
  onDone: () => void;
  /** Hold at one stage: the server-rendered fallback shows the bootloader's blank backdrop. */
  hold?: BootStage;
};

export function BootSplash({ wallpaper, interactive, onDone, hold }: Props) {
  const [stage, setStage] = useState<BootStage>(() => hold ?? (revealPending ? "limine" : "bootloader"));
  const [pw, setPw] = useState("");
  const [progress, setProgress] = useState(0);
  const [k, setK] = useState(fit);
  const ready = useRef<Promise<void> | null>(null);
  const field = useRef<HTMLInputElement>(null);

  // The wallpaper decodes while the boot plays, as the shell prepares its first frame.
  useEffect(() => {
    if (!wallpaper) return;
    const img = new window.Image();
    img.src = wallpaper;
    ready.current = img.decode().catch(() => undefined);
  }, [wallpaper]);

  useEffect(() => {
    if (!hold) {
      revealPending = false;
      return;
    }
    const onKey = () => {
      revealPending = true;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hold]);

  // Bootloader (quiet: a key reveals Limine's menu), then the logo alone, then the passphrase.
  useEffect(() => {
    if (hold) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next: Partial<Record<BootStage, [BootStage, number]>> = {
      bootloader: ["logo", LOADER_MS],
      // Booting from the revealed menu clears to black before the kernel starts. limine.json hand.revealed.
      handoff: ["logo", HANDOFF_MS],
      logo: ["password", LOGO_MS],
    };
    const step = next[stage];
    if (!step) return;
    const t = window.setTimeout(() => setStage(step[0]), reduced ? 0 : step[1]);
    // Only the keyboard reveals the menu; the mouse is not set up in quiet mode. quiet.reveal, quiet.no-mouse.
    const onKey = (e: KeyboardEvent) => {
      if (stage !== "bootloader" || !interactive) return;
      e.preventDefault();
      window.clearTimeout(t);
      setStage("limine");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [hold, stage, interactive]);

  useEffect(() => {
    if (stage === "password" && interactive) field.current?.focus({ preventScroll: true });
  }, [stage, interactive]);

  useEffect(() => {
    if (stage !== "progress") return;
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
    const minimum = new Promise((r) => setTimeout(r, reduced ? 0 : 900));
    const loaded = Promise.race([ready.current, new Promise((r) => setTimeout(r, READY_CAP_MS))]);
    // Real progress takes over once it passes the fake, and Plymouth quits at the end.
    Promise.all([loaded, minimum]).then(() => {
      if (!live) return;
      cancelAnimationFrame(raf);
      setProgress(1);
      setTimeout(() => live && onDone(), reduced ? 0 : 200);
    });
    return () => {
      live = false;
      cancelAnimationFrame(raf);
    };
  }, [stage, onDone]);

  useEffect(() => {
    const onResize = () => setK(fit());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const filled = Math.max(1, Math.round(BAR.w * progress));
  return (
    <div
      role="dialog"
      aria-label="Boot"
      data-stage={stage}
      data-live={interactive || undefined}
      {...stylex.props(s.root, (stage === "bootloader" || stage === "handoff") && s.dark)}
    >
      {stage === "limine" && <LimineMenu now={new Date()} onBoot={() => setStage("handoff")} />}
      {(stage === "logo" || stage === "password" || stage === "progress") && (
        <div {...stylex.props(s.stage, at.stage(k))}>
          <Image
            src={`${ASSETS}/logo.png`}
            alt="Omarchy"
            width={LOGO.w}
            height={LOGO.h}
            unoptimized
            priority
            {...stylex.props(s.img, at.box(0, 0, LOGO.w, LOGO.h))}
          />
          {stage === "password" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (interactive) setStage("progress");
              }}
            >
              <Image
                src={`${ASSETS}/lock.png`}
                alt=""
                width={84}
                height={96}
                unoptimized
                loading="eager"
                {...stylex.props(s.img, at.box(lockX, lockY, LOCK.w, LOCK.h))}
              />
              <Image
                src={`${ASSETS}/entry.png`}
                alt=""
                width={ENTRY.w}
                height={ENTRY.h}
                unoptimized
                loading="eager"
                {...stylex.props(s.img, at.box(entryX, entryY, ENTRY.w, ENTRY.h))}
              />
              {Array.from({ length: Math.min(pw.length, MAX_BULLETS) }, (_, i) => (
                <Image
                  key={i}
                  src={`${ASSETS}/bullet.png`}
                  alt=""
                  width={14}
                  height={14}
                  unoptimized
                  loading="eager"
                  {...stylex.props(s.img, at.box(entryX + 20 + i * (BULLET + 5), entryY + ENTRY.h / 2 - BULLET / 2, BULLET, BULLET))}
                />
              ))}
              <input
                ref={field}
                type="password"
                aria-label="Password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                readOnly={!interactive}
                tabIndex={interactive ? 0 : -1}
                autoComplete="off"
                {...stylex.props(s.input, at.box(entryX, entryY, ENTRY.w, ENTRY.h))}
              />
            </form>
          )}
          {stage === "progress" && (
            <div
              role="progressbar"
              aria-label="Starting"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              {...stylex.props(s.img, at.box(barX, barY, BAR.w, BAR.h))}
            >
              <Image
                src={`${ASSETS}/progress_box.png`}
                alt=""
                width={BAR.w}
                height={BAR.h}
                unoptimized
                loading="eager"
                {...stylex.props(s.img, at.box(0, 0, BAR.w, BAR.h))}
              />
              {/* The bar image is scaled to the progress width, as update_progress_bar does. omarchy.script:62-72. */}
              <Image
                src={`${ASSETS}/progress_bar.png`}
                alt=""
                width={BAR.w}
                height={BAR.h}
                unoptimized
                loading="eager"
                {...stylex.props(s.img, at.box(0, 0, filled, BAR.h))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
