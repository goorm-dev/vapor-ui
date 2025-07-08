import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import { sync } from 'glob';
import postcss from 'postcss';
import { type Options, defineConfig } from 'tsup';

const COMPONENT_DIR = 'dist/components';
const DIR = 'dist';

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
    const files = isEsm
        ? sync(`${COMPONENT_DIR}/*/index.js`)
        : sync(`${COMPONENT_DIR}/*/index.cjs`);

    for (const file of files) {
        try {
            let content = fs.readFileSync(file, 'utf-8');
            const componentName = isEsm
                ? file.split(`${COMPONENT_DIR}/`)[1].split('/index.js')[0]
                : file.split(`${COMPONENT_DIR}/`)[1].split('/index.cjs')[0];
            const componentSourceFile = fs.readFileSync(
                `src/components/${componentName}/${componentName}.tsx`,
                'utf-8',
            );

            const cssFilePath = `src/components/${componentName}/${componentName}.css.ts`;
            const cssFileExists = fs.existsSync(cssFilePath);

            const useClientDirective = `'use client';`;
            const useStrictDirective = `"use strict";`;

            if (cssFileExists) {
                const cssImport = isEsm ? `import "./index.css";` : `require("./index.css");`;

                if (content.includes(useStrictDirective)) {
                    content = content.replace(
                        useStrictDirective,
                        `${useStrictDirective}\n${cssImport}`,
                    );
                } else {
                    content = `${cssImport}\n${content}`;
                }
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
    outExtension({ format }) {
        return {
            js: format === 'cjs' ? '.cjs' : '.js',
        };
    },
};

export default defineConfig([
    {
        ...commonConfig,
        entry: { index: 'src/index.ts' },
        outDir: DIR,
        external: [...(commonConfig.external || []), './components'],
        clean: true, // Clean the dist on the first build step.
    },
    {
        ...commonConfig,
        entry: ['src/components/*/index.ts'],
        outDir: COMPONENT_DIR,
        splitting: false,
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
        entry: ['src/index.ts', 'src/components/*/index.ts'],
        outDir: 'dist',
        format: 'cjs',
        splitting: true,
        dts: { only: true },
        esbuildOptions(options) {
            options.outbase = './';
        },
    },
    // Styles build
    {
        entry: {
            styles: 'src/styles/index.ts',
        },
        outDir: DIR,
        esbuildPlugins: [
            vanillaExtractPlugin({
                outputCss: true,
                processCss,
            }),
        ],
    },
]);
