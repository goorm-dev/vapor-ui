import reactDocgenTypescript from '@joshwooding/vite-plugin-react-docgen-typescript';
import type { StorybookConfig } from '@storybook/react-vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import path from 'node:path';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
    stories: ['../packages/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-controls',
        '@storybook/addon-interactions',
    ],

    core: {
        builder: '@storybook/builder-vite',
    },

    framework: {
        name: '@storybook/react-vite',
        options: {
            builder: {},
        },
    },
    typescript: {
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            tsconfigPath: path.resolve(__dirname, '../packages/core/tsconfig.json'),
        },
    },

    previewHead: (head) => `
    ${head}
    ${'<link rel="preload" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />'}`,

    viteFinal: async (config) => {
        const mergedConfig = mergeConfig(config, {
            ...config,
            resolve: {
                ...config.resolve,
                alias: {
                    ...config.resolve?.alias,
                    // ...convertTsConfigPathsToWebpackAliases(),
                    '~': path.resolve(__dirname, '../packages/core/src'),
                },
            },

            plugins: [
                vanillaExtractPlugin({
                    identifiers: ({ hash, filePath, debugId }) => {
                        const componentName = path.basename(filePath, '.css.ts');
                        const prefix = componentName === 'sprinkles' ? 'v' : componentName;

                        return `${prefix}${debugId ? `-${debugId}` : ''}-${hash}`;
                    },
                }),
                reactDocgenTypescript(),
            ],
        });

        return mergedConfig;
    },
};

export default config;
