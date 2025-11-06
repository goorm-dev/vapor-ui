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
function loadCompilerOptions(tsConfigPath) {
    if (!tsConfigPath) return {};

    const configFile = readConfigFile(tsConfigPath, sys.readFile);
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
 * - foundation(styles/...) CSS는 styles.css로 번들링합니다.
 * - 컴포넌트(components/...) CSS는 JS 파일에 import를 남겨둡니다 (트리 쉐이킹).
 * @return {import('rollup').Plugin}
 */
const bundleCssEmits = () => ({
    name: 'bundle-css-emits',
    buildStart() {
        emittedCSSFiles.clear();
    },
    /**
     * 청크를 렌더링할 때 'foundation' CSS import만 제거합니다.
     * @param {string} code
     * @param {import('rollup').RenderedChunk} chunkInfo
     */
    // renderChunk(code, chunkInfo) {
    //     /** @type Array<[string, string]> */
    //     console.log('--- renderChunk ---');
    //     console.log(chunkInfo.fileName);
    //     const allImports = [...code.matchAll(/import (?:.* from )?['"]([^;'"]*)['"];?/g)];
    //     const dirname = path.dirname(chunkInfo.fileName);

    //     const output = allImports.reduce((resultingCode, [importLine, moduleId]) => {
    //         const resolvedModulePath = path.posix.join(dirname, moduleId);

    //         if (emittedCSSFiles.has(resolvedModulePath)) {
    //             // 'components/'로 시작하지 않는 CSS import만 제거합니다.
    //             if (!resolvedModuledPath.startsWith('components/')) {
    //                 // foundation 스타일(styles/...)이면 JS에서 import를 제거합니다.
    //                 return resultingCode.replace(importLine, '');
    //             }
    //             // 컴포넌트 스타일(components/...)이면 import를 그대로 둡니다.
    //         }
    //         return resultingCode;
    //     }, code);

    //     return {
    //         code: output,
    //         map: chunkInfo.map ?? null,
    //     };
    // },

    /**
     * 'foundation' CSS 파일만 styles.css로 번들링합니다.
     */
    // generateBundle() {
    //     const allCssFiles = Array.from(emittedCSSFiles);

    //     console.log('--- emitted CSS files ---');
    //     console.log(emittedCSSFiles);

    //     // 1. foundation 파일만 필터링합니다
    //     const foundationalFiles = allCssFiles.filter((file) => file.startsWith('styles/'));

    //     // 2. foundation 파일에서 tailwind-preset 분리
    //     const defaultFiles = { tailwindFile: null, filteredFiles: [] };
    //     const { tailwindFile, filteredFiles } = foundationalFiles.reduce((acc, file) => {
    //         if (file.includes('tailwind-preset')) acc.tailwindFile = file;
    //         else acc.filteredFiles.push(file);

    //         return acc;
    //     }, defaultFiles);

    //     // 3. foundation 파일의 @import 순서를 명시적으로 정렬합니다.
    //     const FOUNDATIONAL_ORDER = [
    //         'styles/layers', ///// 1 - @layer 우선순위 선언 (필수 최상단)
    //         'styles/variables', // 2 - @property 등록 (값이 할당/사용되기 전에 선행되어야 함)
    //         'styles/themes', ///// 3 - CSS 변수 값 할당 (:root, [data-theme] 등, 가독성 상 상단에 위치)
    //         'styles/mixins', ///// 이외는 @layer로 우선순위가 제어되므로, 순서 무관
    //         'styles/sprinkles',
    //     ];

    //     const getOrderIndex = (file) => {
    //         const index = FOUNDATIONAL_ORDER.findIndex((prefix) => file.includes(prefix));
    //         return index === -1 ? FOUNDATIONAL_ORDER.length : index;
    //     };

    //     const sortedFiles = filteredFiles.sort((a, b) => getOrderIndex(a) - getOrderIndex(b));

    //     // 4. styles.css 생성 (foundation 파일만 포함)
    //     this.emitFile({
    //         type: 'asset',
    //         name: 'src/styles.css', // 빌드 후 'dist/styles.css'가 됩니다.
    //         source: sortedFiles.map((name) => `@import "./${name}";`).join('\n') + '\n',
    //     });

    //     // 5. tailwind.css 생성
    //     if (tailwindFile) {
    //         this.emitFile({
    //             type: 'asset',
    //             name: 'src/tailwind.css', // 빌드 후 'dist/tailwind.css'가 됩니다.
    //             source: `@import "./${tailwindFile}";\n`,
    //         });
    //     }
    // },
});

/**
 * @layer 선언을 정리하는 플러그인
 * 'styles/layers.css.ts.vanilla.css' 파일을 제외한 모든 .css 파일에서
 * 최상위 '@layer ...;' 선언을 제거합니다.
 * @returns {import('rollup').Plugin}
 */
function cleanCssLayerDeclarations() {
    return {
        name: 'clean-css-layer-declarations',

        /**
         * @param {import('rollup').OutputOptions} options
         * @param {Record<string, import('rollup').OutputAsset | import('rollup').OutputChunk>} bundle
         */
        generateBundle(options, bundle) {
            // [수정] 정규식을 더 구체적으로 변경하여 layer '선언부'만 타겟팅합니다.
            // (예: '@layer components;')
            // layer '블록'은 타겟팅하지 않습니다. (예: '@layer components { ... }')
            const layerDeclarationRegex = /^@layer [a-zA-Z0-9_-]+;\s*/gm; // <-- 수정

            // 예외 처리할 정확한 파일 경로 (rollup bundle 객체의 key 기준)
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
}

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
            // 'styles/tailwind-preset.css' -> 'styles/tailwind-preset.css.vanilla.js'
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

const commonPlugins = [getAliasPlugin(), vanillaExtractPlugin(), depsExternal()];
const buildPlugins = [
    ...commonPlugins,
    esbuild({ target: 'esnext' }),
    json(),
    preserveDirectives({ include: ['**/*.ts', '**/*.tsx'] }),
];

const esmBuild = {
    input: componentEntries,
    plugins: [
        ...buildPlugins,
        // cleanCssLayerDeclarations(), // (esm) CSS 생성 -> 정리
        bundleCssEmits(), // (esm) CSS 번들링 (styles.css)
    ],
    output: [createOutput('dist/', 'esm', 'js')],
};

const cjsBuild = {
    input: componentEntries,
    plugins: [
        ...buildPlugins,
        // cleanCssLayerDeclarations(), // <-- 수정: (cjs) CSS 생성 -> 정리
    ],
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
        target: compilerOptions.target || 'ESNext',
    });
};

const dtsBuild = {
    input: componentEntries,
    plugins: [
        ...commonPlugins,
        getDtsPlugins(compilerOptions),
        cleanCssLayerDeclarations(), // <-- 수정: (dts) CSS 생성 -> 정리
    ],
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
