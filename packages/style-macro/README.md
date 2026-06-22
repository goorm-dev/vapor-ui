# @vapor-ui/style-macro

Build-time macro powering `@vapor-ui/core`'s `$style` function.

Not consumed directly — use the bundler adapter (`@vapor-ui/style-macro/unplugin`) shipped from Plan B.

## Contract

```ts
import { transform, loadManifest, formatBuildError } from '@vapor-ui/style-macro';

const manifest = loadManifest(require.resolve('@vapor-ui/core/dist/tokens.manifest.json'));
const result = transform({ source, filename, manifest });

// result.code → transformed JS/TSX (string)
// result.css  → emitted CSS chunk or null
// result.classes → all atomic class names referenced (sorted)
// result.errors → BuildError[]; formatBuildError() renders codeframe text
```

## Determinism

Same `(source, manifest)` → byte-identical `code`, `css`, and `classes`. Class names are sorted at the call-site (static path) and the CSS emitter sorts within each condition bucket.

## Token manifest shape (v1)

```ts
interface ManifestShape {
  version: '1';
  tokens: Record<TokenScope, Record<string, string>>;
  propertyScopes: Record<string, TokenScope>;
}

type TokenScope = 'color' | 'space' | 'dimension' | 'borderRadius' | 'shadow' | 'typography';
```

## Conditions

| Key                      | Maps to                       |
|--------------------------|-------------------------------|
| `default`                | base rule                     |
| `sm` / `md` / `lg`       | `@media (--vapor-<name>)`     |
| `@media (…)`             | raw CSS media query           |
| `_hover`, `_focus`, …    | pseudo-class selector         |

## Error codes

`unknown-token`, `scope-mismatch`, `unknown-property`, `invalid-input-shape`, `dynamic-value`, `computed-key`, `spread`.
