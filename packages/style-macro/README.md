# @vapor-ui/style-macro

Build-time macro that transforms `$style({...})` calls into atomic class names + a CSS chunk.

**This is a low-level package.** Application authors should never import from it directly. Use:

- `import { $style } from '@vapor-ui/core'` in source code
- `@vapor-ui/style-macro/unplugin` in `vite.config` / `rollup.config` / `next.config` / `webpack.config`

## Bundler wiring (the only thing app authors do)

```ts
// vite.config.ts
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';
export default { plugins: [vaporStyleMacro.vite()] };
```

```ts
// rollup.config.mjs
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';
export default { plugins: [vaporStyleMacro.rollup()] };
```

```ts
// next.config.mjs (use --webpack, not Turbopack)
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';
export default {
    webpack(config) {
        config.plugins.push(vaporStyleMacro.webpack());
        return config;
    },
};
```

Adapter also exposes `.esbuild()`, `.rspack()`, `.farm()`, `.rolldown()` (anything `unplugin` supports).

### Options

| Option                | Default                                                  | Purpose                                              |
|-----------------------|----------------------------------------------------------|------------------------------------------------------|
| `tokensManifestPath`  | `require.resolve('@vapor-ui/core/tokens.manifest.json')` | Override for non-`@vapor-ui/core` token sources      |
| `importSource`        | `'@vapor-ui/core'`                                       | Module the `$style` symbol is imported from          |
| `importName`          | `'$style'`                                               | Local binding to recognize as the macro call         |
| `include`             | `*.{ts,tsx,js,jsx,mts,mjs,cts,cjs}` minus `node_modules` | Custom file filter                                   |


## Who runs what

| Layer | What it does | Who runs it |
|---|---|---|
| End-user source | `$style({ padding: '$400' })` | App author writes |
| `@vapor-ui/style-macro/unplugin` | Calls `loadManifest()` **once** at bundler start, then `transform()` per file | Bundler plugin (Vite / webpack / Rollup) |
| `@vapor-ui/style-macro` (this package) | `transform(source, opts)` → `{ code, css, classes }`. Pure function. | The unplugin above |
| `@vapor-ui/core` | Ships `dist/tokens.manifest.json` next to the `$style` runtime stub | `@vapor-ui/core` build (Plan C) |

End users never see `loadManifest` or `transform`. They `import { $style } from '@vapor-ui/core'` and write call sites; the bundler plugin wires the rest.

## Contract (for plugin authors / internal use)

```ts
import { transform, loadManifest, formatBuildError } from '@vapor-ui/style-macro';

// Bundler-plugin start: load manifest once
const manifest = loadManifest(require.resolve('@vapor-ui/core/tokens.manifest.json'));

// Per source file
const result = transform({ source, filename, manifest });

// result.code → transformed JS/TSX
// result.css  → emitted CSS chunk or null
// result.classes → atomic class names referenced (sorted)
// result.errors → BuildError[]; formatBuildError() renders codeframe text
```

The macro **does not** import from `@vapor-ui/core` at runtime. Manifest is the only contract surface, so any package can supply tokens (future `@vapor-ui/tokens`, custom theme bundles, etc.).

## Determinism

Same `(source, manifest)` → byte-identical `code`, `css`, `classes`. Class names sort at the call site (static path); CSS emitter sorts within each condition bucket.

## Token manifest shape (v1)

```ts
interface ManifestShape {
  version: '1';
  tokens: Record<TokenScope, Record<string, string>>;     // token name → CSS var
  propertyScopes: Record<string, TokenScope>;             // property → which scope its tokens live in
}

type TokenScope = 'color' | 'space' | 'dimension' | 'borderRadius' | 'shadow' | 'typography';
```

`@vapor-ui/core` emits this JSON during its build (Plan C). Macro consumes via plain `JSON.parse` — no import path coupling.

## Conditions

| Key                   | Maps to                    |
|-----------------------|----------------------------|
| `default`             | base rule                  |
| `sm` / `md` / `lg`    | `@media (--vapor-<name>)`  |
| `@media (…)`          | raw CSS media query        |
| `_hover`, `_focus`, … | pseudo-class selector      |

## Error codes

`unknown-token`, `scope-mismatch`, `unknown-property`, `invalid-input-shape`, `dynamic-value`, `computed-key`, `spread`.
