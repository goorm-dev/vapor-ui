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
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        target: 'es6',
        outDir: 'dist',
        sourcemap: true,
        clean: true,
        minify: true,
        banner: {
            js: '"use client";',
            css: '@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css");',
        },
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
        format: ['esm', 'cjs'],
        clean: true,
        dts: { only: true },
        outDir: 'dist',
    }),
];
