import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import { sync } from 'glob';
import postcss from 'postcss';
import type { Options} from 'tsup';
import { defineConfig } from 'tsup';

// Common configuration shared across different build formats.
const commonConfig: Options = {
    entry: ['src/components/*/index.ts'],
    target: 'es6',
    splitting: true,
    sourcemap: true,
    minify: false,
    external: ['react', 'react-dom'],
    dts: false, // Type definitions are generated in a separate step.
};

/**
 * Processes the CSS output from vanilla-extract with PostCSS.
 * This is used to add vendor prefixes with autoprefixer.
 * @link https://vanilla-extract.style/documentation/integrations/esbuild/#processcss
 * @param {string} css - The CSS string to process.
 * @returns {Promise<string>} The processed CSS string.
 */
async function processCss(css: string) {
    const result = await postcss([autoprefixer]).process(css, {
        from: undefined /* Suppress source map warning */,
    });
    return result.css;
}

/**
 * A post-build script to inject CSS imports into the generated JavaScript files.
 * This ensures that when a component is imported, its corresponding CSS is also included.
 * It also correctly places the import after the "use client" directive if it exists.
 * @param {'esm' | 'cjs'} format - The module format of the output files.
 */
const injectCssImports = async (format: 'esm' | 'cjs') => {
    const isEsm = format === 'esm';
    const outDir = `dist/${format}`;
    // Find all the generated index.js files for each component.
    const files = sync(`${outDir}/*/index.js`);

    for (const file of files) {
        try {
            let content = fs.readFileSync(file, 'utf-8');
            const cssImport = isEsm ? `import "./index.css";` : `require("./index.css");`;
            const useClientDirective = '"use client";';

            // If the file starts with "use client", insert the CSS import after it.
            if (content.startsWith(useClientDirective)) {
                content = content.replace(
                    useClientDirective,
                    `${useClientDirective}\n${cssImport}`,
                );
            } else {
                // Otherwise, prepend the CSS import to the top of the file.
                content = `${cssImport}\n${content}`;
            }

            fs.writeFileSync(file, content);
        } catch (error) {
            console.error(`❌ Failed to inject CSS import for ${file}:`, error);
        }
    }
};

export default defineConfig([
    // 1. ESM Build
    // This build generates ES Module files for modern bundlers (like Vite, Webpack).
    // It outputs both JS and CSS files for each component.
    {
        ...commonConfig,
        format: 'esm',
        outDir: 'dist/esm',
        clean: true, // Clean the dist directory only on the first build step.
        esbuildPlugins: [
            vanillaExtractPlugin({
                outputCss: true,
                processCss,
                // Custom identifier for generating debug-friendly class names.
                identifiers: ({ hash, filePath, debugId }) => {
                    const componentName = filePath.split('/').pop()?.replace('.css.ts', '');
                    return `${componentName}${debugId ? `-${debugId}` : ''}__${hash}`;
                },
            }),
        ],
        outExtension() {
            return {
                js: `.js`,
            };
        },
        async onSuccess() {
            console.log('✅ ESM build successful. Injecting CSS imports...');
            await injectCssImports('esm');
            console.log('🚀 CSS imports injected for ESM.');
        },
    },

    // 1.1 ESM Barrel File Build
    // This bundles the main `src/index.ts` entry point, which re-exports all components.
    {
        entry: ['src/index.ts'],
        format: 'esm',
        outDir: 'dist/esm',
    },

    // 2. CJS Build
    // This build generates CommonJS files for Node.js environments.
    // Note: `outputCss` is false, so this build does not generate CSS files.
    // Consumers in CJS environments are expected to handle CSS separately.
    {
        ...commonConfig,
        format: 'cjs',
        outDir: 'dist/cjs',
        esbuildPlugins: [vanillaExtractPlugin({ outputCss: false })],
        outExtension() {
            return {
                js: `.cjs`,
            };
        },
    },

    // 3. Type Declaration Build
    // This step generates all TypeScript definition files (.d.ts) for the entire library.
    {
        entry: ['src/index.ts', 'src/components/*/index.ts'],
        outDir: 'dist',
        dts: {
            only: true,
        },
    },

    // 4. Global Styles Build
    // This build processes and outputs global styles (e.g., themes, resets)
    // that consumers can import directly into their application.
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
