import { createRequire } from 'node:module';

import type { AnyProp } from '~/models/types';

import type { VaporPluginOptions } from './_options';
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

const loaderName = (u: AnyProp): string => (typeof u === 'string' ? u : (u?.loader ?? ''));

/**
 * Next 가 구성한 CSS rule 체인(`css-loader` 포함 `use` 배열) 끝에 loader 를 추가한다.
 * 별도 `.css` rule 을 push 하면 Next 가 내장 CSS 지원을 비활성화하므로 기존 체인에 끼운다.
 * webpack loader 는 배열 뒤에서 앞으로 실행되므로 끝에 두면 원본 CSS 를 가장 먼저 받는다.
 */
function appendToCssRules(rules: AnyProp[], loader: { loader: string; options: unknown }): number {
    let matched = 0;
    for (const rule of rules) {
        if (!rule || typeof rule !== 'object') continue;
        if (Array.isArray(rule.oneOf)) matched += appendToCssRules(rule.oneOf, loader);
        if (Array.isArray(rule.rules)) matched += appendToCssRules(rule.rules, loader);
        if (!Array.isArray(rule.use)) continue;
        if (!rule.use.some((u: AnyProp) => loaderName(u).includes('css-loader'))) continue;
        matched++;
        if (rule.use.some((u: AnyProp) => loaderName(u) === loader.loader)) continue;
        rule.use.push(loader);
    }
    return matched;
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
    const cssLoaderPath = selfRequire.resolve('@vapor-ui/style-macro/css-loader');

    // Turbopack loader 옵션은 JSON 직렬화되므로 함수형 옵션(injectColorScheme 등)은 제외.
    const loaderOptions = Object.fromEntries(
        Object.entries({
            include: unpluginOpts.include,
            exclude: unpluginOpts.exclude,
            root: unpluginOpts.root,
            hash: unpluginOpts.hash,
            layer: unpluginOpts.layer,
        }).filter(([, v]) => v !== undefined),
    );

    return <T extends object = object>(nextConfig: T = {} as T): T => {
        const merged = { ...(nextConfig as NextConfigMutable) } as NextConfigMutable;

        if (useWebpack) {
            const originalWebpack = (nextConfig as NextConfigMutable).webpack;
            merged.webpack = (config: AnyProp, ctx: AnyProp) => {
                const root = unpluginOpts.root ?? (ctx?.dir as string | undefined);
                config.plugins ??= [];
                config.plugins.push(vaporWebpackPlugin({ ...unpluginOpts, root }));
                const matched = appendToCssRules(config.module?.rules ?? [], {
                    loader: cssLoaderPath,
                    options: { ...loaderOptions, ...(root ? { root } : {}) },
                });
                if (matched === 0) {
                    throw new Error(
                        '[@vapor-ui/style-macro] Could not find Next.js CSS loader rules to attach to. ' +
                            'This Next.js version may have changed its webpack CSS pipeline; ' +
                            'please report the Next.js version.',
                    );
                }
                return originalWebpack ? originalWebpack(config, ctx) : config;
            };
        }

        if (useTurbo) {
            const loaderPath = selfRequire.resolve('@vapor-ui/style-macro/turbopack');

            const globs = Array.isArray(turbopackGlob) ? turbopackGlob : [turbopackGlob];
            const sourceRule = {
                loaders: [{ loader: loaderPath, options: loaderOptions }],
            };

            const existingTurbopack = (merged.turbopack ?? {}) as {
                rules?: Record<string, unknown>;
                [k: string]: unknown;
            };
            const rules: Record<string, unknown> = {
                ...existingTurbopack.rules,
                ...Object.fromEntries(globs.map((g) => [g, sourceRule])),
            };

            const cssLoader = { loader: cssLoaderPath, options: loaderOptions };
            const existingCss = rules['*.css'] as { loaders?: unknown[]; as?: string } | undefined;
            rules['*.css'] = {
                ...existingCss,
                loaders: [...(existingCss?.loaders ?? []), cssLoader],
                as: existingCss?.as ?? '*.css',
            };

            merged.turbopack = { ...existingTurbopack, rules };
        }

        return merged as unknown as T;
    };
}
