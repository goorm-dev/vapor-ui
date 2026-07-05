# Plan A — `@vapor-ui/style-macro` Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the pure-function transform core of `$style` — given a source file, the macro parses every `$style({...})` call, synthesizes deterministic atomic class names, and emits a CSS chunk. No bundler wiring yet.

**Architecture:** Standalone npm package `@vapor-ui/style-macro` exposing a `transform(source, opts) → { code, css, classes }` function. Reads a token manifest JSON (path configurable, default resolves `@vapor-ui/core/dist/tokens.manifest.json`). Built around Babel's `@babel/parser` + `@babel/traverse`. Output is deterministic byte-identical for the same input + manifest.

**Tech Stack:** TypeScript, `@babel/parser`, `@babel/traverse`, `@babel/generator`, `@babel/code-frame`, vitest, tsup.

## Global Constraints

- Node `>=20.19`, pnpm `>=10.5.1`.
- Package boundary (spec §7.1): macro **must not** import from `@vapor-ui/core` source. Only reads the token manifest JSON. Macro is **type-only** consumed by `@vapor-ui/core`; runtime separation strict.
- Token grammar (§4.3): `$` prefix required; property-token scope mismatch is a build error.
- Value rules (§4.4): object literals only, no computed keys, no spreads, no variable refs in values, ternary OK only if both arms are static literals/tokens **and** the ternary lives at entry-level (`{ color: x ? '$a' : '$b' }`). Ternary nested **inside** a condition-object (`{ color: { default: x ? '$a' : '$b' } }`) is rejected with `dynamic-value`. Rationale: spec §4.2 only shows entry-level ternaries; nested-ternary cascade semantics would be invented and surprising.
- Condition keys (§5.1): `default`, named BP `sm`/`md`/`lg`, pseudo `_<name>`, raw `'@media (...)'`.
- Atomic class names (§6.1): content-addressed, deterministic, prefixed `_`, no minification in v1.
- Emit order (§6.3): default → sm → md → lg → raw `@media` (query-string sort) → pseudo (`_before` → `_after` → `_focus` → `_focusVisible` → `_focusWithin` → `_hover` → `_active` — LVFHA, focus before hover so hover ring cannot override focus ring).
- Determinism (§6.4): same input + manifest → byte-identical CSS output. Snapshot-tested.
- All `@layer vapor.utilities` (§6.2).
- Build-time error reporting uses `@babel/code-frame` (§7.2 step 6).
- Non-goals (§3): no condition-first nesting, no custom conditions, no runtime branching, no class minification, no SWC plugin, no Turbopack.
- Locked decisions (§11): `$` prefix required, BP names `sm`/`md`/`lg` only, `propertyShort` table internal to this plan.

---

## File Structure

```
packages/style-macro/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── README.md
└── src/
    ├── index.ts                 # public: transform, types
    ├── transform.ts             # orchestrator: source → { code, css, classes }
    ├── parse-call.ts            # AST walker: locate $style(...) calls, extract input AST
    ├── validate-input.ts        # §4.4 rules → either ValidInput or BuildError[]
    ├── tokens.ts                # manifest loader + property-scope checks
    ├── property-shorthand.ts    # PROPERTY_SHORT lookup table
    ├── condition.ts             # condition key classifier (default/bp/pseudo/raw-media)
    ├── class-name.ts            # synthesize atomic class name from tuple
    ├── emit-css.ts              # tuple set → CSS string, deterministic order
    ├── code-frame.ts            # wrap @babel/code-frame for error formatting
    └── types.ts                 # StyleInput, Tuple, BuildError, ManifestShape
└── tests/
    ├── fixtures/                # *.input.tsx + *.expected.{code.tsx,css}
    │   ├── static-literal/
    │   ├── ternary/
    │   ├── named-bp/
    │   ├── raw-media/
    │   ├── pseudo/
    │   ├── mixed/
    │   └── reject/
    │       ├── computed-key.input.tsx
    │       ├── spread.input.tsx
    │       ├── dynamic-ternary.input.tsx
    │       ├── unknown-token.input.tsx
    │       └── token-scope-mismatch.input.tsx
    ├── transform.test.ts        # snapshot-driven, walks fixtures/
    ├── class-name.test.ts       # unit
    ├── emit-css.test.ts         # unit + determinism
    ├── condition.test.ts        # unit
    └── byte-identical.test.ts   # run transform twice, assert equality
```

`apps/storybook/vite.config.ts` / `apps/website/next.config.mjs` are **not** touched in Plan A.

---

## Task 1: Package skeleton

**Files:**

- Create: `packages/style-macro/package.json`
- Create: `packages/style-macro/tsconfig.json`
- Create: `packages/style-macro/tsup.config.ts`
- Create: `packages/style-macro/vitest.config.ts`
- Create: `packages/style-macro/README.md`
- Create: `packages/style-macro/src/index.ts` (stub)
- Modify: `pnpm-workspace.yaml` (no change needed if `packages/*` is already globbed — verify)

**Interfaces:**

- Consumes: nothing.
- Produces: workspace package `@vapor-ui/style-macro` at version `0.0.0-private`, type-checks clean, vitest runs an empty suite.

- [ ] **Step 1: Inspect existing package conventions**

Run: `ls packages/codemod/` to see tsup/tsconfig style used elsewhere. Match it.

- [ ] **Step 2: Write `packages/style-macro/package.json`**

```json
{
    "name": "@vapor-ui/style-macro",
    "version": "0.0.0",
    "description": "Build-time macro powering @vapor-ui/core's $style function.",
    "license": "MIT",
    "main": "./dist/index.cjs",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "import": "./dist/index.js",
            "require": "./dist/index.cjs"
        }
    },
    "files": ["dist"],
    "scripts": {
        "build": "tsup",
        "clean": "rimraf dist node_modules .turbo",
        "lint": "eslint ./src",
        "test": "vitest --run",
        "test:watch": "vitest",
        "typecheck": "tsc --noEmit"
    },
    "dependencies": {
        "@babel/code-frame": "^7.24.0",
        "@babel/generator": "^7.24.0",
        "@babel/parser": "^7.24.0",
        "@babel/traverse": "^7.24.0",
        "@babel/types": "^7.24.0"
    },
    "devDependencies": {
        "@repo/eslint-config": "workspace:*",
        "@repo/typescript-config": "workspace:*",
        "@types/babel__generator": "^7.6.0",
        "@types/babel__traverse": "^7.20.0",
        "@types/node": "^22.19.20",
        "eslint": "catalog:",
        "rimraf": "^6.1.3",
        "tsup": "^8.0.0",
        "typescript": "catalog:",
        "vitest": "^3.2.4"
    },
    "publishConfig": { "access": "public" }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
    "extends": "@repo/typescript-config/base.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "lib": ["ES2022"],
        "types": ["node"]
    },
    "include": ["src/**/*"]
}
```

- [ ] **Step 4: Write `tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'node18',
});
```

- [ ] **Step 5: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
        environment: 'node',
    },
});
```

- [ ] **Step 6: Write `src/index.ts` stub**

```ts
export const __placeholder = true;
```

- [ ] **Step 7: Write `README.md`**

```markdown
# @vapor-ui/style-macro

Build-time macro powering `@vapor-ui/core`'s `$style` function. Not consumed directly — use the bundler adapter (`@vapor-ui/style-macro/unplugin`) shipped from Plan B.
```

- [ ] **Step 8: Install + verify**

Run: `pnpm install`
Run: `pnpm --filter @vapor-ui/style-macro typecheck`
Expected: no errors.
Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: "No test files found" (acceptable for skeleton).

- [ ] **Step 9: Commit**

```bash
git add packages/style-macro pnpm-lock.yaml
git commit -m "feat(style-macro): scaffold package"
```

---

## Task 2: Token manifest contract + loader

**Files:**

- Create: `packages/style-macro/src/types.ts`
- Create: `packages/style-macro/src/tokens.ts`
- Create: `packages/style-macro/tests/tokens.test.ts`
- Create: `packages/style-macro/tests/fixtures/manifest.sample.json`

**Interfaces:**

- Consumes: nothing.
- Produces:
    - `type ManifestShape = { version: '1'; tokens: Record<TokenScope, Record<string, string>>; propertyScopes: Record<string, TokenScope>; }` where `TokenScope = 'color' | 'space' | 'dimension' | 'borderRadius' | 'shadow' | 'typography'`.
    - `loadManifest(path: string): ManifestShape` — reads + validates JSON, throws on missing keys.
    - `resolveToken(manifest, property, tokenName): { cssVar: string } | { error: 'unknown-token' | 'scope-mismatch' | 'unknown-property' }`.

- [ ] **Step 1: Write `src/types.ts`**

```ts
export type TokenScope = 'color' | 'space' | 'dimension' | 'borderRadius' | 'shadow' | 'typography';

export interface ManifestShape {
    version: '1';
    tokens: Record<TokenScope, Record<string, string>>;
    propertyScopes: Record<string, TokenScope>;
}

export interface BuildError {
    code:
        | 'unknown-token'
        | 'scope-mismatch'
        | 'unknown-property'
        | 'invalid-input-shape'
        | 'dynamic-value'
        | 'computed-key'
        | 'spread';
    message: string;
    loc: { line: number; column: number };
    frame?: string;
}

export interface Tuple {
    property: string;
    propertyShort: string;
    valueShort: string;
    cssValue: string;
    condition: ConditionKey;
}

export type ConditionKey =
    | { kind: 'default' }
    | { kind: 'named-bp'; name: 'sm' | 'md' | 'lg' }
    | { kind: 'pseudo'; name: PseudoName }
    | { kind: 'raw-media'; query: string; hash: string };

export type PseudoName =
    | '_before'
    | '_after'
    | '_hover'
    | '_focus'
    | '_focusVisible'
    | '_focusWithin'
    | '_active';
```

- [ ] **Step 2: Write `tests/fixtures/manifest.sample.json`**

```json
{
    "version": "1",
    "tokens": {
        "color": {
            "primary": "--vapor-color-primary",
            "bg-gray-100": "--vapor-color-background-canvas-100"
        },
        "space": {
            "100": "--vapor-size-space-100",
            "200": "--vapor-size-space-200",
            "400": "--vapor-size-space-400"
        },
        "dimension": { "100": "--vapor-size-dimension-100" },
        "borderRadius": { "200": "--vapor-size-borderRadius-200" },
        "shadow": { "100": "--vapor-shadow-100" },
        "typography": {}
    },
    "propertyScopes": {
        "padding": "space",
        "paddingTop": "space",
        "margin": "space",
        "gap": "space",
        "backgroundColor": "color",
        "color": "color",
        "borderColor": "color",
        "width": "dimension",
        "height": "dimension",
        "borderRadius": "borderRadius",
        "boxShadow": "shadow"
    }
}
```

- [ ] **Step 3: Write failing tests `tests/tokens.test.ts`**

```ts
import { describe, expect, it } from 'vitest';

import { loadManifest, resolveToken } from '../src/tokens';

const manifestPath = new URL('./fixtures/manifest.sample.json', import.meta.url).pathname;

describe('loadManifest', () => {
    it('reads + validates a valid manifest', () => {
        const m = loadManifest(manifestPath);
        expect(m.tokens.color['primary']).toBe('--vapor-color-primary');
    });

    it('throws on missing version', () => {
        const bad = new URL('./fixtures/manifest.bad.json', import.meta.url).pathname;
        expect(() => loadManifest(bad)).toThrow(/manifest/);
    });
});

describe('resolveToken', () => {
    it('returns css var for valid token', () => {
        const m = loadManifest(manifestPath);
        expect(resolveToken(m, 'padding', '400')).toEqual({ cssVar: '--vapor-size-space-400' });
    });

    it('rejects scope mismatch', () => {
        const m = loadManifest(manifestPath);
        expect(resolveToken(m, 'padding', 'primary')).toEqual({ error: 'scope-mismatch' });
    });

    it('rejects unknown token within scope', () => {
        const m = loadManifest(manifestPath);
        expect(resolveToken(m, 'padding', '9999')).toEqual({ error: 'unknown-token' });
    });

    it('rejects unknown property', () => {
        const m = loadManifest(manifestPath);
        expect(resolveToken(m, 'noSuchProp', '400')).toEqual({ error: 'unknown-property' });
    });
});
```

- [ ] **Step 4: Run tests, verify they fail**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: FAIL with "Cannot find module '../src/tokens'".

- [ ] **Step 5: Write `src/tokens.ts`**

```ts
import { readFileSync } from 'node:fs';

import type { ManifestShape, TokenScope } from './types';

const SCOPES: TokenScope[] = [
    'color',
    'space',
    'dimension',
    'borderRadius',
    'shadow',
    'typography',
];

export function loadManifest(path: string): ManifestShape {
    let parsed: unknown;
    try {
        parsed = JSON.parse(readFileSync(path, 'utf-8'));
    } catch (err) {
        throw new Error(`Failed to read manifest at ${path}: ${(err as Error).message}`);
    }
    if (!isManifest(parsed)) {
        throw new Error(`Invalid token manifest shape at ${path}`);
    }
    return parsed;
}

function isManifest(value: unknown): value is ManifestShape {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    if (v.version !== '1') return false;
    if (typeof v.tokens !== 'object' || v.tokens === null) return false;
    if (typeof v.propertyScopes !== 'object' || v.propertyScopes === null) return false;
    for (const scope of SCOPES) {
        if (typeof (v.tokens as Record<string, unknown>)[scope] !== 'object') return false;
    }
    return true;
}

export type ResolveResult =
    | { cssVar: string }
    | { error: 'unknown-token' | 'scope-mismatch' | 'unknown-property' };

export function resolveToken(
    manifest: ManifestShape,
    property: string,
    tokenName: string,
): ResolveResult {
    const scope = manifest.propertyScopes[property];
    if (!scope) return { error: 'unknown-property' };
    const bucket = manifest.tokens[scope];
    const cssVar = bucket[tokenName];
    if (!cssVar) {
        for (const otherScope of SCOPES) {
            if (otherScope === scope) continue;
            if (manifest.tokens[otherScope][tokenName]) return { error: 'scope-mismatch' };
        }
        return { error: 'unknown-token' };
    }
    return { cssVar };
}
```

- [ ] **Step 6: Create `tests/fixtures/manifest.bad.json`**

```json
{ "tokens": {} }
```

- [ ] **Step 7: Run tests, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: 4 PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/style-macro/src packages/style-macro/tests
git commit -m "feat(style-macro): token manifest contract + loader"
```

---

## Task 3: Property shorthand table + condition classifier

**Files:**

- Create: `packages/style-macro/src/property-shorthand.ts`
- Create: `packages/style-macro/src/condition.ts`
- Create: `packages/style-macro/tests/property-shorthand.test.ts`
- Create: `packages/style-macro/tests/condition.test.ts`

**Interfaces:**

- Consumes: `types.ts`.
- Produces:
    - `PROPERTY_SHORT: Record<string, string>` — lookup table mapping `padding`→`p`, `backgroundColor`→`bg`, etc.
    - `shortenProperty(property): string` — returns `PROPERTY_SHORT[property]` or kebab-cased fallback.
    - `classifyCondition(key: string): ConditionKey | { error: 'unknown-condition' }`.
    - `hashMediaQuery(query: string): string` — 8-char lowercase hex; whitespace + case normalized.

- [ ] **Step 1: Write failing tests `tests/condition.test.ts`**

```ts
import { describe, expect, it } from 'vitest';

import { classifyCondition, hashMediaQuery } from '../src/condition';

describe('classifyCondition', () => {
    it('classifies default', () => {
        expect(classifyCondition('default')).toEqual({ kind: 'default' });
    });
    it('classifies named BP', () => {
        expect(classifyCondition('sm')).toEqual({ kind: 'named-bp', name: 'sm' });
        expect(classifyCondition('md')).toEqual({ kind: 'named-bp', name: 'md' });
        expect(classifyCondition('lg')).toEqual({ kind: 'named-bp', name: 'lg' });
    });
    it('classifies pseudo', () => {
        expect(classifyCondition('_hover')).toEqual({ kind: 'pseudo', name: '_hover' });
        expect(classifyCondition('_focusVisible')).toEqual({
            kind: 'pseudo',
            name: '_focusVisible',
        });
    });
    it('classifies raw @media with normalized hash', () => {
        const a = classifyCondition('@media (min-width: 2560px)');
        const b = classifyCondition('@media (min-width:2560px)');
        const c = classifyCondition('@media   (MIN-WIDTH:  2560PX)');
        expect(a.kind).toBe('raw-media');
        if (a.kind !== 'raw-media' || b.kind !== 'raw-media' || c.kind !== 'raw-media')
            throw new Error();
        expect(a.hash).toBe(b.hash);
        expect(a.hash).toBe(c.hash);
        expect(a.hash).toHaveLength(8);
    });
    it('rejects unknown keys', () => {
        expect(classifyCondition('xl')).toEqual({ error: 'unknown-condition' });
        expect(classifyCondition('_unknownPseudo')).toEqual({ error: 'unknown-condition' });
    });
});

describe('hashMediaQuery', () => {
    it('produces 8-char lowercase hex', () => {
        expect(hashMediaQuery('(min-width: 2560px)')).toMatch(/^[0-9a-f]{8}$/);
    });
    it('is normalize-stable', () => {
        expect(hashMediaQuery('(min-width: 2560px)')).toBe(hashMediaQuery('(MIN-WIDTH:  2560px)'));
    });
});
```

- [ ] **Step 2: Write failing tests `tests/property-shorthand.test.ts`**

```ts
import { describe, expect, it } from 'vitest';

import { PROPERTY_SHORT, shortenProperty } from '../src/property-shorthand';

describe('PROPERTY_SHORT', () => {
    it('covers common spacing props', () => {
        expect(PROPERTY_SHORT.padding).toBe('p');
        expect(PROPERTY_SHORT.margin).toBe('m');
        expect(PROPERTY_SHORT.paddingTop).toBe('pt');
        expect(PROPERTY_SHORT.gap).toBe('gap');
    });
    it('covers color props', () => {
        expect(PROPERTY_SHORT.backgroundColor).toBe('bg');
        expect(PROPERTY_SHORT.color).toBe('color');
        expect(PROPERTY_SHORT.borderColor).toBe('bc');
    });
    it('shortenProperty kebabs unknown props', () => {
        expect(shortenProperty('textAlign')).toBe('text-align');
    });
});
```

- [ ] **Step 3: Run tests, verify they fail**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: FAIL with "Cannot find module".

- [ ] **Step 4: Write `src/property-shorthand.ts`**

```ts
export const PROPERTY_SHORT: Record<string, string> = {
    padding: 'p',
    paddingTop: 'pt',
    paddingBottom: 'pb',
    paddingLeft: 'pl',
    paddingRight: 'pr',
    paddingX: 'px',
    paddingY: 'py',
    margin: 'm',
    marginTop: 'mt',
    marginBottom: 'mb',
    marginLeft: 'ml',
    marginRight: 'mr',
    marginX: 'mx',
    marginY: 'my',
    gap: 'gap',
    width: 'w',
    height: 'h',
    minWidth: 'minw',
    minHeight: 'minh',
    maxWidth: 'maxw',
    maxHeight: 'maxh',
    backgroundColor: 'bg',
    color: 'color',
    borderColor: 'bc',
    borderRadius: 'br',
    boxShadow: 'sh',
    opacity: 'op',
    display: 'd',
    position: 'pos',
    overflow: 'ov',
    textAlign: 'ta',
};

export function shortenProperty(property: string): string {
    const known = PROPERTY_SHORT[property];
    if (known) return known;
    return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}
```

- [ ] **Step 5: Write `src/condition.ts`**

```ts
import { createHash } from 'node:crypto';

import type { ConditionKey, PseudoName } from './types';

const NAMED_BP = new Set(['sm', 'md', 'lg'] as const);
const PSEUDO: Set<PseudoName> = new Set([
    '_before',
    '_after',
    '_hover',
    '_focus',
    '_focusVisible',
    '_focusWithin',
    '_active',
]);

export function hashMediaQuery(query: string): string {
    const normalized = query.replace(/\s+/g, ' ').trim().toLowerCase();
    return createHash('sha1').update(normalized).digest('hex').slice(0, 8);
}

export function classifyCondition(key: string): ConditionKey | { error: 'unknown-condition' } {
    if (key === 'default') return { kind: 'default' };
    if ((NAMED_BP as Set<string>).has(key)) {
        return { kind: 'named-bp', name: key as 'sm' | 'md' | 'lg' };
    }
    if ((PSEUDO as Set<string>).has(key)) {
        return { kind: 'pseudo', name: key as PseudoName };
    }
    if (key.startsWith('@media ')) {
        const query = key.slice('@media '.length).trim();
        return { kind: 'raw-media', query, hash: hashMediaQuery(query) };
    }
    return { error: 'unknown-condition' };
}
```

- [ ] **Step 6: Run tests, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/style-macro/src packages/style-macro/tests
git commit -m "feat(style-macro): property shorthand table + condition classifier"
```

---

## Task 4: Atomic class-name synthesizer

**Files:**

- Create: `packages/style-macro/src/class-name.ts`
- Create: `packages/style-macro/tests/class-name.test.ts`

**Interfaces:**

- Consumes: `types.ts`, `property-shorthand.ts`, `condition.ts`.
- Produces:
    - `buildClassName(tuple: Tuple): string` — deterministic, `_<conditionPrefix>-<propShort>-<valueShort>`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest';

import { buildClassName } from '../src/class-name';
import type { Tuple } from '../src/types';

const t = (overrides: Partial<Tuple>): Tuple => ({
    property: 'padding',
    propertyShort: 'p',
    valueShort: '400',
    cssValue: 'var(--vapor-size-space-400)',
    condition: { kind: 'default' },
    ...overrides,
});

describe('buildClassName', () => {
    it('default: _<short>-<value>', () => {
        expect(buildClassName(t({}))).toBe('_p-400');
    });
    it('default: bg primary', () => {
        expect(
            buildClassName(
                t({ property: 'backgroundColor', propertyShort: 'bg', valueShort: 'primary' }),
            ),
        ).toBe('_bg-primary');
    });
    it('named BP: _sm-<short>-<value>', () => {
        expect(
            buildClassName(t({ valueShort: '100', condition: { kind: 'named-bp', name: 'sm' } })),
        ).toBe('_sm-p-100');
    });
    it('pseudo: strip leading underscore', () => {
        expect(
            buildClassName(
                t({
                    property: 'backgroundColor',
                    propertyShort: 'bg',
                    valueShort: 'primary-hover',
                    condition: { kind: 'pseudo', name: '_hover' },
                }),
            ),
        ).toBe('_hover-bg-primary-hover');
    });
    it('raw media: _mq<hash6>-<short>-<value>', () => {
        const cls = buildClassName(
            t({
                valueShort: '400',
                condition: { kind: 'raw-media', query: '(min-width: 2560px)', hash: 'abcdef12' },
            }),
        );
        expect(cls).toBe('_mqabcdef-p-400');
    });
});
```

- [ ] **Step 2: Verify tests fail**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: FAIL.

- [ ] **Step 3: Write `src/class-name.ts`**

```ts
import type { ConditionKey, Tuple } from './types';

function conditionPrefix(c: ConditionKey): string {
    switch (c.kind) {
        case 'default':
            return '';
        case 'named-bp':
            return c.name;
        case 'pseudo':
            return c.name.slice(1);
        case 'raw-media':
            return `mq${c.hash.slice(0, 6)}`;
    }
}

export function buildClassName(t: Tuple): string {
    const prefix = conditionPrefix(t.condition);
    const head = prefix ? `_${prefix}` : '_';
    const sep = prefix ? '-' : '';
    return `${head}${sep}${t.propertyShort}-${t.valueShort}`;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/style-macro/src packages/style-macro/tests
git commit -m "feat(style-macro): atomic class-name synthesizer"
```

---

## Task 5: CSS emitter with deterministic order

**Files:**

- Create: `packages/style-macro/src/emit-css.ts`
- Create: `packages/style-macro/tests/emit-css.test.ts`

**Interfaces:**

- Consumes: `types.ts`, `class-name.ts`.
- Produces:
    - `emitCss(tuples: Tuple[]): string` — single string. `@layer vapor.utilities { … }`. Emit order per §6.3. Same input → byte-identical output.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest';

import { emitCss } from '../src/emit-css';
import type { Tuple } from '../src/types';

const t = (o: Partial<Tuple>): Tuple => ({
    property: 'padding',
    propertyShort: 'p',
    valueShort: '400',
    cssValue: 'var(--vapor-size-space-400)',
    condition: { kind: 'default' },
    ...o,
});

describe('emitCss', () => {
    it('emits default rules inside @layer vapor.utilities', () => {
        const css = emitCss([t({})]);
        expect(css).toContain('@layer vapor.utilities');
        expect(css).toMatch(/\._p-400\s*\{\s*padding:\s*var\(--vapor-size-space-400\);\s*\}/);
    });

    it('orders: default → sm → md → lg → @media (sorted) → pseudo (fixed order)', () => {
        const tuples: Tuple[] = [
            t({ condition: { kind: 'pseudo', name: '_hover' }, valueShort: 'h' }),
            t({
                condition: { kind: 'raw-media', query: '(min-width: 9999px)', hash: 'zzzzzzzz' },
                valueShort: 'z',
            }),
            t({ condition: { kind: 'named-bp', name: 'lg' }, valueShort: 'l' }),
            t({ condition: { kind: 'default' }, valueShort: 'd' }),
            t({ condition: { kind: 'named-bp', name: 'sm' }, valueShort: 's' }),
            t({
                condition: { kind: 'raw-media', query: '(min-width: 1000px)', hash: 'aaaaaaaa' },
                valueShort: 'a',
            }),
            t({ condition: { kind: 'named-bp', name: 'md' }, valueShort: 'm' }),
            t({ condition: { kind: 'pseudo', name: '_focus' }, valueShort: 'f' }),
        ];
        const css = emitCss(tuples);
        const positions = [
            '_p-d',
            '_sm-p-s',
            '_md-p-m',
            '_lg-p-l',
            '_mqaaaaaa-p-a',
            '_mqzzzzzz-p-z',
            '_focus-p-f',
            '_hover-p-h',
        ].map((cls) => css.indexOf(cls));
        const sorted = [...positions].sort((a, b) => a - b);
        expect(positions).toEqual(sorted);
        expect(positions.every((p) => p >= 0)).toBe(true);
    });

    it('dedupes identical tuples', () => {
        const dup = [t({}), t({})];
        const css = emitCss(dup);
        expect((css.match(/\._p-400/g) ?? []).length).toBe(1);
    });

    it('wraps named BP in @media (--vapor-<name>)', () => {
        const css = emitCss([
            t({ condition: { kind: 'named-bp', name: 'sm' }, valueShort: '100' }),
        ]);
        expect(css).toMatch(/@media \(--vapor-sm\)\s*\{\s*\._sm-p-100/);
    });

    it('wraps raw @media using raw query string', () => {
        const css = emitCss([
            t({
                condition: { kind: 'raw-media', query: '(min-width: 2560px)', hash: 'abcdef12' },
                valueShort: '400',
            }),
        ]);
        expect(css).toMatch(/@media \(min-width: 2560px\)\s*\{\s*\._mqabcdef-p-400/);
    });

    it('appends :pseudo selector', () => {
        const css = emitCss([
            t({ condition: { kind: 'pseudo', name: '_hover' }, valueShort: 'h' }),
        ]);
        expect(css).toMatch(/\._hover-p-h:hover\s*\{/);
    });

    it('is deterministic — same input twice → byte-identical', () => {
        const tuples: Tuple[] = [
            t({}),
            t({ condition: { kind: 'pseudo', name: '_hover' }, valueShort: 'h' }),
            t({ condition: { kind: 'named-bp', name: 'sm' }, valueShort: 's' }),
        ];
        expect(emitCss(tuples)).toBe(emitCss([...tuples].reverse()));
    });
});
```

- [ ] **Step 2: Verify tests fail**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: FAIL.

- [ ] **Step 3: Write `src/emit-css.ts`**

```ts
import { buildClassName } from './class-name';
import type { ConditionKey, PseudoName, Tuple } from './types';

const PSEUDO_ORDER: PseudoName[] = [
    '_before',
    '_after',
    '_hover',
    '_focus',
    '_focusVisible',
    '_focusWithin',
    '_active',
];

const PSEUDO_SELECTOR: Record<PseudoName, string> = {
    _before: '::before',
    _after: '::after',
    _hover: ':hover',
    _focus: ':focus',
    _focusVisible: ':focus-visible',
    _focusWithin: ':focus-within',
    _active: ':active',
};

function bucket(c: ConditionKey): 'default' | 'sm' | 'md' | 'lg' | 'raw' | 'pseudo' {
    switch (c.kind) {
        case 'default':
            return 'default';
        case 'named-bp':
            return c.name;
        case 'raw-media':
            return 'raw';
        case 'pseudo':
            return 'pseudo';
    }
}

function dedupe(tuples: Tuple[]): Tuple[] {
    const seen = new Map<string, Tuple>();
    for (const t of tuples) {
        const key = buildClassName(t);
        if (!seen.has(key)) seen.set(key, t);
    }
    return [...seen.values()];
}

function ruleLine(t: Tuple): string {
    const cls = buildClassName(t);
    const sel = t.condition.kind === 'pseudo' ? `${cls}${PSEUDO_SELECTOR[t.condition.name]}` : cls;
    return `    .${sel} { ${kebab(t.property)}: ${t.cssValue}; }`;
}

function kebab(p: string): string {
    return p.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function emitCss(tuples: Tuple[]): string {
    const unique = dedupe(tuples);
    const groups = {
        default: [] as Tuple[],
        sm: [] as Tuple[],
        md: [] as Tuple[],
        lg: [] as Tuple[],
        raw: [] as Tuple[],
        pseudo: [] as Tuple[],
    };
    for (const t of unique) groups[bucket(t.condition)].push(t);

    // raw-media: sort by query string
    groups.raw.sort((a, b) => {
        if (a.condition.kind !== 'raw-media' || b.condition.kind !== 'raw-media') return 0;
        return a.condition.query.localeCompare(b.condition.query);
    });

    // pseudo: enforce PSEUDO_ORDER
    groups.pseudo.sort((a, b) => {
        if (a.condition.kind !== 'pseudo' || b.condition.kind !== 'pseudo') return 0;
        return PSEUDO_ORDER.indexOf(a.condition.name) - PSEUDO_ORDER.indexOf(b.condition.name);
    });

    // within each bucket, sort by class name for byte-identical output
    const sortByClass = (arr: Tuple[]) =>
        arr.sort((a, b) => buildClassName(a).localeCompare(buildClassName(b)));
    sortByClass(groups.default);
    sortByClass(groups.sm);
    sortByClass(groups.md);
    sortByClass(groups.lg);
    // raw + pseudo already deterministic above

    const lines: string[] = ['@layer vapor.utilities {'];
    for (const t of groups.default) lines.push(ruleLine(t));
    const namedBpBlock = (name: 'sm' | 'md' | 'lg', arr: Tuple[]) => {
        if (!arr.length) return;
        lines.push(`    @media (--vapor-${name}) {`);
        for (const t of arr) lines.push('    ' + ruleLine(t));
        lines.push('    }');
    };
    namedBpBlock('sm', groups.sm);
    namedBpBlock('md', groups.md);
    namedBpBlock('lg', groups.lg);
    for (const t of groups.raw) {
        if (t.condition.kind !== 'raw-media') continue;
        lines.push(`    @media ${t.condition.query} {`);
        lines.push('    ' + ruleLine(t));
        lines.push('    }');
    }
    for (const t of groups.pseudo) lines.push(ruleLine(t));
    lines.push('}');
    return lines.join('\n') + '\n';
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/style-macro/src packages/style-macro/tests
git commit -m "feat(style-macro): deterministic CSS emitter"
```

---

## Task 6: Input validator + AST walker

**Files:**

- Create: `packages/style-macro/src/code-frame.ts`
- Create: `packages/style-macro/src/validate-input.ts`
- Create: `packages/style-macro/src/parse-call.ts`
- Create: `packages/style-macro/tests/validate-input.test.ts`

**Interfaces:**

- Consumes: `types.ts`, `condition.ts`, `tokens.ts`.
- Produces:
    - `parseCallArgs(node: t.ObjectExpression): RawEntry[]` — extracts `{ key, value | ternaryValue, conditions? }`.
    - `validateInput(raw: RawEntry[], manifest): BuildError[]` — pure validator. Returns all build errors discovered in input shape, token grammar, and the entry-level-only ternary rule (no ternaries inside condition-objects).
    - `formatBuildError(err: BuildError, source: string, filename: string): string` (uses `@babel/code-frame`).

The orchestrator (Task 7) owns the actual class-name + AST rewrite. This file only validates and reports.

- [ ] **Step 1: Write `src/code-frame.ts`**

```ts
import { codeFrameColumns } from '@babel/code-frame';

import type { BuildError } from './types';

export function formatBuildError(err: BuildError, source: string, filename: string): string {
    const frame = codeFrameColumns(
        source,
        { start: { line: err.loc.line, column: err.loc.column } },
        { highlightCode: false },
    );
    return `${filename}:${err.loc.line}:${err.loc.column}\n${err.code}: ${err.message}\n${frame}`;
}
```

- [ ] **Step 2: Write failing tests `tests/validate-input.test.ts`**

```ts
import * as parser from '@babel/parser';
import * as t from '@babel/types';
import { describe, expect, it } from 'vitest';

import { parseCallArgs } from '../src/parse-call';
import { loadManifest } from '../src/tokens';
import { validateInput } from '../src/validate-input';

const manifestPath = new URL('./fixtures/manifest.sample.json', import.meta.url).pathname;
const manifest = loadManifest(manifestPath);

function callArg(src: string) {
    const file = parser.parse(`$style(${src})`, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
    });
    const expr = (file.program.body[0] as t.ExpressionStatement).expression as t.CallExpression;
    return expr.arguments[0] as t.ObjectExpression;
}

describe('validateInput', () => {
    it('accepts a static literal entry', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ padding: '$400' }`)), manifest);
        expect(errors).toEqual([]);
    });

    it('accepts an object value with multiple conditions', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ padding: { default: '$200', sm: '$100' } }`)),
            manifest,
        );
        expect(errors).toEqual([]);
    });

    it('accepts an entry-level ternary', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ backgroundColor: x ? '$primary' : '$bg-gray-100' }`)),
            manifest,
        );
        expect(errors).toEqual([]);
    });

    it('rejects spread', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ ...other, padding: '$400' }`)),
            manifest,
        );
        expect(errors.map((e) => e.code)).toContain('spread');
    });

    it('rejects computed key', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ [k]: '$400' }`)), manifest);
        expect(errors.map((e) => e.code)).toContain('computed-key');
    });

    it('rejects identifier value', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ padding: someVar }`)), manifest);
        expect(errors.map((e) => e.code)).toContain('dynamic-value');
    });

    it('rejects ternary with dynamic arm', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ padding: x ? '$400' : someVar }`)),
            manifest,
        );
        expect(errors.map((e) => e.code)).toContain('dynamic-value');
    });

    it('rejects ternary nested inside a condition-object', () => {
        const errors = validateInput(
            parseCallArgs(callArg(`{ color: { default: x ? '$primary' : '$bg-gray-100' } }`)),
            manifest,
        );
        expect(errors.map((e) => e.code)).toContain('dynamic-value');
    });

    it('rejects unknown token', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ padding: '$9999' }`)), manifest);
        expect(errors.map((e) => e.code)).toContain('unknown-token');
    });

    it('rejects property-token scope mismatch', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ padding: '$primary' }`)), manifest);
        expect(errors.map((e) => e.code)).toContain('scope-mismatch');
    });

    it('allows literal CSS value', () => {
        const errors = validateInput(parseCallArgs(callArg(`{ display: 'flex' }`)), manifest);
        expect(errors).toEqual([]);
    });
});
```

- [ ] **Step 3: Verify tests fail**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: FAIL with module-not-found.

- [ ] **Step 4: Write `src/parse-call.ts`**

```ts
import * as t from '@babel/types';

export interface RawValue {
    kind: 'literal' | 'token' | 'ternary' | 'unknown';
    rawText?: string;
    token?: string;
    literal?: string | number;
    consequent?: RawValue;
    alternate?: RawValue;
    loc: { line: number; column: number };
}

export interface RawEntry {
    property: string;
    /** When value is an object literal (e.g. `{ default, sm, _hover }`), `conditions` is populated; else `value`. */
    value?: RawValue;
    conditions?: Array<{ conditionKey: string; value: RawValue }>;
    loc: { line: number; column: number };
    error?: 'spread' | 'computed-key';
}

function locOf(node: t.Node): { line: number; column: number } {
    return { line: node.loc?.start.line ?? 1, column: node.loc?.start.column ?? 0 };
}

function readValueExpression(node: t.Node): RawValue {
    if (t.isStringLiteral(node)) {
        if (node.value.startsWith('$')) {
            return {
                kind: 'token',
                token: node.value.slice(1),
                rawText: node.value,
                loc: locOf(node),
            };
        }
        return { kind: 'literal', literal: node.value, rawText: node.value, loc: locOf(node) };
    }
    if (t.isNumericLiteral(node)) {
        return {
            kind: 'literal',
            literal: node.value,
            rawText: String(node.value),
            loc: locOf(node),
        };
    }
    if (t.isConditionalExpression(node)) {
        return {
            kind: 'ternary',
            consequent: readValueExpression(node.consequent),
            alternate: readValueExpression(node.alternate),
            loc: locOf(node),
        };
    }
    return { kind: 'unknown', loc: locOf(node) };
}

export function parseCallArgs(arg: t.ObjectExpression): RawEntry[] {
    const out: RawEntry[] = [];
    for (const prop of arg.properties) {
        if (t.isSpreadElement(prop)) {
            out.push({ property: '<spread>', loc: locOf(prop), error: 'spread' });
            continue;
        }
        if (!t.isObjectProperty(prop)) continue;
        if (prop.computed) {
            out.push({ property: '<computed>', loc: locOf(prop), error: 'computed-key' });
            continue;
        }
        const name = t.isIdentifier(prop.key)
            ? prop.key.name
            : t.isStringLiteral(prop.key)
              ? prop.key.value
              : undefined;
        if (!name) {
            out.push({ property: '<unknown>', loc: locOf(prop), error: 'computed-key' });
            continue;
        }

        const valueNode = prop.value;
        if (t.isObjectExpression(valueNode)) {
            const conditions: Array<{ conditionKey: string; value: RawValue }> = [];
            for (const inner of valueNode.properties) {
                if (!t.isObjectProperty(inner) || inner.computed) {
                    conditions.push({
                        conditionKey: '<bad>',
                        value: { kind: 'unknown', loc: locOf(inner) },
                    });
                    continue;
                }
                const ck = t.isIdentifier(inner.key)
                    ? inner.key.name
                    : t.isStringLiteral(inner.key)
                      ? inner.key.value
                      : '<bad>';
                conditions.push({
                    conditionKey: ck,
                    value: readValueExpression(inner.value as t.Node),
                });
            }
            out.push({ property: name, conditions, loc: locOf(prop) });
        } else {
            out.push({
                property: name,
                value: readValueExpression(valueNode as t.Node),
                loc: locOf(prop),
            });
        }
    }
    return out;
}
```

- [ ] **Step 5: Write `src/validate-input.ts`**

```ts
import { classifyCondition } from './condition';
import type { RawEntry, RawValue } from './parse-call';
import { resolveToken } from './tokens';
import type { BuildError, ManifestShape } from './types';

function validateValue(
    property: string,
    raw: RawValue,
    manifest: ManifestShape,
    errors: BuildError[],
    allowTernary: boolean,
): void {
    switch (raw.kind) {
        case 'literal':
            return;
        case 'token': {
            const res = resolveToken(manifest, property, raw.token!);
            if ('error' in res) {
                errors.push({
                    code: res.error,
                    message:
                        res.error === 'unknown-token'
                            ? `Unknown token "$${raw.token}" for property "${property}".`
                            : res.error === 'scope-mismatch'
                              ? `Token "$${raw.token}" is not valid for property "${property}".`
                              : `Unknown property "${property}".`,
                    loc: raw.loc,
                });
            }
            return;
        }
        case 'ternary':
            if (!allowTernary) {
                errors.push({
                    code: 'dynamic-value',
                    message:
                        'Ternary is only allowed at entry-level. Move it outside the { default, sm, _hover } object.',
                    loc: raw.loc,
                });
                return;
            }
            validateValue(property, raw.consequent!, manifest, errors, false);
            validateValue(property, raw.alternate!, manifest, errors, false);
            return;
        case 'unknown':
            errors.push({
                code: 'dynamic-value',
                message: 'Value must be a literal, token string, or ternary of those.',
                loc: raw.loc,
            });
            return;
    }
}

export function validateInput(entries: RawEntry[], manifest: ManifestShape): BuildError[] {
    const errors: BuildError[] = [];
    for (const entry of entries) {
        if (entry.error) {
            errors.push({
                code: entry.error,
                message:
                    entry.error === 'spread'
                        ? 'Spread is not allowed inside $style().'
                        : 'Computed keys are not allowed inside $style().',
                loc: entry.loc,
            });
            continue;
        }
        if (entry.conditions) {
            for (const c of entry.conditions) {
                const cls = classifyCondition(c.conditionKey);
                if ('error' in cls) {
                    errors.push({
                        code: 'invalid-input-shape',
                        message: `Unknown condition "${c.conditionKey}".`,
                        loc: c.value.loc,
                    });
                    continue;
                }
                // No ternaries inside condition-objects: pass `allowTernary: false`.
                validateValue(entry.property, c.value, manifest, errors, false);
            }
        } else if (entry.value) {
            validateValue(entry.property, entry.value, manifest, errors, true);
        }
    }
    return errors;
}
```

- [ ] **Step 6: Run tests, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: 10 PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/style-macro/src packages/style-macro/tests
git commit -m "feat(style-macro): input validator + AST walker"
```

---

## Task 7: Transform orchestrator + fixture suite

**Files:**

- Create: `packages/style-macro/src/transform.ts`
- Create: `packages/style-macro/src/index.ts` (overwrite stub)
- Create: `packages/style-macro/tests/fixtures/**` (one dir per case)
- Create: `packages/style-macro/tests/transform.test.ts`

**Interfaces:**

- Consumes: every prior file.
- Produces (public API of the package):
    ```ts
    export interface TransformResult {
        code: string;
        css: string | null;
        classes: string[];
        errors: BuildError[];
    }
    export function transform(opts: {
        source: string;
        filename: string;
        manifest: ManifestShape;
        importSource?: string; // default '@vapor-ui/core'
        importName?: string; // default '$style'
    }): TransformResult;
    ```
- `transform` parses the source, locates every `$style(...)` call whose callee binding traces to `@vapor-ui/core`'s `$style` import, validates + expands each, replaces the call with a string-literal of space-joined class names, and returns one merged CSS chunk.

- [ ] **Step 1: Write `src/transform.ts`**

```ts
import _generate from '@babel/generator';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import * as t from '@babel/types';

import { buildClassName } from './class-name';
import { classifyCondition } from './condition';
import { emitCss } from './emit-css';
import { parseCallArgs } from './parse-call';
import type { RawEntry, RawValue } from './parse-call';
import { shortenProperty } from './property-shorthand';
import { resolveToken } from './tokens';
import type { BuildError, ConditionKey, ManifestShape, Tuple } from './types';
import { validateInput } from './validate-input';

const traverse = (_traverse as unknown as { default: typeof _traverse }).default ?? _traverse;
const generate = (_generate as unknown as { default: typeof _generate }).default ?? _generate;

export interface TransformResult {
    code: string;
    css: string | null;
    classes: string[];
    errors: BuildError[];
}

interface TransformOpts {
    source: string;
    filename: string;
    manifest: ManifestShape;
    importSource?: string;
    importName?: string;
}

/**
 * Build a tuple for a single value (literal | token). Caller has already validated.
 */
function tupleFor(
    property: string,
    cond: ConditionKey,
    raw: RawValue,
    manifest: ManifestShape,
): Tuple {
    const propertyShort = shortenProperty(property);
    if (raw.kind === 'literal') {
        return {
            property,
            propertyShort,
            valueShort: String(raw.literal)
                .replace(/[^a-z0-9]+/gi, '-')
                .replace(/^-|-$/g, ''),
            cssValue: String(raw.literal),
            condition: cond,
        };
    }
    // raw.kind === 'token'
    const res = resolveToken(manifest, property, raw.token!);
    if ('error' in res) throw new Error('validateInput should have caught this');
    return {
        property,
        propertyShort,
        valueShort: raw.token!,
        cssValue: `var(${res.cssVar})`,
        condition: cond,
    };
}

/**
 * For one entry, build the AST replacement expression + collect tuples.
 * Returns null if the entry yielded nothing (no static value).
 *
 * Spec invariants enforced by validateInput beforehand:
 *  - ternary only at entry-level (never inside a condition-object)
 *  - both arms are static (literal | token)
 */
function buildEntryExpression(
    entry: RawEntry,
    manifest: ManifestShape,
    tuples: Tuple[],
    allClasses: Set<string>,
): t.Expression | null {
    // Case A: entry-level ternary (`{ color: x ? '$a' : '$b' }`)
    if (entry.value?.kind === 'ternary') {
        const conseq = tupleFor(
            entry.property,
            { kind: 'default' },
            entry.value.consequent!,
            manifest,
        );
        const alt = tupleFor(entry.property, { kind: 'default' }, entry.value.alternate!, manifest);
        tuples.push(conseq, alt);
        const conseqCls = buildClassName(conseq);
        const altCls = buildClassName(alt);
        allClasses.add(conseqCls);
        allClasses.add(altCls);
        return t.conditionalExpression(
            t.cloneNode(entry.testNode!),
            t.stringLiteral(conseqCls),
            t.stringLiteral(altCls),
        );
    }

    // Case B: condition-object (`{ color: { default: '$a', sm: '$b', _hover: '$c' } }`)
    if (entry.conditions) {
        const classNames: string[] = [];
        for (const c of entry.conditions) {
            const cond = classifyCondition(c.conditionKey);
            if ('error' in cond) continue;
            const tup = tupleFor(entry.property, cond, c.value, manifest);
            tuples.push(tup);
            const cls = buildClassName(tup);
            classNames.push(cls);
            allClasses.add(cls);
        }
        if (!classNames.length) return null;
        return t.stringLiteral(classNames.join(' '));
    }

    // Case C: single literal/token value
    if (entry.value) {
        const tup = tupleFor(entry.property, { kind: 'default' }, entry.value, manifest);
        tuples.push(tup);
        const cls = buildClassName(tup);
        allClasses.add(cls);
        return t.stringLiteral(cls);
    }

    return null;
}

export function transform(opts: TransformOpts): TransformResult {
    const importSource = opts.importSource ?? '@vapor-ui/core';
    const importName = opts.importName ?? '$style';

    let ast: ReturnType<typeof parse>;
    try {
        ast = parse(opts.source, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
            sourceFilename: opts.filename,
        });
    } catch {
        return { code: opts.source, css: null, classes: [], errors: [] };
    }

    const errors: BuildError[] = [];
    const allTuples: Tuple[] = [];
    const allClasses = new Set<string>();
    let bindingName: string | null = null;

    traverse(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value !== importSource) return;
            for (const spec of path.node.specifiers) {
                if (
                    t.isImportSpecifier(spec) &&
                    t.isIdentifier(spec.imported) &&
                    spec.imported.name === importName
                ) {
                    bindingName = spec.local.name;
                }
            }
        },
    });

    if (!bindingName) {
        return { code: opts.source, css: null, classes: [], errors: [] };
    }

    traverse(ast, {
        CallExpression(path) {
            const callee = path.node.callee;
            if (!t.isIdentifier(callee) || callee.name !== bindingName) return;
            const arg = path.node.arguments[0];
            if (!t.isObjectExpression(arg)) {
                errors.push({
                    code: 'invalid-input-shape',
                    message: '$style() requires an object literal argument.',
                    loc: {
                        line: path.node.loc?.start.line ?? 1,
                        column: path.node.loc?.start.column ?? 0,
                    },
                });
                return;
            }

            const entries = parseCallArgs(arg);

            // Capture the original ternary test AST per entry — parseCallArgs already discards
            // the ConditionalExpression node, so the orchestrator wires it back in here.
            for (const [idx, entry] of entries.entries()) {
                const prop = arg.properties[idx];
                if (!t.isObjectProperty(prop)) continue;
                if (t.isConditionalExpression(prop.value)) {
                    entry.testNode = prop.value.test;
                }
            }

            const inputErrors = validateInput(entries, opts.manifest);
            errors.push(...inputErrors);
            if (inputErrors.length) return;

            const entryNodes: t.Expression[] = [];
            for (const entry of entries) {
                if (entry.error) continue;
                const expr = buildEntryExpression(entry, opts.manifest, allTuples, allClasses);
                if (expr) entryNodes.push(expr);
            }

            // All-static → single string literal. Otherwise → array.filter(Boolean).join(' ').
            const allStatic = entryNodes.every((n) => t.isStringLiteral(n));
            if (allStatic) {
                const merged = entryNodes
                    .map((n) => (n as t.StringLiteral).value)
                    .filter(Boolean)
                    .join(' ');
                path.replaceWith(t.stringLiteral(merged));
            } else {
                const arr = t.arrayExpression(entryNodes);
                const filter = t.callExpression(t.memberExpression(arr, t.identifier('filter')), [
                    t.identifier('Boolean'),
                ]);
                const join = t.callExpression(t.memberExpression(filter, t.identifier('join')), [
                    t.stringLiteral(' '),
                ]);
                path.replaceWith(join);
            }
        },
    });

    if (errors.length) {
        return { code: opts.source, css: null, classes: [], errors };
    }

    const { code } = generate(ast, { retainLines: false, comments: true }, opts.source);
    const css = allTuples.length ? emitCss(allTuples) : null;
    return { code, css, classes: [...allClasses], errors: [] };
}
```

Add a `testNode?: t.Expression` field to the `RawEntry` interface in `parse-call.ts` so the orchestrator can wire the original ternary test back into the rewritten code:

```ts
// in parse-call.ts — add to RawEntry:
export interface RawEntry {
    // ... existing fields ...
    testNode?: import('@babel/types').Expression;
}
```

- [ ] **Step 2: Overwrite `src/index.ts`**

```ts
export { transform } from './transform';
export type { TransformResult } from './transform';
export type { ManifestShape, BuildError } from './types';
export { loadManifest } from './tokens';
```

- [ ] **Step 3: Build fixtures (one dir per case)**

For each case, create two files (`input.tsx`, `expected.code.tsx`, `expected.css`) under `tests/fixtures/<case>/`. Build at minimum:

`tests/fixtures/static-literal/input.tsx`:

```tsx
import { $style } from '@vapor-ui/core';

export const C = () => <div className={$style({ padding: '$400', backgroundColor: '$primary' })} />;
```

`tests/fixtures/static-literal/expected.code.tsx`:

```tsx
import { $style } from '@vapor-ui/core';

export const C = () => <div className={'_bg-primary _p-400'} />;
```

`tests/fixtures/static-literal/expected.css`:

```css
@layer vapor.utilities {
    ._bg-primary {
        background-color: var(--vapor-color-primary);
    }
    ._p-400 {
        padding: var(--vapor-size-space-400);
    }
}
```

Add similar fixtures for `ternary/`, `named-bp/`, `raw-media/`, `pseudo/`, `mixed/`, and one `reject/` dir per error case from §4.4 with an `expected.errors.json` like `[{ "code": "spread" }]`.

- [ ] **Step 4: Write fixture-driven `tests/transform.test.ts`**

```ts
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { transform } from '../src';
import { loadManifest } from '../src/tokens';

const manifest = loadManifest(new URL('./fixtures/manifest.sample.json', import.meta.url).pathname);
const FIX_DIR = new URL('./fixtures', import.meta.url).pathname;

describe('transform fixtures', () => {
    const dirs = readdirSync(FIX_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== 'reject')
        .map((d) => d.name);
    for (const name of dirs) {
        it(`accepts: ${name}`, () => {
            const dir = join(FIX_DIR, name);
            const source = readFileSync(join(dir, 'input.tsx'), 'utf-8');
            const result = transform({ source, filename: 'input.tsx', manifest });
            expect(result.errors).toEqual([]);
            const expectedCode = readFileSync(join(dir, 'expected.code.tsx'), 'utf-8');
            expect(result.code.replace(/\s+/g, ' ').trim()).toBe(
                expectedCode.replace(/\s+/g, ' ').trim(),
            );
            const expectedCss = readFileSync(join(dir, 'expected.css'), 'utf-8');
            expect(result.css?.replace(/\s+/g, ' ').trim()).toBe(
                expectedCss.replace(/\s+/g, ' ').trim(),
            );
        });
    }

    const rejectDirs = existsSync(join(FIX_DIR, 'reject'))
        ? readdirSync(join(FIX_DIR, 'reject'), { withFileTypes: true })
              .filter((d) => d.isFile() && d.name.endsWith('.input.tsx'))
              .map((d) => d.name)
        : [];
    for (const file of rejectDirs) {
        it(`rejects: ${file}`, () => {
            const source = readFileSync(join(FIX_DIR, 'reject', file), 'utf-8');
            const result = transform({ source, filename: file, manifest });
            const expectedJson = readFileSync(
                join(FIX_DIR, 'reject', file.replace('.input.tsx', '.expected.errors.json')),
                'utf-8',
            );
            const expected = JSON.parse(expectedJson) as Array<{ code: string }>;
            expect(result.errors.map((e) => e.code).sort()).toEqual(
                expected.map((e) => e.code).sort(),
            );
        });
    }
});
```

- [ ] **Step 5: Run tests, verify all fixtures pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: every fixture PASS. If a fixture fails, fix the fixture (it's the source of truth) before fixing the macro.

- [ ] **Step 6: Build the package**

Run: `pnpm --filter @vapor-ui/style-macro build`
Expected: emits `dist/index.js` + `dist/index.cjs` + `dist/index.d.ts`.

- [ ] **Step 7: Commit**

```bash
git add packages/style-macro
git commit -m "feat(style-macro): transform orchestrator + fixture suite"
```

---

## Task 8: Byte-identical determinism test

**Files:**

- Create: `packages/style-macro/tests/byte-identical.test.ts`

**Interfaces:**

- Consumes: public `transform`.

- [ ] **Step 1: Write test**

```ts
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { transform } from '../src';
import { loadManifest } from '../src/tokens';

const manifest = loadManifest(new URL('./fixtures/manifest.sample.json', import.meta.url).pathname);
const FIX = new URL('./fixtures', import.meta.url).pathname;

describe('byte-identical output', () => {
    const dirs = readdirSync(FIX, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== 'reject')
        .map((d) => d.name);
    for (const name of dirs) {
        it(`${name} → identical on rerun`, () => {
            const src = readFileSync(join(FIX, name, 'input.tsx'), 'utf-8');
            const a = transform({ source: src, filename: 'x', manifest });
            const b = transform({ source: src, filename: 'x', manifest });
            expect(a.code).toBe(b.code);
            expect(a.css).toBe(b.css);
            expect(a.classes).toEqual(b.classes);
        });
    }
});
```

- [ ] **Step 2: Run, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/style-macro/tests/byte-identical.test.ts
git commit -m "test(style-macro): byte-identical determinism"
```

---

## Task 9: Public API freeze + README

**Files:**

- Modify: `packages/style-macro/README.md`
- Modify: `packages/style-macro/src/index.ts` (verify exports surface)

**Interfaces:**

- Consumes: full package.
- Produces: documented contract that downstream Plans B–D import against.

- [ ] **Step 1: Update README with the contract**

Overwrite with:

````markdown
# @vapor-ui/style-macro

Build-time macro powering `@vapor-ui/core`'s `$style` function.

## Contract (consumed by `@vapor-ui/style-macro/unplugin`)

```ts
import { loadManifest, transform } from '@vapor-ui/style-macro';

const manifest = loadManifest(require.resolve('@vapor-ui/core/dist/tokens.manifest.json'));
const result = transform({ source, filename, manifest });
// result.code → rewritten source (every $style call replaced with className string)
// result.css  → CSS chunk (or null if no $style calls)
// result.errors → BuildError[]; formatBuildError() produces codeframe text
```
````

### Token manifest shape (v1)

```json
{
    "version": "1",
    "tokens": {
        "color": { "primary": "--vapor-color-primary" },
        "space": { "400": "--vapor-size-space-400" },
        "dimension": {},
        "borderRadius": {},
        "shadow": {},
        "typography": {}
    },
    "propertyScopes": { "padding": "space", "backgroundColor": "color" }
}
```

The token-emitter (currently `@vapor-ui/core`, possibly a future `@vapor-ui/tokens`) owns generation; the macro only consumes JSON matching this shape.

### Determinism guarantees

- Same `(source, manifest)` → byte-identical `code` + `css` (tested).
- Emit order: default → sm → md → lg → raw `@media` (query-string sort) → pseudo (fixed table).
- Atomic class names are content-addressed; dedupe is automatic.

````

- [ ] **Step 2: Final verification**

Run: `pnpm --filter @vapor-ui/style-macro lint`
Run: `pnpm --filter @vapor-ui/style-macro typecheck`
Run: `pnpm --filter @vapor-ui/style-macro test`
Run: `pnpm --filter @vapor-ui/style-macro build`
Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/style-macro/README.md packages/style-macro/src/index.ts
git commit -m "docs(style-macro): public contract for downstream plans"
````

---

## Self-review against spec

- §3 non-goals → enforced via Global Constraints and the absence of corresponding tasks.
- §4 API/value rules → Task 6 (validator) + Task 7 (transform).
- §5 condition system → Task 3 (classifier) + Task 5 (emit named BP via `@media (--vapor-<name>)`).
- §6.1 class names → Task 4.
- §6.2 CSS output → Task 7 fixture, Task 5 emitter.
- §6.3 emit order → Task 5 with explicit ordering test.
- §6.4 caching/determinism → Task 8.
- §7.2 macro responsibilities (#1–#7) → Tasks 6–7; #4 (virtual module emission) is **deferred to Plan B**; #7 (token mapping reference) is Task 2.
- §10 macro unit test layer → all macro tests in this plan.

**Out of scope for Plan A (handed off):** unplugin adapter, virtual module wiring, Next/Vite integration, `$style` export from `@vapor-ui/core`, postcss helper, codemod, deprecation, Phase-1 JSDoc.
