import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import autoprefixer from 'autoprefixer';
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

export default [
    // ESM, CJS
    defineConfig({
        entryPoints: ['src/index.ts'],
        format: ['esm', 'cjs'],
        target: 'es6', // Final build output is transpiled to ES6 for legacy browser compatibility
        outDir: 'dist',
        minify: true,
        treeshake: true,
        sourcemap: true,
        cjsInterop: true,
        esbuildPlugins: [
            vanillaExtractPlugin({
                processCss,
                identifiers: ({ hash, filePath, debugId }) => {
                    /** debugId: human readable prefixes like variants, sprinkles properties, etc. */
                    const componentName = filePath.split('/').pop()?.replace('.css.ts', '');

                    return `${componentName}${debugId ? `-${debugId}` : ''}-${hash}`;
                },
            }),
        ],
        esbuildOptions(options, context) {
            if (context.format === 'esm') {
                options.banner = { js: 'import "./index.css";' };
            } else {
                options.banner = { js: 'require("./index.css");' };
            }
        },
    }),

    // TYPES
    defineConfig({
        entryPoints: ['src/index.ts'],
        format: ['cjs', 'esm'],
        splitting: true,
        sourcemap: true,
        clean: true,
        dts: { only: true },
        outDir: 'dist/types',
    }),
];
