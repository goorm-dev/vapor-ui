# @vapor-ui/style-macro

Build-time macro that transforms `$style({...})` calls into atomic class names + a CSS chunk.

Application authors use:

- `import { $style } from '@vapor-ui/style-macro'` in source code
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

| Option              | Default                                                  | Purpose                                                       |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| `manifest`          | `import { manifest } from '@vapor-ui/tokens'`            | Alternative token manifest object (`ManifestShape`)           |
| `importSource`      | `'@vapor-ui/style-macro'`                                | Module the `$style` symbol is imported from                   |
| `importName`        | `'$style'`                                               | Local binding to recognize as the macro call                  |
| `themeStylesImport` | `'${importSource}/styles.css'`                           | Side-effect CSS import injected per-file. `false` to disable. |
| `include`           | `*.{ts,tsx,js,jsx,mts,mjs,cts,cjs}` minus `node_modules` | Custom file filter                                            |

## Who runs what

| Layer                                  | What it does                                                                 | Who runs it                              |
| -------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| End-user source                        | `$style({ padding: '$400' })`                                                | App author writes                        |
| `@vapor-ui/style-macro/unplugin`       | Imports `manifest` from `@vapor-ui/tokens` once, then `transform()` per file | Bundler plugin (Vite / webpack / Rollup) |
| `@vapor-ui/style-macro` (this package) | Hosts the `$style` runtime stub + `transform(source, opts)`                  | The unplugin above                       |
| `@vapor-ui/tokens`                     | Owns token data + emits `manifest` (TS module) + token literal union types   | tokens build                             |
| `@vapor-ui/core`                       | Ships the theme CSS contract loaded via `themeStylesImport`                  | `@vapor-ui/core` build                   |

End users never see the manifest or `transform`. They `import { $style } from '@vapor-ui/style-macro'` and write call sites; the bundler plugin wires the rest.

## Contract (internal)

`transform(source, opts)` is not part of the public entry — it lives in `src/transform.ts` and is consumed only by the bundled `./unplugin` adapter. Manifest is the only external contract; any package can supply tokens.

## Determinism

Same `(source, manifest)` → byte-identical `code`, `css`, `classes`. Class names sort at the call site (static path); CSS emitter sorts within each condition bucket.

## Token manifest shape (v1)

```ts
interface ManifestShape {
    version: '1';
    tokens: Record<TokenScope, Record<string, string>>; // token name → CSS var
    propertyScopes: Record<string, TokenScope>; // property → which scope its tokens live in
}

type TokenScope = 'color' | 'space' | 'dimension' | 'borderRadius' | 'shadow' | 'typography';
```

`@vapor-ui/core` emits this JSON during its build (Plan C). Macro consumes via plain `JSON.parse` — no import path coupling.

## Conditions

| Key                   | Maps to                   |
| --------------------- | ------------------------- |
| `default`             | base rule                 |
| `sm` / `md` / `lg`    | `@media (--vapor-<name>)` |
| `@media (…)`          | raw CSS media query       |
| `_hover`, `_focus`, … | pseudo-class selector     |

## Error codes

`unknown-token`, `scope-mismatch`, `unknown-property`, `invalid-input-shape`, `dynamic-value`, `computed-key`, `spread`.
