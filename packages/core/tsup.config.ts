import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import fs from 'fs';
import { sync } from 'glob';
import { defineConfig } from 'tsup';

const commonConfig = {
    entry: ['src/components/*/index.ts'],
    target: 'es6',
    splitting: true,
    sourcemap: true,
    minify: false,
    external: ['react', 'react-dom'],
    dts: false,
};

const injectCssImports = async (format: 'esm' | 'cjs') => {
    const isEsm = format === 'esm';
    const outDir = `dist/${format}`;
    const files = sync(`${outDir}/*/index.${isEsm ? 'js' : 'js'}`);

    for (const file of files) {
        try {
            let content = fs.readFileSync(file, 'utf-8');
            const cssImport = isEsm ? `import "./index.css";` : `require("./index.css");`;
            const useClientDirective = '"use client";';

            if (content.startsWith(useClientDirective)) {
                content = content.replace(
                    useClientDirective,
                    `${useClientDirective}\n${cssImport}`,
                );
            } else {
                content = `${cssImport}\n${content}`;
            }

            fs.writeFileSync(file, content);
        } catch (error) {
            console.error(`❌ Failed to inject CSS for ${file}:`, error);
        }
    }
};

export default defineConfig([
    // 1. ESM 빌드
    {
        ...commonConfig,
        format: 'esm',
        outDir: 'dist/esm',
        clean: true, // 첫 빌드에서만 dist 폴더 정리
        esbuildPlugins: [vanillaExtractPlugin({ outputCss: true })],
        outExtension() {
            return {
                js: `.js`,
            };
        },
        async onSuccess() {
            console.log('🚀 Post-build: Injecting ESM CSS imports...');
            await injectCssImports('esm');
        },
    },
    // 2. CJS 빌드
    {
        ...commonConfig,
        format: 'cjs',
        outDir: 'dist/cjs',
        esbuildPlugins: [vanillaExtractPlugin({ outputCss: false })],
        // async onSuccess() {
        //     console.log('🚀 Post-build: Injecting CJS CSS imports...');
        //     await injectCssImports('cjs');
        // },
    },
    // 3. 타입 선언 빌드
    {
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        outDir: 'dist/types',
        minify: true,
        dts: { only: true },
        esbuildOptions(options) {
            options.outbase = './';
        },
    },
    // 4. 사용자가 직접 import 할 테마/글로벌 CSS 빌드
    {
        entry: ['src/styles/index.ts'],
        outDir: 'dist/styles',
        esbuildPlugins: [
            vanillaExtractPlugin({
                outputCss: true,
            }),
        ],
    },
]);
