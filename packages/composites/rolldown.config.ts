import { bundle, generateInputs } from '@repo/rolldown-config';
import { cleanLayerDeclaration, depsExternal, dts } from '@repo/rolldown-config/plugins';
import path from 'node:path';
import { defineConfig } from 'rolldown';

/* ----- input ----- */

const inputs = generateInputs([
    'src/index.ts',
    'src/components/**/*.{ts,tsx}',
    '!src/components/**/*.{figma,stories,test,spec}.*',
]);

const resolve = {
    alias: { '~': path.resolve('./src') },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
};

export default defineConfig([
    // ESM Build
    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), cleanLayerDeclaration()],
        output: {
            format: 'esm',
            strict: true,
            exports: 'named',

            entryFileNames: '[name].mjs',
        },
    }),

    // CJS Build
    bundle({
        input: inputs,
        plugins: [depsExternal(), cleanLayerDeclaration()],
        output: {
            format: 'cjs',
            strict: true,
            exports: 'named',

            entryFileNames: '[name].cjs',
        },
    }),

    // DTS Build
    bundle({
        input: inputs,
        plugins: [depsExternal(), dts()],
        output: {
            entryFileNames: '[name].mts',
        },
    }),

    bundle({
        input: inputs,
        plugins: [depsExternal(), dts()],
        output: {
            entryFileNames: '[name].cts',
        },
    }),
]);
