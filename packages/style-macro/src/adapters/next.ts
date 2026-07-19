import { createRequire } from 'node:module';

import type { AnyProp } from '~/model/types';

import unplugin from './unplugin';
import type { VaporStyleOptions } from './unplugin';

/**
 * Which bundler backend to wire into the returned `NextConfig`.
 *
 * - `'auto'` (default) — inspects `process.env.TURBOPACK`. Next.js sets this
 *   to `'1'` when invoked with `--turbopack` (dev or build). Truthy → wire
 *   the Turbopack loader only; falsy → wire the webpack unplugin only.
 * - `'webpack'` — always wire the webpack unplugin, skip Turbopack rules.
 *   Use this to force the webpack path even when running on a Turbopack
 *   default (e.g. Next 16 with `--webpack`).
 * - `'turbopack'` — always wire the Turbopack loader, skip the webpack
 *   plugin. Use this when you know only Turbopack will run.
 */
export type NextMode = 'auto' | 'webpack' | 'turbopack';

export interface WithVaporStyleOptions extends VaporStyleOptions {
    mode?: NextMode;
    /** Turbopack rule glob(s) for source files that may contain `styles`. */
    turbopackGlob?: string | string[];
}

/**
 * Structural view of the two fields we augment on `NextConfig`. Used only
 * internally when merging — the exposed generic is unconstrained so that
 * Next's own `NextConfig` (whose `turbopack`/`webpack` shapes carry no
 * index signature) passes through without a structural-mismatch TS error.
 */
interface NextConfigMutable {
    webpack?: ((config: AnyProp, ctx: AnyProp) => unknown) | null;
    turbopack?: {
        rules?: Record<string, unknown>;
    };
}

// Deliberately narrow: `styles` is only written in TS/JSX source, so we
// don't need to run the loader over `.js`/`.cjs`/`.mjs` (compiled deps in
// node_modules) — mislabelling those as ESM would break CJS interop.
const DEFAULT_TURBOPACK_GLOB = '**/*.{tsx,jsx,ts}';

function detectTurbopack(): boolean {
    return Boolean(process.env.TURBOPACK);
}

/**
 * Wrap a `next.config.ts` object with Vapor style-macro support. Wires
 * either the webpack unplugin or the Turbopack loader based on `mode`
 * (default `'auto'` reads `process.env.TURBOPACK`).
 *
 *     // next.config.ts
 *     import vaporStyle from '@vapor-ui/style-macro/next';
 *     export default vaporStyle({
 *         // ...your next config
 *     });
 *
 *     // force webpack path
 *     export default vaporStyle(nextConfig, { mode: 'webpack' });
 */
export default function vaporStyleNext<T extends object = object>(
    nextConfig: T = {} as T,
    opts: WithVaporStyleOptions = {},
): T {
    const { mode = 'auto', turbopackGlob = DEFAULT_TURBOPACK_GLOB, ...unpluginOpts } = opts;

    const useTurbo = mode === 'turbopack' || (mode === 'auto' && detectTurbopack());
    const useWebpack = mode === 'webpack' || (mode === 'auto' && !detectTurbopack());

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
        // Resolve the loader relative to this module (self-reference through
        // the `./turbopack` subpath export). Anchoring `createRequire` to the
        // plugin file itself keeps resolution independent of the consumer's
        // cwd, so pnpm symlinks and `next build` invoked from a parent
        // directory don't affect it. `__filename` is defined in tsup's CJS
        // output; `import.meta.url` covers the ESM output.
        const modulePath = typeof __filename !== 'undefined' ? __filename : import.meta.url;
        const selfRequire = createRequire(modulePath);
        const loaderPath = selfRequire.resolve('@vapor-ui/style-macro/turbopack');

        // Turbopack rule options must be JSON-serializable AND cannot carry
        // `undefined` values (its serde layer rejects them). Strip functions
        // (e.g. user-supplied `include`) and drop any undefined field so the
        // resulting object is a pure JSON object.
        const rawLoaderOptions: Record<string, unknown> = {
            manifest: unpluginOpts.manifest,
            obfuscate: unpluginOpts.obfuscate,
            themeStylesImport: unpluginOpts.themeStylesImport,
            layerOrder: unpluginOpts.layerOrder,
        };
        const loaderOptions = Object.fromEntries(
            Object.entries(rawLoaderOptions).filter(
                ([, v]) => v !== undefined && typeof v !== 'function',
            ),
        );

        const globs = Array.isArray(turbopackGlob) ? turbopackGlob : [turbopackGlob];
        // Do NOT set `as` on the source rule — we return the same TS/JSX we
        // received (with `import` statements prepended), so Turbopack should
        // continue running its default TS/JSX transform pipeline based on the
        // real file extension.
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
                ...(existingTurbopack.rules ?? {}),
                ...Object.fromEntries(globs.map((g) => [g, sourceRule])),
            },
        };
    }

    return merged as unknown as T;
}
