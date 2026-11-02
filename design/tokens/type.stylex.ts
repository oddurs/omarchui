import * as stylex from "@stylexjs/stylex";

/** Mono for what a machine wrote; sans for what a person reads as a sentence. */
export const font = stylex.defineVars({
  mono: 'var(--font-mono), "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  sans: 'var(--font-sans), "Instrument Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
});

/**
 * Eight sizes, each paired with a line height below. Nothing else may set a font size.
 * display and lede exist for pages; the desktop itself uses the six in between.
 */
export const fontSize = stylex.defineVars({
  display: "clamp(2.5rem, 5.4vw + 0.6rem, 4.75rem)",
  heading: "1.75rem",
  lede: "1.1875rem",
  title: "1.0625rem",
  body: "0.9375rem",
  small: "0.8125rem",
  caption: "0.75rem",
  label: "0.6875rem",
});

export const leading = stylex.defineVars({
  display: "0.95",
  heading: "1.2",
  lede: "1.55",
  title: "1.4",
  body: "1.6",
  small: "1.5",
  caption: "1.55",
  label: "1.45",
});

/** Three working weights, and heavy for display type only. */
export const weight = stylex.defineVars({
  regular: "400",
  medium: "500",
  semibold: "600",
  heavy: "800",
});

export const tracking = stylex.defineVars({
  display: "-0.045em",
  heading: "-0.012em",
  normal: "0",
  caps: "0.08em",
});
