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

# Run extraction from website (uses apps/website/docs-extractor.config.mjs)
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

| Option        | Short | Description                                  |
| ------------- | ----- | -------------------------------------------- |
| `--component` | `-n`  | Extract a specific component file only       |
| `--all`       | `-a`  | Bypass all filters (external/html/sprinkles) |
| `--verbose`   | `-v`  | Enable verbose logging                       |
| `--config`    | -     | Specify a config file path                   |
| `--no-config` | -     | Disable config file loading                  |

## Configuration

### Config File Names

The CLI searches for these filenames (in order):

- `docs-extractor.config.mjs`
- `docs-extractor.config.js`
- `docs-extractor.config.cjs`
- `docs-extractor.config.ts`

> Note: The package directory was renamed to `ts-api-extractor`, but config filenames remain `docs-extractor.config.*` for backward compatibility.

### Config Priority

1. CLI flags (highest)
2. File specified via `--config`
3. Default config file in current working directory
4. `src/config/defaults.ts` (lowest)

### Config Schema

```ts
import { defineConfig } from '@vapor-ui/ts-api-extractor';

export default defineConfig({
    inputPath: '../../packages/core',
    tsconfig: '../../packages/core/tsconfig.json',
    exclude: [],
    excludeDefaults: true,
    outputDir: './public/components/generated',
    languages: ['en'],
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className'],
    components: {
        'button/button.tsx': {
            include: ['data-testid'],
        },
    },
});
```

## Output Schema

Each component generates a JSON file (`<kebab-case>.json`):

```json
{
    "name": "Button",
    "displayName": "Button",
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
- Namespace contains `export interface Props`

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
| `include`         | Overrides filters for specific props             |
| `includeHtml`     | Overrides HTML filter for specific attributes    |

## Extraction Pipeline

1. Parse CLI flags (`--component`, `--all`, `--config`, `--no-config`, `--verbose`)
2. Load and merge config (defaults + file config + flags)
3. Scan target component files
4. Initialize a ts-morph project from the configured `tsconfig`
5. Parse exported namespaces and `Props` declarations (`interface` or `type`)
6. Resolve types, extract defaults, and filter props
7. Transform parsed props into sorted component models
8. Serialize models to JSON files and format them with Prettier

## Architecture

The package is organized around pipeline stages and pure transformation modules:

```text
scripts/ts-api-extractor/
├── src/
│   ├── cli/                 # meow CLI entrypoint + option resolution
│   ├── config/              # config schema, defaults, loader
│   ├── models/              # parsed/model/json/extract types
│   ├── resolve/             # guard-clause type resolver + base-ui mapper
│   ├── rules/               # categorize, sort, normalize
│   ├── extract.ts           # orchestrator (project init, IO, prettier)
│   ├── extract-defaults.ts  # destructuring + recipe default extraction
│   ├── filter.ts            # prop inclusion rules
│   ├── parse.ts             # namespace/props parsing
│   ├── scan.ts              # component file discovery
│   ├── transform.ts         # parsed -> model -> json
│   └── write.ts             # serialization + output planning
└── dist/
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

- Verify `inputPath` is correct relative to current working directory
- Check for typos in `--config` path

### `No .tsx files found`

- Review `exclude` and `excludeDefaults` settings
- Confirm target files have `.tsx` extension

### `Component '<name>' not found`

- Verify filename matches component name after normalization (case-insensitive, hyphens removed)

### `module not found` when running from website

- Run `pnpm install` after directory renames or workspace changes

## Future Extensions

- External plugin injection for Resolver/Filter/Defaults
- Additional output formats (MD, YAML)
- Multi-config/profile support in CLI

## License

Internal use only.
