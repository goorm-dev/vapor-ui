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

/**
 * TypeScript 컴파일러 옵션 로드
 * @param {string} tsconfig - tsconfig 파일 경로
 * @returns {object} TypeScript 컴파일러 옵션
 */
function loadCompilerOptions(tsconfig) {
    if (!tsconfig) return {};

    const configFile = readConfigFile(tsconfig, sys.readFile);
    const { options } = parseJsonConfigFileContent(configFile.config, sys, './');

    return options;
}

function getComponentEntries() {
    const componentsDir = 'src/components';
    const entries = {
        index: 'src/index.ts',
        'styles/tailwind-preset': 'src/styles/tailwind-preset.css.ts',
    };

    if (fs.existsSync(componentsDir)) {
        const componentFolders = fs
            .readdirSync(componentsDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        componentFolders.forEach((folder) => {
            const indexPath = `${componentsDir}/${folder}/index.ts`;
            if (fs.existsSync(indexPath)) {
                entries[`components/${folder}/index`] = indexPath;
            }
        });
    }

    return entries;
}

/** @type {Set<string>} */
const emittedCSSFiles = new Set();

function processAssetFileName(assetInfo) {
    const assetPath = assetInfo.name.replace(/^src\//, '');
    if (assetPath.match(/\.css$/)) {
        emittedCSSFiles.add(assetPath);
    }

    return assetPath;
}

/**
 * CSS 번들링을 위한 플러그인
 * CSS import를 처리하고 최종 CSS 파일을 생성합니다.
 * @return {import('rollup').Plugin}
 */
const bundleCssEmits = () => ({
    name: 'bundle-css-emits',
    buildStart() {
        emittedCSSFiles.clear();
    },
    /**
     * 청크를 렌더링할 때 CSS import를 제거합니다.
     * @param {string} code
     * @param {import('rollup').RenderedChunk} chunkInfo
     */
    renderChunk(code, chunkInfo) {
        /** @type Array<[string, string]> */
        const allImports = [...code.matchAll(/import (?:.* from )?['"]([^;'"]*)['"];?/g)];
        const dirname = path.dirname(chunkInfo.fileName);
        const output = allImports.reduce((resultingCode, [importLine, moduleId]) => {
            if (emittedCSSFiles.has(path.posix.join(dirname, moduleId))) {
                return resultingCode.replace(importLine, '');
            }
            return resultingCode;
        }, code);

        return {
            code: output,
            map: chunkInfo.map ?? null,
        };
    },

    generateBundle() {
        const cssFiles = Array.from(emittedCSSFiles);

        const defaultFiles = { tailwindFile: null, filteredFiles: [] };
        const { tailwindFile, filteredFiles } = cssFiles.reduce((acc, file) => {
            if (file.includes('tailwind-preset')) acc.tailwindFile = file;
            else acc.filteredFiles.push(file);

            return acc;
        }, defaultFiles);

        const sortedFiles = filteredFiles.sort((a) => (a.match(/styles\/layers/) ? -1 : 1));

        this.emitFile({
            type: 'asset',
            name: 'src/styles.css',
            source: sortedFiles.map((name) => `@import "./${name}";`).join('\n') + '\n',
        });

        if (tailwindFile) {
            this.emitFile({
                type: 'asset',
                name: 'src/tailwind.css',
                source: `@import "./${tailwindFile}";\n`,
            });
        }
    },
});

/**
 * 공통 출력 설정을 기반으로 특정 형태의 출력 설정을 생성
 */
function createOutput(dir, format, extension, options = {}) {
    return {
        dir,
        format,
        preserveModules: true,
        strict: false,
        entryFileNames({ name }) {
            return `${name.replace(/\.css$/, '.css.vanilla')}.${extension}`;
        },
        assetFileNames: processAssetFileName,
        exports: 'named',
        sourcemap: false,
        sourcemapExcludeSources: false,
        ...options,
    };
}

const componentEntries = getComponentEntries();

function getAliasPlugin() {
    const customResolver = resolve({
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    });

    return alias({
        entries: [{ find: '~', replacement: path.resolve('./src') }],
        customResolver,
    });
}

const commonPlugins = [
    getAliasPlugin(),
    vanillaExtractPlugin(),
    depsExternal(),
    esbuild({ target: 'esnext' }),
    json(),
    preserveDirectives({ include: ['**/*.ts', '**/*.tsx'] }),
];

const esmBuild = {
    input: componentEntries,
    plugins: [...commonPlugins, bundleCssEmits()],
    output: [createOutput('dist/', 'esm', 'js')],
};

const cjsBuild = {
    input: componentEntries,
    plugins: [...commonPlugins],
    output: [createOutput('dist/', 'cjs', 'cjs')],
};

const compilerOptions = loadCompilerOptions('tsconfig.json');
const getDtsPlugins = (compilerOptions) => {
    return dts({
        ...compilerOptions,
        baseUrl: path.resolve(compilerOptions.baseUrl || '.'),
        declaration: true,
        noEmit: false,
        emitDeclarationOnly: true,
        noEmitOnError: true,
        target: 'ESNext',
    });
};

const dtsBuild = {
    input: componentEntries,
    plugins: [...commonPlugins.slice(0, 3), getDtsPlugins(compilerOptions)],
    output: [
        createOutput('dist/', 'esm', 'd.ts', {
            preserveModulesRoot: 'src',
            assetFileNames: undefined,
            exports: undefined, // TypeScript 선언 파일은 exports 옵션 불필요
            sourcemap: false,
        }),
    ],
};

export default [esmBuild, cjsBuild, dtsBuild];
