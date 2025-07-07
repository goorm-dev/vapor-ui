import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import { sync } from 'glob';
import postcss from 'postcss';
import { defineConfig } from 'tsup';

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
    const outDir = `dist/${format}`;
    const files = sync(`${outDir}/*/index.js`);

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
            console.error(`❌ Failed to inject CSS import for ${file}:`, error);
        }
    }
};

export default defineConfig([
    {
        entry: ['src/components/*/index.ts'],
        format: ['esm', 'cjs'],
        outDir: 'dist/components',
        target: 'es6',
        splitting: true,
        sourcemap: true,
        minify: false,
        external: ['react', 'react-dom'],
        dts: false,
        clean: true, // Clean the dist on the first build step.
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
            console.log('✅ ESM build successful. Injecting CSS imports...');
            await injectSideEffectImports('esm');
            console.log('🚀 CSS imports injected for ESM.');
        },
    },

    {
        entry: ['src/index.ts'],
        format: 'esm',
        outDir: 'dist',
    },

    {
        entry: ['src/index.ts', 'src/components/*/index.ts'],
        outDir: 'dist/types',
        format: 'esm',
        dts: {
            only: true,
        },
    },

    {
        entry: {
            styles: 'src/styles/index.css.ts',
        },
        outDir: 'dist/styles',
        esbuildPlugins: [
            vanillaExtractPlugin({
                outputCss: true,
                processCss,
            }),
        ],
    },
]);
