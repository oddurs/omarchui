"use client";

import * as stylex from "@stylexjs/stylex";
import { CodeBlock } from "@/design/components/CodeBlock";
import { color } from "@/design/tokens/color.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { themePath, themeTokens, themeToml } from "@/lib/theme-file";
import { useTheme } from "../use-theme";

const s = stylex.create({
  comment: { color: color["--text-3"] },
  section: { color: color["--magenta"] },
  str: { color: color["--green"] },
  swatch: {
    display: "inline-block",
    width: "0.85em",
    height: "0.85em",
    marginLeft: "0.7em",
    verticalAlign: "-0.1em",
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
  },
});

const dyn = stylex.create({ bg: (c: string) => ({ backgroundColor: c }) });

/** The proposed theme.toml for whichever theme is on screen, coloured and copyable. */
export function ThemeFileView() {
  const { slug } = useTheme();
  return (
    <CodeBlock title={themePath(slug)} copy={themeToml(slug)}>
      {themeTokens(slug).map((t, i) => {
        switch (t.kind) {
          case "blank":
            return "\n";
          case "comment":
            return <span key={i} {...stylex.props(s.comment)}>{`# ${t.text}\n`}</span>;
          case "section":
            return <span key={i} {...stylex.props(s.section)}>{`[${t.text}]\n`}</span>;
          case "pair":
            return (
              <span key={i}>
                {t.swatch ? t.key.padEnd(10) + "= " : `${t.key} = `}
                <span {...stylex.props(s.str)}>&quot;{t.value}&quot;</span>
                {t.swatch && <span aria-hidden {...stylex.props(s.swatch, dyn.bg(t.swatch))} />}
                {"\n"}
              </span>
            );
        }
      })}
    </CodeBlock>
  );
}
