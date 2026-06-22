import { build } from 'vite';
import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

import vaporStyleMacro from '../../src/unplugin';

const fixtureRoot = fileURLToPath(new URL('./fixtures', import.meta.url));
const manifestPath = join(fixtureRoot, 'manifest.json');

describe('error reporting', () => {
    it('fails the build with a scope-mismatch codeframe', async () => {
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
                        themeStylesImport: false,
                    }),
                ],
            }),
        ).rejects.toThrow(/scope-mismatch/);
    });
});
