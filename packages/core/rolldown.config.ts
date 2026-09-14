import { bundle, generateInputs } from '@repo/rolldown-config';
import {
    cleanLayerDeclaration,
    dataSlots,
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

const replaceFileName = (name: string, ext: string) => {
    return `${name.replace(/\.css$/, '.css.vanilla')}.${ext}`;
};

export default defineConfig([
    // ESM Build
    bundle({
        input: inputs,
        resolve,
        plugins: [
            depsExternal(),
            dataSlots(),
            vanillaExtractPlugin({ identifiers }),
            cleanLayerDeclaration(),
        ],
        output: {
            format: 'esm',
            strict: true,
            exports: 'named',

            // e.g., 'styles/tailwind-preset.css' -> 'styles/tailwind-preset.css.vanilla.js'
            entryFileNames: ({ name }) => replaceFileName(name, 'mjs'),
            assetFileNames,
        },
    }),

    // CJS Build
    bundle({
        input: inputs,
        resolve,
        plugins: [
            depsExternal(),
            dataSlots(),
            vanillaExtractPlugin({ identifiers }),
            cleanLayerDeclaration(),
        ],
        output: {
            format: 'cjs',
            strict: true,
            exports: 'named',

            entryFileNames: ({ name }) => replaceFileName(name, 'cjs'),
            assetFileNames,
        },
    }),

    // DTS Build
    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), dts()],
        output: {
            entryFileNames: ({ name }) => replaceFileName(name, 'mts'),
        },
    }),

    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), dts()],
        output: {
            entryFileNames: ({ name }) => replaceFileName(name, 'cts'),
        },
    }),
]);
