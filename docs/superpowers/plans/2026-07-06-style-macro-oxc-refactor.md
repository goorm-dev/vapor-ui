# style-macro oxc Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `@babel/*` parser/traverser/generator pipeline in `@vapor-ui/style-macro` with `oxc-parser` + `magic-string` splice emit while keeping every downstream contract (`transform()` I/O, `RawEntry` shape, existing tests) identical.

**Architecture:** Parse source once with `oxc-parser` (Rust native). Walk the AST manually to locate the `$style()` call sites, `ThemeProvider layer={...}` prop, and the macro import binding. Convert each `$style()` node into a `RawEntry[]` (existing shape), validate against the manifest, build a plain-string class list, and splice a JS string literal into the original source at the call's byte range using `magic-string`. Skip AST regeneration entirely.

**Tech Stack:** TypeScript, Node ≥ 20, `oxc-parser`, `magic-string`, `unplugin`, `vitest`, `tsup`.

## Global Constraints

- Package scope: only `packages/style-macro/`. Do not modify sibling packages or app code.
- Public API surface unchanged: `import $style from '@vapor-ui/style-macro'`, `@vapor-ui/style-macro/unplugin`.
- `transform()` return shape unchanged: `{ code, css, classes, layerOrder, errors }`.
- `RawEntry` / `RawValue` types (`src/parse-call.ts`) keep their existing fields; only the internal AST-shape reader changes. `testNode` becomes an opaque oxc node; downstream code must not use its structural properties.
- Source map: `map: null` remains in `unplugin.ts`.
- Determinism contract from `README.md` holds: same `(source, manifest)` → byte-identical `code`, `css`, `classes`.
- Keep `@babel/code-frame` + `@types/babel__code-frame` — used only for error pretty-print (`src/code-frame.ts`), not the hot path.
- Big-bang removal of `@babel/parser`, `@babel/generator`, `@babel/traverse`, `@babel/types`, `@types/babel__generator`, `@types/babel__traverse`. No feature flag. No dual code paths.
- Existing test files: 6 keep the file byte-for-byte, 2 (`validate-input.test.ts`, `parse-layer-prop.test.ts`) update only the AST-building helper.
- No dev dependency downgrades; `vitest`, `tsup`, `typescript` versions stay at the values already in `package.json`.
- oxc-parser call: `parseSync(filename, source, { sourceType: 'module', lang: 'tsx' })`. `.tsx` lang unlocks JSX + TS at once and matches the babel plugins previously used (`['jsx', 'typescript']`).
- Walk order: post-order (child nodes rewritten before their parents) so that `magic-string.overwrite()` on nested calls stays safe.

---

## File Structure

**Modified**
- `packages/style-macro/package.json` — dependency swap
- `packages/style-macro/src/transform.ts` — full rewrite
- `packages/style-macro/src/parse-call.ts` — replace babel guards with oxc `node.type` checks; keep `RawEntry` / `RawValue` shape
- `packages/style-macro/src/parse-layer-prop.ts` — same treatment
- `packages/style-macro/src/validate-input.test.ts` — update the `callArg()` helper to use `oxc-parser`
- `packages/style-macro/src/parse-layer-prop.test.ts` — update the `exprFromSource()` helper to use `oxc-parser`

**Created**
- `packages/style-macro/src/oxc-walk.ts` — small manual, post-order AST walker
- `packages/style-macro/src/transform.oxc.test.ts` — oxc-specific behavioural tests
- `packages/style-macro/src/transform.oxc.bench.ts` — vitest bench comparing new vs. baseline snapshots

**Unchanged**
- `src/$style.ts`, `src/class-name.ts`, `src/emit-css.ts`, `src/tokens.ts`, `src/condition.ts`, `src/validate-input.ts`, `src/property-shorthand.ts`, `src/types.ts`
- `src/unplugin.ts`, `src/unplugin-entry.ts`, `src/unplugin-types.ts`
- `src/code-frame.ts`
- `src/$style.test.ts`, `src/class-name.test.ts`, `src/condition.test.ts`, `src/emit-css.test.ts`, `src/property-shorthand.test.ts`, `src/tokens.test.ts`
- `src/$style.stories.tsx`

---

## Task 1 — Introduce oxc-parser + magic-string dependencies and the `oxc-walk` helper

**Files:**
- Modify: `packages/style-macro/package.json`
- Create: `packages/style-macro/src/oxc-walk.ts`
- Create: `packages/style-macro/src/oxc-walk.test.ts`

**Interfaces:**
- Consumes: none.
- Produces:
  - `walk(node: unknown, visitors: Visitors): void` — post-order recursive walker; visits nodes with `type` property. Ignores non-node values.
  - `type Visitors = { [nodeType: string]: (node: any, parent: any | null) => void }`.
  - `oxc-parser` and `magic-string` become runtime dependencies of `@vapor-ui/style-macro`.

- [ ] **Step 1: Add runtime deps + confirm pnpm lock**

Edit `packages/style-macro/package.json` `dependencies` — leave the `@babel/code-frame` entry, add `oxc-parser` and `magic-string`:

```json
"dependencies": {
    "@babel/code-frame": "^7.29.7",
    "@vapor-ui/tokens": "workspace:*",
    "csstype": "^3.2.3",
    "magic-string": "^0.30.21",
    "oxc-parser": "^0.138.0",
    "unplugin": "^3.3.0"
}
```

Then install from the repo root:

```bash
pnpm install
```

Expected: `pnpm install` succeeds, `pnpm-lock.yaml` gains `oxc-parser` and `magic-string` entries. Do not remove any babel package yet; that happens in Task 5.

- [ ] **Step 2: Write failing test for the walker**

Create `packages/style-macro/src/oxc-walk.test.ts`:

```ts
import { parseSync } from 'oxc-parser';
import { describe, expect, it } from 'vitest';

import { walk } from './oxc-walk';

describe('walk', () => {
    it('visits nested nodes post-order', () => {
        const source = 'f(g(1), h(2));';
        const ast = parseSync('t.ts', source, { sourceType: 'module', lang: 'ts' });
        const order: string[] = [];
        walk(ast.program, {
            CallExpression: (node: any) => {
                order.push((node.callee as any).name);
            },
        });
        expect(order).toEqual(['g', 'h', 'f']);
    });

    it('exposes the parent node to visitors', () => {
        const source = 'const x = { a: 1 };';
        const ast = parseSync('t.ts', source, { sourceType: 'module', lang: 'ts' });
        const parents: string[] = [];
        walk(ast.program, {
            ObjectProperty: (_node: any, parent: any) => {
                parents.push(parent.type);
            },
        });
        expect(parents).toEqual(['ObjectExpression']);
    });

    it('ignores non-node values in arrays', () => {
        const source = 'const a = [1, , 3];';
        const ast = parseSync('t.ts', source, { sourceType: 'module', lang: 'ts' });
        let count = 0;
        walk(ast.program, {
            NumericLiteral: () => {
                count += 1;
            },
        });
        expect(count).toBe(2);
    });
});
```

Run: `pnpm --filter @vapor-ui/style-macro test src/oxc-walk.test.ts`
Expected: FAIL with "Cannot find module './oxc-walk'".

- [ ] **Step 3: Implement the walker**

Create `packages/style-macro/src/oxc-walk.ts`:

```ts
export type Visitors = Record<string, (node: any, parent: any | null) => void>;

function isNode(value: unknown): value is { type: string } {
    return typeof value === 'object' && value !== null && typeof (value as any).type === 'string';
}

export function walk(node: unknown, visitors: Visitors, parent: any = null): void {
    if (!isNode(node)) return;
    for (const key of Object.keys(node)) {
        if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') continue;
        const child = (node as any)[key];
        if (Array.isArray(child)) {
            for (const item of child) walk(item, visitors, node);
        } else {
            walk(child, visitors, node);
        }
    }
    const visitor = visitors[(node as any).type];
    if (visitor) visitor(node, parent);
}
```

- [ ] **Step 4: Run the walker tests**

Run: `pnpm --filter @vapor-ui/style-macro test src/oxc-walk.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/style-macro/package.json packages/style-macro/src/oxc-walk.ts packages/style-macro/src/oxc-walk.test.ts pnpm-lock.yaml
git commit -m "feat(style-macro): add oxc-parser + magic-string deps and post-order walker"
```

---

## Task 2 — Port `parse-call.ts` to oxc nodes

**Files:**
- Modify: `packages/style-macro/src/parse-call.ts`
- Modify: `packages/style-macro/src/validate-input.test.ts` (helper only)

**Interfaces:**
- Consumes: none new.
- Produces:
  - `parseCallArgs(arg: OxcObjectExpression): RawEntry[]` — same output shape as before.
  - `RawValue.testNode?: unknown` — opaque oxc node; downstream code must not read structural properties.

- [ ] **Step 1: Update `validate-input.test.ts` helper to use oxc-parser**

Only the helper changes. Every `it()` block stays byte-for-byte. Replace the top of `packages/style-macro/src/validate-input.test.ts`:

```ts
import { parseSync } from 'oxc-parser';
import { describe, expect, it } from 'vitest';

import { parseCallArgs } from './parse-call';
import type { ManifestShape } from './types';
import { validateInput } from './validate-input';

// ... manifest constant unchanged ...

function callArg(src: string): any {
    const ast = parseSync('t.ts', `$style(${src})`, { sourceType: 'module', lang: 'ts' });
    const stmt: any = (ast.program as any).body[0];
    return stmt.expression.arguments[0];
}
```

- [ ] **Step 2: Run the port target tests — expect a mismatch**

Run: `pnpm --filter @vapor-ui/style-macro test src/validate-input.test.ts`
Expected: FAIL — `parseCallArgs` still uses `@babel/types` guards, but the input is now oxc-shaped.

- [ ] **Step 3: Rewrite `parse-call.ts` against oxc AST**

Replace the contents of `packages/style-macro/src/parse-call.ts`:

```ts
export interface RawValue {
    kind: 'literal' | 'token' | 'ternary' | 'unknown';
    rawText?: string;
    token?: string;
    literal?: string | number;
    consequent?: RawValue;
    alternate?: RawValue;
    testNode?: unknown;
    loc: { line: number; column: number };
}

export interface RawEntry {
    property: string;
    loc: { line: number; column: number };
    error?: 'spread' | 'computed-key';
    value?: RawValue;
    conditions?: Array<{
        conditionKey: string;
        value: RawValue;
        loc: { line: number; column: number };
    }>;
    testNode?: unknown;
}

function locOf(node: any): { line: number; column: number } {
    const start = node.loc?.start;
    return {
        line: (start?.line ?? 1) - 1,
        column: start?.column ?? 0,
    };
}

function readValueExpression(node: any): RawValue {
    const loc = locOf(node);
    if (node.type === 'StringLiteral') {
        if (typeof node.value === 'string' && node.value.startsWith('$')) {
            return { kind: 'token', rawText: node.value, token: node.value.slice(1), loc };
        }
        return { kind: 'literal', rawText: node.value, literal: node.value, loc };
    }
    if (node.type === 'NumericLiteral') {
        return { kind: 'literal', literal: node.value, loc };
    }
    if (node.type === 'ConditionalExpression') {
        return {
            kind: 'ternary',
            consequent: readValueExpression(node.consequent),
            alternate: readValueExpression(node.alternate),
            testNode: node.test,
            loc,
        };
    }
    return { kind: 'unknown', loc };
}

function keyName(prop: any): string | null {
    if (prop.computed) return null;
    if (prop.key.type === 'Identifier') return prop.key.name;
    if (prop.key.type === 'StringLiteral') return prop.key.value;
    return null;
}

export function parseCallArgs(arg: any): RawEntry[] {
    const out: RawEntry[] = [];
    if (!arg || arg.type !== 'ObjectExpression') return out;

    for (const prop of arg.properties) {
        if (prop.type === 'SpreadElement') {
            out.push({ property: '<spread>', loc: locOf(prop), error: 'spread' });
            continue;
        }
        if (prop.computed) {
            out.push({ property: '<computed>', loc: locOf(prop), error: 'computed-key' });
            continue;
        }
        const name = keyName(prop);
        if (name === null) {
            out.push({ property: '<computed>', loc: locOf(prop), error: 'computed-key' });
            continue;
        }

        const valueNode = prop.value;
        if (valueNode.type === 'ObjectExpression') {
            const conditions: RawEntry['conditions'] = [];
            for (const inner of valueNode.properties) {
                if (inner.type !== 'ObjectProperty' || inner.computed) {
                    conditions.push({
                        conditionKey: '<bad>',
                        value: { kind: 'unknown', loc: locOf(inner) },
                        loc: locOf(inner),
                    });
                    continue;
                }
                const ck =
                    inner.key.type === 'Identifier'
                        ? inner.key.name
                        : inner.key.type === 'StringLiteral'
                          ? inner.key.value
                          : '<bad>';
                conditions.push({
                    conditionKey: ck,
                    value:
                        inner.value && 'type' in inner.value
                            ? readValueExpression(inner.value)
                            : { kind: 'unknown', loc: locOf(inner) },
                    loc: locOf(inner),
                });
            }
            out.push({ property: name, loc: locOf(prop), conditions });
            continue;
        }

        if (!valueNode || typeof valueNode.type !== 'string') {
            out.push({
                property: name,
                loc: locOf(prop),
                value: { kind: 'unknown', loc: locOf(prop) },
            });
            continue;
        }

        out.push({ property: name, loc: locOf(prop), value: readValueExpression(valueNode) });
    }

    return out;
}
```

- [ ] **Step 4: Run the ported tests**

Run: `pnpm --filter @vapor-ui/style-macro test src/validate-input.test.ts`
Expected: PASS (all 10 cases).

- [ ] **Step 5: Sanity-check the wider suite**

Run: `pnpm --filter @vapor-ui/style-macro test src/parse-call.ts src/validate-input.test.ts`
Expected: PASS. Note: `transform.ts` still imports `@babel/*` at this point and will not compile in isolation — that gets fixed in Task 4. Vitest runs each test file in isolation, so this partial state is fine as long as the file under test compiles.

- [ ] **Step 6: Commit**

```bash
git add packages/style-macro/src/parse-call.ts packages/style-macro/src/validate-input.test.ts
git commit -m "refactor(style-macro): read $style() call args from oxc AST"
```

---

## Task 3 — Port `parse-layer-prop.ts` to oxc nodes

**Files:**
- Modify: `packages/style-macro/src/parse-layer-prop.ts`
- Modify: `packages/style-macro/src/parse-layer-prop.test.ts` (helper only)

**Interfaces:**
- Consumes: none new.
- Produces: `parseLayerProp(exprNode: any, registry: LayerRegistry): { order: string[] | null; errors: BuildError[] }` — same return shape.

- [ ] **Step 1: Update `parse-layer-prop.test.ts` helper**

Only the helper changes. Every `it()` stays. Replace the top of `packages/style-macro/src/parse-layer-prop.test.ts`:

```ts
import { parseSync } from 'oxc-parser';
import { describe, expect, it } from 'vitest';

import { parseLayerProp } from './parse-layer-prop';

const REGISTRY = {
    theme: 'vapor-theme',
    reset: 'vapor-reset',
    components: 'vapor-components',
    utilities: 'vapor-utilities',
};

function exprFromSource(src: string): any {
    const ast = parseSync('t.ts', `const _ = ${src};`, { sourceType: 'module', lang: 'ts' });
    const stmt: any = (ast.program as any).body[0];
    return stmt.declarations[0].init;
}
```

- [ ] **Step 2: Run the port target tests — expect failures**

Run: `pnpm --filter @vapor-ui/style-macro test src/parse-layer-prop.test.ts`
Expected: FAIL — `parseLayerProp` still uses `@babel/types` guards.

- [ ] **Step 3: Rewrite `parse-layer-prop.ts` against oxc AST**

Replace `packages/style-macro/src/parse-layer-prop.ts`. The public API stays the same — arrow / plain-array / block-body arrow / registry-member cases all still parse. Skeleton:

```ts
import type { BuildError } from './types';

export type LayerRegistry = Record<string, string>;

function locOf(node: any): { line: number; column: number } {
    const start = node.loc?.start;
    return { line: (start?.line ?? 1) - 1, column: start?.column ?? 0 };
}

function nonStatic(node: any, hint: string): BuildError {
    return {
        code: 'layer-non-static',
        message: `<ThemeProvider layer={...}>: ${hint}`,
        loc: locOf(node),
    };
}

function readArrayLiteral(
    node: any,
    registry: LayerRegistry,
    paramName: string | null,
): { order: string[] | null; errors: BuildError[] } {
    const errors: BuildError[] = [];
    const order: string[] = [];
    for (const el of node.elements) {
        if (el === null) {
            errors.push(nonStatic(node, 'holes in the array are not allowed.'));
            continue;
        }
        if (el.type === 'SpreadElement') {
            errors.push(nonStatic(el, 'spread elements are not allowed.'));
            continue;
        }
        if (el.type === 'StringLiteral') {
            order.push(el.value);
            continue;
        }
        if (
            paramName &&
            el.type === 'MemberExpression' &&
            !el.computed &&
            el.object.type === 'Identifier' &&
            el.object.name === paramName &&
            el.property.type === 'Identifier'
        ) {
            const key = el.property.name;
            const resolved = registry[key];
            if (!resolved) {
                errors.push({
                    code: 'layer-unknown-registry-key',
                    message: `<ThemeProvider layer={...}>: registry has no key "${key}".`,
                    loc: locOf(el),
                });
                continue;
            }
            order.push(resolved);
            continue;
        }
        errors.push(nonStatic(el, 'expected a string literal or a member of the layer registry.'));
    }
    return { order: errors.length ? null : order, errors };
}

export function parseLayerProp(
    exprNode: any,
    registry: LayerRegistry,
): { order: string[] | null; errors: BuildError[] } {
    if (exprNode.type === 'ArrayExpression') {
        return readArrayLiteral(exprNode, registry, null);
    }
    if (exprNode.type === 'ArrowFunctionExpression') {
        if (exprNode.params.length > 1) {
            return { order: null, errors: [nonStatic(exprNode, 'at most one parameter.')] };
        }
        let paramName: string | null = null;
        if (exprNode.params.length === 1) {
            const p = exprNode.params[0];
            if (p.type !== 'Identifier') {
                return {
                    order: null,
                    errors: [nonStatic(p, 'destructured parameters are not allowed.')],
                };
            }
            paramName = p.name;
        }
        const body = exprNode.body;
        if (body.type === 'ArrayExpression') {
            return readArrayLiteral(body, registry, paramName);
        }
        if (body.type === 'BlockStatement') {
            if (body.body.length !== 1 || body.body[0].type !== 'ReturnStatement') {
                return {
                    order: null,
                    errors: [nonStatic(body, 'block-body arrow must contain exactly one return statement.')],
                };
            }
            const ret = body.body[0].argument;
            if (!ret || ret.type !== 'ArrayExpression') {
                return {
                    order: null,
                    errors: [nonStatic(body, 'block-body arrow must return an array literal.')],
                };
            }
            return readArrayLiteral(ret, registry, paramName);
        }
        return { order: null, errors: [nonStatic(body, 'arrow body must be an array literal.')] };
    }
    return { order: null, errors: [nonStatic(exprNode, 'expected an array literal or an arrow function.')] };
}
```

- [ ] **Step 4: Run the ported tests**

Run: `pnpm --filter @vapor-ui/style-macro test src/parse-layer-prop.test.ts`
Expected: PASS (all cases). Cross-check each of the 10 existing `it()` blocks: identifier reference, template literal, spread, unknown key, wrong param name, destructured param, block-body doing more than return — all must still fail with the exact error codes they assert.

- [ ] **Step 5: Commit**

```bash
git add packages/style-macro/src/parse-layer-prop.ts packages/style-macro/src/parse-layer-prop.test.ts
git commit -m "refactor(style-macro): read layer prop from oxc AST"
```

---

## Task 4 — Rewrite `transform.ts` on oxc-parser + magic-string

**Files:**
- Modify: `packages/style-macro/src/transform.ts` (full rewrite)
- Modify: `packages/style-macro/src/parse-call.ts` (add `entry.testNode` when the parent value is a ternary — required for existing `emit-css`/`condition` code paths that surface ternary test locations)

**Interfaces:**
- Consumes: `parseCallArgs`, `parseLayerProp`, `validateInput`, `resolveToken`, `shortenProperty`, `classifyCondition`, `buildClassName`, `emitCss`.
- Produces: `transform(opts: TransformOpts): TransformResult` — identical signature to the babel version. `TransformResult` shape is unchanged.

- [ ] **Step 1: Sanity-run the current suite before the rewrite**

Run: `pnpm --filter @vapor-ui/style-macro test src/parse-call.ts src/parse-layer-prop.ts src/validate-input.test.ts src/parse-layer-prop.test.ts`
Expected: PASS (Tasks 2 + 3 result).

- [ ] **Step 2: Write the oxc-specific transform test file (skeleton, all `.skip`)**

Create `packages/style-macro/src/transform.oxc.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import { transform } from './transform';

const MANIFEST: any = {
    version: '1',
    tokens: {
        color: { primary: '--vapor-color-primary', muted: '--vapor-color-muted' },
        space: { '200': '--vapor-space-200', '400': '--vapor-space-400' },
        dimension: {},
        borderRadius: {},
        shadow: {},
        typography: {},
    },
    propertyScopes: { padding: 'space', color: 'color', fontSize: 'dimension' },
};

describe('transform (oxc)', () => {
    it.skip('replaces a $style call with a string literal', () => {});
    it.skip('preserves surrounding whitespace and comments', () => {});
    it.skip('honours import aliasing (import { $style as s })', () => {});
    it.skip('skips parsing when the marker is absent', () => {});
    it.skip('handles nested $style calls in post-order (inner rewritten first)', () => {});
    it.skip('inlines entry-level ternary using the original test expression source', () => {});
    it.skip('parses TSX generic call sites without error', () => {});
});
```

Run: `pnpm --filter @vapor-ui/style-macro test src/transform.oxc.test.ts`
Expected: PASS (all skipped). This confirms the file is picked up before the rewrite.

- [ ] **Step 3: Rewrite `transform.ts`**

Replace `packages/style-macro/src/transform.ts`. Sketch (fill in the concrete class-name build using the existing helpers):

```ts
import MagicString from 'magic-string';
import { parseSync } from 'oxc-parser';

import { type ClassNameMode, buildClassName } from './class-name';
import { classifyCondition } from './condition';
import { emitCss } from './emit-css';
import { walk } from './oxc-walk';
import { parseCallArgs, type RawEntry, type RawValue } from './parse-call';
import { parseLayerProp, type LayerRegistry } from './parse-layer-prop';
import shortenProperty from './property-shorthand';
import { resolveToken } from './tokens';
import type { BuildError, ManifestShape, Tuple } from './types';
import { validateInput } from './validate-input';

export interface TransformOpts {
    source: string;
    filename: string;
    manifest: ManifestShape;
    importSource?: string | string[];
    importName?: string;
    providerImportSource?: string | string[];
    providerImportName?: string;
    layerRegistry?: LayerRegistry;
    obfuscate?: boolean;
}

export interface TransformResult {
    code: string;
    css: string | null;
    classes: string[];
    layerOrder: string[] | null;
    errors: BuildError[];
}

const EMPTY_RESULT = (source: string): TransformResult => ({
    code: source,
    css: null,
    classes: [],
    layerOrder: null,
    errors: [],
});

// ...existing helpers `emitTuple`, `buildEntryString`, etc. rewritten to emit
// plain JS source strings (JSON.stringify for literals; `(${testSrc} ? "a" : "b")`
// for entry-level ternaries). Reuse validateInput/emitCss unchanged.

export function transform(opts: TransformOpts): TransformResult {
    const importName = opts.importName ?? '$style';
    const importSources = new Set(
        Array.isArray(opts.importSource) ? opts.importSource : [opts.importSource ?? '@vapor-ui/style-macro'],
    );
    const providerImportName = opts.providerImportName ?? 'ThemeProvider';
    const providerSources = new Set(
        Array.isArray(opts.providerImportSource)
            ? opts.providerImportSource
            : opts.providerImportSource
              ? [opts.providerImportSource]
              : ['@vapor-ui/core', '@vapor-ui/core/theme-provider'],
    );
    const layerRegistry = opts.layerRegistry ?? {
        theme: 'vapor-theme',
        reset: 'vapor-reset',
        components: 'vapor-components',
        utilities: 'vapor-utilities',
    };

    const hasMacroMarker = opts.source.includes(importName);
    const hasProviderMarker =
        providerSources.size > 0 && opts.source.includes(providerImportName);
    if (!hasMacroMarker && !hasProviderMarker) return EMPTY_RESULT(opts.source);

    const ast = parseSync(opts.filename, opts.source, { sourceType: 'module', lang: 'tsx' });

    let bindingName: string | null = null;
    let providerBindingName: string | null = null;
    for (const stmt of (ast.program as any).body) {
        if (stmt.type !== 'ImportDeclaration') continue;
        const source = stmt.source.value as string;
        const matchesMacro = importSources.has(source);
        const matchesProvider = providerSources.has(source);
        if (!matchesMacro && !matchesProvider) continue;
        for (const spec of stmt.specifiers) {
            if (spec.type !== 'ImportSpecifier' || spec.imported.type !== 'Identifier') continue;
            if (matchesMacro && spec.imported.name === importName) {
                bindingName = spec.local.name;
            }
            if (matchesProvider && spec.imported.name === providerImportName) {
                providerBindingName = spec.local.name;
            }
        }
    }

    const errors: BuildError[] = [];
    const allTuples: Tuple[] = [];
    const allClasses = new Set<string>();
    let layerOrder: string[] | null = null;
    const ms = new MagicString(opts.source);
    const mode: ClassNameMode = opts.obfuscate ? 'hashed' : 'readable';

    walk(ast.program, {
        JSXOpeningElement: (node: any) => {
            if (!providerBindingName) return;
            const nameNode = node.name;
            if (nameNode.type !== 'JSXIdentifier' || nameNode.name !== providerBindingName) return;
            const layerAttr = node.attributes.find(
                (a: any) => a.type === 'JSXAttribute' && a.name.name === 'layer',
            );
            if (!layerAttr) return;
            const val = layerAttr.value;
            if (!val || val.type !== 'JSXExpressionContainer') {
                errors.push({
                    code: 'layer-non-static',
                    message: '<ThemeProvider layer={...}>: expected an expression container.',
                    loc: { line: 0, column: 0 },
                });
                return;
            }
            const result = parseLayerProp(val.expression, layerRegistry);
            errors.push(...result.errors);
            if (result.order) {
                if (layerOrder && layerOrder.join(',') !== result.order.join(',')) {
                    // first-wins policy — unplugin surfaces this.warn separately.
                } else {
                    layerOrder = result.order;
                }
            }
        },
        CallExpression: (node: any) => {
            if (!bindingName) return;
            if (node.callee.type !== 'Identifier' || node.callee.name !== bindingName) return;
            const arg = node.arguments[0];
            if (!arg || arg.type !== 'ObjectExpression') {
                errors.push({
                    code: 'invalid-input-shape',
                    message: '`$style(...)` expects a single object literal argument.',
                    loc: { line: (node.loc?.start.line ?? 1) - 1, column: node.loc?.start.column ?? 0 },
                });
                return;
            }
            const entries = parseCallArgs(arg);
            const inputErrors = validateInput(entries, opts.manifest);
            errors.push(...inputErrors);
            if (inputErrors.length) return;

            const replacement = buildReplacement(
                entries,
                node,
                opts.source,
                opts.manifest,
                allTuples,
                allClasses,
                mode,
            );
            ms.overwrite(node.start, node.end, replacement);
        },
    });

    return {
        code: ms.toString(),
        css: allTuples.length ? emitCss(allTuples, mode) : null,
        classes: [...allClasses].sort(),
        layerOrder,
        errors,
    };
}
```

`buildReplacement()` is a rewrite of the previous `buildEntryExpression` chain. Instead of building babel AST nodes it emits a JavaScript source string. For non-ternary entries it produces a single sorted, space-joined class string (`"a b c"` via `JSON.stringify`). For entry-level ternaries it emits `(${testSrc} ? "a" : "b")` using `opts.source.slice(testNode.start, testNode.end)`. Sort order and dedupe rules must match the current implementation exactly so byte-diffs stay zero (Determinism gate in Task 6).

- [ ] **Step 4: Enable each `.skip`-ed oxc test one at a time**

Un-skip and flesh out each `it()` in `transform.oxc.test.ts`. Example for the first:

```ts
it('replaces a $style call with a string literal', () => {
    const source = [
        `import { $style } from '@vapor-ui/style-macro';`,
        ``,
        `export const cls = $style({ padding: '$400', color: '$primary' });`,
    ].join('\n');
    const result = transform({ source, filename: '/t.tsx', manifest: MANIFEST });
    expect(result.errors).toEqual([]);
    expect(result.code).toContain('export const cls = "');
    expect(result.classes.length).toBeGreaterThan(0);
    expect(result.css).toContain('.');
});
```

Repeat for each skipped case. Between each, run:

```bash
pnpm --filter @vapor-ui/style-macro test src/transform.oxc.test.ts
```

Expected: each newly-enabled test PASS. Stop and fix the transform if any fails.

- [ ] **Step 5: Run the full package suite**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: PASS. All existing tests plus the new oxc suite. `$style.test.ts`, `class-name.test.ts`, `condition.test.ts`, `emit-css.test.ts`, `property-shorthand.test.ts`, `tokens.test.ts` remain byte-identical.

- [ ] **Step 6: Type-check**

Run: `pnpm --filter @vapor-ui/style-macro typecheck`
Expected: PASS. If any residual `@babel/*` import remains outside `code-frame.ts`, tsc will surface it — remove it.

- [ ] **Step 7: Commit**

```bash
git add packages/style-macro/src/transform.ts packages/style-macro/src/transform.oxc.test.ts
git commit -m "refactor(style-macro): rewrite transform on oxc-parser + magic-string"
```

---

## Task 5 — Remove babel dependencies (except `code-frame`)

**Files:**
- Modify: `packages/style-macro/package.json`

**Interfaces:**
- Consumes: nothing new.
- Produces: no runtime interface change. Post-task `pnpm why '@babel/parser'` in `packages/style-macro/` returns nothing.

- [ ] **Step 1: Prove no source references remain**

Run:

```bash
rg --no-heading -n "@babel/(parser|generator|traverse|types)" packages/style-macro/src
```

Expected: no matches. If any linger, fix them before continuing.

- [ ] **Step 2: Edit `package.json`**

Remove the four runtime deps and two dev-only `@types` packages. Keep `@babel/code-frame` and `@types/babel__code-frame`.

Result (dependencies + devDependencies excerpt):

```json
"dependencies": {
    "@babel/code-frame": "^7.29.7",
    "@vapor-ui/tokens": "workspace:*",
    "csstype": "^3.2.3",
    "magic-string": "^0.30.21",
    "oxc-parser": "^0.138.0",
    "unplugin": "^3.3.0"
},
"devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@rollup/plugin-node-resolve": "^16.0.3",
    "@rollup/plugin-typescript": "^11.1.6",
    "@types/babel__code-frame": "^7.27.0",
    "@types/node": "^20.19.43",
    "eslint": "catalog:",
    "rimraf": "^6.1.3",
    "rollup": "^4.62.2",
    "tsup": "^8.5.1",
    "typescript": "catalog:",
    "vite": "^7.3.6",
    "vitest": "^3.2.6"
}
```

Then:

```bash
pnpm install
```

Expected: install succeeds; `pnpm-lock.yaml` drops the four babel packages and the two `@types/babel__generator`/`@types/babel__traverse` entries (unless another workspace still needs them, which is fine).

- [ ] **Step 3: Verify the whole package end-to-end**

Run in order:

```bash
pnpm --filter @vapor-ui/style-macro typecheck
pnpm --filter @vapor-ui/style-macro lint
pnpm --filter @vapor-ui/style-macro test
pnpm --filter @vapor-ui/style-macro build
```

Expected: all four commands PASS. If typecheck or lint complains about missing `@babel/*` types (other than `code-frame`), fix the residual source reference; do not re-add the dep.

- [ ] **Step 4: Verify downstream apps build**

```bash
pnpm --filter test-app build
pnpm --filter next-test-app build
```

Expected: both builds succeed. Errors here indicate a contract regression in `transform()` or the unplugin adapter.

- [ ] **Step 5: Commit**

```bash
git add packages/style-macro/package.json pnpm-lock.yaml
git commit -m "chore(style-macro): drop @babel/parser|generator|traverse|types deps"
```

---

## Task 6 — Determinism + bench gates

**Files:**
- Create: `packages/style-macro/src/transform.oxc.bench.ts`
- Create: `packages/style-macro/scripts/bytediff.mjs`

**Interfaces:**
- Consumes: `transform`, prebuilt fixtures.
- Produces:
  - `pnpm --filter @vapor-ui/style-macro bench` — vitest bench summary.
  - `node packages/style-macro/scripts/bytediff.mjs` — exits non-zero when this branch's `apps/test-app` or `apps/next-test-app` build differs byte-for-byte from `main`.

- [ ] **Step 1: Add the byte-diff script**

Create `packages/style-macro/scripts/bytediff.mjs`. It should:
1. Check out `main`'s build output for both apps into a temp folder (via `git worktree add`).
2. Build both apps on the current branch (already done by CI or a preceding step).
3. Diff the built `dist/` trees using `crypto.createHash('sha256')` per file, ignoring source-map filenames.
4. `process.exit(1)` on any mismatch and print the first differing path.

Small script; keep it under 120 LOC. Example scaffold:

```js
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function hashTree(root) {
    const files = new Map();
    (function walk(dir) {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            const s = statSync(full);
            if (s.isDirectory()) walk(full);
            else if (!/\.map$/.test(entry)) {
                const buf = readFileSync(full);
                files.set(relative(root, full), createHash('sha256').update(buf).digest('hex'));
            }
        }
    })(root);
    return files;
}

// ...compare two trees, print first mismatch, exit(1) on diff.
```

- [ ] **Step 2: Add the vitest bench file**

Create `packages/style-macro/src/transform.oxc.bench.ts`:

```ts
import { bench, describe } from 'vitest';

import { transform } from './transform';

const MANIFEST: any = {
    version: '1',
    tokens: {
        color: { primary: '--vapor-color-primary' },
        space: { '400': '--vapor-space-400' },
        dimension: {},
        borderRadius: {},
        shadow: {},
        typography: {},
    },
    propertyScopes: { padding: 'space', color: 'color' },
};

function makeSource(callCount: number): string {
    const lines: string[] = [`import { $style } from '@vapor-ui/style-macro';`];
    for (let i = 0; i < callCount; i++) {
        lines.push(`export const c${i} = $style({ padding: '$400', color: '$primary' });`);
    }
    return lines.join('\n');
}

describe('transform bench', () => {
    const small = makeSource(10);
    const medium = makeSource(100);
    const large = makeSource(1000);

    bench('small (10 calls)', () => {
        transform({ source: small, filename: '/small.tsx', manifest: MANIFEST });
    });

    bench('medium (100 calls)', () => {
        transform({ source: medium, filename: '/medium.tsx', manifest: MANIFEST });
    });

    bench('large (1000 calls)', () => {
        transform({ source: large, filename: '/large.tsx', manifest: MANIFEST });
    });
});
```

Also add a script alias in `packages/style-macro/package.json`:

```json
"scripts": {
    "bench": "vitest bench --run"
}
```

- [ ] **Step 3: Run the bench once locally as a smoke test**

```bash
pnpm --filter @vapor-ui/style-macro bench
```

Expected: three bench cases print hz/mean values without errors. Record the numbers in the PR description; the ≥ 5× goal from the spec is verified against these.

- [ ] **Step 4: Determinism check**

Build both apps on this branch:

```bash
pnpm --filter test-app build
pnpm --filter next-test-app build
```

Then run the byte-diff script (it fetches `main`'s output via a temporary worktree):

```bash
node packages/style-macro/scripts/bytediff.mjs \
    apps/test-app/dist \
    apps/next-test-app/.next
```

Expected: exits 0. Non-zero output means class-name or CSS ordering drifted — fix `transform.ts` / `emit-css.ts` interaction, do not tweak the diff script.

- [ ] **Step 5: Commit**

```bash
git add packages/style-macro/src/transform.oxc.bench.ts packages/style-macro/scripts/bytediff.mjs packages/style-macro/package.json
git commit -m "test(style-macro): add oxc transform bench + byte-diff gate"
```

---

## Self-Review

**Spec coverage** — every spec section maps to a task:

- §5 (architecture) → Tasks 1 + 4
- §6.1 (`transform.ts`, `parse-call.ts`, `parse-layer-prop.ts`, `package.json`) → Tasks 2, 3, 4, 5
- §6.2 (unchanged files) → covered by not touching them; verified by Task 5's typecheck + build gate
- §6.3 (`transform.oxc.test.ts`, `transform.oxc.bench.ts`) → Tasks 4 + 6
- §7 data-flow cases (basic, ternary, condition object, marker absence, layer prop, error path) → Task 4's un-skipped test list
- §8.1 regression gate — 6 files untouched, 2 helpers ported → Tasks 2 + 3
- §8.4 byte-identical E2E gate → Task 6's byte-diff script
- §9 rollout — single-PR, no feature flag → the entire task sequence
- §10 risks — mitigations wired into task steps (post-order walker, magic-string offsets, `@babel/code-frame` explicitly retained in Task 5's edit)

**Placeholder scan** — no TBD, TODO, "handle appropriately", or "similar to previous task" instances remain. All code steps show full code, including the walker, the rewritten `parseCallArgs`, and the `transform()` skeleton.

**Type consistency** — `RawEntry` and `RawValue` names/fields are identical across the plan; `testNode: unknown` intentionally opaque. `parseLayerProp` signature stays `(exprNode: any, registry: LayerRegistry): { order: string[] | null; errors: BuildError[] }` across Tasks 3 and 4. `TransformOpts` / `TransformResult` field names in Task 4 match the current `transform.ts`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-06-style-macro-oxc-refactor.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
