# @vapor-ui/ts-api-extractor

> **Internal Package** - This is a private package (`private: true`) for internal use only. Not published to npm.

An internal CLI tool that extracts Vapor UI component metadata from TypeScript AST and generates JSON output for API documentation.

## Overview

This package automatically generates JSON documentation for `packages/core` components. The primary consumer is `apps/website`, which uses the extracted metadata to render component API references.

**Key characteristics:**

- Location: `scripts/ts-api-extractor`
- Architecture: function-first extraction pipeline (`scan -> parse -> resolve -> defaults -> filter -> transform -> write`)
- Primary usage: `pnpm --filter website extract`

## Quick Start

Run from the monorepo root:

```bash
# Build the extractor package
pnpm --filter @vapor-ui/ts-api-extractor build

# Run extraction from website (cwd must be apps/website)
pnpm --filter website extract

# Extract a specific component only
pnpm --filter website extract --component Button
```

Run package tests:

```bash
pnpm --filter @vapor-ui/ts-api-extractor typecheck
pnpm --filter @vapor-ui/ts-api-extractor lint
pnpm --filter @vapor-ui/ts-api-extractor test:run
```

## CLI Reference

| Option        | Short | Description                            |
| ------------- | ----- | -------------------------------------- |
| `--component` | `-n`  | Extract a specific component file only |

## Configuration

Configuration lives in `src/config/defaults.ts` and is edited in place — there is no
config file loading. Relative paths resolve against `process.cwd()`, which is
`apps/website` when invoked as `pnpm --filter website extract`.

```ts
export const extractorConfig: ExtractorConfig = {
    inputPath: '../../packages/core',
    tsconfig: '../../packages/core/tsconfig.json',
    exclude: [],
    excludeDefaults: true,
    outputDir: '../../apps/website/public/components/generated',
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className'],
};
```

## Output Schema

Each component generates a JSON file (`<kebab-case>.json`):

```json
{
    "name": "Button",
    "description": "...",
    "props": [
        {
            "name": "size",
            "type": ["sm", "md", "lg"],
            "required": false,
            "description": "...",
            "defaultValue": "md"
        }
    ]
}
```

## Component Recognition

Components are recognized based on this pattern:

- File contains `export namespace <ComponentName>`
- Namespace contains `export type Props` — a `type` alias, not an `interface`.
  An exported `interface Props` is skipped with a `[docs-extractor] Skipped` warning.

Files not matching this pattern are excluded from extraction.

## Prop Processing

### Type Resolution

- Parses ts-morph types to strings
- Resolver plugin chain handles React/Base UI/function/union types
- Cleaner stage normalizes unions and abbreviates render callbacks

### Default Value Extraction

Default values are merged from multiple sources:

- Component parameter destructuring defaults
- `recipe(...).defaultVariants` in `.css.ts` files
- Recipe back-tracking via `RecipeVariants` type imports

### Prop Filtering

Props are filtered based on configuration:

| Filter            | Description                                      |
| ----------------- | ------------------------------------------------ |
| `filterExternal`  | Excludes external types (React/DOM/node_modules) |
| `filterHtml`      | Excludes HTML attributes (`data-*`, `aria-*`)    |
| `filterSprinkles` | Excludes sprinkles/deprecated CSS props          |
| `includeHtml`     | Overrides HTML filter for specific attributes    |

## Extraction Pipeline

1. Parse the `--component` flag
2. Scan target component files
3. Initialize a ts-morph project from the configured `tsconfig`
4. Parse exported namespaces and their `Props` type aliases
5. Resolve types, extract defaults, and filter props
6. Transform parsed props into sorted component models
7. Serialize models to JSON files and format them with Prettier

## Architecture

The package is organized around pipeline stages and pure transformation modules:

```text
scripts/ts-api-extractor/
├── src/
│   ├── cli/         # meow CLI entrypoint + option resolution
│   ├── config/      # config schema + values
│   ├── models/      # pipeline and output types
│   ├── resolve/     # guard-clause type resolver + base-ui mapper
│   ├── rules/       # categorize, sort, normalize
│   ├── stages/      # scan → parse → filter → transform → serialize → write
│   ├── utils/       # cleaner, declaration source, defaults, filename
│   └── extract.ts   # orchestrator (project init, stage wiring)
└── dist/cli/
```

## Quality Standards

| Check      | Command        | Tool   |
| ---------- | -------------- | ------ |
| Type check | `tsc --noEmit` | tsc    |
| Lint       | `eslint`       | eslint |
| Test       | `vitest`       | vitest |
| Build      | `tsup`         | tsup   |

## Troubleshooting

### `Path does not exist`

- Verify `inputPath` in `src/config/defaults.ts` is correct relative to the current working directory

### `No .tsx files found`

- Review `exclude` and `excludeDefaults` settings
- Confirm target files have `.tsx` extension

### `Component '<name>' not found`

- Verify filename matches component name after normalization (case-insensitive, hyphens removed)

### `module not found` when running from website

- Run `pnpm install` after directory renames or workspace changes

## License

Internal use only.
