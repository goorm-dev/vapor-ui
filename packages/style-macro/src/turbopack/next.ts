import { createRequire } from 'node:module';
import * as path from 'node:path';

import type { VaporStyleOptions } from '~/bundler/unplugin-types';
import type { AnyProp } from '~/model/types';
import unplugin from '~/webpack/unplugin';

/**
 * Whether the Turbopack path should be wired. `auto` enables it when the
 * consumer's resolved `next` package is >= 16 (the version that ships
 * `turbopack.rules` as a stable option).
 */
export type UnstableTurbopackMode = 'auto' | 'on' | 'off';

export interface WithVaporStyleOptions extends VaporStyleOptions {
    unstable_turbopack?: {
        mode?: UnstableTurbopackMode;
        /** Turbopack rule glob(s) for source files that may contain `$style`. */
        glob?: string | string[];
    };
}

/**
 * Structural subset of `NextConfig` we actually touch. Deliberately narrow
 * and lenient — Next's own `NextConfig` isn't structurally compatible with
 * an interface that carries an index signature, so we treat unknown fields
 * as opaque and only pin the ones we augment. Consumers pass a fully-typed
 * `NextConfig` in and get the same type out (see the generic on the caller).
 */
interface NextConfigSubset {
    webpack?: ((config: AnyProp, ctx: AnyProp) => unknown) | null;
    turbopack?: {
        rules?: Record<string, unknown>;
    };
}

// Deliberately narrow: `$style` is only written in TS/JSX source, so we
// don't need to run the loader over `.js`/`.cjs`/`.mjs` (compiled deps in
// node_modules) — mislabelling those as ESM would break CJS interop.
const DEFAULT_TURBOPACK_GLOB = '**/*.{tsx,jsx,ts}';

function detectNext16InConsumer(): boolean {
    try {
        const cwdRequire = createRequire(path.join(process.cwd(), 'package.json'));
        const pkg = cwdRequire('next/package.json') as { version?: string };
        if (!pkg?.version) return false;

        const major = Number.parseInt(pkg.version.split('.')[0]!, 10);

        return Number.isFinite(major) && major >= 16;
    } catch {
        return false;
    }
}

/**
 * Wrap a `next.config.ts` object with Vapor style-macro support. Wires both
 * the webpack unplugin (for `next dev --webpack` / Next < 16 / production
 * webpack builds) and the Turbopack loader (Next >= 16), so Next picks
 * whichever bundler it runs and everything Just Works.
 *
 *     // next.config.ts
 *     import { withVaporStyle } from '@vapor-ui/style-macro/next';
 *     export default withVaporStyle()({ ...yourNextConfig });
 */
export function withVaporStyle(
    opts: WithVaporStyleOptions = {},
): <T extends NextConfigSubset = NextConfigSubset>(nextConfig?: T) => T {
    const { unstable_turbopack: turbopackOpts = {}, ...unpluginOpts } = opts;
    const { mode = 'auto', glob = DEFAULT_TURBOPACK_GLOB } = turbopackOpts;

    return <T extends NextConfigSubset = NextConfigSubset>(nextConfig: T = {} as T): T => {
        const originalWebpack = nextConfig.webpack;
        const merged: NextConfigSubset = {
            ...nextConfig,
            webpack(config: AnyProp, ctx: AnyProp) {
                config.plugins ??= [];
                config.plugins.push(unplugin.webpack(unpluginOpts));
                return originalWebpack ? originalWebpack(config, ctx) : config;
            },
        };

        const enableTurbopack = mode === 'on' || (mode === 'auto' && detectNext16InConsumer());
        if (!enableTurbopack) return merged as unknown as T;

        // Resolve the loader from the consumer's `node_modules`. Resolving
        // relative to *this* file would break under tsup's CJS output
        // (`import.meta.url` is undefined there) and under pnpm's symlinked
        // package layout it would still pick up the right dist file.
        const cwdRequire = createRequire(path.join(process.cwd(), 'package.json'));
        const loaderPath = cwdRequire.resolve('@vapor-ui/style-macro/turbopack-loader');

        // Turbopack rule options must be JSON-serializable AND cannot carry
        // `undefined` values (its serde layer rejects them). Strip functions
        // (e.g. user-supplied `include`) and drop any undefined field so the
        // resulting object is a pure JSON object.
        const rawLoaderOptions: Record<string, unknown> = {
            manifest: unpluginOpts.manifest,
            importSource: unpluginOpts.importSource,
            importName: unpluginOpts.importName,
            obfuscate: unpluginOpts.obfuscate,
            themeStylesImport: unpluginOpts.themeStylesImport,
            providerImportSource: unpluginOpts.providerImportSource,
            providerImportName: unpluginOpts.providerImportName,
            layerRegistry: unpluginOpts.layerRegistry,
        };
        const loaderOptions = Object.fromEntries(
            Object.entries(rawLoaderOptions).filter(
                ([, v]) => v !== undefined && typeof v !== 'function',
            ),
        );

        const globs = Array.isArray(glob) ? glob : [glob];
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

        return merged as unknown as T;
    };
}
