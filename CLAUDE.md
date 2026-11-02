# Working in omarchui

A Next.js 16 site (App Router, StyleX, React Aria) with three parts: the exposition (`/`),
the design-system reference (`/system`), a cited map of Omarchy's source (`/omarchy`), and a
desktop demo (`/demo`). Read `AGENTS.md` too: this Next.js version differs from training data;
check `node_modules/next/dist/docs/` before using an API.

## Workflow

- Never commit on `main`. It advances only through a merged pull request; a hook and branch
  protection both enforce it.
- One unit of work → one worktree → one branch → one pull request:
  1. `scripts/agent start <type>/<slug>` (type ∈ feat fix chore docs perf refactor test), then `cd` to the printed path.
  2. Change things. `scripts/agent check` until green.
  3. `scripts/agent commit "<type>(scope): subject"`.
  4. `scripts/agent pr --auto` pushes, opens the PR and squash-merges it when CI passes.
  5. After the merge: `scripts/agent done` from the worktree.
- Never `--no-verify`, never `|| true` or `continue-on-error` to get green.
- Commits are Conventional Commits; subject ≤ 72 characters, imperative, no trailing period.
  The body says why.
- PR descriptions state the problem, the approach, and where the change is weakest.

## Attribution

Never name an AI, assistant or tool as author anywhere that reaches git or GitHub: no
co-author trailers, no "generated with" footers, no robot emoji. The commit-msg hook rejects them.

## The seam

CI and hooks call only `scripts/task`:

| Verb                | Does                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| `fmt` / `fmt:check` | Prettier                                                                          |
| `lint`              | route types, `tsc`, ESLint (warnings fail), generated-file freshness              |
| `test`              | Vitest, then Playwright (light and dark, axe on every reference page)             |
| `build`             | `next build`                                                                      |
| `check`             | all of the above                                                                  |
| `docs`              | regenerate `lib/themes.generated.ts`, colour token defaults and `docs/props.json` |

## The design system's rules

The tests hold these; follow them rather than fixing the test.

- Colours, sizes, spacing, z-index and focus rings come from `design/tokens`. Font sizes only
  through the presets in `design/primitives/typography.ts`.
- Design-system components take variants, never `style` or `className`.
- Style objects a server component imports must live in a module without `"use client"`.
- Every ink, accent and spectrum colour holds 4.5:1 on every ground in every theme. Themes are
  generated from `research/omarchy/facts.json` by `scripts/gen-themes.mts`; change the
  derivation, not the output.
- A keybinding marked `today` must exist in Omarchy's source (`tests/keymap-omarchy.test.ts`).
- New components get a registry entry in `docs/registry.ts` and an example in `docs/examples.tsx`.

## Facts about Omarchy

`research/omarchy/` holds what Omarchy actually ships, read from source at a pinned commit, with
`path:line` citations. Cite it for any claim about Omarchy; do not rely on memory of 3.x.
