import { THEMES } from "./themes";

const t = THEMES["tokyo-night"];

/** Shared artwork for the Open Graph and Apple touch images: the mark on Tokyo Night. */
export function MarkArt({ size, title, subtitle }: { size: number; title?: string; subtitle?: string }) {
  const unit = size / 32;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: unit * 4,
        padding: unit * 3,
        background: t.wall,
        color: t.text,
        fontFamily: "monospace",
      }}
    >
      <div style={{ display: "flex", gap: unit * 1.5, flexShrink: 0 }}>
        <div style={{ width: unit * 11, height: unit * 22, background: t.accent }} />
        <div style={{ display: "flex", flexDirection: "column", gap: unit * 1.5 }}>
          <div style={{ width: unit * 7.5, height: unit * 10.25, border: `${unit * 0.75}px solid ${t["text-2"]}` }} />
          <div style={{ width: unit * 7.5, height: unit * 10.25, border: `${unit * 0.75}px solid ${t["text-2"]}` }} />
        </div>
      </div>
      {title && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: "-0.04em" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 32, color: t["text-2"], maxWidth: 700 }}>{subtitle}</div>}
        </div>
      )}
    </div>
  );
}
