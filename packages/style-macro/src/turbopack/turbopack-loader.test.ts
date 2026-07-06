import { describe, expect, it } from 'vitest';

import type { VaporStyleOptions } from '~/bundler/unplugin-types';
import type { ManifestShape } from '~/model/types';

import vaporStyleTurbopackLoader, { type TurbopackLoaderContext } from './turbopack-loader';

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

const DATA_CSS_IMPORT_RE = /import "data:text\/css,([^"]+)";?/g;

function mkCtx(resourcePath: string, opts: VaporStyleOptions = {}): TurbopackLoaderContext {
    return {
        resourcePath,
        getOptions: () => ({ manifest: MANIFEST, ...opts }),
    };
}

async function run(ctx: TurbopackLoaderContext, source: string) {
    return vaporStyleTurbopackLoader.call(ctx, source);
}

describe('turbopack-loader', () => {
    it('returns source unmodified when there is no $style call (fast path)', async () => {
        const ctx = mkCtx('/src/plain.tsx');
        const src = `export const x = 1;`;
        const out = await run(ctx, src);
        expect(out).toBe(src);
    });

    it('prepends exactly one data:text/css import when $style is used', async () => {
        const ctx = mkCtx('/src/A.tsx');
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `const cls = $style({ padding: '$400' });`,
        ].join('\n');
        const out = await run(ctx, src);
        const cssImports = Array.from(out.matchAll(DATA_CSS_IMPORT_RE));
        expect(cssImports.length).toBe(1);
    });

    it('encodes CSS into the data URI so decoding recovers the payload', async () => {
        const ctx = mkCtx('/src/B.tsx');
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `const cls = $style({ padding: '$400', color: '$primary' });`,
        ].join('\n');
        const out = await run(ctx, src);
        const match = out.match(/import "data:text\/css,([^"]+)";?/);
        expect(match).not.toBeNull();
        const css = decodeURIComponent(match![1]!);
        expect(css).toMatch(/--vapor/);
    });

    it('percent-encodes reserved CSS characters (semicolons, commas, quotes) so the URI stays valid', async () => {
        const ctx = mkCtx('/src/C.tsx');
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `const cls = $style({ padding: '$400', color: '$primary' });`,
        ].join('\n');
        const out = await run(ctx, src);
        const match = out.match(/import "data:text\/css,([^"]+)";?/);
        expect(match).not.toBeNull();
        const raw = match![1]!;
        // Reserved data-URI chars must be percent-encoded, not passed literal.
        expect(raw).not.toContain(';');
        expect(raw).not.toContain(',');
        expect(raw).not.toContain('"');
        expect(raw).not.toContain('\n');
    });

    it('emits themeStylesImport BEFORE the data:text/css import when option is set', async () => {
        const ctx = mkCtx('/src/D.tsx', { themeStylesImport: '@vapor-ui/core/styles.css' });
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `const cls = $style({ padding: '$200' });`,
        ].join('\n');
        const out = await run(ctx, src);
        const themeIdx = out.indexOf(`import "@vapor-ui/core/styles.css";`);
        const cssIdx = out.search(/import "data:text\/css,/);
        expect(themeIdx).toBeGreaterThanOrEqual(0);
        expect(cssIdx).toBeGreaterThan(themeIdx);
    });

    it('emits a separate layer-order data-URI import (single @layer declaration) when ThemeProvider carries a `layer` prop', async () => {
        const ctx = mkCtx('/src/E.tsx');
        const src = [
            `import { ThemeProvider } from '@vapor-ui/core';`,
            `import { $style } from '@vapor-ui/style-macro';`,
            `const cls = $style({ padding: '$400' });`,
            `export function App() {`,
            `  return <ThemeProvider layer={['vapor-theme', 'vapor-reset']}>x</ThemeProvider>;`,
            `}`,
        ].join('\n');
        const out = await run(ctx, src);
        const matches = Array.from(out.matchAll(DATA_CSS_IMPORT_RE));
        expect(matches.length).toBe(2);
        const payloads = matches.map((m) => decodeURIComponent(m[1]!));
        const layerCss = payloads.find((c) => /^@layer [^{]+;\s*$/.test(c));
        expect(layerCss).toBeTruthy();
        expect(layerCss).toContain('vapor-theme');
    });

    it('throws when the transform reports a build error', async () => {
        const ctx = mkCtx('/src/err.tsx');
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            // $999 is not in manifest → validation error
            `const cls = $style({ padding: '$999' });`,
        ].join('\n');
        await expect(run(ctx, src)).rejects.toThrow();
    });
});
