# Plan B — `@vapor-ui/style-macro` unplugin Adapter + Virtual Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap Plan A's pure `transform` in an `unplugin` adapter that emits a virtual CSS module per transformed file, auto-injects an import to it, and exposes `.vite()`, `.webpack()`, `.rollup()`, `.esbuild()` factories. Fixture-level tests run a real Vite + a real Rollup build and assert emitted assets.

**Architecture:** New sub-export `@vapor-ui/style-macro/unplugin`. Uses `unplugin` to register `transformInclude` (`*.{ts,tsx,js,jsx}`), `transform` (calls Plan A, returns rewritten code + side-effect import), `resolveId` (matches `virtual:vapor-style/<hash>.css`), `load` (returns the in-memory CSS). Per-file content is keyed by SHA1 of the source so HMR re-emits only changed chunks.

**Tech Stack:** `unplugin@^2`, Plan A package, vitest, `vite@^5`, `rollup@^4` (devDependency for integration tests).

## Global Constraints

- Macro stays a separate package from `@vapor-ui/core` (spec §7.1).
- v1 supports Next.js (webpack) + Vite explicitly; Storybook(Vite) + Rollup auto-fall out of unplugin (§7.4–7.5).
- Turbopack unsupported in v1 (§7.3): emit a runtime warning when Turbopack-only mode is detected; document `--webpack` fallback.
- SSR safe: virtual CSS is a static module; no per-request state (§8).
- Cache stability: same source + manifest → identical virtual module id (content hash) so the bundler's persistent cache stays valid.
- HMR: file change recomputes hash; old virtual id becomes unreachable; bundler invalidates it via standard `hotUpdate` semantics.
- Plan A's public surface is frozen — this plan only consumes `transform`/`loadManifest`/types.
- No `$style` API exists in `@vapor-ui/core` yet — fixtures here use a private package source pointing to a stub `$style` export (see Task 2).
- Locked decisions (§11): manifest path is **always configurable** via plugin option `tokensManifestPath`, default `require.resolve('@vapor-ui/core/dist/tokens.manifest.json')`.

---

## File Structure

```
packages/style-macro/
├── package.json                       # add unplugin dep + unplugin subpath export
├── src/
│   ├── unplugin.ts                    # createUnplugin factory + cache
│   ├── unplugin-types.ts              # PluginOptions + per-file record types
│   └── unplugin-entry.ts              # `import vaporStyleMacro from '@vapor-ui/style-macro/unplugin'`
└── tests/
    ├── unplugin/
    │   ├── fixtures/
    │   │   ├── manifest.json          # symlink or copy of fixtures/manifest.sample.json
    │   │   ├── src/
    │   │   │   ├── input-static.tsx
    │   │   │   ├── input-responsive.tsx
    │   │   │   └── input-error.tsx
    │   │   └── package.json
    │   ├── vite-build.test.ts         # spins a real Vite build
    │   ├── rollup-build.test.ts       # spins a real Rollup build
    │   ├── hmr-id.test.ts             # source change → new virtual id
    │   └── error-reporting.test.ts    # bad input → bundler error contains codeframe
```

---

## Task 1: unplugin core + per-file virtual module

**Files:**

- Modify: `packages/style-macro/package.json` (add `unplugin` dep + sub-export)
- Create: `packages/style-macro/src/unplugin-types.ts`
- Create: `packages/style-macro/src/unplugin.ts`
- Create: `packages/style-macro/src/unplugin-entry.ts`

**Interfaces:**

- Consumes: Plan A `transform`, `loadManifest`, types.
- Produces:

    ```ts
    export interface VaporStyleOptions {
        tokensManifestPath?: string;
        importSource?: string; // default '@vapor-ui/core'
        importName?: string; // default '$style'
        include?: (id: string) => boolean;
    }
    declare const vaporStyleMacro: ReturnType<typeof createUnplugin<VaporStyleOptions>>;
    export default vaporStyleMacro;
    ```

    exposes `.vite()`, `.webpack()`, `.rollup()`, `.esbuild()`.

- [ ] **Step 1: Update `package.json`**

Add to `dependencies`:

```json
{ "unplugin": "^2.0.0" }
```

Add to `exports`:

```json
{
    "./unplugin": {
        "types": "./dist/unplugin-entry.d.ts",
        "import": "./dist/unplugin-entry.js",
        "require": "./dist/unplugin-entry.cjs"
    }
}
```

Add `src/unplugin-entry.ts` to `tsup.config.ts` `entry`:

```ts
entry: ['src/index.ts', 'src/unplugin-entry.ts'],
```

- [ ] **Step 2: Run install**

Run: `pnpm install`

- [ ] **Step 3: Write `src/unplugin-types.ts`**

```ts
import type { ManifestShape } from './types';

export interface VaporStyleOptions {
    tokensManifestPath?: string;
    importSource?: string;
    importName?: string;
    include?: (id: string) => boolean;
}

export interface ResolvedOptions {
    manifest: ManifestShape;
    importSource: string;
    importName: string;
    include: (id: string) => boolean;
}

export interface FileRecord {
    css: string;
    classes: string[];
}
```

- [ ] **Step 4: Write `src/unplugin.ts`**

```ts
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { createUnplugin } from 'unplugin';

import { formatBuildError } from './code-frame';
import { loadManifest } from './tokens';
import { transform } from './transform';
import type { FileRecord, ResolvedOptions, VaporStyleOptions } from './unplugin-types';

const VIRTUAL_PREFIX = '\0virtual:vapor-style/';
const VIRTUAL_SUFFIX = '.css';
const PUBLIC_PREFIX = 'virtual:vapor-style/';

function defaultInclude(id: string): boolean {
    if (id.includes('node_modules')) return false;
    return /\.(?:tsx?|jsx?|mts|mjs|cts|cjs)$/.test(id);
}

function resolveOptions(opts: VaporStyleOptions): ResolvedOptions {
    const require_ = createRequire(import.meta.url);
    // Resolves the package-exported entry `@vapor-ui/core/tokens.manifest.json`
    // (NOT a deep `/dist/...` path — once `exports` is declared, deep imports are
    // blocked unless explicitly whitelisted). Plan C exposes this exact entry.
    const manifestPath =
        opts.tokensManifestPath ?? require_.resolve('@vapor-ui/core/tokens.manifest.json');
    return {
        manifest: loadManifest(manifestPath),
        importSource: opts.importSource ?? '@vapor-ui/core',
        importName: opts.importName ?? '$style',
        include: opts.include ?? defaultInclude,
    };
}

function hashContent(input: string): string {
    return createHash('sha1').update(input).digest('hex').slice(0, 12);
}

export default createUnplugin<VaporStyleOptions | undefined>((rawOpts) => {
    const opts = resolveOptions(rawOpts ?? {});
    const records = new Map<string, FileRecord>(); // hash → record

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        resolveId(id) {
            if (id.startsWith(PUBLIC_PREFIX)) return '\0' + id;
            return null;
        },

        loadInclude(id) {
            return id.startsWith(VIRTUAL_PREFIX);
        },

        load(id) {
            if (!id.startsWith(VIRTUAL_PREFIX)) return null;
            const hash = id.slice(VIRTUAL_PREFIX.length, -VIRTUAL_SUFFIX.length);
            const rec = records.get(hash);
            if (!rec) return null;
            return rec.css;
        },

        transformInclude(id) {
            const cleaned = id.split('?')[0];
            if (cleaned.startsWith(VIRTUAL_PREFIX)) return false;
            return opts.include(cleaned);
        },

        transform(code, id) {
            const filename = id.split('?')[0];
            const result = transform({
                source: code,
                filename,
                manifest: opts.manifest,
                importSource: opts.importSource,
                importName: opts.importName,
            });
            if (result.errors.length) {
                const msg = result.errors
                    .map((e) => formatBuildError(e, code, filename))
                    .join('\n\n');
                this.error(msg);
                return null;
            }
            if (!result.css) return null;
            const hash = hashContent(result.css);
            records.set(hash, { css: result.css, classes: result.classes });
            const importLine = `import "${PUBLIC_PREFIX}${hash}${VIRTUAL_SUFFIX}";\n`;
            return { code: importLine + result.code, map: null };
        },
    };
});
```

- [ ] **Step 5: Write `src/unplugin-entry.ts`**

```ts
import unplugin from './unplugin';

export default unplugin;
export type { VaporStyleOptions } from './unplugin-types';
```

- [ ] **Step 6: Verify build**

Run: `pnpm --filter @vapor-ui/style-macro build`
Expected: emits both `dist/index.*` and `dist/unplugin-entry.*`.

- [ ] **Step 7: Commit**

```bash
git add packages/style-macro/package.json packages/style-macro/src packages/style-macro/tsup.config.ts
git commit -m "feat(style-macro): unplugin adapter with virtual CSS module"
```

---

## Task 2: Fixture project skeleton

**Files:**

- Create: `packages/style-macro/tests/unplugin/fixtures/package.json`
- Create: `packages/style-macro/tests/unplugin/fixtures/manifest.json` (copy of `tests/fixtures/manifest.sample.json`)
- Create: `packages/style-macro/tests/unplugin/fixtures/src/$style-stub.ts`
- Create: `packages/style-macro/tests/unplugin/fixtures/src/input-static.tsx`
- Create: `packages/style-macro/tests/unplugin/fixtures/src/input-responsive.tsx`
- Create: `packages/style-macro/tests/unplugin/fixtures/src/input-error.tsx`

**Interfaces:**

- Consumes: nothing.
- Produces: a self-contained mini-project the integration tests build.

Note: until Plan C ships, no real `@vapor-ui/core/$style` export exists. The fixtures use a local stub module whose import id we pass via `importSource`.

- [ ] **Step 1: Write `fixtures/package.json`**

```json
{ "name": "@_fixture/vapor-style-test", "private": true, "version": "0.0.0", "type": "module" }
```

- [ ] **Step 2: Copy manifest**

Run: `cp packages/style-macro/tests/fixtures/manifest.sample.json packages/style-macro/tests/unplugin/fixtures/manifest.json`

- [ ] **Step 3: Write the `$style` stub**

`fixtures/src/$style-stub.ts`:

```ts
// Used as the macro's importSource. After build the call is removed; the runtime stub returns ''
// to keep the source type-checkable in editor mode.
export function $style(_: Record<string, unknown>): string {
    return '';
}
```

- [ ] **Step 4: Write fixture inputs**

`fixtures/src/input-static.tsx`:

```tsx
import { $style } from './$style-stub';

export const cls = $style({ padding: '$400', backgroundColor: '$primary' });
```

`fixtures/src/input-responsive.tsx`:

```tsx
import { $style } from './$style-stub';

export const cls = $style({
    padding: { default: '$200', sm: '$100' },
    color: { default: '$bg-gray-100', _hover: '$primary' },
});
```

`fixtures/src/input-error.tsx`:

```tsx
import { $style } from './$style-stub';

export const cls = $style({ padding: '$primary' });
```

- [ ] **Step 5: Commit**

```bash
git add packages/style-macro/tests/unplugin/fixtures
git commit -m "test(style-macro): unplugin integration fixtures"
```

---

## Task 3: Vite build integration test

**Files:**

- Modify: `packages/style-macro/package.json` (devDeps: `vite`, no Vite plugins needed)
- Create: `packages/style-macro/tests/unplugin/vite-build.test.ts`

**Interfaces:**

- Consumes: Task 1 unplugin entry, Task 2 fixtures.
- Produces: assertion that emitted output contains the expected `@layer vapor.utilities { ... }` CSS and that `cls` is a static string literal.

- [ ] **Step 1: Add devDependency**

Add to `packages/style-macro/package.json` devDeps:

```json
{ "vite": "^5.0.0" }
```

Run: `pnpm install`.

- [ ] **Step 2: Write `tests/unplugin/vite-build.test.ts`**

```ts
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';

import vaporStyleMacro from '../../src/unplugin';

const fixtureRoot = fileURLToPath(new URL('./fixtures', import.meta.url));
const manifestPath = join(fixtureRoot, 'manifest.json');

async function buildEntry(entry: string) {
    const out = await build({
        root: fixtureRoot,
        logLevel: 'silent',
        build: {
            write: false,
            lib: { entry: resolve(fixtureRoot, entry), formats: ['es'], fileName: 'out' },
            rollupOptions: { external: ['react', 'react/jsx-runtime'] },
        },
        plugins: [
            vaporStyleMacro.vite({
                tokensManifestPath: manifestPath,
                importSource: './$style-stub',
            }),
        ],
    });
    if (!Array.isArray(out)) throw new Error('expected single build output');
    const assets = (
        out[0] as {
            output: Array<{ type: string; fileName: string; source?: string; code?: string }>;
        }
    ).output;
    const js = assets.find((a) => a.fileName.endsWith('.js'));
    const css = assets.find((a) => a.fileName.endsWith('.css'));
    return { js: js?.code ?? '', css: (css?.source as string) ?? '' };
}

describe('vite build', () => {
    it('inlines static class names + emits CSS for the static case', async () => {
        const r = await buildEntry('src/input-static.tsx');
        expect(r.js).toMatch(/"_bg-primary _p-400"|"_p-400 _bg-primary"/);
        expect(r.css).toContain('@layer vapor.utilities');
        expect(r.css).toContain('._bg-primary');
        expect(r.css).toContain('._p-400');
    });

    it('emits responsive + pseudo rules', async () => {
        const r = await buildEntry('src/input-responsive.tsx');
        expect(r.css).toContain('@media (--vapor-sm)');
        expect(r.css).toContain(':hover');
    });
});
```

- [ ] **Step 3: Run tests, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: both PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/style-macro/package.json packages/style-macro/tests/unplugin/vite-build.test.ts pnpm-lock.yaml
git commit -m "test(style-macro): vite integration build"
```

---

## Task 4: Rollup build integration test

**Files:**

- Modify: `packages/style-macro/package.json` (devDeps: `rollup`, `@rollup/plugin-typescript`)
- Create: `packages/style-macro/tests/unplugin/rollup-build.test.ts`

**Interfaces:**

- Consumes: Task 1 unplugin entry.
- Produces: confirmation that Rollup's CSS-by-import-side-effect path receives the virtual CSS module (it does not bundle CSS by default, so we assert via `generateBundle` collector).

- [ ] **Step 1: Add devDeps**

Add:

```json
{
    "rollup": "^4.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "@rollup/plugin-node-resolve": "^16.0.3"
}
```

Run: `pnpm install`.

- [ ] **Step 2: Write `tests/unplugin/rollup-build.test.ts`**

```ts
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import { describe, expect, it } from 'vitest';

import vaporStyleMacro from '../../src/unplugin';

const fixtureRoot = fileURLToPath(new URL('./fixtures', import.meta.url));
const manifestPath = join(fixtureRoot, 'manifest.json');

describe('rollup build', () => {
    it('rewrites the call and registers a virtual CSS module', async () => {
        const css: string[] = [];
        const bundle = await rollup({
            input: join(fixtureRoot, 'src/input-static.tsx'),
            external: ['react', 'react/jsx-runtime'],
            plugins: [
                vaporStyleMacro.rollup({
                    tokensManifestPath: manifestPath,
                    importSource: './$style-stub',
                }),
                {
                    name: 'capture-css',
                    load(id) {
                        if (id.endsWith('.css')) {
                            // unplugin returns css via load; we collect here.
                            // No-op; the unplugin's own load() answers.
                            return null;
                        }
                        return null;
                    },
                    transform(code, id) {
                        if (id.endsWith('.css')) css.push(code);
                        return null;
                    },
                },
            ],
        });
        const { output } = await bundle.generate({ format: 'es' });
        const js = output.find((o) => o.type === 'chunk');
        expect(js).toBeTruthy();
        if (js?.type !== 'chunk') throw new Error();
        expect(js.code).toMatch(/"_bg-primary _p-400"|"_p-400 _bg-primary"/);
        expect(css.some((c) => c.includes('._p-400'))).toBe(true);
    });
});
```

- [ ] **Step 3: Run, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/style-macro/package.json packages/style-macro/tests/unplugin/rollup-build.test.ts pnpm-lock.yaml
git commit -m "test(style-macro): rollup integration build"
```

---

## Task 5: Per-file hash invalidation (HMR-equivalent)

**Files:**

- Create: `packages/style-macro/tests/unplugin/hmr-id.test.ts`

**Interfaces:**

- Consumes: Task 1.
- Produces: assertion that a source edit produces a new virtual module id (so bundler caches invalidate naturally).

- [ ] **Step 1: Write test**

```ts
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import vaporStyleMacro from '../../src/unplugin';

const fixtureRoot = fileURLToPath(new URL('./fixtures', import.meta.url));
const manifestPath = join(fixtureRoot, 'manifest.json');

function extractVirtualImport(code: string): string | null {
    const m = code.match(/import\s+"(virtual:vapor-style\/[a-f0-9]+\.css)"/);
    return m?.[1] ?? null;
}

describe('hmr id stability', () => {
    it('produces same id when source unchanged', () => {
        const factory = vaporStyleMacro.raw(
            { tokensManifestPath: manifestPath, importSource: './$style-stub' },
            { framework: 'esbuild' },
        );
        const transformHook = factory.transform as (
            code: string,
            id: string,
        ) => { code: string } | null | { code: string; map: unknown };
        const src = `import { $style } from './$style-stub';\nexport const c = $style({ padding: '$400' });`;
        const a = transformHook.call({ error: () => {} } as never, src, '/v/file.tsx') as {
            code: string;
        };
        const b = transformHook.call({ error: () => {} } as never, src, '/v/file.tsx') as {
            code: string;
        };
        expect(extractVirtualImport(a.code)).toBe(extractVirtualImport(b.code));
    });

    it('produces different id when source changes', () => {
        const factory = vaporStyleMacro.raw(
            { tokensManifestPath: manifestPath, importSource: './$style-stub' },
            { framework: 'esbuild' },
        );
        const transformHook = factory.transform as (code: string, id: string) => { code: string };
        const src1 = `import { $style } from './$style-stub';\nexport const c = $style({ padding: '$400' });`;
        const src2 = `import { $style } from './$style-stub';\nexport const c = $style({ padding: '$200' });`;
        const a = transformHook.call({ error: () => {} } as never, src1, '/v/file.tsx');
        const b = transformHook.call({ error: () => {} } as never, src2, '/v/file.tsx');
        expect(extractVirtualImport(a.code)).not.toBe(extractVirtualImport(b.code));
    });
});
```

- [ ] **Step 2: Run, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/style-macro/tests/unplugin/hmr-id.test.ts
git commit -m "test(style-macro): per-file virtual module id stability"
```

---

## Task 6: Build error reporting carries codeframe

**Files:**

- Create: `packages/style-macro/tests/unplugin/error-reporting.test.ts`

**Interfaces:**

- Consumes: Task 1 + Vite build harness.
- Produces: assertion that a fixture with a bad token (`{ padding: '$primary' }`) causes the bundler build to fail with an error message containing `scope-mismatch` and the source line.

- [ ] **Step 1: Write test**

```ts
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';

import vaporStyleMacro from '../../src/unplugin';

const fixtureRoot = fileURLToPath(new URL('./fixtures', import.meta.url));
const manifestPath = join(fixtureRoot, 'manifest.json');

describe('error reporting', () => {
    it('surfaces a codeframe error for bad token', async () => {
        await expect(
            build({
                root: fixtureRoot,
                logLevel: 'silent',
                build: {
                    write: false,
                    lib: {
                        entry: resolve(fixtureRoot, 'src/input-error.tsx'),
                        formats: ['es'],
                        fileName: 'out',
                    },
                    rollupOptions: { external: ['react', 'react/jsx-runtime'] },
                },
                plugins: [
                    vaporStyleMacro.vite({
                        tokensManifestPath: manifestPath,
                        importSource: './$style-stub',
                    }),
                ],
            }),
        ).rejects.toThrow(/scope-mismatch/);
    });
});
```

- [ ] **Step 2: Run, verify pass**

Run: `pnpm --filter @vapor-ui/style-macro test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/style-macro/tests/unplugin/error-reporting.test.ts
git commit -m "test(style-macro): build error includes codeframe"
```

---

## Task 7: Public README + final build

**Files:**

- Modify: `packages/style-macro/README.md`

**Interfaces:**

- Consumes: full package.
- Produces: docs for the bundler-side contract Plan C will consume.

- [ ] **Step 1: Update README — add usage block**

Append to README:

````markdown
## Usage in a bundler

```js
// vite.config.js
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';

export default {
    plugins: [vaporStyleMacro.vite()],
};
```
````

```js
// next.config.mjs / webpack.config.js
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';

export default {
    webpack(config) {
        config.plugins.push(vaporStyleMacro.webpack());
        return config;
    },
};
```

### Options

| Option               | Default                                                                        | Notes                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokensManifestPath` | `require.resolve('@vapor-ui/core/tokens.manifest.json')`                       | JSON manifest exported by `@vapor-ui/core` (or a future `@vapor-ui/tokens`). Resolves the package's `./tokens.manifest.json` exports entry. |
| `importSource`       | `'@vapor-ui/core'`                                                             | Where `$style` is imported from.                                                                                                            |
| `importName`         | `'$style'`                                                                     | Exported name to track.                                                                                                                     |
| `include`            | `(id) => /\.(tsx?\|jsx?\|mts\|cts)$/.test(id) && !id.includes('node_modules')` | Per-id filter.                                                                                                                              |

> Turbopack is not supported in v1. Next 16+ users must run with `--webpack`.

````

- [ ] **Step 2: Final verification**

Run: `pnpm --filter @vapor-ui/style-macro lint`
Run: `pnpm --filter @vapor-ui/style-macro typecheck`
Run: `pnpm --filter @vapor-ui/style-macro test`
Run: `pnpm --filter @vapor-ui/style-macro build`
Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/style-macro/README.md
git commit -m "docs(style-macro): unplugin usage guide"
````

---

## Self-review against spec

- §7.1 macro package separate → enforced via package boundary.
- §7.2 #4 virtual CSS module + auto-import → Task 1 (`transform` hook emits side-effect import).
- §7.2 #5 unplugin `resolveId` / `load` → Task 1.
- §7.2 #6 codeframe in build errors → Task 6 + reuses `formatBuildError` from Plan A.
- §7.3 splitChunks block for Next.js → **belongs to Plan C** (`apps/website/next.config.mjs`); the plugin alone doesn't configure chunks.
- §7.4 Vite integration → Task 3.
- §7.5 Storybook/Rollup/Webpack → Task 4 + unplugin's auto-exposure.
- §8 SSR safety + HMR → Task 5 (per-file content hash gives natural HMR invalidation).

**Out of scope for Plan B (handed off):** `apps/website/next.config.mjs` + `apps/storybook/vite.config.ts` real wiring (Plan C), `$style` source export (Plan C), token manifest emission from `@vapor-ui/core` (Plan C).
