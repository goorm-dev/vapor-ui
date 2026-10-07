# @vapor-ui/docs-extractor

> **Internal Package** - This is a private package (`private: true`) for internal use only. Not published to npm.

An internal CLI tool that extracts Vapor UI component metadata from TypeScript AST and generates JSON output for API documentation.

## Overview

This package automatically generates JSON documentation for `packages/core` components. The primary consumer is `apps/website`, which uses the extracted metadata to render component API references.

**Key characteristics:**

- Location: `scripts/docs-extractor`
- Modules: `extract()` (read + policy) behind a thin CLI that writes the files
- Primary usage: `pnpm --filter website extract`

## Quick Start

Run from the monorepo root:

```bash
# Extract every component into apps/website/public/components/generated
pnpm --filter website extract

# Extract a specific component only
pnpm --filter website extract --component Button
```

There is no build step. The CLI runs straight from TypeScript source through `tsx`.
Only `pnpm install` is required.

Run package tests:

```bash
pnpm docs-extractor typecheck
pnpm docs-extractor lint
pnpm docs-extractor test
```

## CLI Reference

| Option        | Short | Required | Description                                  |
| ------------- | ----- | -------- | -------------------------------------------- |
| `--input`     | -     | yes      | Directory to scan for component `.tsx` files |
| `--tsconfig`  | -     | yes      | `tsconfig.json` used to resolve types        |
| `--out`       | -     | yes      | Directory the JSON files are written to      |
| `--component` | `-n`  | no       | Extract only this component file             |
| `--verbose`   | -     | no       | Print debug output                           |

Paths are resolved against the current working directory. There is no config file: the extraction policy below is fixed in code.

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

- Scanned files: every `.tsx` file under `--input`, except `*.stories.tsx` and `*.test.tsx`.
- A component is an exported `namespace` that contains an exported `Props`, declared with either `type` or `interface`.
- Each namespace is one component. A compound component produces one entry per part (`AvatarRoot`, `AvatarImage`, …).

### Output files

- One JSON file per component in `--out`, named after the namespace in kebab-case: `AvatarRoot` → `avatar-root.json`, `HStack` → `h-stack.json`.
- A full run deletes JSON files in `--out` that it did not write, if they have a string `name` and a `props` array. A `--component` run deletes nothing, and neither does a run where any file or component failed to parse (it would look stale).
- `toast-object.json` in `--out` is hand-written (the ToastOptions object for `useToastManager` has no namespace to extract) and is never deleted.
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
            "detailedType": "\"sm\" | \"md\" | \"lg\" | \"xl\" | undefined",
            "required": false,
            "description": "Size of the avatar. Controls the width, height, and border radius.",
            "defaultValue": "md"
        },
        {
            "name": "className",
            "type": ["string", "function"],
            "detailedType": "string | ((state: Avatar.Root.State) => (string | undefined)) | undefined",
            "required": false
        }
    ],
    "typeRefs": {
        "Avatar.Root.State": "{\n  imageLoadingStatus: \"idle\" | \"error\" | \"loading\" | \"loaded\";\n}"
    }
}
```

| Field                  | Value                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| `name`                 | Namespace name                                                      |
| `description`          | See [Descriptions](#descriptions). Omitted when there is none       |
| `props[].name`         | Property name                                                       |
| `props[].type`         | Summary type, one member per element. See [Types](#types)           |
| `props[].detailedType` | Full type on one line. See [Types](#types)                          |
| `props[].required`     | `true` when the property is not optional                            |
| `props[].description`  | See [Descriptions](#descriptions). Omitted when there is none       |
| `props[].defaultValue` | See [Default values](#default-values). Omitted when there is none   |
| `typeRefs`             | See [Type references](#type-references). Omitted when there is none |

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
2. Tagged `@ignore` in its Base UI JSDoc (Base UI's internal `id`) and not re-declared by vapor-ui: dropped.
3. Declared in React types, DOM lib types, or a `node_modules` package other than Base UI: dropped.
4. Name starts with `data-` or `aria-`: dropped.
5. Declared in the sprinkles module, or named like a deprecated CSS shorthand (`$css`, `width`, `color`, …; full list in `src/policy.ts`): dropped.
6. Anything else (own props, recipe variant props, Base UI props): kept.

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

A prop type is split into the top-level union members TypeScript prints (`src/read/type-printer/printer.ts`). Both fields are built from those members.

| Field          | `className?: string \| ((state: Badge.State) => string)`    |
| -------------- | ----------------------------------------------------------- |
| `type`         | `["string", "function"]`                                    |
| `detailedType` | `"string \| ((state: Badge.State) => string) \| undefined"` |

- `type` leaves out `undefined`, prints a function member as `function`, and prints a string literal without quotes: `"sm"` → `sm`.
- `detailedType` keeps every member, `undefined` included, with quotes and parentheses as TypeScript writes them.
- `boolean`, `ReactNode` and `React.Ref<X>` are not expanded. A named union of values only (`type Side = "top" | "bottom"`) is expanded into its values, any other named union (`type Padding = number | {…}`) is kept by name. The same applies to the properties of an object with no name, such as `sideOffset`'s `data`: it is printed one property at a time on one line (`{ side: "top" | "bottom"; anchor: { width: number; }; }`), with `name?: T` for an optional property. Callback parameters and return types follow the same rules: `(open: boolean) => void`, `(cb?: () => void) => void` for an optional parameter, and `(cb: (() => void) | undefined) => void` for a required one. Members that print the same are listed once. `null` and `undefined` come last.
- Base UI types are printed with their public vapor-ui names, including types TypeScript turns into an anonymous object (Base UI's `ChangeEventDetails`). When several names fit, the one declared in the component's own namespace wins. An anonymous Base UI type with no public name is printed as its structure, with a warning to re-export it from the component namespace. An object Base UI writes inline as the type of a parameter or a property (`sideOffset`'s `data` and its `anchor`) has no name to re-export, so it is printed as its structure without a warning. `ReactElement<X, …>` is printed as `ReactElement<X>`, or `ReactElement` when `X` is `unknown`.

### Type references

`typeRefs` maps each public vapor-ui type name that a documented prop's `detailedType` prints (`Collapsible.Root.State`, `Collapsible.Root.ChangeEventDetails`) to its definition, so a reader can see the fields behind the name.

- Keys are the names exactly as `detailedType` prints them, matched as whole names. Only names a component namespace re-exports from Base UI are listed; React and DOM types are not.
- A value is the definition written out with one property per line: `{\n  open: boolean;\n}`. An optional property reads `name?: T` without `| undefined`. A union of objects, such as event details with one object per `reason`, reads as `(\n  | { reason: "a"; event: MouseEvent; }\n  | …\n) & {\n  cancel: () => void;\n}`: property lines every member prints the same are written once inside `& { … }`, and each member keeps its other properties on its own line, in the checker's order. When no line is shared, the objects are joined by `|` in full.
- Property types follow [Types](#types): a named union of values is expanded, other names inside are kept as names and not listed in `typeRefs`.

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

## Architecture

```text
cli.ts ──► extract() ──► read/     source → ParsedComponent[]   (ts-morph, filesystem)
   │                └──► policy()  ParsedComponent[] → ComponentDoc[]   (pure)
   └─────► writeDocs()  ComponentDoc[] → <out>/*.json, then prettier
```

| Module             | Interface                                                                         | Owns                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/extract.ts`   | `extract({ inputPath, tsconfigPath, component?, reporter? }): { docs, failures }` | Scanning, reading every file, applying the policy, the missing-JSDoc warning. Writes nothing          |
| `src/read/`        | `parseSourceFile()`, `scanComponentFiles()`; only `extract()` imports them        | Component detection, descriptions, default values, source classification, public names, type printing |
| `src/policy.ts`    | `policy(components: ParsedComponent[]): ComponentDoc[]`                           | README "Props", "Types" and the field shape. No ts-morph, no filesystem                               |
| `src/write.ts`     | `writeDocs(outputDir, docs, { removeStale })`, `formatWithPrettier()`             | File names, JSON bytes, stale-file removal                                                            |
| `src/cli.ts`       | the `--input`/`--tsconfig`/`--out` command                                        | Flags, the console reporter, exit codes                                                               |
| `src/model.ts`     | `ParsedComponent`, `ComponentDoc` and their prop types                            | The data passed between the modules above                                                             |
| `src/type-text.ts` | `joinTypeMembers()`, `mentionsTypeName()`                                         | How printed type text is joined and searched, shared by `read/` and the policy                        |
| `src/reporter.ts`  | `Reporter`, `silentReporter`                                                      | Where progress and warnings go; the CLI supplies the console one                                      |
| `src/errors.ts`    | `ExtractorError`                                                                  | Bad input (missing path, unknown component), printed by the CLI without a stack                       |

Tests go through `extract()` (fixture sources on disk), `policy()` (plain data), `writeDocs()` (a temp directory) and two `read/` seams, the type printer's `createTypePrinter()` and the public names' `createPublicNames()` (source strings in an in-memory project), not through module internals.

ESLint (`eslint.config.mjs`) keeps `policy.ts` and `model.ts` free of `ts-morph`, `node:*`, `glob` and `meow`, and keeps `read/` from importing the policy, the writer or the CLI.

## Quality Standards

| Check      | Command        | Tool   |
| ---------- | -------------- | ------ |
| Type check | `tsc --noEmit` | tsc    |
| Lint       | `eslint`       | eslint |
| Test       | `vitest`       | vitest |

## Troubleshooting

### `Path does not exist`

- Verify `--input` is correct relative to the current working directory

### `No .tsx files found`

- Confirm target files have the `.tsx` extension

### `Component '<name>' not found`

- Verify filename matches component name after normalization (case-insensitive, hyphens removed)

### `module not found` when running from website

- Run `pnpm install` — the website script runs `src/cli.ts` by relative path through `tsx`, and this package's dependencies (`ts-morph`, `glob`, `meow`) come from install, not from a build

## License

Internal use only.
