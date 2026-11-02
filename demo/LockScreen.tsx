"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { TextField } from "@/design/components/TextField";
import { LockPanel } from "@/design/shell/LockPanel";
import { color } from "@/design/tokens/color.stylex";
import { space } from "@/design/tokens/space.stylex";
import { formatClock, useNow } from "@/lib/use-clock";

const s = stylex.create({
  root: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    padding: space.u6,
    backgroundColor: color["--scrim"],
    backdropFilter: "blur(18px)",
  },
  form: { width: "100%" },
});

export function LockScreen({ interactive, onUnlock }: { interactive: boolean; onUnlock: () => void }) {
  const c = formatClock(useNow());
  const [pw, setPw] = useState("");
  return (
    <div role="dialog" aria-label="Lock screen" {...stylex.props(s.root)}>
      <LockPanel time={c.time} date={c.date} hint="Any password unlocks the demo. Press Enter. It works best with a keyboard.">
        <form
          {...stylex.props(s.form)}
          onSubmit={(e) => {
            e.preventDefault();
            setPw("");
            onUnlock();
          }}
        >
          <TextField
            label="Password"
            type="password"
            size="large"
            value={pw}
            onChange={setPw}
            isReadOnly={!interactive}
            excludeFromTabOrder={!interactive}
            autoFocus={interactive}
          />
        </form>
      </LockPanel>
    </div>
  );
}
