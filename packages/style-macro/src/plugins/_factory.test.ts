import type { AnyProp } from '~/models/types';

import plugin, { type VaporPluginOptions } from './_factory';

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

function getHooks(opts: VaporPluginOptions = {}): AnyProp {
    return (plugin.raw as AnyProp)(opts, { framework: 'rollup', versions: {} });
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
        it('returns null when the source contains no styles call', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = `const x = 1;`;
            const out = callHook(hooks.transform, ctx, src, '/src/nostyle.tsx');
            expect(out).toBeNull();
        });

        it('prepends exactly one virtual CSS import per css()-bearing file', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = [
                `import { css } from '@vapor-ui/style-macro';`,
                `const cls = css({ padding: '$space-400' });`,
            ].join('\n');
            const out = callHook(hooks.transform, ctx, src, '/src/A.tsx');
            expect(out).not.toBeNull();
            const cssImports = out.code.match(/import\s+"~vapor-style\/[a-f0-9]+\.css";?/g) ?? [];
            expect(cssImports.length).toBe(1);
            // Original named import must survive
            expect(out.code).toContain(`import { css } from '@vapor-ui/style-macro';`);
        });

        it('emits a themeStylesImport before the virtual CSS import when option set', () => {
            const hooks = getHooks({ themeStylesImport: '@vapor-ui/core/styles.css' });
            const ctx = makeCtx();
            const src = [
                `import { css } from '@vapor-ui/style-macro';`,
                `const cls = css({ padding: '$space-200' });`,
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
                `import { css } from '@vapor-ui/style-macro';`,
                // '$999' is not in the hardcoded token table → validation error
                `const cls = css({ padding: '$999' });`,
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
                `import { css } from '@vapor-ui/style-macro';`,
                `const cls = css({ padding: '$space-400', color: '$fg-primary' });`,
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

describe('unplugin — layer order (plugin option)', () => {
    it('prepends a layer-order CSS import into files that import the Provider', () => {
        const hooks = getHooks({
            layerOrder: ['vapor-theme', 'vapor-reset', 'vapor-components'],
        });
        const ctx = makeCtx();
        const src = [
            `import { ThemeProvider } from '@vapor-ui/core';`,
            `import { css } from '@vapor-ui/style-macro';`,
            `const cls = css({ padding: '$space-400' });`,
            `export function App() {`,
            `  return <ThemeProvider>x</ThemeProvider>;`,
            `}`,
        ].join('\n');
        const out = callHook(hooks.transform, ctx, src, '/src/D.tsx');
        expect(out).not.toBeNull();
        const cssImports = out.code.match(/import "~vapor-style\/[a-f0-9]+\.css";?/g) ?? [];
        // one for layer-order CSS, one for the emitted styles CSS
        expect(cssImports.length).toBe(2);

        // The layer-order virtual id should resolve to the exact `@layer …;`
        // declaration built from the plugin option (in order).
        const layerImports = cssImports.filter((s: string) => {
            const m = s.match(/(~vapor-style\/[a-f0-9]+\.css)/);
            if (!m) return false;
            const css = callHook(hooks.load, ctx, m[1]);
            return (
                typeof css === 'string' &&
                css.trim() === '@layer vapor-theme, vapor-reset, vapor-components;'
            );
        });
        expect(layerImports.length).toBe(1);
    });

    it('does not prepend layer CSS into files that only use css() (no Provider import)', () => {
        const hooks = getHooks();
        const ctx = makeCtx();
        const src = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const cls = css({ padding: '$space-400' });`,
        ].join('\n');
        const out = callHook(hooks.transform, ctx, src, '/src/plain.tsx');
        const cssImports = out.code.match(/import "~vapor-style\/[a-f0-9]+\.css";?/g) ?? [];
        // only the css() CSS — no layer-order import
        expect(cssImports.length).toBe(1);
    });
});

describe('unplugin — vite.transformIndexHtml (FOUC guard + layer order)', () => {
    function getVite(opts: VaporPluginOptions = {}): AnyProp {
        const hooks = getHooks(opts);
        // vite adapter object exposes vite-specific hooks under `.vite`.
        return hooks.vite;
    }

    it('injects only <style> layer-order tag when injectColorScheme is not set', () => {
        const vite = getVite();
        const html = '<!doctype html><html><head></head><body></body></html>';
        const out = vite.transformIndexHtml.call(makeCtx(), html);
        expect(out).toContain('<style>@layer ');
        expect(out).not.toContain('<script>');
    });

    it('injects both <script> FOUC guard and <style> layer-order when injectColorScheme=true', () => {
        const vite = getVite({ injectColorScheme: true });
        const html = '<!doctype html><html><head></head><body></body></html>';
        const out = vite.transformIndexHtml.call(makeCtx(), html);
        expect(out).toContain('<script>');
        expect(out).toContain('data-vapor-theme');
        expect(out).toContain('<style>@layer ');
        // <script> must sit BEFORE <style> so attribute is pinned before layer parsing.
        expect(out.indexOf('<script>')).toBeLessThan(out.indexOf('<style>'));
    });

    it('honors custom ColorScheme opts', () => {
        const vite = getVite({
            injectColorScheme: {
                storageKey: 'my-key',
                attribute: 'data-my-theme',
                defaultTheme: 'dark',
            },
        });
        const html = '<!doctype html><html><head></head><body></body></html>';
        const out = vite.transformIndexHtml.call(makeCtx(), html);
        expect(out).toContain('"my-key"');
        expect(out).toContain('"data-my-theme"');
        expect(out).toContain('"dark"');
    });

    it('placement: injects directly after opening <head>', () => {
        const vite = getVite({ injectColorScheme: true });
        const html = '<!doctype html><html><head><title>t</title></head><body></body></html>';
        const out = vite.transformIndexHtml.call(makeCtx(), html);
        expect(out).toMatch(/<head>\s*<script>/);
    });
});
