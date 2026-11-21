import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        // shortcut: palette generation takes ~1s+ (gamut_chroma scans down in 0.0001 steps), drop once it is sped up
        testTimeout: 30_000,
    },
});
