import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import { sync } from 'glob';
import path from 'path';
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

            // --- CSS Import Injection Logic ---
            const cssFilePath = path.join(path.dirname(file), 'index.css');

            if (fs.existsSync(cssFilePath)) {
                const cssImport = isEsm ? `import "./index.css";` : `require("./index.css");`;
                const useStrictDirective = `"use strict";`;

                if (content.includes(useStrictDirective)) {
                    content = content.replace(
                        useStrictDirective,
                        `${useStrictDirective}\n${cssImport}`,
                    );
                } else {
                    content = `${cssImport}\n${content}`;
                }
            }

            // --- 'use client' Directive Injection Logic ---
            const tsxSourcePath = `src/components/${componentName}/${componentName}.tsx`;
            const tsSourcePath = `src/components/${componentName}/${componentName}.ts`;

            let componentSourcePath = '';
            if (fs.existsSync(tsxSourcePath)) {
                componentSourcePath = tsxSourcePath;
            } else if (fs.existsSync(tsSourcePath)) {
                componentSourcePath = tsSourcePath;
            }

            if (componentSourcePath) {
                const componentSourceFile = fs.readFileSync(componentSourcePath, 'utf-8');
                const useClientDirective = `'use client';`;
                if (componentSourceFile.includes(useClientDirective)) {
                    content = `${useClientDirective}\n${content}`;
                }
            }

            fs.writeFileSync(file, content);
        } catch (error) {
            console.error(`❌ Failed to inject side-effects for ${file}:`, error);
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
        banner: {
            css: '@layer vapor-theme, vapor-reset, vapor-component, vapor-utilities;',
        },
    },
    {
        entry: ['src/index.ts', 'src/components/*/index.ts'],
        outDir: DIR,
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
