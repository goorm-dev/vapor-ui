import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'rolldown';
import type { OutputOptions, Plugin, RolldownOptions, RolldownPluginOption } from 'rolldown';
import { dts as dtsPlugin } from 'rolldown-plugin-dts';
import depsExternalPlugin from 'rollup-plugin-node-externals';

/* ---- cleanLayerDeclaration ----- */

/**
 * Removes top-level '@layer ...;' declarations from '.css' asset files.
 * (Excluding layers.css.ts.vanilla.css)
 */
const cleanLayerDeclaration = (): Plugin => {
    return {
        name: 'clean-css-layer-declarations',

        generateBundle(_options, bundle) {
            const layerDeclarationRegex = /^@layer vapor.[a-zA-Z0-9_-]+;\s*/gm;
            const exceptionFile = 'styles/layers.css.ts.vanilla.css';

            for (const fileName in bundle) {
                const file = bundle[fileName];

                if (
                    file.type === 'asset' &&
                    fileName.endsWith('.css') &&
                    fileName !== exceptionFile
                ) {
                    if (typeof file.source === 'string') {
                        file.source = file.source.replace(layerDeclarationRegex, '');
                    }
                }
            }
        },
    };
};

/* ----- plugins ----- */

const kebabCase = (str: string) => {
    if (!str) return '';

    const WORD_PATTERN = [
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)/, // 대문자 연속 (예: XML, JSON)
        /[A-Z]?[a-z]+[0-9]*/, // 일반 단어 (예: hello, World1)
        /[A-Z]/, // 남은 대문자 하나
        /[0-9]+/, // 숫자 뭉치
    ];

    const regex = new RegExp(WORD_PATTERN.map((r) => r.source).join('|'), 'g');
    const words = str.match(regex) || [];

    return words.map((word) => word.toLowerCase()).join('-');
};

type IdentifiersOptions = { hash: string; filePath: string; debugId?: string };

const identifiers = ({ hash, filePath, debugId }: IdentifiersOptions) => {
    const componentName = path.basename(filePath, '.css.ts');
    const prefix = componentName === 'sprinkles' ? 'v' : componentName;

    const cleanId = debugId ? debugId.replace('-default', '').replace('_', '-') : '';
    const id = kebabCase(cleanId);

    return `${prefix}${id ? `-${id}` : ''}-${hash}`;
};

const plugins = {
    vanillaExtract: vanillaExtractPlugin({
        esbuildOptions: { tsconfig: './tsconfig.base.json' },
        identifiers,
    }),
    depsExternal: depsExternalPlugin(),
    dts: dtsPlugin({
        tsconfig: './tsconfig.base.json',
        emitDtsOnly: true,
        compilerOptions: {
            declaration: true,
            declarationMap: false,
            noEmit: false,
            emitDeclarationOnly: true,
            noEmitOnError: true,
        },
    }),
    cleanLayerDeclaration: cleanLayerDeclaration(),
};

/* ----- input ----- */

/**
 * Scans the 'src/components' directory
 * and adds the 'index.ts' file of each component as a dynamic entry point.
 * @param {string} componentsDir - The component directory path
 * @returns {Record<string, string>}
 */
const getComponentEntries = (componentsDir = 'src/components') => {
    const entries: Record<string, string> = {};

    if (!fs.existsSync(componentsDir)) {
        return entries;
    }

    const componentFolders = fs
        .readdirSync(componentsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    componentFolders.forEach((folder) => {
        const indexPath = `${componentsDir}/${folder}/index.ts`;

        // e.g., 'components/Button' -> 'src/components/Button/index.ts'
        if (fs.existsSync(indexPath)) {
            entries[`components/${folder}/index`] = indexPath;
        }
    });

    return entries;
};

const ENTRY_POINTS = {
    index: 'src/index.ts',
    'styles/tailwind-preset': 'src/styles/tailwind-preset.css.ts',
    ...getComponentEntries('src/components'),
};

/* ----- rolldown ----- */

const sharedResolve = {
    alias: { '~': path.resolve('./src') },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
};

// e.g., 'src/styles/foo.css' -> 'styles/foo.css'
const assetFileNames = (assetInfo: { name?: string }) => {
    if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
    return assetInfo.name.replace(/^src\//, '');
};

type BundleOptions = { plugins: RolldownPluginOption; output: OutputOptions };
const bundle = ({ plugins, output }: BundleOptions): RolldownOptions => ({
    input: ENTRY_POINTS,
    resolve: sharedResolve,
    plugins,
    output: {
        dir: 'dist',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: false,
        sourcemapExcludeSources: false,
        ...output,
    },
});

export default defineConfig([
    // ESM Build
    bundle({
        plugins: [plugins.depsExternal, plugins.vanillaExtract, plugins.cleanLayerDeclaration],
        output: {
            format: 'esm',
            strict: true,
            exports: 'named',

            // e.g., 'styles/tailwind-preset.css' -> 'styles/tailwind-preset.css.vanilla.js'
            entryFileNames: ({ name }) => `${name.replace(/\.css$/, '.css.vanilla')}.js`,
            assetFileNames,
        },
    }),

    // CJS Build
    bundle({
        plugins: [plugins.depsExternal, plugins.vanillaExtract, plugins.cleanLayerDeclaration],
        output: {
            format: 'cjs',
            strict: true,
            exports: 'named',

            entryFileNames: ({ name }) => `${name.replace(/\.css$/, '.css.vanilla')}.cjs`,
            assetFileNames,
        },
    }),

    // DTS Build
    bundle({
        plugins: [plugins.depsExternal, plugins.dts],
        output: {
            format: 'esm',
            strict: false,
            exports: undefined,

            // e.g., 'button.css.d' -> 'button.css.vanilla.d.ts'
            entryFileNames: ({ name }) => `${name.replace(/\.css\.d$/, '.css.vanilla.d')}.ts`,
        },
    }),
]);
