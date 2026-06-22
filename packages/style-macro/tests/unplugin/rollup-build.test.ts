import { rollup } from 'rollup';
import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

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
                    themeStylesImport: false,
                }),
                nodeResolve({ extensions: ['.ts', '.tsx', '.js'] }),
                typescript({
                    tsconfig: false,
                    include: [join(fixtureRoot, 'src/**/*')],
                    compilerOptions: {
                        target: 'es2022',
                        module: 'esnext',
                        moduleResolution: 'bundler',
                        jsx: 'preserve',
                        allowImportingTsExtensions: false,
                        noEmit: false,
                        noEmitOnError: false,
                    },
                }),
                {
                    name: 'capture-css',
                    transform(code, id) {
                        if (id.endsWith('.css')) {
                            css.push(code);
                            return { code: 'export default null;', map: null };
                        }
                        return null;
                    },
                },
            ],
        });
        const { output } = await bundle.generate({ format: 'es' });
        const js = output.find((o) => o.type === 'chunk');
        expect(js).toBeTruthy();
        if (js?.type !== 'chunk') throw new Error('no chunk');
        expect(js.code).toMatch(/"_bg-primary _p-400"|"_p-400 _bg-primary"/);
        expect(css.some((c) => c.includes('._p-400'))).toBe(true);
    });
});
