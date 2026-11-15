import { createRequire } from 'node:module';

import type { AnyProp } from '~/models/types';

import type { VaporPluginOptions } from './_options';
import { VAPOR_CSS_QUERY } from './turbopack';
import { loaderOptions, resolveCssLoader, vaporWebpackPlugin } from './webpack';

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
     * Turbopack loader options are JSON serialized; `include`/`exclude`/`root` are
     * plain data and forward as-is. `turbopackGlob` only decides which files the
     * loader is attached to — the include/exclude filter still applies inside it.
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

    const modulePath = typeof __filename !== 'undefined' ? __filename : import.meta.url;
    const selfRequire = createRequire(modulePath);

    return <T extends object = object>(nextConfig: T = {} as T): T => {
        const merged = { ...(nextConfig as NextConfigMutable) } as NextConfigMutable;

        if (useWebpack) {
            const originalWebpack = (nextConfig as NextConfigMutable).webpack;
            merged.webpack = (config: AnyProp, ctx: AnyProp) => {
                const root = unpluginOpts.root ?? (ctx?.dir as string | undefined);
                config.plugins ??= [];
                config.plugins.push(vaporWebpackPlugin({ ...unpluginOpts, root }));
                return originalWebpack ? originalWebpack(config, ctx) : config;
            };
        }

        if (useTurbo) {
            const options = loaderOptions(unpluginOpts);
            const jsLoader = {
                loader: selfRequire.resolve('@vapor-ui/style-macro/turbopack'),
                options,
            };
            const cssLoader = { loader: resolveCssLoader(), options };
            const query = new RegExp(`[?&]${VAPOR_CSS_QUERY}(?=&|$)`);
            // 같은 glob 에 두 규칙: 쿼리 없는 import 는 JS 변환, `?vapor-css` 는 같은 소스를
            // CSS 로 컴파일해 CSS 모듈로 처리한다.
            const sourceRules = [
                { condition: { not: { query } }, loaders: [jsLoader] },
                { condition: { query }, loaders: [cssLoader], as: '*.css' },
            ];

            const globs = Array.isArray(turbopackGlob) ? turbopackGlob : [turbopackGlob];
            const existingTurbopack = (merged.turbopack ?? {}) as {
                rules?: Record<string, unknown>;
                [k: string]: unknown;
            };
            merged.turbopack = {
                ...existingTurbopack,
                rules: {
                    ...existingTurbopack.rules,
                    ...Object.fromEntries(globs.map((g) => [g, sourceRules])),
                },
            };
        }

        return merged as unknown as T;
    };
}
