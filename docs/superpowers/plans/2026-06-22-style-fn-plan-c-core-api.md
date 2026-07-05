# Plan C — `$style` API in `@vapor-ui/core` + PostCSS Helper + App Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the `$style` symbol in `@vapor-ui/core`, emit the token manifest JSON its build produces, ship the `@vapor-ui/core/postcss` helper for breakpoint override, and wire the macro into `apps/storybook` (Vite) + `apps/website` (Next/webpack).

**Architecture:**

1. `$style` is type-only at runtime — a Babel-friendly identifier replaced by Plan B's macro before bundling. Source file holds an `IDENTITY_RUNTIME_FALLBACK` for editor-mode evaluation. The runtime fallback returns `''`.
2. A new build step (`scripts/build-tokens-manifest.ts`) reads `src/styles/tokens/` exports and emits `dist/tokens.manifest.json` matching Plan A's `ManifestShape`.
3. `@vapor-ui/core/postcss` wraps `postcss-custom-media` and strict-validates the BP-name override map (sm/md/lg only).
4. `apps/storybook/vite.config.ts` adds the unplugin. `apps/website/next.config.mjs` adds webpack plugin + splitChunks group + `@custom-media` CSS injection.

**Tech Stack:** `@vapor-ui/core` (Rollup + vanilla-extract), `@vapor-ui/style-macro/unplugin` (Plan B), `postcss-custom-media`, vitest, Playwright (existing).

## Global Constraints

- `$style`'s runtime is type-only (§7.1 & §8).
- Token grammar (§4.3) — only `$<name>` strings allowed in user input; otherwise build-time error.
- BP override surface: `sm`/`md`/`lg` only (§5.2 & §11). Unknown BP key in `vaporCustomMedia` → throw with a list of accepted names.
- Token manifest path consumed by the macro must be `@vapor-ui/core/dist/tokens.manifest.json` — already the default in Plan B.
- splitChunks cache group for Next.js: copy the exact block from spec §7.3 verbatim.
- Vapor's existing `@layer vapor.*` cascade is intact; new macro output goes inside `@layer vapor.utilities` (spec §6.2).
- Next 16+ uses `--webpack`; Turbopack not supported.
- `@custom-media --vapor-{sm,md,lg}` declarations must appear in the bundle output before any rule using them — the postcss helper handles this, and as a fallback the core ships them in a static `dist/styles/breakpoints.css` so consumers that don't run postcss-custom-media still get default queries.
- Non-goals (§3) — no condition-first nesting, no custom conditions, no runtime branching.

---

## File Structure

```
packages/core/
├── src/
│   ├── $style.ts                          # type + runtime fallback export
│   ├── postcss/
│   │   ├── index.ts                       # vaporCustomMedia()
│   │   └── breakpoints.ts                 # default BP definitions (single source)
│   ├── styles/
│   │   └── breakpoints.css.ts             # vanilla-extract emit of @custom-media defaults
│   └── index.ts                            # add: export { $style }
├── scripts/
│   └── build-tokens-manifest.ts           # emits dist/tokens.manifest.json
├── package.json                            # add scripts/exports/dep entries
├── rollup.config.mjs                       # add manifest emission step
└── __tests__/
    └── style-fn/
        ├── manifest-shape.test.ts
        ├── postcss-helper.test.ts
        └── $style-runtime-fallback.test.ts

apps/storybook/vite.config.ts               # add unplugin
apps/website/next.config.mjs                # add webpack plugin + splitChunks
apps/website/postcss.config.mjs             # add vaporCustomMedia
apps/website/__tests__/visual/style-fn.spec.ts (Playwright)  # smoke render
apps/storybook/src/stories/StyleFn.stories.tsx  # storybook demo + visual baseline
```

---

## Task 1: Source `$style` symbol + identity runtime

**Files:**

- Create: `packages/core/src/$style.ts`
- Modify: `packages/core/src/index.ts` (add `export { $style }`)
- Create: `packages/core/__tests__/style-fn/$style-runtime-fallback.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:

    ```ts
    export type StyleTokenValue = `$${string}`;
    export type StyleValue = string | number | StyleTokenValue;
    export type ConditionRecord = {
        default?: StyleValue;
        sm?: StyleValue;
        md?: StyleValue;
        lg?: StyleValue;
        _before?: StyleValue;
        _after?: StyleValue;
        _hover?: StyleValue;
        _focus?: StyleValue;
        _focusVisible?: StyleValue;
        _focusWithin?: StyleValue;
        _active?: StyleValue;
    } & { [key: `@media ${string}`]: StyleValue };
    export type StyleInput = Record<string, StyleValue | ConditionRecord>;
    export function $style(input: StyleInput): string;
    ```

    At runtime, `$style` returns `''` (call is removed at build time). Source must remain JSX/Babel-parseable.

- [ ] **Step 1: Write `src/$style.ts`**

```ts
export type StyleTokenValue = `$${string}`;
export type StyleValue = string | number | StyleTokenValue;

export interface ConditionRecord {
    default?: StyleValue;
    sm?: StyleValue;
    md?: StyleValue;
    lg?: StyleValue;
    _before?: StyleValue;
    _after?: StyleValue;
    _hover?: StyleValue;
    _focus?: StyleValue;
    _focusVisible?: StyleValue;
    _focusWithin?: StyleValue;
    _active?: StyleValue;
    [rawMedia: `@media ${string}`]: StyleValue | undefined;
}

export type StyleInput = Record<string, StyleValue | ConditionRecord>;

/**
 * Build-time macro. `@vapor-ui/style-macro/unplugin` rewrites every call site of this
 * function into a literal class-name string and emits the corresponding atomic CSS.
 *
 * If you see this body executing at runtime, the macro is not configured in your
 * bundler — install `@vapor-ui/style-macro/unplugin` per the migration guide.
 */
export function $style(_input: StyleInput): string {
    if (
        typeof console !== 'undefined' &&
        typeof process !== 'undefined' &&
        process.env?.NODE_ENV !== 'production'
    ) {
        console.warn(
            '[@vapor-ui/core] $style was called at runtime — your bundler is missing @vapor-ui/style-macro/unplugin. Returning empty string.',
        );
    }
    return '';
}
```

- [ ] **Step 2: Modify `src/index.ts` — add export**

Add line near the other top-level exports (after the `components/*` block):

```ts
export { $style } from './$style';
export type { StyleInput, StyleValue, ConditionRecord, StyleTokenValue } from './$style';
```

- [ ] **Step 3: Write failing test `__tests__/style-fn/$style-runtime-fallback.test.ts`**

```ts
import { describe, expect, it, vi } from 'vitest';

import { $style } from '../../src/$style';

describe('$style runtime fallback', () => {
    it('returns empty string', () => {
        expect($style({ padding: '$400' })).toBe('');
    });

    it('warns when invoked at runtime in dev', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        $style({ padding: '$400' });
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});
```

- [ ] **Step 4: Run test, verify pass**

Run: `pnpm --filter @vapor-ui/core vitest run __tests__/style-fn/$style-runtime-fallback.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify typecheck + build**

Run: `pnpm --filter @vapor-ui/core typecheck`
Run: `pnpm --filter @vapor-ui/core build`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/\$style.ts packages/core/src/index.ts packages/core/__tests__/style-fn
git commit -m "feat(core): add \$style symbol with runtime fallback"
```

---

## Task 2: Token manifest emitter

**Files:**

- Create: `packages/core/scripts/build-tokens-manifest.ts`
- Modify: `packages/core/package.json` (add `build:tokens-manifest` script, run as part of `build`)
- Modify: `packages/core/rollup.config.mjs` OR `package.json` `build` script (chain `build:tokens-manifest` after rollup)
- Create: `packages/core/__tests__/style-fn/manifest-shape.test.ts`

**Interfaces:**

- Consumes: token sources in `src/styles/tokens/`.
- Produces:
    - Script reads `src/styles/tokens/index.ts` exports at module-load time (it ships as type/data only, no `vanilla-extract` runtime).
    - Emits `dist/tokens.manifest.json` matching Plan A's `ManifestShape`.
    - Property-scope map is sourced from a single hand-maintained `PROPERTY_SCOPES` constant inside the script (must include every prop the macro accepts).

- [ ] **Step 1: Inspect token source shape AND verify pure-data**

Run: `ls packages/core/src/styles/tokens/`
Run a quick read of `src/styles/tokens/size/index.ts` and `color/index.ts` to confirm exported object names (e.g. `SPACE`, `DIMENSION`, `BORDER_RADIUS`, `LIGHT_BASIC_COLORS`, `LIGHT_SEMANTIC_COLORS`, `BOX_SHADOW`, font tokens). The script must reuse these constants directly.

**Critical pre-check:** the manifest emitter runs via `tsx` at build time, **outside** a vanilla-extract bundler context. If `src/styles/tokens/index.ts` (or any transitive import) calls `createGlobalTheme`, `style`, `recipe`, or any other vanilla-extract API at module-load time, `tsx` will crash because it ships no `@vanilla-extract/runtime` bundle adapter. Verify by inspecting every `src/styles/tokens/**/*.ts` for vanilla-extract imports.

- If the token files are pure object literals (no vanilla-extract imports): proceed.
- If they aren't: copy the relevant constants into a sibling pure-data file (e.g. `src/styles/tokens/raw.ts`) and import the manifest emitter from there. The vanilla-extract layer can keep its existing import path; only the emitter needs the raw constants.

- [ ] **Step 2: Write `scripts/build-tokens-manifest.ts`**

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    BORDER_RADIUS,
    BOX_SHADOW,
    DIMENSION,
    FONT_FAMILY,
    FONT_SIZE,
    FONT_WEIGHT,
    LETTER_SPACING,
    LIGHT_BASIC_COLORS,
    LIGHT_SEMANTIC_COLORS,
    LINE_HEIGHT,
    SPACE,
} from '../src/styles/tokens';

type TokenScope = 'color' | 'space' | 'dimension' | 'borderRadius' | 'shadow' | 'typography';

interface ManifestShape {
    version: '1';
    tokens: Record<TokenScope, Record<string, string>>;
    propertyScopes: Record<string, TokenScope>;
}

// Mirrors createGlobalThemeContract's path-join logic in themes.css.ts.
function flatten(
    prefix: string[],
    obj: Record<string, unknown>,
    out: Record<string, string>,
): void {
    for (const [k, v] of Object.entries(obj)) {
        const path = [...prefix, k];
        if (typeof v === 'string') {
            out[path.slice(1).join('-')] = `--vapor-${path.join('-')}`;
        } else if (v && typeof v === 'object') {
            flatten(path, v as Record<string, unknown>, out);
        }
    }
}

function buildBucket(scope: string, source: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    flatten([scope], source, out);
    return out;
}

const PROPERTY_SCOPES: Record<string, TokenScope> = {
    // spacing
    padding: 'space',
    paddingTop: 'space',
    paddingBottom: 'space',
    paddingLeft: 'space',
    paddingRight: 'space',
    paddingX: 'space',
    paddingY: 'space',
    margin: 'space',
    marginTop: 'space',
    marginBottom: 'space',
    marginLeft: 'space',
    marginRight: 'space',
    marginX: 'space',
    marginY: 'space',
    gap: 'space',
    rowGap: 'space',
    columnGap: 'space',
    // dimensions
    width: 'dimension',
    height: 'dimension',
    minWidth: 'dimension',
    minHeight: 'dimension',
    maxWidth: 'dimension',
    maxHeight: 'dimension',
    // colors
    color: 'color',
    backgroundColor: 'color',
    borderColor: 'color',
    // radius / shadow
    borderRadius: 'borderRadius',
    boxShadow: 'shadow',
};

const manifest: ManifestShape = {
    version: '1',
    tokens: {
        color: {
            ...buildBucket('color', LIGHT_BASIC_COLORS as Record<string, unknown>),
            ...buildBucket('color', LIGHT_SEMANTIC_COLORS as Record<string, unknown>),
        },
        space: buildBucket('size-space', SPACE as Record<string, unknown>),
        dimension: buildBucket('size-dimension', DIMENSION as Record<string, unknown>),
        borderRadius: buildBucket('size-borderRadius', BORDER_RADIUS as Record<string, unknown>),
        shadow: buildBucket('shadow', BOX_SHADOW as Record<string, unknown>),
        typography: {
            ...buildBucket('typography-fontSize', FONT_SIZE as Record<string, unknown>),
            ...buildBucket('typography-lineHeight', LINE_HEIGHT as Record<string, unknown>),
            ...buildBucket('typography-fontWeight', FONT_WEIGHT as Record<string, unknown>),
            ...buildBucket('typography-letterSpacing', LETTER_SPACING as Record<string, unknown>),
            ...buildBucket('typography-fontFamily', FONT_FAMILY as Record<string, unknown>),
        },
    },
    propertyScopes: PROPERTY_SCOPES,
};

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, '..', 'dist', 'tokens.manifest.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
// eslint-disable-next-line no-console
console.log(
    `tokens.manifest.json written: ${Object.keys(manifest.tokens.space).length} space, ${Object.keys(manifest.tokens.color).length} color`,
);
```

Note: the `flatten(['color', ...])` call yields entries like `color-primary` → `--vapor-color-primary`. The macro looks up tokens against `manifest.tokens.color[<short>]`, so prefix-strip is required — the script keeps the bucket-internal key without the leading scope segment (see `path.slice(1).join('-')`).

- [ ] **Step 3: Add `build:tokens-manifest` script + wire into `build`**

Modify `packages/core/package.json`:

```json
{
    "scripts": {
        "build": "rollup -c && pnpm run build:tokens-manifest",
        "build:tokens-manifest": "tsx scripts/build-tokens-manifest.ts"
    }
}
```

Add `tsx` to devDependencies if absent.

- [ ] **Step 4: Add `dist/tokens.manifest.json` to `files` in `package.json`**

```json
{ "files": ["dist"] }
```

If `files` already covers `dist`, no change needed. Confirm by reading current value.

- [ ] **Step 5: Add manifest entry to `exports`**

```json
{
    "exports": {
        "./tokens.manifest.json": "./dist/tokens.manifest.json"
    }
}
```

- [ ] **Step 6: Write failing test `__tests__/style-fn/manifest-shape.test.ts`**

```ts
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const manifestPath = resolve(__dirname, '../../dist/tokens.manifest.json');

describe('tokens.manifest.json', () => {
    it('exists after build', () => {
        expect(existsSync(manifestPath)).toBe(true);
    });

    it('matches ManifestShape', () => {
        const m = JSON.parse(readFileSync(manifestPath, 'utf-8'));
        expect(m.version).toBe('1');
        for (const scope of [
            'color',
            'space',
            'dimension',
            'borderRadius',
            'shadow',
            'typography',
        ]) {
            expect(typeof m.tokens[scope]).toBe('object');
        }
        expect(m.propertyScopes.padding).toBe('space');
        expect(m.propertyScopes.backgroundColor).toBe('color');
    });

    it('exposes well-known tokens', () => {
        const m = JSON.parse(readFileSync(manifestPath, 'utf-8'));
        // SPACE tokens are numeric keys (e.g. '100', '200', '400')
        const spaceKeys = Object.keys(m.tokens.space);
        expect(spaceKeys.length).toBeGreaterThan(0);
        // CSS var format
        expect(m.tokens.space[spaceKeys[0]]).toMatch(/^--vapor-/);
    });
});
```

- [ ] **Step 7: Run build + test**

Run: `pnpm --filter @vapor-ui/core build`
Run: `pnpm --filter @vapor-ui/core vitest run __tests__/style-fn/manifest-shape.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/core/scripts packages/core/package.json packages/core/__tests__/style-fn/manifest-shape.test.ts
git commit -m "feat(core): emit dist/tokens.manifest.json on build"
```

---

## Task 3: `@vapor-ui/core/postcss` helper

**Files:**

- Create: `packages/core/src/postcss/breakpoints.ts`
- Create: `packages/core/src/postcss/index.ts`
- Create: `packages/core/src/styles/breakpoints.css.ts`
- Modify: `packages/core/package.json` (add `./postcss` export entry + `postcss-custom-media` dep)
- Modify: `packages/core/rollup.config.mjs` (add `'postcss/index': 'src/postcss/index.ts'` entry, mark `postcss-custom-media` external)
- Create: `packages/core/__tests__/style-fn/postcss-helper.test.ts`

**Interfaces:**

- Consumes: `postcss-custom-media`.
- Produces:
    ```ts
    interface BreakpointOverrides {
        sm?: string;
        md?: string;
        lg?: string;
    }
    export function vaporCustomMedia(overrides?: BreakpointOverrides): import('postcss').Plugin;
    ```
    Throws on unknown BP keys. Wraps `postcss-custom-media` with a custom-media map merging defaults + overrides.
- Also produces a static `dist/styles/breakpoints.css` containing the default `@custom-media --vapor-sm/md/lg` declarations.

- [ ] **Step 1: Add `postcss-custom-media` dep**

Modify `packages/core/package.json`:

```json
{
    "dependencies": { "postcss-custom-media": "^11.0.0" },
    "peerDependencies": { "postcss": "^8.4.0" }
}
```

Run: `pnpm install`.

- [ ] **Step 2: Write `src/postcss/breakpoints.ts`**

```ts
export const DEFAULT_BREAKPOINTS = {
    sm: '(max-width: 767px)',
    md: '(max-width: 1024px)',
    lg: '(min-width: 1025px)',
} as const;

export type BreakpointName = keyof typeof DEFAULT_BREAKPOINTS;

export interface BreakpointOverrides {
    sm?: string;
    md?: string;
    lg?: string;
}

export function resolveBreakpoints(
    overrides: BreakpointOverrides = {},
): Record<BreakpointName, string> {
    for (const key of Object.keys(overrides)) {
        if (!(key in DEFAULT_BREAKPOINTS)) {
            throw new Error(
                `@vapor-ui/core/postcss: unknown breakpoint "${key}". Allowed: ${Object.keys(DEFAULT_BREAKPOINTS).join(', ')}.`,
            );
        }
    }
    return {
        sm: overrides.sm ?? DEFAULT_BREAKPOINTS.sm,
        md: overrides.md ?? DEFAULT_BREAKPOINTS.md,
        lg: overrides.lg ?? DEFAULT_BREAKPOINTS.lg,
    };
}
```

- [ ] **Step 3: Write `src/postcss/index.ts`**

```ts
import postcssCustomMedia from 'postcss-custom-media';

import { type BreakpointOverrides, resolveBreakpoints } from './breakpoints';

export function vaporCustomMedia(
    overrides: BreakpointOverrides = {},
): ReturnType<typeof postcssCustomMedia> {
    const resolved = resolveBreakpoints(overrides);
    return postcssCustomMedia({
        importFrom: [
            {
                customMedia: {
                    '--vapor-sm': resolved.sm,
                    '--vapor-md': resolved.md,
                    '--vapor-lg': resolved.lg,
                },
            },
        ],
    });
}

export type { BreakpointOverrides } from './breakpoints';
```

- [ ] **Step 4: Write `src/styles/breakpoints.css.ts`**

```ts
import { globalStyle } from '@vanilla-extract/css';

import { DEFAULT_BREAKPOINTS } from '../postcss/breakpoints';

// vanilla-extract does not have a first-class @custom-media. Emit via raw global selector
// using the `globalLayer` trick: insert the at-rule via a comment-style hook? Simpler is to
// keep this file plain CSS distributed alongside vanilla output. The build chains a side
// effect to write `dist/styles/breakpoints.css` directly. See `scripts/build-breakpoints-css.ts`.
//
// Placeholder kept so the file participates in the @layer registration.
globalStyle(':root', {
    // intentionally empty; the real artifact is dist/styles/breakpoints.css written by the build script.
});

export const DEFAULTS = DEFAULT_BREAKPOINTS;
```

Note: vanilla-extract does not emit `@custom-media`. The build instead writes `dist/styles/breakpoints.css` directly from a tiny Node script — add this as part of Task 2's `build:tokens-manifest` script (extend the same script) so we don't add a second build hook:

Extend `scripts/build-tokens-manifest.ts` with an additional output:

```ts
import { DEFAULT_BREAKPOINTS } from '../src/postcss/breakpoints';

const bpCss =
    Object.entries(DEFAULT_BREAKPOINTS)
        .map(([k, v]) => `@custom-media --vapor-${k} ${v};`)
        .join('\n') + '\n';
writeFileSync(resolve(here, '..', 'dist', 'styles', 'breakpoints.css'), bpCss, 'utf-8');
mkdirSync(resolve(here, '..', 'dist', 'styles'), { recursive: true }); // ensure dir exists first
```

(Make sure `mkdirSync` for the styles dir happens before `writeFileSync` — adjust order.)

- [ ] **Step 5: Add `./postcss` export to `packages/core/package.json`**

```json
{
    "exports": {
        "./postcss": {
            "types": "./dist/postcss/index.d.ts",
            "import": "./dist/postcss/index.js",
            "require": "./dist/postcss/index.cjs"
        },
        "./styles/breakpoints.css": "./dist/styles/breakpoints.css"
    }
}
```

- [ ] **Step 6: Add the postcss entry to Rollup**

Modify `packages/core/rollup.config.mjs` near `ENTRY_POINTS`:

```js
const ENTRY_POINTS = {
    index: 'src/index.ts',
    'postcss/index': 'src/postcss/index.ts',
    'styles/tailwind-preset': 'src/styles/tailwind-preset.css.ts',
    ...getComponentEntries('src/components'),
};
```

- [ ] **Step 7: Write failing test `__tests__/style-fn/postcss-helper.test.ts`**

```ts
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { vaporCustomMedia } from '../../src/postcss';
import { DEFAULT_BREAKPOINTS, resolveBreakpoints } from '../../src/postcss/breakpoints';

describe('vaporCustomMedia', () => {
    it('exposes defaults', () => {
        expect(resolveBreakpoints()).toEqual(DEFAULT_BREAKPOINTS);
    });

    it('merges overrides', () => {
        const r = resolveBreakpoints({ md: '(max-width: 900px)' });
        expect(r.md).toBe('(max-width: 900px)');
        expect(r.sm).toBe(DEFAULT_BREAKPOINTS.sm);
    });

    it('throws on unknown BP', () => {
        expect(() => resolveBreakpoints({ xl: '(min-width: 1600px)' } as never)).toThrow(
            /unknown breakpoint "xl"/,
        );
    });

    it('expands @media (--vapor-sm) to override value', async () => {
        const input = `@media (--vapor-sm) { .a { color: red } }`;
        const result = await postcss([vaporCustomMedia({ sm: '(max-width: 600px)' })]).process(
            input,
            { from: undefined },
        );
        expect(result.css).toContain('(max-width: 600px)');
    });

    it('expands using defaults when no overrides', async () => {
        const input = `@media (--vapor-md) { .a { color: red } }`;
        const result = await postcss([vaporCustomMedia()]).process(input, { from: undefined });
        expect(result.css).toContain(DEFAULT_BREAKPOINTS.md);
    });
});
```

- [ ] **Step 8: Run tests + build**

Run: `pnpm --filter @vapor-ui/core build`
Run: `pnpm --filter @vapor-ui/core vitest run __tests__/style-fn/postcss-helper.test.ts`
Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add packages/core/src/postcss packages/core/src/styles/breakpoints.css.ts packages/core/scripts packages/core/package.json packages/core/rollup.config.mjs packages/core/__tests__/style-fn/postcss-helper.test.ts pnpm-lock.yaml
git commit -m "feat(core): vaporCustomMedia + breakpoints CSS export"
```

---

## Task 4: Storybook (Vite) wiring + demo story

**Files:**

- Modify: `apps/storybook/vite.config.ts`
- Modify: `apps/storybook/package.json` (devDep on `@vapor-ui/style-macro`)
- Create: `apps/storybook/src/stories/StyleFn.stories.tsx`
- Modify: `apps/storybook/.storybook/preview.*` (import `@vapor-ui/core/styles/breakpoints.css` once)

**Interfaces:**

- Consumes: Plan B's `vaporStyleMacro.vite()`, `@vapor-ui/core`'s `$style` + `breakpoints.css`.
- Produces: a story `style-fn/basics` showing static, ternary, responsive, and pseudo cases; serves as the Playwright visual baseline.

- [ ] **Step 1: Update `apps/storybook/vite.config.ts`**

```ts
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [vaporStyleMacro.vite(), react()],
});
```

- [ ] **Step 2: Add the dep**

Modify `apps/storybook/package.json` to add `"@vapor-ui/style-macro": "workspace:*"` in dependencies.
Run: `pnpm install`.

- [ ] **Step 3: Add a global preview import**

Modify the Storybook preview (`.storybook/preview.tsx` or `preview.ts`) to add at the top:

```ts
import '@vapor-ui/core/styles/breakpoints.css';
```

This ensures `@custom-media --vapor-{sm,md,lg}` is in scope. (If preview already imports core styles, append after that.)

- [ ] **Step 4: Create demo story**

`apps/storybook/src/stories/StyleFn.stories.tsx`:

```tsx
import { useState } from 'react';

import { $style } from '@vapor-ui/core';

export default { title: 'utility/$style' };

export const Basics = () => {
    const [active, setActive] = useState(false);
    return (
        <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
            <div className={$style({ padding: '$400', backgroundColor: '$primary' })}>static</div>
            <div className={$style({ padding: { default: '$200', sm: '$100', md: '$300' } })}>
                responsive
            </div>
            <div
                className={$style({
                    backgroundColor: { default: '$bg-gray-100', _hover: '$primary' },
                })}
            >
                pseudo
            </div>
            <button
                onClick={() => setActive((s) => !s)}
                className={$style({ backgroundColor: active ? '$primary' : '$bg-gray-100' })}
            >
                ternary
            </button>
        </div>
    );
};
```

- [ ] **Step 5: Run storybook locally to verify visually**

Run: `pnpm --filter @vapor-ui/storybook dev`
Open the story. Confirm classes are applied. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add apps/storybook
git commit -m "feat(storybook): wire \$style macro + demo story"
```

---

## Task 5: Next.js (website) wiring with splitChunks

**Files:**

- Modify: `apps/website/next.config.mjs`
- Modify: `apps/website/postcss.config.mjs`
- Modify: `apps/website/package.json` (add `@vapor-ui/style-macro` dep)

**Interfaces:**

- Consumes: Plan B's `vaporStyleMacro.webpack()`, `@vapor-ui/core/postcss`.
- Produces: a working Next build that emits the vapor-style chunk and applies the BP override map.

- [ ] **Step 1: Add deps**

```json
{ "@vapor-ui/style-macro": "workspace:*" }
```

Run: `pnpm install`.

- [ ] **Step 2: Modify `apps/website/next.config.mjs`** — add plugin + splitChunks block from spec §7.3 verbatim:

```js
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';
import createMDX from 'fumadocs-mdx/next';

const withMDX = createMDX();
const plugin = vaporStyleMacro.webpack();

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    // ... existing redirects/rewrites/images/turbopack/experimental untouched ...
    webpack(config) {
        config.module.rules.push({ test: /\.svg$/, use: ['@svgr/webpack'] });
        config.plugins.push(plugin);
        config.optimization.splitChunks ||= {};
        config.optimization.splitChunks.cacheGroups ||= {};
        config.optimization.splitChunks.cacheGroups.vaporStyle = {
            name: 'vapor-style',
            test: (m) =>
                m.type === 'css/mini-extract' &&
                (m.identifier().includes('@vapor-ui/core') ||
                    /macro-(.*?)\.css/.test(m.identifier()) ||
                    /virtual:vapor-style/.test(m.identifier())),
            chunks: 'all',
            enforce: true,
        };
        return config;
    },
};

export default withMDX(config);
```

- [ ] **Step 3: Modify `apps/website/postcss.config.mjs`** — add the helper as a single `plugins` array (PostCSS 8 array form). Tailwind v4's `@tailwindcss/postcss` is callable when invoked through array form:

```js
import tailwindcss from '@tailwindcss/postcss';
import { vaporCustomMedia } from '@vapor-ui/core/postcss';

// vaporCustomMedia MUST run before tailwindcss so Tailwind's resolver sees expanded media queries.
export default {
    plugins: [
        vaporCustomMedia({
            sm: '(max-width: 640px)',
            md: '(max-width: 960px)',
            lg: '(min-width: 961px)',
        }),
        tailwindcss(),
    ],
};
```

Note: a single `plugins` array (no duplicate keys). If `@tailwindcss/postcss` does not export a default callable plugin in the version pinned here, fall back to `require.resolve('@tailwindcss/postcss')` and pass the path as a string entry — verify by running `pnpm --filter @vapor-ui/website build` once after the change and adjusting if PostCSS complains about the entry shape.

- [ ] **Step 4: Update Next 16 fallback notice**

Add to top of `next.config.mjs`:

```js
// Turbopack is not supported by @vapor-ui/style-macro in v1. Run with `next dev --webpack` on Next 16+.
```

- [ ] **Step 5: Smoke check**

Run: `pnpm --filter @vapor-ui/website build`
Expected: build succeeds; the build log mentions a `vapor-style` chunk being emitted.

- [ ] **Step 6: Commit**

```bash
git add apps/website
git commit -m "feat(website): wire \$style macro + vaporCustomMedia"
```

---

## Task 6: Visual regression (Playwright) baseline for `$style`

**Files:**

- Create: `apps/storybook/playwright/visual/style-fn.spec.ts` (path to match the project's existing Playwright layout — adapt if `__tests__/visual/`).
- Update or create relevant baseline screenshots.

**Interfaces:**

- Consumes: Storybook story from Task 4.
- Produces: a Playwright spec that screenshots the story and asserts byte parity within the existing project tolerance.

- [ ] **Step 1: Inspect existing Playwright structure**

Run: `ls apps/storybook` and look for `playwright.config.ts` or `visual` dirs. Mirror the existing layout — do not invent a new one.

- [ ] **Step 2: Write the spec**

Example (adapt path):

```ts
import { expect, test } from '@playwright/test';

test('utility/$style — basics renders deterministically', async ({ page }) => {
    await page.goto('/iframe.html?id=utility-style--basics');
    await expect(page.locator('body')).toHaveScreenshot('style-fn-basics.png');
});
```

- [ ] **Step 3: Run visual + accept new baselines**

Run: existing project's Playwright command (e.g. `pnpm --filter @vapor-ui/storybook test:visual --update-snapshots`)
Inspect the new baseline image (it lives under `apps/storybook/__tests__/visual/` or similar) and confirm it shows what you expect.

- [ ] **Step 4: Re-run without `--update-snapshots`, verify pass**

Run: `pnpm --filter @vapor-ui/storybook test:visual`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/storybook
git commit -m "test(storybook): visual baseline for \$style basics"
```

---

## Task 7: README / migration guide for v1

**Files:**

- Modify: `packages/core/README.md`
- Create: `apps/website/content/docs/migration/style-fn.mdx` (path: confirm with existing docs structure under `apps/website/content/docs/`)

**Interfaces:**

- Consumes: nothing.
- Produces: human docs for the new function + bundler setup.

- [ ] **Step 1: Update `packages/core/README.md` with a `$style` section**

Add a section under `Usage`:

````markdown
## `$style`

Build-time utility CSS API. Returns a class-name string at build time; the runtime fallback returns `''`.

```tsx
import { $style } from '@vapor-ui/core';

<Box className={$style({ padding: '$400', backgroundColor: '$bg-gray-100' })} />;
```
````

Requires `@vapor-ui/style-macro/unplugin` in your bundler. See [the migration guide](https://vapor-ui.goorm.io/docs/migration/style-fn).

````

- [ ] **Step 2: Write the migration MDX**

Create `apps/website/content/docs/migration/style-fn.mdx`:
```mdx
---
title: '$style 함수 사용 가이드'
description: '빌드 타임 유틸리티 CSS API'
---

import { Steps, Step } from 'fumadocs-ui/components/steps';

## 설치

```bash
pnpm add @vapor-ui/style-macro
````

## Next.js

```js
// next.config.mjs
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';

export default {
    webpack(config) {
        config.plugins.push(vaporStyleMacro.webpack());
        return config;
    },
};
```

> Turbopack은 v1에서 지원하지 않습니다. Next 16+에서는 `next dev --webpack` 으로 실행하세요.

## Vite

```js
// vite.config.ts
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';

export default { plugins: [vaporStyleMacro.vite()] };
```

## 브레이크포인트 override

`postcss-custom-media` 기반의 헬퍼가 있습니다.

```js
// postcss.config.mjs
import { vaporCustomMedia } from '@vapor-ui/core/postcss';

export default { plugins: [vaporCustomMedia({ sm: '(max-width: 640px)' })] };
```

`sm` `md` `lg` 외의 키는 빌드 시 오류를 발생시킵니다.

````

- [ ] **Step 3: Build website to confirm MDX compiles**

Run: `pnpm --filter @vapor-ui/website build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/core/README.md apps/website/content/docs/migration
git commit -m "docs: \$style migration guide"
````

---

## Self-review against spec

- §4.2 examples render — covered by Task 4 story + Task 6 visual.
- §5.2 `vaporCustomMedia` helper with strict BP validation → Task 3.
- §5.2 `@custom-media` emit → Task 3 (`dist/styles/breakpoints.css`).
- §7.2 #7 manifest as single source of truth → Task 2.
- §7.3 splitChunks block + Turbopack notice → Task 5 (verbatim).
- §7.4 Vite config → Task 4.
- §8 SSR — `$style` source is RSC-safe (no runtime); covered by Task 1.
- §10 Storybook + website integration + Playwright visual → Tasks 4 + 5 + 6.

**Out of scope for Plan C (handed off):** codemod (Plan D), JSDoc `@deprecated` + dev-mode warning on `$css` (Plan E).
