import { mkdtempSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { vaporNextPlugin } from './next';
import { vaporRolldownPlugin } from './rolldown';
import { vaporVitePlugin } from './vite';
import { vaporWebpackPlugin } from './webpack';

describe('vite adapter — FOUC plugin composition', () => {
    function foucOf(plugins: Array<{ name: string; transformIndexHtml?: unknown }>) {
        return plugins.find((p) => p.name === 'vapor-style-macro:fouc') as
            { name: string; transformIndexHtml: (html: string) => string } | undefined;
    }

    it('returns an array containing both the base plugin and the FOUC plugin by default', () => {
        const plugins = vaporVitePlugin();
        expect(Array.isArray(plugins)).toBe(true);
        const names = plugins.map((p) => p.name);
        expect(names).toContain('vapor-style-macro');
        expect(names).toContain('vapor-style-macro:fouc');
    });

    it('omits the FOUC plugin when injectColorScheme is false', () => {
        const plugins = vaporVitePlugin({ injectColorScheme: false });
        const names = plugins.map((p) => p.name);
        expect(names).toContain('vapor-style-macro');
        expect(names).not.toContain('vapor-style-macro:fouc');
    });

    it('FOUC plugin injects <script> guard right after <head>', () => {
        const fouc = foucOf(vaporVitePlugin({ injectColorScheme: true }));
        expect(fouc).toBeDefined();
        const html = '<!doctype html><html><head><title>t</title></head><body></body></html>';
        const out = fouc!.transformIndexHtml(html);
        expect(out).toContain('<script>');
        expect(out).toContain('data-vapor-theme');
        expect(out).toMatch(/<head>\s*<script>/);
    });

    it('FOUC plugin honors custom ColorScheme opts', () => {
        const fouc = foucOf(
            vaporVitePlugin({
                injectColorScheme: {
                    storageKey: 'my-key',
                    attribute: 'data-my-theme',
                    defaultTheme: 'dark',
                },
            }),
        );
        const html = '<!doctype html><html><head></head><body></body></html>';
        const out = fouc!.transformIndexHtml(html);
        expect(out).toContain('"my-key"');
        expect(out).toContain('"data-my-theme"');
        expect(out).toContain('"dark"');
    });
});

// The webpack adapter composes `unplugin.webpack(opts).apply` with
// `tapVirtualModulesPlugin` and `tapHtmlFouc`. `base.apply(compiler)`
// touches real webpack internals (plugin registration via Compiler
// hooks like `thisCompilation`), which this test environment doesn't
// mock. Behavioral coverage for the FOUC pipeline (buildColorSchemeScript
// output, <head> regex replace) lives in `fouc-script.test.ts` and the
// vite adapter block above — same script string, same regex.

describe('adapter subpath default exports', () => {
    it.each([
        ['vite', vaporVitePlugin],
        ['webpack', vaporWebpackPlugin],
        ['rolldown', vaporRolldownPlugin],
        ['next', vaporNextPlugin],
    ])('%s exports a callable', (_name, adapter) => {
        expect(typeof adapter).toBe('function');
    });
});

describe('unplugin-backed adapters return a plugin object', () => {
    it('rolldown() returns a descriptor with `name`', () => {
        const plugin = vaporRolldownPlugin();
        expect(plugin).toBeTypeOf('object');
        expect(plugin).not.toBeNull();
        expect((plugin as { name?: string }).name).toBe('vapor-style-macro');
    });

    it('rolldown() has no generateBundle hook unless cssFileName is set', () => {
        const plugin = vaporRolldownPlugin() as { generateBundle?: unknown };
        expect(plugin.generateBundle).toBeUndefined();
    });

    it('webpack() returns an instance with apply()', () => {
        const plugin = vaporWebpackPlugin() as { apply?: unknown };
        expect(plugin).toBeTypeOf('object');
        expect(typeof plugin.apply).toBe('function');
    });
});

describe('rolldown() adapter — cssFileName (library build sheet)', () => {
    type Emitted = { type: string; fileName: string; source: string };
    type Bundle = Record<string, { type: 'chunk'; moduleIds: string[] } | { type: 'asset' }>;
    type GenerateBundle = (
        this: { emitFile(file: Emitted): void },
        options: unknown,
        bundle: Bundle,
    ) => void;

    function project() {
        const root = mkdtempSync(join(tmpdir(), 'vapor-rolldown-'));
        const write = (name: string, body: string) => {
            const file = join(root, name);
            writeFileSync(file, `import { css } from '@vapor-ui/style-macro';\n${body}\n`);
            return file;
        };
        return {
            root,
            a: write('a.tsx', `export const a = css({ paddingTop: '$space-100' });`),
            b: write('b.tsx', `export const b = css({ color: '$fg-primary' });`),
            unbundled: write('c.stories.tsx', `export const c = css({ marginTop: '$space-200' });`),
            plain: join(root, 'plain.ts'),
        };
    }

    function run(opts: Parameters<typeof vaporRolldownPlugin>[0], bundle: Bundle) {
        const plugin = vaporRolldownPlugin(opts) as { generateBundle?: GenerateBundle };
        const emitted: Emitted[] = [];
        plugin.generateBundle?.call({ emitFile: (f) => emitted.push(f) }, {}, bundle);
        return emitted;
    }

    it('emits one sheet from the css() rules of bundled modules only', () => {
        const p = project();
        writeFileSync(p.plain, 'export const x = 1;\n');
        const emitted = run(
            { root: p.root, hash: true, cssFileName: 'styles.css' },
            {
                'a.mjs': { type: 'chunk', moduleIds: [p.a, p.plain] },
                'b.mjs': { type: 'chunk', moduleIds: [p.b, '\0virtual:x'] },
                'x.css': { type: 'asset' },
            },
        );

        expect(emitted).toHaveLength(1);
        expect(emitted[0]).toMatchObject({ type: 'asset', fileName: 'styles.css' });
        const css = emitted[0]!.source;
        expect(css.match(/@layer vapor-utilities \{/g)).toHaveLength(1);
        expect(css).toContain('padding-top');
        expect(css).toContain('--vapor-color-foreground-primary');
        expect(css).not.toContain('margin-top'); // stories file was not in the bundle
    });

    it('class names in the sheet match the JS transform output (same hash mode)', async () => {
        const p = project();
        const plugin = vaporRolldownPlugin({ root: p.root, hash: true, cssFileName: 's.css' }) as {
            transform: { handler?: Function } | Function;
        };
        const transform =
            typeof plugin.transform === 'function' ? plugin.transform : plugin.transform.handler!;
        const code = (await transform.call(
            {
                error: (m: string) => {
                    throw new Error(m);
                },
            },
            `import { css } from '@vapor-ui/style-macro';\nexport const a = css({ paddingTop: '$space-100' });\n`,
            p.a,
        )) as { code: string };
        const cls = code.code.match(/['"](_[^'"\s]+)['"]/)?.[1];
        expect(cls).toBeDefined();

        const [sheet] = run(
            { root: p.root, hash: true, cssFileName: 's.css' },
            { 'a.mjs': { type: 'chunk', moduleIds: [p.a] } },
        );
        expect(sheet!.source).toContain(`.${cls} {`);
    });

    it('emits the library sheet into the configured layer', () => {
        const p = project();
        const [sheet] = run(
            { root: p.root, hash: true, cssFileName: 'styles.css', layer: 'composites' },
            { 'a.mjs': { type: 'chunk', moduleIds: [p.a] } },
        );
        expect(sheet!.source).toMatch(/@layer composites \{[\s\S]*padding-top/);
        expect(sheet!.source).not.toContain('vapor-utilities');
    });

    it('still emits an (empty) sheet when no bundled module uses css()', () => {
        const p = project();
        writeFileSync(p.plain, 'export const x = 1;\n');
        const emitted = run(
            { root: p.root, cssFileName: 'styles.css' },
            { 'a.mjs': { type: 'chunk', moduleIds: [p.plain] } },
        );
        expect(emitted).toHaveLength(1);
        expect(emitted[0]!.source).not.toContain('@layer vapor-utilities {');
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

describe('next() adapter — curried API: vaporNextPlugin(opts)(config)', () => {
    it('returns the config verbatim shape when nothing to wire', () => {
        const input: TestNextConfig = { reactStrictMode: true };
        const output = vaporNextPlugin({ mode: 'webpack' })(input);
        expect(output).toMatchObject({ reactStrictMode: true });
    });

    it('wires webpack in `mode: webpack`', () => {
        const output = vaporNextPlugin({ mode: 'webpack' })<TestNextConfig>({});
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
        const output = vaporNextPlugin({ mode: 'turbopack' })<TestNextConfig>({});
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
        const output = vaporNextPlugin({ mode: 'webpack' })<TestNextConfig>({
            webpack: userWebpack,
        });
        const cssRule = { test: /\.css$/, use: ['next/dist/compiled/css-loader'] };
        const config: { plugins?: unknown[]; module: { rules: unknown[] } } = {
            module: { rules: [{ oneOf: [cssRule] }] },
        };
        const returned = output.webpack?.(config, {}) as { plugins?: unknown[] } | undefined;
        expect(returned?.plugins).toContainEqual({ marker: 'user-plugin' });
        // css-loader 체인 끝에 수집 loader 가 붙는다 (webpack 은 뒤에서 앞으로 실행).
        const last = cssRule.use[cssRule.use.length - 1] as { loader?: string };
        expect(String(last.loader ?? last)).toMatch(/css-loader\.[cm]?js$/);
    });

    it('throws when no Next.js CSS rule can be found (pipeline changed)', () => {
        const output = vaporNextPlugin({ mode: 'webpack' })<TestNextConfig>({});
        expect(() => output.webpack?.({ module: { rules: [] } }, {})).toThrow(/CSS loader rules/);
    });

    it.skipIf(!turbopackBuilt)('merges into existing turbopack.rules without clobbering', () => {
        const output = vaporNextPlugin({ mode: 'turbopack' })<TestNextConfig>({
            turbopack: {
                rules: {
                    '*.svg': { loaders: ['svg-loader'] },
                },
            },
        });
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
                const turboOutput = vaporNextPlugin({ mode: 'auto' })<TestNextConfig>({});
                expect(turboOutput.turbopack?.rules).toBeTypeOf('object');
                expect(turboOutput.webpack).toBeUndefined();
            }

            delete process.env.TURBOPACK;
            const webpackOutput = vaporNextPlugin({ mode: 'auto' })<TestNextConfig>({});
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
