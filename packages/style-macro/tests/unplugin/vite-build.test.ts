import { build } from 'vite';
import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

import vaporStyleMacro from '../../src/unplugin';

const fixtureRoot = fileURLToPath(new URL('./fixtures', import.meta.url));
const manifestPath = join(fixtureRoot, 'manifest.json');

interface RollupOutput {
    output: Array<{ type: string; fileName: string; source?: string; code?: string }>;
}

async function buildEntry(entry: string) {
    const out = (await build({
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
    })) as RollupOutput | RollupOutput[];
    const single = Array.isArray(out) ? out[0] : out;
    const assets = single.output;
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
        expect(r.css).toMatch(/@media\s*\(--vapor-sm\)/);
        expect(r.css).toContain(':hover');
    });
});
