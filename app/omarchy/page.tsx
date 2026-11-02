import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Chord } from "@/design/components/Kbd";
import { Tag } from "@/design/components/Tag";
import { TextLink } from "@/design/components/TextLink";
import { Intro } from "@/design/patterns/Intro";
import { Box } from "@/design/primitives/Box";
import { Grid } from "@/design/primitives/Grid";
import { Inline, Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { typo } from "@/design/primitives/typography";
import { bp } from "@/design/tokens/breakpoints.stylex";
import { color } from "@/design/tokens/color.stylex";
import { size, stroke } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Bindings, type BindingRow } from "@/docs/omarchy/Bindings";
import { Cite } from "@/docs/omarchy/Cite";
import { facts, REPO, type Dict, type Theme } from "@/docs/omarchy/data";
import { FactDict, FactTable, Sub } from "@/docs/omarchy/Facts";
import { MenuTree } from "@/docs/omarchy/MenuTree";
import { NavLinks } from "@/docs/ui/SideNav";
import { Header } from "@/site/Header";

export const metadata: Metadata = {
  title: "How Omarchy is built",
  description: `A cited map of Omarchy ${facts.version}'s interface: repository, theme system, Hyprland, every keybinding, the bar, the full menu tree, shell services, type and spacing.`,
  alternates: { canonical: "/omarchy" },
};

const SECTIONS = [
  ["different", "A different desktop"],
  ["repo", "Repository"],
  ["themes-system", "Theme system"],
  ["themes", "Every theme"],
  ["hyprland", "Hyprland"],
  ["bindings", "Keybindings"],
  ["bar", "The bar"],
  ["menu", "The Omarchy menu"],
  ["shell", "Shell services"],
  ["terminals", "Terminals and fonts"],
  ["type-space", "Type and spacing"],
  ["apps", "Apps and boot"],
  ["checked", "Omarchui, checked"],
  ["unknown", "Not in the source"],
] as const;

const s = stylex.create({
  page: {
    maxWidth: size.page,
    marginInline: "auto",
    paddingBlock: `${space.u8} ${space.u16}`,
    paddingLeft: `max(${space.u4}, env(safe-area-inset-left, 0px))`,
    paddingRight: `max(${space.u4}, env(safe-area-inset-right, 0px))`,
    display: "grid",
    gap: { default: space.u8, [bp.lg]: space.u12 },
    gridTemplateColumns: { default: "minmax(0, 1fr)", [bp.lg]: "200px minmax(0, 1fr)" },
    alignItems: "start",
  },
  main: { minWidth: 0, outline: "none" },
  anchor: { scrollMarginTop: `calc(${size.header} + ${space.u6})` },
  strip: { display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gap: "2px" },
  cell: { height: space.u4 },
  ground: {
    display: "flex",
    alignItems: "center",
    gap: space.u2,
    paddingBlock: space.u2,
    paddingInline: space.u3,
    borderWidth: stroke.hair,
    borderStyle: "solid",
    borderColor: color["--line-2"],
  },
  steps: { margin: 0, paddingLeft: space.u5, display: "grid", gap: space.u2 },
  ok: { color: color["--ok"] },
  no: { color: color["--err"] },
});

const dyn = stylex.create({
  bg: (c: string) => ({ backgroundColor: c }),
  card: (bg: string, fg: string) => ({ backgroundColor: bg, color: fg }),
});

const DIFFERENT: [concern: string, was: string, now: string, source: string][] = [
  ["Status bar", "Waybar", "omarchy.bar, a Quickshell (QML) plugin", "shell/plugins/bar/README.md:3-6; bin/omarchy-upgrade-to-quattro:925"],
  [
    "Launcher",
    "Walker and Elephant",
    "None. The Omarchy menu lists apps (Super+Space); the dock has an app grid (Super+Alt+Space)",
    "default/hypr/bindings/utilities.lua:1-2",
  ],
  ["Notifications", "mako", "omarchy.notifications", "docs/notifications.md:3; bin/omarchy-upgrade-to-quattro:907"],
  ["Volume overlay", "swayosd", "omarchy.osd", "shell/plugins/README.md:39; bin/omarchy-upgrade-to-quattro:920"],
  ["Lock and idle", "hyprlock, hypridle", "omarchy.lock, omarchy.idle", "shell/plugins/README.md:38; bin/omarchy-upgrade-to-quattro:899-900"],
  [
    "Audio, Wi-Fi, Bluetooth",
    "wiremix, impala, bluetui",
    "Bar panels (Super+Ctrl+A, N, B)",
    "bin/omarchy-upgrade-to-quattro:878,901,929; default/hypr/bindings/utilities.lua:113-118",
  ],
  ["Hyprland config", "hyprland.conf", "Lua: hyprland.lua, hl.config, o.bind", "config/hypr/hyprland.lua:1-32"],
  ["Default terminal", "Alacritty", "foot", "default/xdg-terminal-exec/hyprland-xdg-terminals.list:3"],
];

function Section({ id, title, lede, children }: { id: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`h-${id}`} {...stylex.props(s.anchor)}>
      <Stack gap="u6">
        <Intro id={`h-${id}`} title={title}>
          {lede}
        </Intro>
        {children}
      </Stack>
    </section>
  );
}

function Palette({ t }: { t: Theme }) {
  const c = t.colors;
  return (
    <Box border="line" pad="u0" clip>
      <div {...stylex.props(s.ground, dyn.card(c.background, c.foreground))}>
        <Text as="span" variant="small" weight="semibold" tone="inherit">
          {t.name}
        </Text>
        <Text as="span" variant="label" tone="inherit">
          {t.mode}
        </Text>
      </div>
      <Stack gap="u2">
        <span aria-hidden {...stylex.props(s.strip)}>
          {c.ansi.map((x, i) => (
            <span key={i} title={`color${i} ${x}`} {...stylex.props(s.cell, dyn.bg(x))} />
          ))}
        </span>
        <Box pad="u3">
          <Stack gap="u1">
            <Text variant="caption" face="mono" tone="muted">
              accent {c.accent} · bg {c.background}
            </Text>
            <Text variant="caption" face="mono" tone="faint">
              border {c.activeBorder ?? "accent"} / {c.inactiveBorder ?? "none"}
            </Text>
            <Cite source={t.source} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

const bindingRows: BindingRow[] = facts.bindings.map((b) => ({
  chord: b.mods?.length
    ? [...b.mods.map((m) => m[0] + m.slice(1).toLowerCase()), b.key.length > 1 ? b.key[0] + b.key.slice(1).toLowerCase() : b.key].join("+")
    : b.key,
  description: b.description ?? b.action,
  group: b.group,
  source: b.source,
  condition: b.condition,
}));

const str = (v: unknown) => (typeof v === "string" ? v : Array.isArray(v) ? v.join(" · ") : "");

export default function OmarchyPage() {
  const ts = facts.themeSystem;
  const h = facts.hyprland;
  const bar = facts.bar;
  return (
    <>
      <Header sections={false} />
      <div {...stylex.props(s.page)}>
        <NavLinks groups={[{ title: "On this page", links: SECTIONS.map(([id, label]) => ({ href: `/omarchy#${id}`, label })) }]} path={null} />
        <main id="main" tabIndex={-1} {...stylex.props(s.main)}>
          <Stack gap="u16">
            <Stack gap="u5">
              <Text variant="label" tone="faint">
                Research · read from source, never run
              </Text>
              <Intro size="page" title="How Omarchy is built">
                A cited map of everything that shapes Omarchy&apos;s interface, read from its repository. Every fact links to the file and line it came from, so
                you can check it.
              </Intro>
              <Inline gap="u2" wrap>
                <Tag>
                  {facts.version} · {facts.codename}
                </Tag>
                <Tag>
                  <TextLink href={`${REPO}/commit/${facts.commit}`} external>
                    commit {facts.commit.slice(0, 7)}
                  </TextLink>
                </Tag>
                <Tag>{new Date(facts.commitDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</Tag>
                <Tag>{facts.bindings.length} bindings</Tag>
                <Tag>{facts.menuEntryCount} menu entries</Tag>
                <Tag>{facts.themes.length} themes</Tag>
              </Inline>
            </Stack>

            <Section id="different" title="Omarchy 4 is a different desktop" lede={facts.summary}>
              <FactTable
                label="3.x and 4.0"
                head={["Concern", "Omarchy 3", "Omarchy 4", "Source"]}
                rows={DIFFERENT.map(([c, was, now, src]) => [
                  <Text key="c" as="span" variant="small" weight="semibold">
                    {c}
                  </Text>,
                  <Text key="w" as="span" variant="small" tone="faint">
                    {was}
                  </Text>,
                  now,
                  <Cite key="s" source={src} />,
                ])}
              />
              <Text tone="muted" measure>
                All of it runs in one long-lived process, omarchy-shell. Every shell surface takes its colours from one generated shell.toml and its sizes from
                one Style singleton, which makes 4.0 far more consistent than the 3.x mix of Waybar CSS, Walker CSS and separate daemon configs.
              </Text>
            </Section>

            <Section
              id="repo"
              title="Repository"
              lede="Two Arch packages are built from it: omarchy (commands, shell, themes, migrations) and omarchy-settings (defaults, skeleton config, boot and login themes)."
            >
              <FactTable
                label="Top-level directories"
                head={["Directory", "Files", "Purpose", "Ships in", "Source"]}
                rows={facts.repo.dirs.map((d) => [
                  <code key="p" {...stylex.props(typo.caption)}>
                    {d.path}/
                  </code>,
                  <Text key="f" as="span" variant="small" face="mono" tabular>
                    {d.files}
                  </Text>,
                  d.purpose,
                  d.shipped,
                  <Cite key="s" source={d.source} />,
                ])}
              />
              <Sub title="Three layers of configuration">
                <FactDict
                  label="Configuration layers"
                  data={{ homeLayers: facts.repo.homeLayers, userEditable: facts.repo.userEditable, managed: facts.repo.managed }}
                />
              </Sub>
            </Section>

            <Section
              id="themes-system"
              title="Theme system"
              lede="A theme is a colors.toml of named colours. Twenty-one templates render it into every app; one more renders shell.toml, which colours every shell surface."
            >
              <Grid layout="two" gap="u6">
                <Sub title="Files in a theme">
                  <FactTable
                    label="Theme files"
                    head={["File", "Purpose"]}
                    rows={Object.entries(ts.typicalFiles).map(([k, v]) => [
                      <code key="k" {...stylex.props(typo.caption)}>
                        {k}
                      </code>,
                      v,
                    ])}
                  />
                </Sub>
                <Sub title="ANSI slots are derived">
                  <FactTable
                    label="ANSI mapping"
                    head={["Slot", "colors.toml key"]}
                    rows={Object.entries(ts.ansiMapping).map(([k, v]) => [
                      <code key="k" {...stylex.props(typo.caption)}>
                        {k}
                      </code>,
                      v,
                    ])}
                  />
                </Sub>
              </Grid>
              <Sub title="colors.toml keys">
                <Inline gap="u2" wrap as="ul" aria-label="colors.toml keys">
                  {ts.colorsTomlKeys.map((k) => (
                    <li key={k}>
                      <Tag variant="token">{k}</Tag>
                    </li>
                  ))}
                </Inline>
                <Text variant="small" tone="muted">
                  Missing keys are derived:{" "}
                  {Object.entries(ts.derivedDefaults)
                    .map(([k, v]) => `${k} = ${v}`)
                    .join("; ")}
                  . Mode resolves as {ts.modeResolution}.
                </Text>
              </Sub>
              <Sub title="omarchy-theme-set, step by step">
                <ol {...stylex.props(s.steps)}>
                  {ts.applyFlow.map((st, i) => (
                    <li key={i}>
                      <Stack gap="u1">
                        <Text variant="small">{st.step}</Text>
                        <Cite source={st.source} />
                      </Stack>
                    </li>
                  ))}
                </ol>
              </Sub>
              <Sub title="Templates">
                <Inline gap="u2" wrap as="ul" aria-label="Templates">
                  {ts.templates.map((t) => (
                    <li key={t}>
                      <Tag variant="token">{t}</Tag>
                    </li>
                  ))}
                </Inline>
              </Sub>
            </Section>

            <Section
              id="themes"
              title="Every theme"
              lede="The sixteen ANSI colours of each first-party theme as rendered, with its accent and border colours. Hover a cell for its value."
            >
              <Grid layout="fitMd" gap="u3">
                {facts.themes.map((t) => (
                  <Palette key={t.slug} t={t} />
                ))}
              </Grid>
            </Section>

            <Section
              id="hyprland"
              title="Hyprland"
              lede={`Configured in Lua. Gaps ${h.gapsIn} in and ${h.gapsOut} out, ${h.borderSize}px borders, rounding ${h.rounding}, layout ${str(h.layout)}. Any active theme replaces the built-in cyan-to-green border gradient with its accent.`}
            >
              <FactDict label="Hyprland" data={h} skip={["animations", "beziers", "animationsNote", "input", "cursor", "misc"]} />
              <Sub title="Animations">
                <Text variant="small" tone="muted">
                  {h.animationsNote}
                </Text>
                <FactTable
                  label="Animations"
                  head={["Leaf", "Speed", "Curve", "Style"]}
                  rows={h.animations.map((a) => [str(a.leaf), String(a.speed ?? ""), str(a.bezier), str(a.style)])}
                />
                <FactTable label="Curves" head={["Bezier", "Points"]} rows={h.beziers.map((b) => [b.name, b.points.join(", ")])} />
                <Cite source={h.animationsSource} />
              </Sub>
            </Section>

            <Section
              id="bindings"
              title="Keybindings"
              lede={`All ${facts.bindings.length} bindings, grouped by the file that declares them. Bindings load in order and a later one wins.`}
            >
              <Bindings rows={bindingRows} groups={facts.bindingGroups} />
              <Sub title="Touchpad gestures">
                <FactTable
                  label="Gestures"
                  head={["Fingers", "Direction", "Does", "Source"]}
                  rows={facts.gestures.map((g) => [String(g.fingers), g.direction, g.action, <Cite key="s" source={g.source} />])}
                />
              </Sub>
            </Section>

            <Section id="bar" title="The bar" lede={`${str(bar.app)}. ${bar.height}px tall, full width, laid out from shell.json.`}>
              <FactTable
                label="Bar sections"
                head={["Section", "Widgets, in order"]}
                rows={(
                  [
                    ["left", bar.modulesLeft],
                    ["center begin", bar.modulesCenterBegin],
                    ["center", bar.modulesCenter],
                    ["center end", bar.modulesCenterEnd],
                    ["right", bar.modulesRight],
                  ] as const
                ).map(([k, v]) => [k, str(v)])}
              />
              <FactDict label="Bar" data={bar} skip={["modulesLeft", "modulesCenterBegin", "modulesCenter", "modulesCenterEnd", "modulesRight"]} />
            </Section>

            <Section
              id="menu"
              title="The Omarchy menu"
              lede={`The menu is data: ${facts.menuEntryCount} entries in a JSONC file, merged with the user's extensions. Super+Space opens it; its first row lists apps.`}
            >
              <Inline gap="u3" wrap>
                <Chord chord="Super+Space" />
                <Text as="span" variant="small" tone="muted">
                  opens the root;
                </Text>
                <Chord chord="Super+Escape" />
                <Text as="span" variant="small" tone="muted">
                  opens System. <Cite source={facts.menuSource} />
                </Text>
              </Inline>
              <MenuTree nodes={facts.menu} />
              <Sub title="The menu card">
                <FactDict label="Menu card" data={facts.launcher as Dict} />
              </Sub>
            </Section>

            <Section
              id="shell"
              title="Shell services"
              lede="Notifications, the volume overlay, the lock screen, idle and the dock are all plugins of the same shell process."
            >
              <Sub title="Notifications">
                <FactDict label="Notifications" data={facts.notifications} />
              </Sub>
              <Sub title="Volume and brightness overlay">
                <FactDict label="OSD" data={facts.osd} />
              </Sub>
              <Sub title="Lock screen">
                <FactDict label="Lock" data={facts.lock} />
              </Sub>
              <Sub title="Idle">
                <FactDict label="Idle" data={facts.idle} />
              </Sub>
              <Sub title="Dock">
                <FactDict label="Dock" data={facts.dock} />
              </Sub>
            </Section>

            <Section
              id="terminals"
              title="Terminals and fonts"
              lede="foot by default, with Alacritty, Ghostty and Kitty selectable. Every surface, terminal included, is JetBrainsMono Nerd Font."
            >
              <FactDict label="Terminals" data={facts.terminal} />
              <FactDict label="Fonts" data={facts.fonts} />
            </Section>

            <Section
              id="type-space"
              title="Type and spacing as shipped"
              lede="Every shell dimension goes through Style.space(px), which scales with the base font size. The values below are at the default 12px."
            >
              <FactTable
                label="Typography"
                head={["Where", "Family", "Sizes", "Source"]}
                rows={facts.typography.map((t) => [t.where, t.family, t.sizes, <Cite key="s" source={t.source} />])}
              />
              <FactTable
                label="Spacing"
                head={["Where", "Property", "Value", "Source"]}
                rows={facts.spacing.map((x) => [
                  x.where,
                  x.property,
                  <Text key="v" as="span" variant="small" face="mono">
                    {x.value}
                  </Text>,
                  <Cite key="s" source={x.source} />,
                ])}
              />
              <Grid layout="two" gap="u4">
                <Box tone="surface" border="line" pad="u4">
                  <Stack gap="u2">
                    <Text variant="label" tone="ok">
                      Consistent
                    </Text>
                    <Text variant="small">
                      One font family, one type scale, one spacing scale (2, 3, 4, 6, 8, 10, 12, 14, 18), 2px card borders everywhere, radius always equal to
                      Hyprland rounding, the screen-edge inset always half of gaps_out.
                    </Text>
                  </Stack>
                </Box>
                <Box tone="surface" border="line" pad="u4">
                  <Stack gap="u2">
                    <Text variant="label" tone="warn">
                      Outliers
                    </Text>
                    <Text variant="small">
                      Terminals at size 9 against a 12px shell base; a fixed 381 × 67 lock field; 16px menu labels, larger than any other body text; one-off
                      67px and 380px in the OSD and notifications; Cantarell in Plymouth.
                    </Text>
                  </Stack>
                </Box>
              </Grid>
              <Text variant="small" tone="muted" measure>
                These outliers, and the spacing steps that fall off a single grid, are where <TextLink href="/">the tuning</TextLink> starts.
              </Text>
            </Section>

            <Section id="apps" title="Apps, web apps and boot">
              <FactDict label="Default apps" data={facts.defaultApps} />
              <Sub title="Web apps">
                <Inline gap="u2" wrap as="ul" aria-label="Web apps">
                  {facts.webApps.map((w) => (
                    <li key={w.name}>
                      <Tag>{w.name}</Tag>
                    </li>
                  ))}
                </Inline>
                <Cite source={facts.webAppsSource} />
              </Sub>
              <Sub title="Boot and login">
                <FactDict label="Boot" data={facts.boot} />
              </Sub>
            </Section>

            <Section
              id="checked"
              title="Omarchui's assumptions, checked"
              lede="What the first version of this study assumed about Omarchy, against the source. The false ones are now fixed across the site and demo."
            >
              <FactTable
                label="Assumptions"
                head={["Claim", "Verdict", "Actually", "Source"]}
                rows={facts.assumptions.map((a) => [
                  a.claim,
                  <span key="v" {...stylex.props(typo.label, a.true ? s.ok : s.no)}>
                    {a.true ? "✓ true" : "✕ false"}
                  </span>,
                  a.actual,
                  <Cite key="s" source={a.source} />,
                ])}
              />
            </Section>

            <Section id="unknown" title="What the source does not say">
              <FactTable label="Undetermined" head={["Question", "Why it is open"]} rows={facts.undetermined.map((u) => [u.item, u.note])} />
            </Section>
          </Stack>
        </main>
      </div>
    </>
  );
}
