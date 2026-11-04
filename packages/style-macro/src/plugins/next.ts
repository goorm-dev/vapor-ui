import { createRequire } from 'node:module';

import type { AnyProp } from '~/models/types';

import type { VaporPluginOptions } from './_factory';
import { vaporWebpackPlugin } from './webpack';

export type NextMode = 'auto' | 'webpack' | 'turbopack';

export interface WithVaporPluginOptions extends VaporPluginOptions {
    mode?: NextMode;
    /**
     * Turbopack rule glob(s) for source files that may contain `css()`.
     *
     * Default: `**\/*.{tsx,jsx,ts,js,mts,mjs,cts,cjs}`. `.js`·`.mjs`·`.cjs`
     * are included because consumers may author `css()` call sites outside of
     * TypeScript files.
     *
     * Turbopack loader options are JSON serialized, so function-typed options
     * (e.g. a custom `include` predicate) can not be forwarded to the loader.
     * The loader applies `defaultInclude` internally — passing a function to
     * `include` here is silently ignored under Turbopack. Narrow the file set
     * through `turbopackGlob` instead, or stay on Webpack (`mode: 'webpack'`)
     * when a predicate is required.
     */
    turbopackGlob?: string | string[];
}

interface NextConfigMutable {
    webpack?: ((config: AnyProp, ctx: AnyProp) => unknown) | null;
    turbopack?: {
        rules?: Record<string, unknown>;
    };
}

const DEFAULT_TURBOPACK_GLOB = '**/*.{tsx,jsx,ts,js,mts,mjs,cts,cjs}';

function detectTurbopack(): boolean {
    return Boolean(process.env.TURBOPACK);
}

/**
 * Curried Next.js integration for the Vapor style macro.
 *
 * Style follows `next-themes`, `next-pwa`, and other Next plugin conventions:
 * options first, then the config to wrap.
 *
 *     // next.config.ts
 *     import { vaporNextPlugin } from '@vapor-ui/style-macro/next';
 *
 *     const withVapor = vaporNextPlugin();
 *
 *     const nextConfig: NextConfig = { ... };
 *     export default withVapor(nextConfig);
 */
export function vaporNextPlugin(
    opts: WithVaporPluginOptions = {},
): <T extends object = object>(nextConfig?: T) => T {
    const { mode = 'auto', turbopackGlob = DEFAULT_TURBOPACK_GLOB, ...unpluginOpts } = opts;

    const useTurbo = mode === 'turbopack' || (mode === 'auto' && detectTurbopack());
    const useWebpack = mode === 'webpack' || (mode === 'auto' && !detectTurbopack());

    return <T extends object = object>(nextConfig: T = {} as T): T => {
        const merged = { ...(nextConfig as NextConfigMutable) } as NextConfigMutable;

        if (useWebpack) {
            const originalWebpack = (nextConfig as NextConfigMutable).webpack;
            merged.webpack = (config: AnyProp, ctx: AnyProp) => {
                config.plugins ??= [];
                config.plugins.push(vaporWebpackPlugin(unpluginOpts));
                return originalWebpack ? originalWebpack(config, ctx) : config;
            };
        }

        if (useTurbo) {
            const modulePath = typeof __filename !== 'undefined' ? __filename : import.meta.url;
            const selfRequire = createRequire(modulePath);
            const loaderPath = selfRequire.resolve('@vapor-ui/style-macro/turbopack');

            const rawLoaderOptions: Record<string, unknown> = {
                hash: unpluginOpts.hash,
            };

            const loaderOptions = Object.fromEntries(
                Object.entries(rawLoaderOptions).filter(
                    ([, v]) => v !== undefined && typeof v !== 'function',
                ),
            );

            const globs = Array.isArray(turbopackGlob) ? turbopackGlob : [turbopackGlob];
            const sourceRule = {
                loaders: [{ loader: loaderPath, options: loaderOptions }],
            };

            const existingTurbopack = (merged.turbopack ?? {}) as {
                rules?: Record<string, unknown>;
                [k: string]: unknown;
            };

            merged.turbopack = {
                ...existingTurbopack,
                rules: {
                    ...existingTurbopack.rules,
                    ...Object.fromEntries(globs.map((g) => [g, sourceRule])),
                },
            };
        }

        return merged as unknown as T;
    };
}
