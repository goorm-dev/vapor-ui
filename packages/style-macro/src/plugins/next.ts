import { createRequire } from 'node:module';

import type { AnyProp } from '~/models/types';

import unplugin from './_factory';
import type { VaporPluginOptions } from './_factory';

export type NextMode = 'auto' | 'webpack' | 'turbopack';

export interface WithVaporPluginOptions extends VaporPluginOptions {
    mode?: NextMode;
    /** Turbopack rule glob(s) for source files that may contain `styles`. */
    turbopackGlob?: string | string[];
}

interface NextConfigMutable {
    webpack?: ((config: AnyProp, ctx: AnyProp) => unknown) | null;
    turbopack?: {
        rules?: Record<string, unknown>;
    };
}

const DEFAULT_TURBOPACK_GLOB = '**/*.{tsx,jsx,ts}';

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
                config.plugins.push(unplugin.webpack(unpluginOpts));
                return originalWebpack ? originalWebpack(config, ctx) : config;
            };
        }

        if (useTurbo) {
            const modulePath = typeof __filename !== 'undefined' ? __filename : import.meta.url;
            const selfRequire = createRequire(modulePath);
            const loaderPath = selfRequire.resolve('@vapor-ui/style-macro/turbopack');

            const rawLoaderOptions: Record<string, unknown> = {
                hash: unpluginOpts.hash,
                themeStylesImport: unpluginOpts.themeStylesImport,
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
