import { createRequire } from 'node:module';

import vaporStyle from '~/index';

import esbuild from './esbuild';
import farm from './farm';
import next from './next';
import rolldown from './rolldown';
import rollup from './rollup';
import rspack from './rspack';
import vite from './vite';
import webpack from './webpack';

describe('adapter subpath default exports', () => {
    it.each([
        ['vite', vite],
        ['rollup', rollup],
        ['webpack', webpack],
        ['rspack', rspack],
        ['esbuild', esbuild],
        ['farm', farm],
        ['rolldown', rolldown],
        ['next', next],
    ])('%s exports a callable', (_name, adapter) => {
        expect(typeof adapter).toBe('function');
    });
});

describe('merged default export', () => {
    it('exposes every bundler adapter by name', () => {
        expect(Object.keys(vaporStyle).sort()).toEqual(
            ['esbuild', 'farm', 'next', 'rolldown', 'rollup', 'rspack', 'vite', 'webpack'].sort(),
        );
    });

    it('every method is the same reference as its dedicated subpath', () => {
        expect(vaporStyle.vite).toBe(vite);
        expect(vaporStyle.rollup).toBe(rollup);
        expect(vaporStyle.webpack).toBe(webpack);
        expect(vaporStyle.rspack).toBe(rspack);
        expect(vaporStyle.esbuild).toBe(esbuild);
        expect(vaporStyle.farm).toBe(farm);
        expect(vaporStyle.rolldown).toBe(rolldown);
        expect(vaporStyle.next).toBe(next);
    });
});

describe('unplugin-backed adapters return a plugin object', () => {
    // Adapters that return an inspectable plugin descriptor with a `name`
    // field (`{ name, ...hooks }` shape).
    it.each([
        ['vite', vite],
        ['rollup', rollup],
        ['esbuild', esbuild],
        ['farm', farm],
        ['rolldown', rolldown],
    ])('%s() returns a descriptor with `name`', (_name, adapter) => {
        const plugin = adapter();
        expect(plugin).toBeTypeOf('object');
        expect(plugin).not.toBeNull();
        expect((plugin as { name?: string }).name).toBe('vapor-style-macro');
    });

    // webpack/rspack unplugin adapters return a plugin CLASS INSTANCE — the
    // `name` lives on the constructor or is set once `apply(compiler)` runs.
    // Assert instead on the `apply` hook every webpack-family plugin exposes.
    it.each([
        ['webpack', webpack],
        ['rspack', rspack],
    ])('%s() returns an instance with apply()', (_name, adapter) => {
        const plugin = adapter() as { apply?: unknown };
        expect(plugin).toBeTypeOf('object');
        expect(typeof plugin.apply).toBe('function');
    });
});

// Local structural view of NextConfig used to type-check assertions on the
// `next()` return value. The runtime shape carries `webpack` / `turbopack`
// after wiring; the exported generic just returns `T` verbatim so tests
// need their own explicit view.
type TestNextConfig = {
    reactStrictMode?: boolean;
    webpack?: (config: unknown, ctx: unknown) => unknown;
    turbopack?: { rules?: Record<string, unknown> };
};

describe('next() adapter', () => {
    it('returns the config verbatim shape when nothing to wire', () => {
        const input: TestNextConfig = { reactStrictMode: true };
        const output = next(input, { mode: 'webpack' });
        expect(output).toMatchObject({ reactStrictMode: true });
    });

    it('wires webpack in `mode: webpack`', () => {
        const output = next<TestNextConfig>({}, { mode: 'webpack' });
        expect(typeof output.webpack).toBe('function');
        expect(output.turbopack).toBeUndefined();
    });

    // Turbopack-mode assertions require the built `dist/turbopack.js` so
    // that `require.resolve('@vapor-ui/style-macro/turbopack')` inside
    // `next.ts` succeeds. Gate on presence of the built artefact — this
    // smoke test stays green in a fresh checkout, and turns on once
    // `tsup` has produced dist.
    const turbopackBuilt = (() => {
        try {
            const req = createRequire(import.meta.url);
            req.resolve('@vapor-ui/style-macro/turbopack');
            return true;
        } catch {
            return false;
        }
    })();

    it.skipIf(!turbopackBuilt)('wires turbopack in `mode: turbopack`', () => {
        const output = next<TestNextConfig>({}, { mode: 'turbopack' });
        expect(output.webpack).toBeUndefined();
        expect(output.turbopack?.rules).toBeTypeOf('object');
    });

    it('preserves the user-supplied webpack fn', () => {
        const userWebpack = (cfg: unknown) => {
            const c = cfg as { plugins?: unknown[] };
            c.plugins ??= [];
            c.plugins.push({ marker: 'user-plugin' });
            return c;
        };
        const output = next<TestNextConfig>({ webpack: userWebpack }, { mode: 'webpack' });
        const config: { plugins?: unknown[] } = {};
        const returned = output.webpack?.(config, {}) as { plugins?: unknown[] } | undefined;
        expect(returned?.plugins).toContainEqual({ marker: 'user-plugin' });
    });

    it.skipIf(!turbopackBuilt)('merges into existing turbopack.rules without clobbering', () => {
        const output = next<TestNextConfig>(
            {
                turbopack: {
                    rules: {
                        '*.svg': { loaders: ['svg-loader'] },
                    },
                },
            },
            { mode: 'turbopack' },
        );
        expect(output.turbopack?.rules?.['*.svg']).toEqual({ loaders: ['svg-loader'] });
        const ruleKeys = Object.keys(output.turbopack?.rules ?? {});
        expect(ruleKeys.length).toBeGreaterThan(1);
    });

    it('mode: auto follows process.env.TURBOPACK', () => {
        const prev = process.env.TURBOPACK;
        try {
            // Turbopack branch — only run the assertion body if the dist
            // artefact exists; without it, `next()` throws on the internal
            // `require.resolve`. Still exercise the webpack branch below.
            if (turbopackBuilt) {
                process.env.TURBOPACK = '1';
                const turboOutput = next<TestNextConfig>({}, { mode: 'auto' });
                expect(turboOutput.turbopack?.rules).toBeTypeOf('object');
                expect(turboOutput.webpack).toBeUndefined();
            }

            delete process.env.TURBOPACK;
            const webpackOutput = next<TestNextConfig>({}, { mode: 'auto' });
            expect(typeof webpackOutput.webpack).toBe('function');
            expect(webpackOutput.turbopack).toBeUndefined();
        } finally {
            if (prev === undefined) {
                delete process.env.TURBOPACK;
            } else {
                process.env.TURBOPACK = prev;
            }
        }
    });
});
