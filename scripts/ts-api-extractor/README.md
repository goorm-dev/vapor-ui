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
# Run extraction from website (uses apps/website/docs-extractor.config.mjs)
pnpm --filter website extract

# Extract a specific component only
pnpm --filter website extract --component Button
```

There is no build step. The CLI runs straight from TypeScript source through `tsx`,
and the package exports `./src/index.ts` so a config file can import `defineConfig`
the same way. Only `pnpm install` is required.

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
});
```

## Extraction Policy

This section is the specification of the generated JSON. The extractor implements exactly these rules.

### Consumers

| Consumer                                                          | Reads                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/website` `ComponentPropsTable` (MDX `componentName="…"`)    | file name, `description`, `props[]`                                       |
| `apps/website` LLM text (`src/utils/get-component-doc.ts`)        | `props[]`                                                                 |
| `skills/vapor-ui/scripts/get-component-info.mjs` (GitHub raw URL) | file path at the `@vapor-ui/core@{version}` tag, `description`, `props[]` |

The output file path and the fields listed here form the contract with these consumers. The generated files are committed; extraction is run by hand, not in CI or the build.

### Components

- Scanned files: every `.tsx` file under `inputPath`, except `*.stories.tsx` and `*.test.tsx`.
- A component is an exported `namespace` that contains an exported `Props`, declared with either `type` or `interface`.
- Each namespace is one component. A compound component produces one entry per part (`AvatarRoot`, `AvatarImage`, …).

### Output files

- One JSON file per component in `outputDir`, named after the namespace in kebab-case: `AvatarRoot` → `avatar-root.json`, `HStack` → `h-stack.json`.
- A full run deletes JSON files in `outputDir` that it did not write, if they have a string `name` and a `props` array. A `--component` run deletes nothing.
- The CLI formats the written files with Prettier.

### Fields

```json
{
    "name": "AvatarRoot",
    "description": "Avatar component for displaying a user's profile image with an automatic initial-based fallback. Renders a `<span>` element.",
    "props": [
        {
            "name": "size",
            "type": ["sm", "md", "lg", "xl"],
            "required": false,
            "description": "Size of the avatar. Controls the width, height, and border radius.",
            "defaultValue": "md"
        }
    ]
}
```

| Field                  | Value                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| `name`                 | Namespace name                                                    |
| `description`          | See [Descriptions](#descriptions). Omitted when there is none     |
| `props[].name`         | Property name                                                     |
| `props[].type`         | See [Types](#types)                                               |
| `props[].required`     | `true` when the property is not optional                          |
| `props[].description`  | See [Descriptions](#descriptions). Omitted when there is none     |
| `props[].defaultValue` | See [Default values](#default-values). Omitted when there is none |

`displayName` and `defaultElement` are not produced.

### Descriptions

- JSDoc is the only source. Hand edits to the generated JSON are overwritten by the next run.
- Text is copied as written in the source (English). Translation is not part of extraction.
- Component description: the description text of the last JSDoc block on `export const <NamespaceName>`.
- Prop description: the description text of the property's JSDoc. When the property is declared in several places (e.g. vapor-ui re-declares a Base UI prop), the vapor-ui declaration wins; otherwise the first declaration that has a JSDoc.
- JSDoc tags (`@default`, `@deprecated`, `@example`, …) are dropped.

### Props

Every property of `Props`, including inherited ones, is checked against these rules in order. The first matching rule decides.

1. `className` and `style`: kept.
2. Declared in React types, DOM lib types, or a `node_modules` package other than Base UI: dropped.
3. Name starts with `data-` or `aria-`: dropped.
4. Declared in the sprinkles module, or named like a deprecated CSS shorthand (`$css`, `width`, `color`, …; full list in `src/domain/filter.ts`): dropped.
5. Anything else (own props, recipe variant props, Base UI props): kept.

Props are sorted by group, then by name within a group. A prop joins the first group whose rule matches, checked in this sequence: required, composition, variants, state, base-ui, custom.

| Order | Group       | Rule                                                                                            |
| ----- | ----------- | ----------------------------------------------------------------------------------------------- |
| 1     | required    | Not optional                                                                                    |
| 2     | variants    | Declared in a `.css.ts` file                                                                    |
| 3     | state       | `value`, `defaultValue`, `onChange`, `on*Change`, `open`/`checked`/… and their `default*` forms |
| 4     | custom      | Everything else                                                                                 |
| 5     | base-ui     | Declared in Base UI                                                                             |
| 6     | composition | `asChild`, `render`                                                                             |

### Types

- The printed type drops `undefined`, empty and duplicate union members.
- A union made only of string literals is printed without quotes: `"sm" | "md"` → `sm | md`.
- When every union member is a simple token (a literal, a number or a single identifier), `type` holds one member per element: `["sm", "md", "lg"]`. Otherwise `type` holds the whole printed type as its only element: `["string | ((state: Badge.State) => (string | undefined))"]`.
- Base UI types are printed with their public vapor-ui names, `React.Ref<X>` as `Ref<X>`, and `import("…").` prefixes are removed (`src/infrastructure/ts-morph/type-printer/`).

### Default values

Code is the only source. The first source that has a value for a prop wins:

1. A destructuring default for the prop in `export const <NamespaceName>`.
2. `defaultVariants` of the recipe the component calls as `<styles>.<recipe>(…)`, where `<styles>` is a namespace import of a `.css` file and the recipe is created with `recipe()` or `componentRecipe()`.

Not extracted:

- `@default` tags and `Default:` text in JSDoc. `Default:` text stays in the description as written.
- Defaults that a root part passes to other parts through context (e.g. `TabsRoot` `size`): the root has no default of its own, and the part recipe's `defaultVariants` is not traced back to the root.

### Warnings

- At the end of a run, one warning lists every component and prop without a description, as `Component` and `Component.prop`.
- Missing JSDoc does not fail the run; the exit code stays 0.

## Extraction Pipeline

1. Parse CLI flags (`--component`, `--config`)
2. Load and merge config (behavioral defaults + file config), failing if a path field is missing
3. Scan target component files
4. Initialize a ts-morph project from the configured `tsconfig`
5. Parse exported namespaces and `Props` declarations (`interface` or `type`)
6. Resolve types, extract defaults, and filter props
7. Transform parsed props into sorted component models
8. Serialize models to JSON files
9. The CLI formats the written files with Prettier

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
│   │   └── file-writer.ts        #   write bytes, run prettier (invoked by cli)
│   └── config/loader.ts          #   find and import the config file
│
├── app/extract.ts           # wiring only — no rules, no IO of its own
└── index.ts                 # public API (exported as source, no dist)
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

- Run `pnpm install` — `tsx` and the workspace link are set up by install, not by a build

## Future Extensions

- Additional output formats: implement `OutputFormat` in `domain/output-format.ts`
  and pass it to `extract({ format })`
- External plugin injection for Resolver/Filter/Defaults
- Multi-config/profile support in CLI

## License

Internal use only.
