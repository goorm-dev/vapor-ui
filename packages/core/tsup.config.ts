import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import { sync as globSync } from 'glob';
import path from 'path';
import postcss from 'postcss';
import { type Options, defineConfig } from 'tsup';

// --- Constants ---
const DIST_DIR = 'dist';
const COMPONENTS_DIR = path.join(DIST_DIR, 'components');

// --- Build Order Synchronization ---
const componentBuildManager = {
    promise: Promise.resolve(),
    resolve: () => {},
    reset() {
        this.promise = new Promise((resolve) => {
            this.resolve = resolve;
        });
    },
};
componentBuildManager.reset();

// --- Helper Functions ---

/**
 * @link https://vanilla-extract.style/documentation/integrations/esbuild/#processcss
 */
async function processCss(css: string) {
    const result = await postcss([autoprefixer]).process(css, {
        from: undefined,
    });

    return result.css;
}
async function aggregateComponentStyles() {
    const mainCssPath = path.join(DIST_DIR, 'styles.css');
    const cssFiles = globSync(path.join(COMPONENTS_DIR, '*/index.css'));
    const existingContent = fs.readFileSync(mainCssPath, 'utf-8');

    const cssImports = cssFiles
        .map((cssFile) => {
            const relativePath = path.relative(DIST_DIR, cssFile);
            return `@import './${relativePath.replace(/\\/g, '/')}';`;
        })
        .join('\n');

    fs.writeFileSync(mainCssPath, `${existingContent}\n${cssImports}`);
}
async function prependUseClientDirective() {
    const outputFiles = globSync(path.join(COMPONENTS_DIR, '*/index.{js,cjs}'));

    for (const file of outputFiles) {
        try {
            let content = fs.readFileSync(file, 'utf-8');
            const componentName = path.basename(path.dirname(file));

            const tsxSourcePath = path.join(
                'src/components',
                componentName,
                `${componentName}.tsx`,
            );
            const tsSourcePath = path.join('src/components', componentName, `${componentName}.ts`);

            let componentSourcePath = '';
            if (fs.existsSync(tsxSourcePath)) {
                componentSourcePath = tsxSourcePath;
            } else if (fs.existsSync(tsSourcePath)) {
                componentSourcePath = tsSourcePath;
            }

            if (componentSourcePath) {
                const componentSource = fs.readFileSync(componentSourcePath, 'utf-8');
                const useClientDirective = `'use client';`;

                if (componentSource.startsWith(useClientDirective)) {
                    content = `${useClientDirective}\n${content}`;
                    fs.writeFileSync(file, content);
                }
            }
        } catch (error) {
            console.error(`❌ Failed to process 'use client' directive for ${file}:`, error);
        }
    }
}

// --- tsup Configurations ---
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
const vanillaExtractConfig = {
    outputCss: true,
    processCss,
};

export default defineConfig([
    // Main Entry Build (index.ts)
    {
        ...commonConfig,
        entry: { index: 'src/index.ts' },
        outDir: DIST_DIR,
        external: [...(commonConfig.external || []), './components'],
        clean: true, // Clean the dist on the first build step.
    },

    // Components Build
    {
        ...commonConfig,
        entry: ['src/components/*/index.ts'],
        outDir: COMPONENTS_DIR,
        splitting: false,
        esbuildPlugins: [
            vanillaExtractPlugin({
                ...vanillaExtractConfig,
                identifiers: ({ hash, filePath, debugId }) => {
                    const componentName = path.basename(filePath, '.css.ts');
                    return `${componentName}${debugId ? `-${debugId}` : ''}__${hash}`;
                },
            }),
        ],
        async onSuccess() {
            console.log('⌛ Components build successful. Post-processing output...');
            await prependUseClientDirective();
            console.log('🚀 "use client" directives added to components.');

            componentBuildManager.resolve();
        },
    },

    // Types build
    {
        entry: ['src/index.ts', 'src/components/*/index.ts'],
        outDir: DIST_DIR,
        dts: { only: true },
        esbuildOptions(options) {
            options.outbase = './'; // This preserves the directory structure for the generated .d.ts files.
        },
    },

    // Styles build
    {
        entry: {
            styles: 'src/styles/index.ts',
            tailwind: 'src/styles/tailwind-preset.css.ts',
        },
        outDir: DIST_DIR,
        esbuildPlugins: [vanillaExtractPlugin(vanillaExtractConfig)],
        async onSuccess() {
            await componentBuildManager.promise;

            console.log('⌛ Styles build successful. Aggregating component styles...');
            await aggregateComponentStyles();
            console.log('🚀 Component styles aggregated into main stylesheet.');

            componentBuildManager.reset();
        },
    },
]);
