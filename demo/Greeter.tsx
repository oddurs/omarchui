"use client";

import * as stylex from "@stylexjs/stylex";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { layer } from "@/design/tokens/layer.stylex";
import { machine } from "@/design/tokens/machine.stylex";
import { OMARCHY_COMMIT } from "@/lib/themes.generated";

// Omarchy's SDDM greeter, as default/sddm/omarchy/Main.qml lays it out. It shows after a logout:
// encrypted installs autologin only at boot (bin/omarchy-provision-owner:765-774). The images are
// Omarchy's own, read from its repository at the pinned commit.
const ASSETS = `https://raw.githubusercontent.com/basecamp/omarchy/${OMARCHY_COMMIT}/default/sddm/omarchy`;

const LOGO = { w: 800, h: 188 };
const ENTRY = { w: 286, h: 48 };
// The 84x96 lock fitted into 34x38 keeps its aspect: 33.25 x 38. Main.qml:50-56.
const LOCK = { w: 84 * (38 / 96), h: 38 };

const s = stylex.create({
  root: { position: "fixed", inset: 0, zIndex: layer.boot, display: "grid", placeItems: "center", backgroundColor: machine.boot },
  // A centred column, 40px between the logo and the password row. Main.qml:33-35.
  column: { display: "flex", flexDirection: "column", alignItems: "center", gap: "40px" },
  // The logo is at most its own width and 80% of the screen's. Main.qml:37-44.
  logo: { display: "block", width: `min(${LOGO.w}px, 80vw)`, height: "auto" },
  // Lock, 15px, then the entry, vertically centred together. Main.qml:46-56.
  row: { display: "flex", alignItems: "center", gap: "15px" },
  lock: { display: "block", width: `${LOCK.w}px`, height: `${LOCK.h}px` },
  entry: { position: "relative", width: `${ENTRY.w}px`, height: `${ENTRY.h}px` },
  fill: { position: "absolute", inset: 0, display: "block" },
  // Bullets from 20px in, 5px apart, at most 21. Main.qml:68-83.
  dots: { position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "5px", pointerEvents: "none" },
  dot: { display: "block", width: "7px", height: "7px" },
  input: {
    position: "absolute",
    inset: 0,
    width: "100%",
    paddingBlock: 0,
    paddingInline: "20px",
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "transparent",
    caretColor: "transparent",
    outline: "none",
    cursor: "default",
  },
});

export function Greeter({ interactive, onLogin }: { interactive: boolean; onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [failed, setFailed] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (interactive) field.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <div role="dialog" aria-label="Login" {...stylex.props(s.root)}>
      <div {...stylex.props(s.column)}>
        <Image src={`${ASSETS}/logo.png`} alt="Omarchy" width={LOGO.w} height={LOGO.h} unoptimized priority {...stylex.props(s.logo)} />
        <form
          {...stylex.props(s.row)}
          onSubmit={(e) => {
            e.preventDefault();
            if (!interactive) return;
            // Any password logs in to the demo; an empty one fails, as SDDM's login would.
            // A failure clears the field and swaps in the red entry and lock. Main.qml:21-31.
            if (pw) onLogin();
            else setFailed(true);
            setPw("");
          }}
        >
          <Image src={`${ASSETS}/${failed ? "lock-failed" : "lock"}.png`} alt="" width={84} height={96} unoptimized loading="eager" {...stylex.props(s.lock)} />
          <span {...stylex.props(s.entry)}>
            <Image
              src={`${ASSETS}/${failed ? "entry-failed" : "entry"}.png`}
              alt=""
              width={ENTRY.w}
              height={ENTRY.h}
              unoptimized
              loading="eager"
              {...stylex.props(s.fill)}
            />
            <span aria-hidden {...stylex.props(s.dots)}>
              {Array.from({ length: Math.min(pw.length, 21) }, (_, i) => (
                <Image key={i} src={`${ASSETS}/bullet.png`} alt="" width={14} height={14} unoptimized loading="eager" {...stylex.props(s.dot)} />
              ))}
            </span>
            <input
              ref={field}
              type="password"
              aria-label="Password"
              aria-invalid={failed || undefined}
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setFailed(false);
              }}
              readOnly={!interactive}
              tabIndex={interactive ? 0 : -1}
              autoComplete="off"
              {...stylex.props(s.input)}
            />
          </span>
        </form>
      </div>
    </div>
  );
}
