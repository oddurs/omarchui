"use client";

import * as stylex from "@stylexjs/stylex";
import { useState, type ReactNode } from "react";
import { Button } from "@/design/components/Button";
import { Segmented } from "@/design/components/Segmented";
import { Switch } from "@/design/components/Switch";
import { TextField } from "@/design/components/TextField";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { stock } from "@/design/tokens/chrome.stylex";

/** Wraps the parts grid in the stock chrome theme on demand: before/after for components. */
export function PartsCompare({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"stock" | "tuned">("tuned");
  return (
    <Stack gap="u4">
      <Inline gap="u4" wrap>
        <Segmented
          label="Draw parts as"
          value={mode}
          onChange={setMode}
          options={[
            { id: "stock", label: "Stock" },
            { id: "tuned", label: "Tuned" },
          ]}
        />
        <Text as="span" variant="small" tone="faint">
          Same markup, same colors. Only the chrome tokens change.
        </Text>
      </Inline>
      <div data-mode={mode} {...stylex.props(mode === "stock" && stock)}>
        {children}
      </div>
    </Stack>
  );
}

/** The setup-prompt sample: a field, a toggle and one primary action. */
export function SetupSample() {
  return (
    <Stack gap="u4">
      <TextField label="Hostname" defaultValue="omarchy" description="Letters, digits and hyphens." mono />
      <Switch defaultSelected>Night light after sunset</Switch>
      <Inline gap="u2">
        <Button variant="primary">Save</Button>
        <Button>Cancel</Button>
      </Inline>
    </Stack>
  );
}

export function LockSample() {
  return <TextField label="Password" type="password" defaultValue="omarchui" size="large" />;
}
