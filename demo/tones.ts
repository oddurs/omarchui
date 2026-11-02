import * as stylex from "@stylexjs/stylex";
import { color } from "@/design/tokens/color.stylex";
import type { Tone } from "@/lib/shell";

export const tones = stylex.create({
  accent: { color: color["--accent"] },
  green: { color: color["--green"] },
  red: { color: color["--red"] },
  yellow: { color: color["--yellow"] },
  blue: { color: color["--blue"] },
  magenta: { color: color["--magenta"] },
  cyan: { color: color["--cyan"] },
  orange: { color: color["--orange"] },
  dim: { color: color["--text-3"] },
  muted: { color: color["--text-2"] },
}) satisfies Record<Tone, unknown>;
