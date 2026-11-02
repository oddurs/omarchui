"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { LockField, LockPanel } from "@/design/shell/LockPanel";
import { space } from "@/design/tokens/space.stylex";

const s = stylex.create({
  // The wallpaper, heavily blurred with contrast eased, behind one field. LockView.qml:109-133.
  root: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    padding: space.u6,
    backdropFilter: "blur(48px) contrast(0.92)",
  },
  form: { width: "100%" },
});

export function LockScreen({ interactive, onUnlock }: { interactive: boolean; onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  return (
    <div role="dialog" aria-label="Lock screen" {...stylex.props(s.root)}>
      <LockPanel hint="Any password unlocks the demo. Press Enter. It works best with a keyboard.">
        <form
          {...stylex.props(s.form)}
          onSubmit={(e) => {
            e.preventDefault();
            setPw("");
            onUnlock();
          }}
        >
          <LockField value={pw} onChange={(e) => setPw(e.target.value)} readOnly={!interactive} tabIndex={interactive ? 0 : -1} autoFocus={interactive} />
        </form>
      </LockPanel>
    </div>
  );
}
