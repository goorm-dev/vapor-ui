import { build } from 'vite';
import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import vaporStyleMacro from '../../src/unplugin';
import { manifest } from './fixtures/manifest';

const fixtureRoot = fileURLToPath(new URL('./fixtures', import.meta.url));

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
                        manifest,
                        importSource: './$style-stub',
                        themeStylesImport: false,
                    }),
                ],
            }),
        ).rejects.toThrow(/scope-mismatch/);
    });
});
