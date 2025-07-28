import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { defineConfig } from 'tsup';

/**
 * 컴포넌트 엔트리 포인트들을 가져옵니다
 */
function getComponentEntries() {
    const componentsDir = 'src/components';
    const entries: Record<string, string> = {
        index: 'src/index.ts',
    };

    if (fs.existsSync(componentsDir)) {
        const componentFolders = fs
            .readdirSync(componentsDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        componentFolders.forEach((folder) => {
            const indexPath = `${componentsDir}/${folder}/index.ts`;
            if (fs.existsSync(indexPath)) {
                entries[`components/${folder}/index`] = indexPath;
            }
        });
    }

    return entries;
}

/**
 * CSS 파일들을 수집하고 번들링하는 플러그인
 */
function createCssBundlePlugin() {
    return {
        name: 'css-bundle',
        buildEnd: async () => {
            // ESM과 CJS 각각에 대해 CSS 번들 생성
            const formats = ['esm', 'cjs'];

            for (const format of formats) {
                const formatDir = `dist/${format}`;
                if (!fs.existsSync(formatDir)) continue;

                const cssFiles = await glob(`${formatDir}/**/*.css`, {
                    ignore: [`${formatDir}/index.css`],
                });

                if (cssFiles.length > 0) {
                    const cssImports = cssFiles
                        .map((file) => {
                            const relativePath = path.relative(formatDir, file);
                            return `@import "./${relativePath}";`;
                        })
                        .join('\n');

                    fs.writeFileSync(path.join(formatDir, 'index.css'), cssImports + '\n');
                }
            }
        },
    };
}

const componentEntries = getComponentEntries();

export default defineConfig([
    // ESM 빌드
    {
        entry: componentEntries,
        format: ['esm'],
        outDir: 'dist/esm',
        dts: false,
        sourcemap: false,
        clean: false,
        splitting: false,
        treeshake: true,
        keepNames: true,
        external: ['react', 'react-dom', '@radix-ui/react-primitive', 'clsx'],
        esbuildPlugins: [vanillaExtractPlugin()],
        esbuildOptions: (options) => {
            options.preserveSymlinks = false;
            options.alias = {
                '~': path.resolve('./src'),
            };
            options.jsx = 'preserve';
        },
        outExtension: () => ({
            js: '.js',
        }),
        banner: {
            js: `"use client";`,
        },
        plugins: [createCssBundlePlugin()],
    },
    // CJS 빌드
    {
        entry: componentEntries,
        format: ['cjs'],
        outDir: 'dist/cjs',
        dts: false,
        sourcemap: false,
        clean: false,
        splitting: false,
        treeshake: true,
        keepNames: true,
        external: ['react', 'react-dom', '@radix-ui/react-primitive', 'clsx'],
        esbuildPlugins: [vanillaExtractPlugin()],
        esbuildOptions: (options) => {
            options.preserveSymlinks = false;
            options.alias = {
                '~': path.resolve('./src'),
            };
            options.jsx = 'preserve';
        },
        outExtension: () => ({
            js: '.cjs',
        }),
        banner: {
            js: `"use client";`,
        },
    },
    // TypeScript 선언 파일 빌드
    {
        entry: componentEntries,
        format: ['esm'],
        outDir: 'dist/types',
        dts: {
            only: true,
        },
        sourcemap: false,
        clean: false,
        splitting: false,
        external: ['react', 'react-dom', '@radix-ui/react-primitive', 'clsx'],
        esbuildOptions: (options) => {
            options.alias = {
                '~': path.resolve('./src'),
            };
        },
    },
]);
