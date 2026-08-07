import { bundle, generateInputs } from '@repo/rolldown-config';
import {
    cleanLayerDeclaration,
    depsExternal,
    dts,
    identifiers,
} from '@repo/rolldown-config/plugins';
import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import path from 'node:path';
import type { PreRenderedAsset } from 'rolldown';
import { defineConfig } from 'rolldown';

const inputs = generateInputs([
    'src/index.ts',
    'src/styles/tailwind-preset.css.ts',
    'src/components/**/*.{ts,tsx}',
    '!src/components/**/*.{stories,test,spec}.*',
]);

// e.g., 'src/styles/foo.css' -> 'styles/foo.css'
const SRC_ROOT = path.resolve('./src');
const assetFileNames = (assetInfo: PreRenderedAsset) => {
    const original = assetInfo.originalFileNames.at(0);

    if (original && path.isAbsolute(original)) {
        const rel = path.relative(SRC_ROOT, original);

        if (rel && !rel.startsWith('..')) {
            return rel.split(path.sep).join('/');
        }
    }

    const name = original ?? assetInfo.names.at(0);
    if (!name) return 'assets/[name]-[hash][extname]';
    return name.replace(/^src\//, '');
};

const resolve = {
    alias: { '~': path.resolve('./src') },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
};

export default defineConfig([
    // ESM Build
    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), vanillaExtractPlugin({ identifiers }), cleanLayerDeclaration()],
        output: {
            format: 'esm',
            strict: true,
            exports: 'named',

            entryFileNames: '[name].js',
            assetFileNames,
        },
    }),

    // CJS Build
    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), vanillaExtractPlugin({ identifiers }), cleanLayerDeclaration()],
        output: {
            format: 'cjs',
            strict: true,
            exports: 'named',

            entryFileNames: '[name].cjs',
            assetFileNames,
        },
    }),

    // DTS Build
    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), dts()],
        output: {
            format: 'esm',
            strict: false,
            exports: undefined,
        },
    }),
]);
