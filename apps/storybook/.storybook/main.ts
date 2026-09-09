import type { StorybookConfig } from '@storybook/react-vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path, { dirname, join } from 'node:path';
import { mergeConfig } from 'vite';

const require = createRequire(import.meta.url);

const CORE_SRC = path.resolve(__dirname, '../../../packages/core/src');
const COMPOSITES_SRC = path.resolve(__dirname, '../../../packages/composites/src');

const PACKAGE_SRC_MAP: { match: string; src: string }[] = [
    { match: `/packages/composites/`, src: COMPOSITES_SRC },
    { match: `/packages/core/`, src: CORE_SRC },
];

const tildeAlias = {
    find: /^~\//,
    replacement: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async customResolver(this: any, source: string, importer?: string) {
        if (!importer) return null;

        const owner = PACKAGE_SRC_MAP.find(({ match }) => importer.includes(match));
        if (!owner) return null;

        const target = path.resolve(owner.src, source);
        const resolved = await this.resolve(target, importer, { skipSelf: true });

        return resolved?.id ?? target;
    },
};

const coreDistCssPassthrough = {
    name: 'vapor-core-dist-css-passthrough',
    enforce: 'pre' as const,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async resolveId(this: any, source: string, importer: string | undefined) {
        if (!source.endsWith('.vanilla.css')) return null;
        const resolved = await this.resolve(source, importer, { skipSelf: true });
        if (!resolved) return null;
        if (resolved.id.includes('/packages/core/dist/')) return resolved.id;
        return null;
    },

    async load(id: string) {
        if (!id.endsWith('.vanilla.css')) return null;
        if (!id.includes('/packages/core/dist/')) return null;
        return await readFile(id.split('?')[0], 'utf-8');
    },
};

const config: StorybookConfig = {
    stories: ['../../../packages/**!(node_modules|dist)/src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
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
        reactDocgen: false,
    },

    viteFinal: async (config) => {
        const mergedConfig = mergeConfig(config, {
            ...config,
            resolve: {
                ...config.resolve,
                alias: [tildeAlias],
            },

            plugins: [
                coreDistCssPassthrough,
                vanillaExtractPlugin({
                    identifiers: ({ hash, filePath, debugId }) => {
                        const componentName = path.basename(filePath, '.css.ts');
                        const prefix = componentName === 'sprinkles' ? 'v' : componentName;

                        return `${prefix}${debugId ? `-${debugId}` : ''}-${hash}`;
                    },
                }),
            ],
        });

        return mergedConfig;
    },
};

export default config;

function getAbsolutePath(value: string) {
    return dirname(require.resolve(join(value, 'package.json')));
}
