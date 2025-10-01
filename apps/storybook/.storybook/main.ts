import reactDocgenTypescript from '@joshwooding/vite-plugin-react-docgen-typescript';
import type { StorybookConfig } from '@storybook/react-vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { createRequire } from 'node:module';
import path, { dirname, join } from 'node:path';
import { mergeConfig } from 'vite';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
    stories: ['../../../packages/**/src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [getAbsolutePath('@storybook/addon-docs')],

    core: {
        builder: getAbsolutePath('@storybook/builder-vite'),
    },

    framework: {
        name: getAbsolutePath('@storybook/react-vite'),
        options: {
            builder: {},
        },
    },

    typescript: {
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            tsconfigPath: path.resolve(__dirname, '../tsconfig.json'),
        },
    },

    viteFinal: async (config) => {
        const mergedConfig = mergeConfig(config, {
            ...config,
            resolve: {
                ...config.resolve,
                alias: {
                    ...config.resolve?.alias,
                    // ...convertTsConfigPathsToWebpackAliases(),
                    '~': path.resolve(__dirname, '../../../packages/core/src'),
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

function getAbsolutePath(value: string) {
    return dirname(require.resolve(join(value, 'package.json')));
}
