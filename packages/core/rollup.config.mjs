// rollup.config.mjs
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import fs from 'fs';
import path from 'path';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import depsExternal from 'rollup-plugin-node-externals';
import { preserveDirectives } from 'rollup-plugin-preserve-directives';
import { parseJsonConfigFileContent, readConfigFile, sys } from 'typescript';

/* -------------------------------------------------------------------------------------------------
 * Entry Point Configuration
 * -----------------------------------------------------------------------------------------------*/

/**
 * Scans the 'src/components' directory
 * and adds the 'index.ts' file of each component as a dynamic entry point.
 * @param {string} componentsDir - The component directory path
 * @returns {Record<string, string>}
 */
const getComponentEntries = (componentsDir = 'src/components') => {
    const entries = {};
    if (!fs.existsSync(componentsDir)) {
        return entries;
    }

    const componentFolders = fs
        .readdirSync(componentsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    componentFolders.forEach((folder) => {
        const indexPath = `${componentsDir}/${folder}/index.ts`;
        if (fs.existsSync(indexPath)) {
            // e.g., 'components/Button' -> 'src/components/Button/index.ts'
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

/* -------------------------------------------------------------------------------------------------
 * Helper & Plugin Definitions
 * -----------------------------------------------------------------------------------------------*/

/**
 * Loads TypeScript compiler options
 * @param {string} tsconfig - Path to the tsconfig file
 * @returns {object} TypeScript compiler options
 */
const loadCompilerOptions = (tsConfigPath) => {
    if (!tsConfigPath) return {};

    const configFile = readConfigFile(tsConfigPath, sys.readFile);
    if (configFile.error) {
        console.error('Failed to read tsconfig.json:', configFile.error);
        return {};
    }

    const { options } = parseJsonConfigFileContent(configFile.config, sys, './');
    return options;
};

const compilerOptions = loadCompilerOptions('tsconfig.json');

/**
 * Removes top-level '@layer ...;' declarations from '.css' asset files.
 * (Excluding layers.css.ts.vanilla.css)
 * @returns {import('rollup').Plugin}
 */
const cleanCssLayerDeclarations = () => {
    return {
        name: 'clean-css-layer-declarations',

        /**
         * @param {import('rollup').OutputOptions} options
         * @param {Record<string, import('rollup').OutputAsset | import('rollup').OutputChunk>} bundle
         */
        generateBundle(options, bundle) {
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

/**
 * Creates common output settings.
 *
 * @param {object} options
 * @param {string} options.dir - Output directory (e.g., 'dist/')
 * @param {'esm' | 'cjs'} options.format - Module format
 * @param {string} options.extension - File extension (e.g., 'js', 'cjs')
 * @param {import('rollup').OutputOptions} [options.outputOptions] - Additional Rollup output options (for overriding)
 * @returns {import('rollup').OutputOptions}
 */
const createOutput = ({ dir, format, extension, ...outputOptions }) => {
    return {
        dir,
        format,
        preserveModules: true, // Preserve source directory structure
        strict: false,
        exports: 'named',
        sourcemap: false,
        sourcemapExcludeSources: false,

        // Customize entry file names
        // e.g., 'styles/tailwind-preset.css' -> 'styles/tailwind-preset.css.vanilla.js'
        entryFileNames: ({ name }) => {
            return `${name.replace(/\.css$/, '.css.vanilla')}.${extension}`;
        },

        // Customize asset file names
        // e.g., 'src/styles/foo.css' -> 'styles/foo.css'
        assetFileNames: (assetInfo) => {
            return assetInfo.name.replace(/^src\//, '');
        },

        ...outputOptions,
    };
};

const kebabCase = (str) => {
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

const identifiers = ({ hash, filePath, debugId }) => {
    const componentName = path.basename(filePath, '.css.ts');
    const prefix = componentName === 'sprinkles' ? 'v' : componentName;

    const cleanId = debugId ? debugId.replace('-default', '').replace('_', '-') : '';
    const id = kebabCase(cleanId);

    console.log(id);

    return `${prefix}${id ? `-${id}` : ''}-${hash}`;
};

const commonPlugins = [
    alias({
        entries: [{ find: '~', replacement: path.resolve('./src') }],
        customResolver: resolve({
            extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
        }),
    }),
    vanillaExtractPlugin({ identifiers }),
    depsExternal(),
];

const buildPlugins = [
    ...commonPlugins,
    esbuild({ target: 'esnext' }),
    preserveDirectives(),
    json(),
];

/* -------------------------------------------------------------------------------------------------
 * Build Definitions
 * -----------------------------------------------------------------------------------------------*/

const esmBuild = {
    input: ENTRY_POINTS,
    plugins: [...buildPlugins, cleanCssLayerDeclarations()],
    output: [
        createOutput({
            dir: 'dist/',
            format: 'esm',
            extension: 'js',
        }),
    ],
};

const cjsBuild = {
    input: ENTRY_POINTS,
    plugins: [...buildPlugins, cleanCssLayerDeclarations()],
    output: [
        createOutput({
            dir: 'dist/',
            format: 'cjs',
            extension: 'cjs',
        }),
    ],
};

const dtsBuild = {
    input: ENTRY_POINTS,
    plugins: [
        ...commonPlugins,
        dts({
            ...compilerOptions,
            baseUrl: path.resolve(compilerOptions.baseUrl || '.'),
            declaration: true,
            noEmit: false,
            emitDeclarationOnly: true,
            noEmitOnError: true,
            target: compilerOptions.target || 'ESNext',
        }),
    ],
    output: [
        createOutput({
            dir: 'dist/',
            format: 'esm',
            extension: 'd.ts',

            // --- overrides ---
            preserveModulesRoot: 'src',
            assetFileNames: undefined,
            exports: undefined,

            entryFileNames: ({ name }) => `${name.replace(/\.css$/, '.css.vanilla')}.d.ts`,
        }),
    ],
};

export default [esmBuild, cjsBuild, dtsBuild];
