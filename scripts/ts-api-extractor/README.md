# @vapor-ui/ts-api-extractor

> **Internal Package** - This is a private package (`private: true`) for internal use only. Not published to npm.

An internal CLI tool that extracts Vapor UI component metadata from TypeScript AST and generates JSON output for API documentation.

## Overview

This package automatically generates JSON documentation for `packages/core` components. The primary consumer is `apps/website`, which uses the extracted metadata to render component API references.

**Key characteristics:**

- Location: `scripts/ts-api-extractor`
- Architecture: three layers (`cli` / `domain` / `infrastructure`) wired together by `app/extract.ts`
- Pipeline: `scan -> parse -> resolve -> defaults -> filter -> transform -> write`
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

| Option        | Short | Description                            |
| ------------- | ----- | -------------------------------------- |
| `--component` | `-n`  | Extract a specific component file only |
| `--config`    | -     | Specify a config file path             |

`verbose` is a config-file option, not a CLI flag.

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
4. `src/domain/config/defaults.ts` (behavioral defaults only)

`inputPath`, `tsconfig` and `outputDir` have **no defaults** — they depend on where
the tool is invoked from, so a config file is required and extraction fails fast
if any of the three is missing.

### Config Schema

```ts
import { defineConfig } from '@vapor-ui/ts-api-extractor';

export default defineConfig({
    inputPath: '../../packages/core',
    tsconfig: '../../packages/core/tsconfig.json',
    exclude: [],
    excludeDefaults: true,
    outputDir: './public/components/generated',
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
- Namespace contains `export type Props = ...` (an exported type alias named `Props`;
  an `interface Props` is not picked up)

Files not matching this pattern are excluded from extraction.

## Prop Processing

### Type Resolution

- Parses ts-morph types to strings
- A chain of `Resolver` objects handles React/Base UI/function/union types; the
  first one to return a non-null string wins (`type-printer/resolve-type.ts`)
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

1. Parse CLI flags (`--component`, `--config`)
2. Load and merge config (behavioral defaults + file config), failing if a path field is missing
3. Scan target component files
4. Initialize a ts-morph project from the configured `tsconfig`
5. Parse exported namespaces and `Props` declarations (`interface` or `type`)
6. Resolve types, extract defaults, and filter props
7. Transform parsed props into sorted component models
8. Serialize models to JSON files and format them with Prettier

## Architecture

Three layers. The folder a file lives in tells you which one it belongs to.

```text
src/
├── cli/                     # presentation — flags, exit codes, the only console.*
│   ├── index.ts             #   meow entrypoint
│   ├── options.ts           #   flags -> extract() inputs (no filesystem work)
│   └── reporter.ts          #   the single Reporter implementation that prints
│
├── domain/                  # business — no ts-morph, no node:*, no console
│   ├── model.ts             #   ParsedProp / PropModel / ComponentModel
│   ├── output.ts            #   JSON shape + extract() input/output types
│   ├── output-format.ts     #   how a component becomes a file (name + bytes)
│   ├── stage-config.ts      #   per-stage config (ParseConfig, FilterConfig)
│   ├── reporter.ts          #   output port implemented by cli/reporter.ts
│   ├── errors.ts            #   ExtractorError (bad request, not a crash)
│   ├── filter.ts            #   prop inclusion rules
│   ├── transform.ts         #   parsed -> model
│   ├── serialize.ts         #   model -> json
│   ├── clean-type.ts        #   type-string normalization
│   ├── file-name.ts         #   kebab-case
│   ├── config/              #   schema, validation, merge, defaults, defineConfig
│   └── rules/               #   categorize, sort, normalize
│
├── infrastructure/          # everything that touches the outside world
│   ├── ts-morph/
│   │   ├── component-reader.ts   #   namespace/Props -> ParsedComponent
│   │   ├── default-values.ts     #   destructuring + recipe defaults
│   │   ├── source-classifier.ts  #   where a symbol was declared
│   │   └── type-printer/         #   the Resolver chain + base-ui mapper
│   ├── fs/
│   │   ├── component-scanner.ts  #   glob + target file resolution
│   │   └── file-writer.ts        #   write bytes, run prettier
│   └── config/loader.ts          #   find and import the config file
│
├── app/extract.ts           # wiring only — no rules, no IO of its own
└── index.ts                 # public API
```

Layer boundaries are enforced by ESLint (`eslint.config.mjs`): `domain/**` may not
import `ts-morph`, `node:*`, `glob` or `meow`, and `infrastructure/**` may not
import from `cli/` or `app/`.

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

- Additional output formats: implement `OutputFormat` in `domain/output-format.ts`
  and pass it to `extract({ format })`
- External plugin injection for Resolver/Filter/Defaults
- Multi-config/profile support in CLI

## License

Internal use only.
