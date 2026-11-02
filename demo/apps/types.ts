import type { Dispatch } from "react";
import type { Command } from "@/lib/commands";
import type { Action, Metrics, Win } from "../state";

export type AppProps<W extends Win["data"]["kind"] = Win["data"]["kind"]> = {
  win: Win & { data: Extract<Win["data"], { kind: W }> };
  /** Focused, keyboard-live, and not behind an overlay. */
  live: boolean;
  /** False for the read-only copy drawn under the before/after divider. */
  interactive: boolean;
  dispatch: Dispatch<Action>;
  exec: (c: Command) => void;
  metrics: Metrics;
};
