import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import { sync } from 'glob';
import postcss from 'postcss';
import { type Options, defineConfig } from 'tsup';

const OUT_DIR = 'dist/components';

/**
 * @link https://vanilla-extract.style/documentation/integrations/esbuild/#processcss
 */
async function processCss(css: string) {
    const result = await postcss([autoprefixer]).process(css, {
        from: undefined /* suppress source map warning */,
    });

    return result.css;
}

const injectSideEffectImports = async (format: 'esm' | 'cjs') => {
    const isEsm = format === 'esm';
    const files = isEsm ? sync(`${OUT_DIR}/*/index.js`) : sync(`${OUT_DIR}/*/index.cjs`);

    for (const file of files) {
        try {
            let content = fs.readFileSync(file, 'utf-8');
            const componentName = isEsm
                ? file.split(`${OUT_DIR}/`)[1].split('/index.js')[0]
                : file.split(`${OUT_DIR}/`)[1].split('/index.cjs')[0];
            const componentSourceFile = fs.readFileSync(
                `src/components/${componentName}/${componentName}.tsx`,
                'utf-8',
            );
            const cssImport = isEsm ? `import "./index.css";` : `require("./index.css");`;
            const useClientDirective = `'use client';`;
            const useStrictDirective = `"use strict";`;

            if (content.includes(useStrictDirective)) {
                content = content.replace(
                    useStrictDirective,
                    `${useStrictDirective}\n${cssImport}`,
                );
            } else {
                content = `${cssImport}\n${content}`;
            }

            if (componentSourceFile.includes(useClientDirective)) {
                content = `${useClientDirective}\n${content}`;
            }

            fs.writeFileSync(file, content);
        } catch (error) {
            console.error(`❌ Failed to inject CSS import for ${file}:`, error);
        }
    }
};

const commonConfig: Options = {
    target: 'es6',
    sourcemap: true,
    minify: false,
    external: ['react', 'react-dom'],
    dts: false,
    format: ['esm', 'cjs'],
};
export default defineConfig([
    {
        ...commonConfig,
        entry: {
            index: 'src/index.ts',
        },
        outDir: 'dist',
        external: [...(commonConfig.external || []), './components'],
        clean: true, // Clean the dist on the first build step.
    },
    {
        ...commonConfig,
        entry: ['src/components/*/index.ts'],
        outDir: OUT_DIR,
        splitting: true,
        esbuildPlugins: [
            vanillaExtractPlugin({
                outputCss: true,
                processCss,

                identifiers: ({ hash, filePath, debugId }) => {
                    /** debugId: human readable prefixes like variants, sprinkles properties, etc. */
                    const componentName = filePath.split('/').pop()?.replace('.css.ts', '');
                    return `${componentName}${debugId ? `-${debugId}` : ''}__${hash}`;
                },
            }),
        ],
        async onSuccess() {
            console.log('✅ ESM build successful. Injecting sideEffect imports...');
            await injectSideEffectImports('esm');
            await injectSideEffectImports('cjs');
            console.log('🚀 SideEffect imports injected');
        },
    },
    {
        entry: ['src/index.ts'],
        outDir: 'dist/types',
        format: 'esm',
        dts: {
            only: true,
        },
        esbuildOptions(options) {
            options.outbase = './';
        },
    },
    // Styles build
    {
        entry: {
            styles: 'src/styles/index.css.ts',
        },
        outDir: 'dist',
        esbuildPlugins: [
            vanillaExtractPlugin({
                outputCss: true,
                processCss,
            }),
        ],
        async onSuccess() {
            fs.unlinkSync('dist/styles.cjs');
        },
    },
]);
