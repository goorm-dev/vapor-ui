import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { VaporStyleOptions } from '~/bundler/unplugin-types';
import type { AnyProp, ManifestShape } from '~/model/types';

import plugin from './unplugin';

const MANIFEST: ManifestShape = {
    version: '1',
    tokens: {
        color: { primary: '--vapor-color-primary' },
        space: { '400': '--vapor-size-space-400', '200': '--vapor-size-space-200' },
        dimension: {},
        borderRadius: {},
        shadow: {},
        typography: {},
    },
    propertyScopes: {
        padding: 'space',
        color: 'color',
    },
};

function makeCtx() {
    return {
        error: vi.fn((msg: string): never => {
            throw new Error(msg);
        }),
        warn: vi.fn(),
        parse: vi.fn(),
        getWatchFiles: vi.fn(() => []),
        addWatchFile: vi.fn(),
        emitFile: vi.fn(),
    };
}

function getHooks(opts: VaporStyleOptions = {}): AnyProp {
    return (plugin.raw as AnyProp)(
        { manifest: MANIFEST, ...opts },
        { framework: 'rollup', versions: {} },
    );
}

function callHook(hook: AnyProp, ctx: AnyProp, ...args: AnyProp[]): AnyProp {
    const fn = typeof hook === 'function' ? hook : hook?.handler;
    return fn.apply(ctx, args);
}

describe('unplugin — hook contract (baseline before refactor)', () => {
    describe('resolveId', () => {
        it('returns the id as-is for ids starting with the public prefix', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const id = '~vapor-style/abcdef012345.css';
            expect(callHook(hooks.resolveId, ctx, id)).toBe(id);
        });

        it('returns null / undefined for unrelated ids', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            expect(callHook(hooks.resolveId, ctx, '/some/file.ts')).toBeFalsy();
        });
    });

    describe('loadInclude', () => {
        it('returns true for ids starting with the virtual prefix', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            expect(callHook(hooks.loadInclude, ctx, '~vapor-style/deadbeef0000.css')).toBe(true);
        });

        it('returns false for unrelated ids', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            expect(callHook(hooks.loadInclude, ctx, '/src/App.tsx')).toBe(false);
        });
    });

    describe('transformInclude', () => {
        it('excludes ids starting with the virtual prefix so we do not recurse', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            expect(callHook(hooks.transformInclude, ctx, '~vapor-style/x.css')).toBe(false);
        });

        it('includes .tsx source files', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            expect(callHook(hooks.transformInclude, ctx, '/src/App.tsx')).toBe(true);
        });

        it('excludes node_modules', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            expect(
                callHook(hooks.transformInclude, ctx, '/repo/node_modules/foo/dist/index.js'),
            ).toBe(false);
        });
    });

    describe('transform', () => {
        it('returns null when the source contains no $style call', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = `const x = 1;`;
            const out = callHook(hooks.transform, ctx, src, '/src/nostyle.tsx');
            expect(out).toBeNull();
        });

        it('prepends exactly one virtual CSS import per $style-bearing file', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = [
                `import { $style } from '@vapor-ui/style-macro';`,
                `const cls = $style({ padding: '$400' });`,
            ].join('\n');
            const out = callHook(hooks.transform, ctx, src, '/src/A.tsx');
            expect(out).not.toBeNull();
            const cssImports = out.code.match(/import\s+"~vapor-style\/[a-f0-9]+\.css";?/g) ?? [];
            expect(cssImports.length).toBe(1);
            // Original named import must survive
            expect(out.code).toContain(`import { $style } from '@vapor-ui/style-macro';`);
        });

        it('emits a themeStylesImport before the virtual CSS import when option set', () => {
            const hooks = getHooks({ themeStylesImport: '@vapor-ui/core/styles.css' });
            const ctx = makeCtx();
            const src = [
                `import { $style } from '@vapor-ui/style-macro';`,
                `const cls = $style({ padding: '$200' });`,
            ].join('\n');
            const out = callHook(hooks.transform, ctx, src, '/src/B.tsx');
            expect(out.code).toContain(`import "@vapor-ui/core/styles.css";`);
            const themeIdx = out.code.indexOf(`import "@vapor-ui/core/styles.css";`);
            const virtualIdx = out.code.search(/import "~vapor-style\/[a-f0-9]+\.css";?/);
            expect(themeIdx).toBeGreaterThanOrEqual(0);
            expect(virtualIdx).toBeGreaterThan(themeIdx);
        });

        it('calls this.error and never returns when transform reports build errors', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = [
                `import { $style } from '@vapor-ui/style-macro';`,
                // '$999' is not in the manifest → validation error
                `const cls = $style({ padding: '$999' });`,
            ].join('\n');
            expect(() => callHook(hooks.transform, ctx, src, '/src/err.tsx')).toThrow();
            expect(ctx.error).toHaveBeenCalledTimes(1);
        });
    });

    describe('load resolves CSS produced by an earlier transform', () => {
        it('returns the CSS whose hash is embedded in the emitted import', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = [
                `import { $style } from '@vapor-ui/style-macro';`,
                `const cls = $style({ padding: '$400', color: '$primary' });`,
            ].join('\n');
            const out = callHook(hooks.transform, ctx, src, '/src/C.tsx');
            const match = out.code.match(/import "(~vapor-style\/[a-f0-9]+\.css)";?/);
            expect(match).not.toBeNull();
            const virtualId = match![1];

            expect(callHook(hooks.loadInclude, ctx, virtualId)).toBe(true);
            const css = callHook(hooks.load, ctx, virtualId);
            expect(typeof css).toBe('string');
            expect(css.length).toBeGreaterThan(0);
            // The resolved CSS should reference the CSS custom properties the
            // transform generated for the tokens used above.
            expect(css).toMatch(/--vapor/);
        });

        it('returns null / undefined for an unknown virtual id', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const out = callHook(hooks.load, ctx, '~vapor-style/000000000000.css');
            expect(out).toBeFalsy();
        });
    });
});

describe('unplugin — layer order (ThemeProvider layer prop)', () => {
    // These share module state (`discoveredLayerOrder`) with earlier tests,
    // so use a fresh hooks instance and rely on the specific asserted behaviors
    // rather than absolute state.

    beforeEach(() => {
        // no-op — documenting that module-scope state persists intentionally.
    });

    it('emits a layer CSS import and records the layer order for a ThemeProvider `layer` prop', () => {
        const hooks = getHooks();
        const ctx = makeCtx();
        const src = [
            `import { ThemeProvider } from '@vapor-ui/core';`,
            `import { $style } from '@vapor-ui/style-macro';`,
            `const cls = $style({ padding: '$400' });`,
            `export function App() {`,
            `  return <ThemeProvider layer={['vapor-theme', 'vapor-reset', 'vapor-components']}>x</ThemeProvider>;`,
            `}`,
        ].join('\n');
        const out = callHook(hooks.transform, ctx, src, '/src/D.tsx');
        expect(out).not.toBeNull();
        const cssImports = out.code.match(/import "~vapor-style\/[a-f0-9]+\.css";?/g) ?? [];
        // one for layer-order CSS, one for the emitted $style CSS
        expect(cssImports.length).toBe(2);

        // The layer-order virtual id should resolve to `@layer ...;\n`
        const layerImports = cssImports.filter((s: string) => {
            const m = s.match(/(~vapor-style\/[a-f0-9]+\.css)/);
            if (!m) return false;
            const css = callHook(hooks.load, ctx, m[1]);
            // Layer-order CSS is a bare declaration (`@layer a, b, c;`),
            // NOT a block (`@layer name { ... }`).
            return typeof css === 'string' && /^@layer [^{]+;\s*$/.test(css);
        });
        expect(layerImports.length).toBe(1);
    });

    it('warns when a second file reports a conflicting layer order', () => {
        const hooks = getHooks();
        const ctx1 = makeCtx();
        const ctx2 = makeCtx();
        const mk = (order: string[]) =>
            [
                `import { ThemeProvider } from '@vapor-ui/core';`,
                `import { $style } from '@vapor-ui/style-macro';`,
                `const cls = $style({ padding: '$200' });`,
                `export function App() {`,
                `  return <ThemeProvider layer={${JSON.stringify(order)}}>x</ThemeProvider>;`,
                `}`,
            ].join('\n');

        callHook(hooks.transform, ctx1, mk(['vapor-theme', 'vapor-reset']), '/src/E1.tsx');
        callHook(
            hooks.transform,
            ctx2,
            mk(['vapor-theme', 'vapor-components', 'vapor-reset']),
            '/src/E2.tsx',
        );
        expect(ctx2.warn).toHaveBeenCalledTimes(1);
    });
});
