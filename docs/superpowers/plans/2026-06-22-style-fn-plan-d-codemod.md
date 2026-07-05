# Plan D — `@vapor-ui/codemod css-to-style` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a jscodeshift transform that rewrites Vapor UI consumer code from the legacy `$css` prop and the flat deprecated layout props (`padding`, `margin`, `width`, …) to a single `$style({...})` call. Skip-with-warning on dynamic cases the macro can't validate at build time.

**Architecture:** New transform under `packages/codemod/src/transforms/v1/migrate/migrations/css-to-style.ts`. Reused per-existing-pattern test harness (fixtures in `__testfixtures__/`, jscodeshift `defineTest`-equivalent via existing `runTestTransform`). New CLI entry: `vapor-codemod css-to-style src/`.

**Tech Stack:** `jscodeshift@^17`, existing `packages/codemod` infrastructure (`runTestTransform`, `hasTargetPackageImports`).

## Global Constraints

- Transform only files importing from `@vapor-ui/core` (existing pattern via `hasTargetPackageImports`).
- Spec §9.1 specifies two responsibilities and they must both ship in this transform:
    1. `<X $css={{...}}/>` → `<X className={$style({...})}/>`.
    2. Flat deprecated layout props (`padding`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`, `paddingX`, `paddingY`, `margin`, `marginTop`, `marginBottom`, `marginLeft`, `marginRight`, `marginX`, `marginY`, `gap`, `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `color`, `backgroundColor`, `borderColor`, `border`, `borderRadius`, `opacity`, `pointerEvents`, `overflow`, `textAlign`, `position`, `display`, `alignItems`, `justifyContent`, `flexDirection`, `alignContent`) — consolidate into the same `$style` call.
- Existing `className` on the element must be preserved: if a static string literal, merge with template literal; if dynamic, merge via `clsx`. Only emit `import { clsx } from 'clsx';` when this branch fires AND no `clsx` import already exists.
- The `$style` import must be added when first introduced; if the file already imports it, reuse.
- Spread props (`{...rest}`), variable references (`<Box $css={something}/>`), and dynamic-object inputs are **not** transformed. They are reported via the existing codemod CLI report channel (see existing transforms for the pattern; the function returns the file unchanged and pushes a warning row).
- Ternary on JSX-attribute values (e.g. `$css={isActive ? a : b}`) is **not** transformed if either branch is a variable reference.
- Per spec §11 token grammar — values that already use `$` strings are preserved verbatim; non-token literals (`'1rem'`, `0`) are preserved verbatim. The transform does NOT validate against the manifest (that's the macro's job).
- Non-goals (§3): does not transform `theme()` calls, custom recipes, or component-specific deprecated props outside the layout set above.
- Locked decisions: CLI subcommand name is `css-to-style` (spec §9.1).

---

## File Structure

```
packages/codemod/src/transforms/v1/migrate/
├── migrations/
│   ├── css-to-style.ts                     # transformCssToStyle
│   └── index.ts                             # re-export
├── utils/
│   └── style-prop-utils.ts                  # shared: flat-prop allow-list, $css detection, className merge
└── __tests__/
    └── css-to-style/                        # case-named test driver

__testfixtures__/css-to-style/
├── static-css-only.input.tsx
├── static-css-only.output.tsx
├── ternary-css.input.tsx
├── ternary-css.output.tsx
├── flat-props-only.input.tsx
├── flat-props-only.output.tsx
├── css-and-flat-props.input.tsx
├── css-and-flat-props.output.tsx
├── existing-classname-literal.input.tsx
├── existing-classname-literal.output.tsx
├── existing-classname-dynamic.input.tsx
├── existing-classname-dynamic.output.tsx
├── existing-style-import.input.tsx
├── existing-style-import.output.tsx
├── no-vapor-import-skip.input.tsx
├── no-vapor-import-skip.output.tsx
├── spread-css-skip.input.tsx
├── spread-css-skip.output.tsx
├── variable-css-skip.input.tsx
└── variable-css-skip.output.tsx

packages/codemod/src/bin/cli.ts             # register `css-to-style` subcommand
```

---

## Task 1: Utility module — flat-prop allow-list + helpers

**Files:**

- Create: `packages/codemod/src/transforms/v1/migrate/utils/style-prop-utils.ts`

**Interfaces:**

- Consumes: `jscodeshift`.
- Produces:

    ```ts
    export const FLAT_LAYOUT_PROPS: ReadonlySet<string>;
    export function isStaticCssObject(node, j): boolean;     // ObjectExpression with no spread/computed
    export function isStaticCssValue(node, j): boolean;      // literal / token string / static ternary
    export interface ConsolidationPlan {
        ok: true;
        objectProperties: jscodeshift.Property[];            // merged keys/values for the new $style({...})
        jsxAttrsToRemove: jscodeshift.JSXAttribute[];
        preservedClassName: jscodeshift.JSXAttribute | null;
    } | { ok: false; reason: 'spread' | 'dynamic-value' | 'mixed-with-other-attrs' };
    export function planConsolidation(openingElement, j): ConsolidationPlan;
    export function ensureStyleImport(root, j): void;        // add `import { $style } from '@vapor-ui/core'` if missing
    export function ensureClsxImport(root, j): void;
    export function mergeClassName(
        previous: jscodeshift.JSXAttribute | null,
        newClassNameExpr: jscodeshift.Expression,
        j: jscodeshift.JSCodeshift,
    ): jscodeshift.JSXAttribute;
    ```

- [ ] **Step 1: Write `utils/style-prop-utils.ts`**

```ts
import type {
    Collection,
    JSCodeshift,
    JSXAttribute,
    JSXElement,
    JSXOpeningElement,
    Node,
    ObjectExpression,
    Property,
} from 'jscodeshift';

export const FLAT_LAYOUT_PROPS: ReadonlySet<string> = new Set([
    // spacing
    'padding',
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingX',
    'paddingY',
    'margin',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'marginX',
    'marginY',
    'gap',
    'rowGap',
    'columnGap',
    // dimensions
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    // colors / borders
    'color',
    'backgroundColor',
    'borderColor',
    'border',
    'borderRadius',
    // visual
    'opacity',
    'boxShadow',
    // behavior
    'pointerEvents',
    'overflow',
    'textAlign',
    // position / display
    'position',
    'display',
    // flex
    'alignItems',
    'justifyContent',
    'flexDirection',
    'alignContent',
    'flexWrap',
]);

export type Plan =
    | {
          ok: true;
          properties: Property[];
          toRemove: JSXAttribute[];
          classNameAttr: JSXAttribute | null;
      }
    | { ok: false; reason: 'spread' | 'dynamic-value' | 'no-style-attrs' };

export function planConsolidation(open: JSXOpeningElement, j: JSCodeshift): Plan {
    const toRemove: JSXAttribute[] = [];
    const fromCss = new Map<string, Property>(); // populated from $css — wins on collision
    const fromFlat = new Map<string, Property>();
    let classNameAttr: JSXAttribute | null = null;
    let saw = false;

    for (const attr of open.attributes ?? []) {
        if (attr.type !== 'JSXAttribute') return { ok: false, reason: 'spread' };
        if (attr.name.type !== 'JSXIdentifier') continue;
        const name = attr.name.name;

        if (name === 'className') {
            classNameAttr = attr;
            continue;
        }
        if (name === '$css') {
            const v = attr.value;
            if (!v || v.type !== 'JSXExpressionContainer')
                return { ok: false, reason: 'dynamic-value' };
            if (v.expression.type !== 'ObjectExpression')
                return { ok: false, reason: 'dynamic-value' };
            if (!isStaticCssObject(v.expression, j)) return { ok: false, reason: 'dynamic-value' };
            for (const p of v.expression.properties) {
                if (p.type !== 'Property' && p.type !== 'ObjectProperty')
                    return { ok: false, reason: 'dynamic-value' };
                const prop = p as Property;
                const key =
                    (prop.key as { name?: string; value?: string }).name ??
                    (prop.key as { value?: string }).value;
                if (key) fromCss.set(key, prop);
            }
            toRemove.push(attr);
            saw = true;
            continue;
        }
        if (FLAT_LAYOUT_PROPS.has(name)) {
            const v = attr.value;
            let valueNode: Node | null = null;
            if (!v) return { ok: false, reason: 'dynamic-value' };
            if (v.type === 'Literal' || v.type === 'StringLiteral') valueNode = v as Node;
            else if (v.type === 'JSXExpressionContainer') {
                if (!isStaticValueExpression(v.expression, j))
                    return { ok: false, reason: 'dynamic-value' };
                valueNode = v.expression as Node;
            } else {
                return { ok: false, reason: 'dynamic-value' };
            }
            fromFlat.set(
                name,
                j.property('init', j.identifier(name), valueNode as never) as Property,
            );
            toRemove.push(attr);
            saw = true;
            continue;
        }
    }

    if (!saw) return { ok: false, reason: 'no-style-attrs' };

    // Precedence: $css wins on key collision (matches runtime resolveStyles).
    // Order properties as: all flat-prop entries (in source order) first, then $css entries, with collisions skipped on the flat side.
    const properties: Property[] = [];
    for (const [k, p] of fromFlat) {
        if (!fromCss.has(k)) properties.push(p);
    }
    for (const p of fromCss.values()) properties.push(p);

    return { ok: true, properties, toRemove, classNameAttr };
}

export function isStaticCssObject(obj: ObjectExpression, j: JSCodeshift): boolean {
    for (const p of obj.properties) {
        if (p.type === 'SpreadElement' || p.type === 'SpreadProperty') return false;
        if ((p as Property).computed) return false;
        const value = (p as Property).value as Node;
        if (value.type === 'ObjectExpression') {
            if (!isStaticCssObject(value as ObjectExpression, j)) return false;
        } else if (!isStaticValueExpression(value, j)) {
            return false;
        }
    }
    return true;
}

export function isStaticValueExpression(node: Node, j: JSCodeshift): boolean {
    if (!node) return false;
    if (node.type === 'StringLiteral' || node.type === 'NumericLiteral' || node.type === 'Literal')
        return true;
    if (node.type === 'ConditionalExpression') {
        return (
            isStaticValueExpression((node as { consequent: Node }).consequent, j) &&
            isStaticValueExpression((node as { alternate: Node }).alternate, j)
        );
    }
    return false;
}

export function ensureStyleImport(root: Collection<unknown>, j: JSCodeshift): void {
    const existing = root.find(j.ImportDeclaration, { source: { value: '@vapor-ui/core' } });
    if (existing.size() === 0) {
        root.find(j.Program)
            .get('body', 0)
            .insertBefore(
                j.importDeclaration(
                    [j.importSpecifier(j.identifier('$style'))],
                    j.literal('@vapor-ui/core'),
                ),
            );
        return;
    }
    const node = existing.nodes()[0];
    const has = node.specifiers?.some(
        (s) => s.type === 'ImportSpecifier' && s.imported.name === '$style',
    );
    if (!has) node.specifiers?.push(j.importSpecifier(j.identifier('$style')));
}

export function ensureClsxImport(root: Collection<unknown>, j: JSCodeshift): void {
    const existing = root.find(j.ImportDeclaration, { source: { value: 'clsx' } });
    if (existing.size() > 0) return;
    root.find(j.Program)
        .get('body', 0)
        .insertBefore(
            j.importDeclaration([j.importSpecifier(j.identifier('clsx'))], j.literal('clsx')),
        );
}

export function mergeClassName(
    previous: JSXAttribute | null,
    styleCallExpr: Node,
    j: JSCodeshift,
    root: Collection<unknown>,
): JSXAttribute {
    if (!previous) {
        return j.jsxAttribute(
            j.jsxIdentifier('className'),
            j.jsxExpressionContainer(styleCallExpr as never),
        );
    }
    const value = previous.value;
    if (!value) return previous;
    if (value.type === 'Literal' || (value as { type: string }).type === 'StringLiteral') {
        const literal = (value as { value: string }).value;
        const expr = j.templateLiteral(
            [
                j.templateElement({ raw: `${literal} `, cooked: `${literal} ` }, false),
                j.templateElement({ raw: '', cooked: '' }, true),
            ],
            [styleCallExpr as never],
        );
        return j.jsxAttribute(j.jsxIdentifier('className'), j.jsxExpressionContainer(expr));
    }
    if (value.type === 'JSXExpressionContainer') {
        ensureClsxImport(root, j);
        const call = j.callExpression(j.identifier('clsx'), [
            value.expression as never,
            styleCallExpr as never,
        ]);
        return j.jsxAttribute(j.jsxIdentifier('className'), j.jsxExpressionContainer(call));
    }
    return previous;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/codemod/src/transforms/v1/migrate/utils/style-prop-utils.ts
git commit -m "feat(codemod): style-prop consolidation utilities"
```

---

## Task 2: `css-to-style` migration function

**Files:**

- Create: `packages/codemod/src/transforms/v1/migrate/migrations/css-to-style.ts`
- Modify: `packages/codemod/src/transforms/v1/migrate/migrations/index.ts` (re-export)

**Interfaces:**

- Consumes: Task 1 utils.
- Produces:

    ```ts
    export function transformCssToStyle(
        j: JSCodeshift,
        root: Collection<unknown>,
    ): { warnings: string[] };
    ```

- [ ] **Step 1: Write the migration**

```ts
import type { Collection, JSCodeshift, JSXOpeningElement } from 'jscodeshift';

import { ensureStyleImport, mergeClassName, planConsolidation } from '../utils/style-prop-utils';

export function transformCssToStyle(
    j: JSCodeshift,
    root: Collection<unknown>,
): { warnings: string[] } {
    const warnings: string[] = [];
    let mutatedAny = false;

    root.find(j.JSXOpeningElement).forEach((path) => {
        const open = path.node as JSXOpeningElement;
        const plan = planConsolidation(open, j);
        if (!plan.ok) {
            if (plan.reason === 'no-style-attrs') return;
            warnings.push(
                `${describeLoc(path)}: skipped (reason: ${plan.reason}). Convert manually.`,
            );
            return;
        }

        const callExpr = j.callExpression(j.identifier('$style'), [
            j.objectExpression(plan.properties),
        ]);
        const mergedClassName = mergeClassName(plan.classNameAttr, callExpr, j, root);

        // Remove old $css and flat layout attributes.
        open.attributes = (open.attributes ?? []).filter(
            (a) => !plan.toRemove.includes(a as never),
        );

        // Replace existing className OR insert a new className attribute.
        const existingIdx = (open.attributes ?? []).findIndex(
            (a) =>
                a.type === 'JSXAttribute' &&
                a.name.type === 'JSXIdentifier' &&
                a.name.name === 'className',
        );
        if (existingIdx >= 0) {
            (open.attributes as never[])[existingIdx] = mergedClassName as never;
        } else {
            open.attributes!.push(mergedClassName);
        }
        mutatedAny = true;
    });

    if (mutatedAny) ensureStyleImport(root, j);
    return { warnings };
}

function describeLoc(path: {
    node: { loc?: { start?: { line: number; column: number } } };
}): string {
    const l = path.node.loc?.start;
    return l ? `${l.line}:${l.column}` : '?:?';
}
```

- [ ] **Step 2: Re-export from `migrations/index.ts`**

Add line to existing index:

```ts
export * from './css-to-style';
```

- [ ] **Step 3: Commit**

```bash
git add packages/codemod/src/transforms/v1/migrate/migrations
git commit -m "feat(codemod): css-to-style migration"
```

---

## Task 3: Fixture suite + test driver

**Files:**

- Create: `packages/codemod/src/transforms/v1/migrate/__testfixtures__/css-to-style/*` (pairs of `.input.tsx` / `.output.tsx`)
- Create: `packages/codemod/src/transforms/v1/migrate/__tests__/css-to-style/css-to-style.test.ts`

**Interfaces:**

- Consumes: existing `runTestTransform` helper (look at the existing test for shape).
- Produces: a dedicated jscodeshift transform driver test that runs through every fixture pair.

The transform driver for these tests is a small wrapper that calls `transformCssToStyle` only — independent of the bundled `migrate` transform so we can run it standalone via `vapor-codemod css-to-style`.

- [ ] **Step 1: Write fixture pairs**

Each pair lives at `__testfixtures__/css-to-style/<name>.input.tsx` + `<name>.output.tsx`.

`static-css-only.input.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

export const X = () => <Box $css={{ padding: '$400', backgroundColor: '$primary' }} />;
```

`static-css-only.output.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';

export const X = () => <Box className={$style({ padding: '$400', backgroundColor: '$primary' })} />;
```

`ternary-css.input.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

export const X = ({ active }) => (
    <Box $css={{ backgroundColor: active ? '$primary' : '$bg-gray-100' }} />
);
```

`ternary-css.output.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';

export const X = ({ active }) => (
    <Box className={$style({ backgroundColor: active ? '$primary' : '$bg-gray-100' })} />
);
```

`flat-props-only.input.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

export const X = () => <Box padding="$400" backgroundColor="$primary" />;
```

`flat-props-only.output.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';

export const X = () => <Box className={$style({ padding: '$400', backgroundColor: '$primary' })} />;
```

`css-and-flat-props.input.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

export const X = () => <Box padding="$400" $css={{ color: '$primary' }} />;
```

`css-and-flat-props.output.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';

export const X = () => <Box className={$style({ padding: '$400', color: '$primary' })} />;
```

`collision-flat-then-css.input.tsx` — precedence test, flat prop appears first:

```tsx
import { Box } from '@vapor-ui/core';

// Today's resolveStyles runs deprecated sprinkles first, then $css. So $css wins.
export const X = () => <Box padding="$200" $css={{ padding: '$400' }} />;
```

`collision-flat-then-css.output.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';

// Same key from both surfaces → emit only one entry, sourced from $css (the winner today).
export const X = () => <Box className={$style({ padding: '$400' })} />;
```

`collision-css-then-flat.input.tsx` — precedence test, `$css` appears first:

```tsx
import { Box } from '@vapor-ui/core';

// Source order is JSX-attribute order, but runtime precedence is fixed at $css > flat. Codemod respects runtime, not source order.
export const X = () => <Box $css={{ padding: '$400' }} padding="$200" />;
```

`collision-css-then-flat.output.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';

export const X = () => <Box className={$style({ padding: '$400' })} />;
```

> Implementation note for Task 2: when both `$css` and a flat-prop carry the same key, keep the `$css` value and drop the flat-prop value. The `planConsolidation` helper from Task 1 must implement this — change the property accumulation so flat-prop entries skip keys already populated from `$css`, regardless of attribute source order. Add a small unit test in `style-prop-utils.test.ts` to lock the precedence rule explicitly.

`existing-classname-literal.input.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

export const X = () => <Box className="existing" padding="$400" />;
```

`existing-classname-literal.output.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';

export const X = () => <Box className={`existing ${$style({ padding: '$400' })}`} />;
```

`existing-classname-dynamic.input.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

export const X = ({ cls }) => <Box className={cls} padding="$400" />;
```

`existing-classname-dynamic.output.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';
import { clsx } from 'clsx';

export const X = ({ cls }) => <Box className={clsx(cls, $style({ padding: '$400' }))} />;
```

`existing-style-import.input.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';

export const X = () => <Box padding="$400" />;
```

`existing-style-import.output.tsx`:

```tsx
import { $style, Box } from '@vapor-ui/core';

export const X = () => <Box className={$style({ padding: '$400' })} />;
```

`no-vapor-import-skip.input.tsx`:

```tsx
import { Box } from 'other-lib';

export const X = () => <Box padding="$400" />;
```

`no-vapor-import-skip.output.tsx`:

```tsx
import { Box } from 'other-lib';

export const X = () => <Box padding="$400" />;
```

`spread-css-skip.input.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

const rest = { padding: '$400' };
export const X = () => <Box {...rest} />;
```

`spread-css-skip.output.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

const rest = { padding: '$400' };
export const X = () => <Box {...rest} />;
```

`variable-css-skip.input.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

const cssObj = { padding: '$400' };
export const X = () => <Box $css={cssObj} />;
```

`variable-css-skip.output.tsx`:

```tsx
import { Box } from '@vapor-ui/core';

const cssObj = { padding: '$400' };
export const X = () => <Box $css={cssObj} />;
```

- [ ] **Step 2: Write transform driver**

`packages/codemod/src/transforms/v1/migrate/__tests__/css-to-style/css-to-style.transform.ts`:

```ts
import type { API, FileInfo, Transform } from 'jscodeshift';

import { transformCssToStyle } from '../../migrations/css-to-style';
import { hasTargetPackageImports } from '../../utils/import-verification';

const transform: Transform = (file: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(file.source);
    if (!hasTargetPackageImports(j, root)) return file.source;
    transformCssToStyle(j, root);
    return root.toSource();
};

export default transform;
export const parser = 'tsx';
```

- [ ] **Step 3: Write test driver**

`packages/codemod/src/transforms/v1/migrate/__tests__/css-to-style/css-to-style.test.ts`:

```ts
import { join } from 'node:path';

import { runTestTransform } from '~/utils/test';

import transform from './css-to-style.transform';

runTestTransform({
    transform,
    fixturesDir: join(__dirname, '..', '..', '__testfixtures__', 'css-to-style'),
});
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @vapor-ui/codemod test`
Expected: all fixture pairs PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/codemod
git commit -m "test(codemod): css-to-style fixture suite"
```

---

## Task 4: CLI subcommand `css-to-style`

**Files:**

- Modify: `packages/codemod/src/bin/cli.ts`

**Interfaces:**

- Consumes: Task 2 transform driver from Task 3 (we ship it as the registered transform for the subcommand).
- Produces: `npx @vapor-ui/codemod css-to-style src/` (and `vapor-codemod css-to-style src/`) — runs the standalone transform and prints skip warnings.

- [ ] **Step 1: Inspect existing CLI structure**

Read `packages/codemod/src/bin/cli.ts` to learn how subcommands are registered. Mirror the existing `migrate` subcommand entry exactly — only swap names + transform module path.

- [ ] **Step 2: Register the subcommand**

Add (or update) a registration block resembling:

```ts
program
    .command('css-to-style <paths...>')
    .description('Convert $css prop + flat layout props to $style({...})')
    .option('--dry', 'Print diff without writing')
    .action(async (paths, opts) => {
        await runTransform({
            transformPath:
                require.resolve('../transforms/v1/migrate/__tests__/css-to-style/css-to-style.transform'),
            paths,
            dry: opts.dry,
        });
    });
```

(The exact API depends on what's in `cli.ts` today — match it. If `runTransform` doesn't exist, replicate the helper the `migrate` subcommand uses.)

If the existing `cli.ts` ships transforms from `dist/...`, also add a transform path entry in the build output. The transform file must be included in `tsup`'s `entry`. Modify the codemod's build config so the standalone css-to-style transform ends up at `dist/transforms/css-to-style.mjs`. The CLI then resolves it via that fixed path.

- [ ] **Step 3: Verify build**

Run: `pnpm --filter @vapor-ui/codemod build`
Expected: emits the standalone transform file under `dist/`.

- [ ] **Step 4: Manual smoke test**

Create a temp dir:

```bash
mkdir -p /tmp/codemod-smoke && cp packages/codemod/src/transforms/v1/migrate/__testfixtures__/css-to-style/static-css-only.input.tsx /tmp/codemod-smoke/sample.tsx
node packages/codemod/dist/bin/cli.mjs css-to-style /tmp/codemod-smoke/
```

Read `/tmp/codemod-smoke/sample.tsx`. Expected: matches the `.output.tsx` fixture.

- [ ] **Step 5: Commit**

```bash
git add packages/codemod/src/bin/cli.ts packages/codemod/tsup.config.ts
git commit -m "feat(codemod): expose css-to-style subcommand"
```

---

## Task 5: Bundle into the `v1/migrate` aggregate transform

**Files:**

- Modify: `packages/codemod/src/transforms/v1/migrate/index.ts`

**Interfaces:**

- Consumes: Task 2.
- Produces: the existing `migrate` subcommand also runs `transformCssToStyle`, so consumers performing the broader v1 migration pick it up automatically.

- [ ] **Step 1: Update the aggregate**

```ts
import { transformCssToStyle } from './migrations/css-to-style';

// inside transform body, alongside the others:
transformCssToStyle(j, root);
```

- [ ] **Step 2: Run the existing migrate test suite — ensure no regression**

Run: `pnpm --filter @vapor-ui/codemod test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/codemod/src/transforms/v1/migrate/index.ts
git commit -m "feat(codemod): include css-to-style in v1 migrate"
```

---

## Task 6: README + warning row format

**Files:**

- Modify: `packages/codemod/README.md`

**Interfaces:**

- Consumes: nothing.
- Produces: user-visible docs for the new subcommand.

- [ ] **Step 1: Update README**

Add a section:

```markdown
## `css-to-style`

`npx @vapor-ui/codemod css-to-style <paths...>`

Converts the legacy `$css` prop and deprecated flat layout props (`padding`, `margin`, `width`, …) into a single `$style({...})` call.

### Skipped cases

These are reported but not transformed — review and convert manually:

- `{...spread}` JSX attributes
- `$css={variable}` (variable reference)
- `$css={dynamicObj()}` (function call)
- Ternary on the JSX attribute level with non-literal arms

### className merge

- Static literal preserved with template literal: ``className={`existing ${$style({...})}`}``
- Dynamic className merged via `clsx`: `className={clsx(prev, $style({...}))}` (import auto-added)
```

- [ ] **Step 2: Commit**

```bash
git add packages/codemod/README.md
git commit -m "docs(codemod): css-to-style usage"
```

---

## Self-review against spec

- §9.1 first responsibility: `<X $css={{...}}/>` → `<X className={$style({...})} />` → Task 2 + fixture.
- §9.1 second responsibility: consolidate flat deprecated props → Task 1 (`FLAT_LAYOUT_PROPS`) + Task 2 + fixtures.
- §9.1 className merge (template-literal OR clsx) → Task 1 `mergeClassName` + fixtures.
- §9.1 skip + report unconvertible cases → Task 2's warning channel + Task 6 docs.

**Out of scope for Plan D (handed off):** deprecation runtime warning on `$css` (Plan E), JSDoc `@deprecated` (Plan E).

**Dependency note:** This plan depends on Plan C landing the `$style` symbol in `@vapor-ui/core`. The fixture files import `$style` from `@vapor-ui/core` and will not type-check until Plan C ships. The jscodeshift transform itself does not need `$style` to exist; only the transformed code does.
