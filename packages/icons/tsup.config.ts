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
        target: 'es6',
        outDir: 'dist',
        sourcemap: true,
        minify: true,
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
    }),

    // TYPES
    defineConfig({
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        clean: true,
        dts: { only: true },
        outDir: 'dist',
    }),
];
