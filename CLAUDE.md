# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Vapor UI

An open-source React UI component library and design system maintained by goorm. Built on `@base-ui/react` primitives with Vanilla Extract for zero-runtime styling.

## Monorepo Structure

**Packages** (`packages/`) — published to npm:

| Package                     | Role                                                                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vapor-ui/core`            | 40+ accessible React components. Headless-first via `@base-ui/react`, zero-runtime styling via Vanilla Extract, variant system via `recipe()` + Sprinkles |
| `@vapor-ui/hooks`           | Shared React hooks for state and UI management — used internally by `core` and available to consumers                                                     |
| `@vapor-ui/icons`           | SVG-to-React icon components, synced automatically from Figma                                                                                             |
| `@vapor-ui/color-generator` | OKLCH-based WCAG-compliant color palette generator — produces design tokens used by `css-generator`                                                       |
| `@vapor-ui/css-generator`   | Generates CSS variables and themes from design tokens produced by `color-generator`                                                                       |
| `@vapor-ui/codemod`         | jscodeshift-based automated code migration tools for major version upgrades                                                                               |

**Apps** (`apps/`) — not published:

| App                    | Role                                                 |
| ---------------------- | ---------------------------------------------------- |
| `storybook`            | Component development and visual regression baseline |
| `website`              | Next.js documentation site                           |
| `figma-plugin`         | Figma theme/color management plugin                  |
| `figma-codegen-plugin` | Figma code generation plugin                         |

Turborepo manages build dependency order automatically — `pnpm dev` builds upstream packages before starting dev servers.

## Development Environment

- **Node.js**: 20.20.2+ (see `.nvmrc`)
- **Package Manager**: pnpm 10.33.4 (`corepack enable` or install via npm)
- **IDE**: ESLint v9+ and Prettier v3+ integration recommended

## Commands

### Workspace-wide

```bash
pnpm install          # install all dependencies
pnpm dev              # run website dev server (upstream packages built first)
pnpm storybook dev    # run Storybook dev server (port 9009)
pnpm build            # build all packages and apps
pnpm test             # run all tests
pnpm lint             # lint all packages
pnpm typecheck        # typecheck all packages
pnpm format           # format all files with Prettier
pnpm format:check     # check formatting without writing
```

### Package shortcuts

```bash
pnpm core <cmd>       # run <cmd> in @vapor-ui/core
pnpm hooks <cmd>      # run <cmd> in @vapor-ui/hooks
pnpm icons <cmd>      # run <cmd> in @vapor-ui/icons
pnpm website <cmd>    # run <cmd> in the docs website
```

Examples:

```bash
pnpm core test        # run core tests once
pnpm core test:watch  # run core tests in watch mode
pnpm core typecheck   # typecheck core only
pnpm core lint        # lint core only
pnpm core build       # build core only
```

## Release Workflow (Changesets)

Any change to a published package (`packages/*`) requires a changeset.

```bash
pnpm changeset        # 1. create a changeset — select packages and bump level (patch | minor | major)
pnpm version          # 2. apply changesets → bump package versions + update changelogs
pnpm release          # 3. build all packages + publish to npm
```

## Git Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>
```

Primary types:

| Type              | When to use                                     |
| ----------------- | ----------------------------------------------- |
| `feat`            | New component, prop, or user-facing feature     |
| `fix`             | Bug fix                                         |
| `docs`            | Documentation only                              |
| `refactor`        | Code change with no behavior change             |
| `test`            | Add or update tests                             |
| `chore`           | Build, config, dependency updates               |
| `BREAKING CHANGE` | Add `!` after type or `BREAKING CHANGE:` footer |

Commit type alone does not determine the release version — the changeset level (`patch` / `minor` / `major`) decides that. See `packages/core/CLAUDE.md` for detailed rules.

## Detailed Conventions

Component architecture, TypeScript rules, styling patterns, testing strategy, and documentation guidelines are documented per workspace:

- **`packages/core/CLAUDE.md`** — component API design, Vanilla Extract styling, Base UI composition, compound component patterns, test strategy
- **`apps/website/CLAUDE.md`** — documentation content rules, public API accuracy, Next.js conventions
