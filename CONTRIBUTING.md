# Contributing

## Set up once

```sh
scripts/setup          # hooks, dependencies, the Playwright browser
scripts/agent doctor   # checks git, gh, node, pnpm, hooks and a clean tree
```

## Make a change

`main` only moves through merged pull requests. Each change gets its own worktree:

```sh
scripts/agent start feat/short-slug     # prints the worktree path; cd there
scripts/agent check                     # format, lint, types, build, all tests
scripts/agent commit "feat(demo): add a lock screen"
scripts/agent pr --auto                 # push, open the PR, squash-merge when CI is green
scripts/agent done                      # after the merge, from the worktree
```

Other commands: `scripts/agent sync` rebases onto `main`; `scripts/agent list` shows every
worktree with its pull request.

## Rules

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/):
  `type(scope): subject`, at most 72 characters, no trailing period. The body explains why.
- **Green first.** The pre-push hook runs `scripts/task check`, the same command CI runs.
- **Reviews.** This is a solo repository, so branch protection requires the `required` CI check
  and an up-to-date branch but zero approvals. That changes to one approval when there is a
  second maintainer.
- **Pull requests** say what was wrong, what changed, and where the change is weakest.
- **Claims about Omarchy** cite `research/omarchy`.
