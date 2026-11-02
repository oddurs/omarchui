import * as stylex from "@stylexjs/stylex";
import type { CSSProperties } from "react";
import { Row, Rows } from "@/design/components/Rows";
import { Swatch } from "@/design/components/Swatch";
import { Tag } from "@/design/components/Tag";
import { Intro } from "@/design/patterns/Intro";
import { Box } from "@/design/primitives/Box";
import { Grid } from "@/design/primitives/Grid";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { typo, type TypeVariant } from "@/design/primitives/typography";
import { Bar } from "@/design/shell/Bar";
import { MenuPanel } from "@/design/shell/MenuPanel";
import { Toast } from "@/design/shell/Toast";
import { WindowFrame } from "@/design/shell/WindowFrame";
import { stock } from "@/design/tokens/chrome.stylex";
import { color } from "@/design/tokens/color.stylex";
import { focus } from "@/design/tokens/effect.stylex";
import { stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { contrast } from "@/lib/contrast";
import { ROLES, SLUGS, THEMES } from "@/lib/themes";
import { OMARCHY_PALETTES } from "@/lib/themes.generated";
import { Motion } from "@/site/sections/Motion";
import type { FoundationSlug } from "./registry";
import { DocSection } from "./ui/Section";
import { tokens, type TokenRow } from "./tokens";

const s = stylex.create({
  scroll: {
    overflowX: "auto",
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line"],
    outline: "none",
    ":focus-visible": { boxShadow: focus.ring },
  },
  table: { borderCollapse: "collapse", width: "100%" },
  matrix: { width: "max-content", minWidth: "100%" },
  nowrap: { whiteSpace: "nowrap" },
  th: {
    textAlign: "left",
    paddingBlock: space.u2,
    paddingInline: space.u3,
    color: color["--text-3"],
    backgroundColor: color["--sunken"],
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
    whiteSpace: "nowrap",
  },
  td: {
    paddingBlock: space.u2,
    paddingInline: space.u3,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: "solid",
    borderBottomColor: color["--line"],
    verticalAlign: "middle",
  },
  cell: { display: "block", width: space.u8, height: space.u6, borderWidth: stroke.hair, borderStyle: "solid", borderColor: color["--line-2"] },
  sr: { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" },
  code: { color: color["--text"], overflowWrap: "anywhere" },
  bar: { height: space.u2, backgroundColor: color["--accent"] },
  ring: {
    width: "120px",
    height: space.u10,
    backgroundColor: color["--surface"],
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
  },
  ringRing: { boxShadow: focus.ring },
  ringInset: { boxShadow: focus.inset },
  ringHalo: { boxShadow: focus.halo, borderColor: color["--accent"] },
  frame: { height: "88px" },
  frameBody: { paddingBlock: space.u2, paddingInline: space.u3 },
  good: { color: color["--ok"] },
  bad: { color: color["--err"] },
});

const dyn = stylex.create({
  bg: (c: string) => ({ backgroundColor: c }),
  w: (v: string) => ({ width: v }),
});

function Table({ head, rows, label }: { head: string[]; rows: React.ReactNode[][]; label: string }) {
  return (
    // Focusable so keyboard users can scroll it sideways on narrow screens.
    <div role="region" aria-label={label} tabIndex={0} {...stylex.props(s.scroll)}>
      <table aria-label={label} {...stylex.props(s.table)}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" {...stylex.props(typo.label, s.th)}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} {...stylex.props(typo.small, s.td)}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const code = (v: string) => <code {...stylex.props(typo.caption, s.code)}>{v}</code>;
const tokenRows = (rows: TokenRow[], prefix = "") =>
  rows.map((r) => [
    code(prefix + r.name),
    code(r.value),
    <Text key="d" as="span" variant="small" tone="muted">
      {r.doc ?? ""}
    </Text>,
  ]);

function ColorPage() {
  const roles = tokens.color().filter((r) => r.dark);
  const derived = tokens.color().filter((r) => !r.dark);
  return (
    <Stack gap="u12">
      <Intro size="page" title="Color">
        Eighteen roles named by job, derived by one rule from each of Omarchy&apos;s 23 colors.toml palettes. The defaults are Catppuccin Latte in light and
        Tokyo Night in dark. Components read roles only, never a theme&apos;s raw palette.
      </Intro>
      <DocSection title="Every role in every theme" id="matrix">
        <div role="region" aria-label="Roles by theme" tabIndex={0} {...stylex.props(s.scroll)}>
          <table aria-label="Roles by theme" {...stylex.props(s.table, s.matrix)}>
            <thead>
              <tr>
                <th scope="col" {...stylex.props(typo.label, s.th)}>
                  Role
                </th>
                {SLUGS.map((k) => (
                  <th key={k} scope="col" {...stylex.props(typo.label, s.th)}>
                    {THEMES[k].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r}>
                  <th scope="row" {...stylex.props(typo.caption, s.td, s.nowrap)}>
                    {code(`--${r}`)}
                  </th>
                  {SLUGS.map((k) => (
                    <td key={k} title={THEMES[k][r]} {...stylex.props(s.td)}>
                      <span aria-hidden {...stylex.props(s.cell, dyn.bg(THEMES[k][r]))} />
                      <span {...stylex.props(s.sr)}>{THEMES[k][r]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Text variant="small" tone="muted">
          Palettes are their authors&apos;. scripts/gen-themes.mts maps them to roles and nudges any ink, accent or spectrum colour that would fall under 4.5:1
          on a ground of its theme.
        </Text>
      </DocSection>
      <DocSection title="From colors.toml to roles" id="derive">
        <Table
          label="Derivation"
          head={["Role", "From colors.toml", "Then"]}
          rows={[
            ["surface", "background", ""],
            ["wall, sunken", "darker_background, dark_background", ""],
            ["raised", "lighter_background (dark themes); background mixed 60% toward white (light themes)", ""],
            ["line, line-2", "selection, muted", ""],
            ["text", "bright_foreground", "lightened or darkened to 7:1 on every ground"],
            ["text-2, text-3", "text mixed 20% and 42% toward surface", "held to 5.5:1 and 4.5:1 on every ground"],
            ["accent and the spectrum", "accent, red, green, yellow, blue, magenta, cyan, orange", "nudged away from the background until 4.5:1"],
            ["on-accent", "whichever of wall, text, black or white reads best on accent", ""],
          ].map(([a = "", b = "", c = ""]) => [
            code(a),
            b,
            <Text key="t" as="span" variant="small" tone="muted">
              {c}
            </Text>,
          ])}
        />
      </DocSection>
      <DocSection title="Contrast, theme by theme" id="contrast">
        <Table
          label="Lowest contrast per theme"
          head={["Theme", "Faintest ink", "Weakest spectrum", "Accent on surface", "On-accent"]}
          rows={SLUGS.map((k) => {
            const t = THEMES[k];
            const grounds = [t.wall, t.sunken, t.surface, t.raised];
            const min = (fgs: string[]) => Math.min(...fgs.flatMap((f) => grounds.map((g) => contrast(f, g))));
            const cells = [
              min([t.text, t["text-2"], t["text-3"]]),
              min([t.red, t.green, t.yellow, t.blue, t.magenta, t.cyan, t.orange]),
              contrast(t.accent, t.surface),
              contrast(t["on-accent"], t.accent),
            ];
            return [
              t.name,
              ...cells.map((r, i) => (
                <Text key={i} as="span" variant="small" face="mono" tabular>
                  <span {...stylex.props(r >= 4.5 ? s.good : s.bad)}>{r >= 4.5 ? "✓" : "✕"}</span> {r.toFixed(2)}:1
                </Text>
              )),
            ];
          })}
        />
      </DocSection>
      <DocSection title="Role tokens" id="tokens">
        <Table
          label="Role tokens"
          head={["Token", "Light", "Dark"]}
          rows={roles.map((r) => [code(`--${r.name.replace(/^--/, "")}`), code(r.value), code(r.dark ?? "")])}
        />
        <Text variant="small" tone="muted">
          Derived roles, computed from the ones above:
        </Text>
        <Table label="Derived tokens" head={["Token", "Value", "Note"]} rows={tokenRows(derived)} />
      </DocSection>
      <DocSection title="Using a role" id="use">
        <Grid layout="fitSm" gap="u3">
          <Swatch role="accent" fill="var(--accent)" use='color["--accent"] in StyleX' />
          <Swatch role="text-3" fill="var(--text-3)" use="Labels and hints; still AA." />
          <Swatch role="err" alias="red" fill="var(--red)" use="Errors, urgent windows" />
        </Grid>
      </DocSection>
    </Stack>
  );
}

/** Token sizes as a reader thinks of them: 1.75rem is 28px; a clamp is a fluid range. */
function asPx(v: string): string {
  const fluid = /^clamp\(([\d.]+)rem,.*,\s*([\d.]+)rem\)$/.exec(v);
  if (fluid?.[1] && fluid[2]) return `${Number(fluid[1]) * 16}–${Number(fluid[2]) * 16}px, fluid`;
  const rem = /^([\d.]+)rem$/.exec(v);
  return rem?.[1] ? `${Number(rem[1]) * 16}px` : v;
}

function TypePage() {
  const sizes = tokens.fontSize();
  const leading = new Map(tokens.leading().map((r) => [r.name, r.value]));
  return (
    <Stack gap="u12">
      <Intro size="page" title="Type">
        Two faces and eight sizes. If you would copy it into a terminal, set it in mono; if you would read it aloud, set it in sans. Each size comes with its
        line height, and a preset bundles both with a face and weight.
      </Intro>
      <DocSection title="Presets" id="presets">
        <Rows>
          {sizes.map((r) => (
            <Row key={r.name} layout="keyed">
              <Stack gap="u0">
                <Text as="span" variant="caption" face="mono" weight="semibold">
                  {r.name}
                </Text>
                <Text as="span" variant="caption" face="mono" tone="faint">
                  {asPx(r.value)} / {leading.get(r.name)}
                </Text>
              </Stack>
              <Text variant={r.name as TypeVariant} truncate>
                {r.name === "display" ? "14:32" : r.name === "label" ? "Network · connected" : "Design review moved to 15:00"}
              </Text>
            </Row>
          ))}
        </Rows>
      </DocSection>
      <DocSection title="Faces, weights, tracking" id="faces">
        <Table label="Faces" head={["Token", "Stack", ""]} rows={tokenRows(tokens.font())} />
        <Grid layout="two" gap="u4">
          <Table label="Weights" head={["Weight", "Value", ""]} rows={tokenRows(tokens.weight())} />
          <Table label="Tracking" head={["Tracking", "Value", ""]} rows={tokenRows(tokens.tracking())} />
        </Grid>
      </DocSection>
    </Stack>
  );
}

function SpacePage() {
  return (
    <Stack gap="u12">
      <Intro size="page" title="Space and size">
        One unit is 4px. Gaps and padding are steps of it; parts have fixed sizes on the same grid, so a menu row, a bar module and a control line up wherever
        they meet.
      </Intro>
      <DocSection title="Space scale" id="space">
        <Rows>
          {tokens.space().map((r) => (
            <Row key={r.name} layout="meter" density="tight">
              {code(r.name)}
              <span {...stylex.props(s.bar, dyn.w(r.value))} />
              <Text as="span" variant="small" face="mono" tone="muted">
                {r.value}
              </Text>
            </Row>
          ))}
        </Rows>
      </DocSection>
      <DocSection title="Part sizes" id="size">
        <Table label="Sizes" head={["Token", "Value", ""]} rows={tokenRows(tokens.size())} />
      </DocSection>
      <DocSection title="Strokes and breakpoints" id="stroke">
        <Grid layout="two" gap="u4">
          <Table label="Strokes" head={["Stroke", "Value", ""]} rows={tokenRows(tokens.stroke())} />
          <Table label="Breakpoints" head={["Breakpoint", "Query", ""]} rows={tokenRows(tokens.breakpoints())} />
        </Grid>
        <Text variant="small" tone="muted">
          Radius has no token: corners are square everywhere. That is a rule, not a missing value.
        </Text>
      </DocSection>
    </Stack>
  );
}

function DepthPage() {
  return (
    <Stack gap="u12">
      <Intro size="page" title="Depth and focus">
        Nothing casts a shadow. Layers step up in tone, from the wall to raised menus, and one focus language marks whatever has the keyboard or the pointer.
      </Intro>
      <DocSection title="Tone ladder" id="tone">
        <Box tone="wall" border="line" pad="u6">
          <Stack gap="u3">
            <Text variant="label" tone="faint">
              wall · desktop, bar, gaps
            </Text>
            <Box tone="sunken" border="line" pad="u4">
              <Text variant="label" tone="faint">
                sunken · fields, code, wells
              </Text>
            </Box>
            <Box tone="surface" border="line" pad="u6">
              <Stack gap="u3">
                <Text variant="label" tone="faint">
                  surface · windows, tiles
                </Text>
                <Box tone="raised" border="line-2" pad="u4">
                  <Text variant="label" tone="faint">
                    raised · menus, toasts, overlays
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DocSection>
      <DocSection title="Focus" id="focus">
        <Grid layout="three" gap="u6">
          {(
            [
              ["ring", s.ringRing, "Free-standing controls: buttons, segments, links."],
              ["inset", s.ringInset, "Where a ring would be clipped: list rows, bar buttons."],
              ["halo", s.ringHalo, "Windows and fields that already draw an accent border."],
            ] as const
          ).map(([name, st, use]) => (
            <Stack key={name} gap="u3">
              <span aria-hidden {...stylex.props(s.ring, st)} />
              {code(`focus.${name}`)}
              <Text variant="small" tone="muted">
                {use}
              </Text>
            </Stack>
          ))}
        </Grid>
        <Table label="Focus tokens" head={["Token", "Value", ""]} rows={tokenRows(tokens.focus())} />
      </DocSection>
      <DocSection title="Layers" id="layers">
        <Table label="Layers" head={["Layer", "z-index", ""]} rows={tokenRows(tokens.layer())} />
      </DocSection>
    </Stack>
  );
}

function MotionPage() {
  return (
    <Stack gap="u12">
      <Intro size="page" title="Motion">
        Motion confirms what you did and gets out of the way. Three durations and one curve; under reduced motion every duration is zero.
      </Intro>
      <DocSection title="Durations and curve" id="tokens">
        <Table
          label="Motion tokens"
          head={["Token", "Value", ""]}
          rows={tokens.motion().map((r) => [code(r.name), code(r.value), code(r.dark ? `reduced: ${r.dark}` : "")])}
        />
      </DocSection>
      <DocSection title="Feel them" id="demo">
        <Motion />
      </DocSection>
      <DocSection title="Rules" id="rules">
        <Stack gap="u2" as="ul">
          {[
            "Nothing bounces or overshoots.",
            "Text never fades in; it is there or it is not.",
            "Workspaces travel; windows move; hovers tick.",
            "Motion never delays input: a press acts at once and animates after.",
          ].map((r) => (
            <li key={r}>
              <Text tone="muted">{r}</Text>
            </li>
          ))}
        </Stack>
      </DocSection>
    </Stack>
  );
}

function Sample() {
  return (
    <Stack gap="u3">
      <Bar
        framed
        workspaces={[1, 2, 3].map((n) => ({ n, busy: n < 3, active: n === 1 }))}
        clock={{ day: "Sunday", time: "14:32" }}
        modules={[
          { id: "wifi", icon: "wifi", label: "Wifi", value: "home" },
          { id: "bat", icon: "battery", label: "Battery", value: "82", tone: "ok" },
        ]}
      />
      <div {...stylex.props(s.frame)}>
        <WindowFrame label="Sample window" active>
          <div {...stylex.props(s.frameBody)}>~ ❯ nvim .</div>
        </WindowFrame>
      </div>
      <Toast who="Calendar" title="Design review moved to 15:00" body="Same room." />
      <MenuPanel
        label="Sample menu"
        sel={0}
        listId="chrome-sample"
        search={
          <Text as="span" variant="small" tone="faint">
            Search
          </Text>
        }
        rows={[
          { key: "theme", glyph: "◐", name: "Theme", more: true },
          { key: "bg", glyph: "▨", name: "Next background" },
        ]}
      />
    </Stack>
  );
}

// Tokyo Night's roles and raw palette as custom properties, the way theme-runtime paints <html>.
const TOKYO_NIGHT = {
  ...Object.fromEntries(ROLES.map((r) => [`--${r}`, THEMES["tokyo-night"][r]])),
  ...OMARCHY_PALETTES["tokyo-night"],
  colorScheme: "dark",
} as CSSProperties;

function ChromePage() {
  const rows = tokens.chrome();
  return (
    <Stack gap="u12">
      <Intro size="page" title="Before and after">
        Structural tokens: how chrome is drawn, independent of colour. The defaults are the tuned proposal; the stock theme overrides them with Omarchy
        4.0&apos;s shipped values, read from its source. Before/after is nothing more than this theme.
      </Intro>
      <DocSection title="The same parts, both ways" id="sample">
        <Grid layout="halves" gap="u4">
          <Stack gap="u2">
            <Inline gap="u2">
              <Tag>Stock</Tag>
            </Inline>
            {/* Omarchy's own palette, pinned to its default theme so the sample reads the same in light and dark. */}
            <div style={TOKYO_NIGHT} {...stylex.props(stock)}>
              <Box tone="wall" border="line" pad="u4">
                <Sample />
              </Box>
            </div>
            <Text variant="small" tone="muted">
              Stock draws with Omarchy&apos;s colors.toml values as shipped, unadjusted. Shown in Tokyo Night, Omarchy&apos;s default. On Catppuccin Latte its
              selected menu row is accent on foreground at 8%, which measures 3.86:1, below WCAG AA.
            </Text>
          </Stack>
          <Stack gap="u2">
            <Inline gap="u2">
              <Tag>Tuned</Tag>
            </Inline>
            <Box tone="wall" border="line" pad="u4">
              <Sample />
            </Box>
          </Stack>
        </Grid>
      </DocSection>
      <DocSection title="Chrome tokens" id="tokens">
        <Table
          label="Chrome tokens"
          head={["Token", "Tuned", "Stock", "What it controls"]}
          rows={rows.map((r) => [
            code(r.name),
            code(r.value),
            code(r.stock),
            <Text key="d" as="span" variant="small" tone="muted">
              {r.doc ?? ""}
            </Text>,
          ])}
        />
      </DocSection>
    </Stack>
  );
}

export function Foundation({ slug }: { slug: FoundationSlug }) {
  switch (slug) {
    case "color":
      return <ColorPage />;
    case "type":
      return <TypePage />;
    case "space":
      return <SpacePage />;
    case "depth":
      return <DepthPage />;
    case "motion":
      return <MotionPage />;
    case "chrome":
      return <ChromePage />;
  }
}
