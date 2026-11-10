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
import type { PreRenderedAsset, RolldownPlugin } from 'rolldown';
import { defineConfig } from 'rolldown';

const AGGREGATE_SOURCES = [
    'styles/variables.css.ts.vanilla.css',
    'styles/themes.css.ts.vanilla.css',
] as const;

const aggregateStylesCss = (): RolldownPlugin => ({
    name: 'aggregate-styles-css',
    generateBundle(_options, bundle) {
        const parts: string[] = [];

        for (const fileName of AGGREGATE_SOURCES) {
            const asset = bundle[fileName];
            if (asset?.type === 'asset' && typeof asset.source === 'string') {
                parts.push(asset.source);
            }
        }

        if (parts.length !== AGGREGATE_SOURCES.length) return;

        this.emitFile({
            type: 'asset',
            fileName: 'styles/index.css',
            source: parts.join('\n'),
        });
    },
});

const inputs = generateInputs([
    'src/index.ts',
    'src/styles/create-layers.css.ts',
    'src/styles/tailwind-preset.css.ts',
    'src/components/**/*.{ts,tsx}',
    '!src/components/**/*.{figma,stories,test,spec}.*',
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
            aggregateStylesCss(),
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
            aggregateStylesCss(),
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
