import { mkdtempSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { vaporNextPlugin } from './next';
import { type VaporRolldownOptions, vaporRolldownPlugin } from './rolldown';
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

describe('adapters return plugin objects', () => {
    it('rolldown() returns a plugin with transform / resolveId / renderChunk', () => {
        const plugin = vaporRolldownPlugin();
        expect(plugin.name).toBe('vapor-style-macro:rolldown');
        expect(typeof plugin.transform).toBe('function');
        expect(typeof plugin.resolveId).toBe('function');
        expect(typeof plugin.renderChunk).toBe('function');
    });

    it('webpack() returns an instance with apply()', () => {
        const plugin = vaporWebpackPlugin() as { apply?: unknown };
        expect(plugin).toBeTypeOf('object');
        expect(typeof plugin.apply).toBe('function');
    });
});

describe('rolldown() adapter — per-module CSS (library build)', () => {
    type Hook = (...args: unknown[]) => unknown;
    type Resolved = { id: string; external: boolean; meta: { css: string } };
    type EmittedAsset = { type: string; name: string; originalFileName: string; source: string };

    function setup(opts: Parameters<typeof vaporRolldownPlugin>[0] = {}) {
        const root = mkdtempSync(join(tmpdir(), 'vapor-rolldown-'));
        writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@acme/ui' }));
        const plugin = vaporRolldownPlugin({ root, hash: true, ...opts }) as unknown as Record<
            string,
            Hook
        >;
        const ctx = {
            error: (m: string) => {
                throw new Error(m);
            },
        };
        const file = join(root, 'src', 'button', 'button.tsx');
        const modules = new Map<string, Resolved>();
        const transform = (code: string, id = file) =>
            plugin.transform!.call(ctx, code, id) as { code: string } | null;
        const resolveId = (source: string, importer = file) => {
            const r = plugin.resolveId!.call(ctx, source, importer) as Resolved | null;
            if (r) modules.set(r.id, r);
            return r;
        };
        /** rolldown 이 하는 일을 흉내: 출력 chunk 의 import 를 보고 renderChunk 호출. */
        const renderChunk = (
            code: string,
            chunk: { fileName: string; imports: string[] },
            fileNameOf: (asset: EmittedAsset) => string = (a) =>
                a.originalFileName.replace(/^src\//, ''),
        ) => {
            const emitted: EmittedAsset[] = [];
            const rendered = plugin.renderChunk!.call(
                {
                    getModuleInfo: (id: string) => modules.get(id) ?? null,
                    emitFile: (f: EmittedAsset) => emitted.push(f) - 1,
                    getFileName: (ref: number) => fileNameOf(emitted[ref]!),
                },
                code,
                chunk,
            ) as { code: string } | null;
            return { code: rendered?.code ?? code, emitted };
        };
        return { root, file, transform, resolveId, renderChunk };
    }

    const SRC = `import { css } from '@vapor-ui/style-macro';\nimport { Box } from './box';\nexport const cls = css({ gap: '0' });\n`;

    it('imports the module CSS right after the last import', () => {
        const { transform } = setup();
        const out = transform(SRC)!;
        expect(out.code).toMatch(
            /import \{ Box \} from '\.\/box';\nimport '\.\/button\.vapor\.css';/,
        );
        expect(out.code).toMatch(/const cls = 'v\w+';/);
    });

    it('adds no import when the module has no css() output', () => {
        const { transform } = setup();
        const out = transform(
            `import { css } from '@vapor-ui/style-macro';\nimport { b } from './b';\nexport const c = css(b);\n`,
        );
        expect(out?.code ?? '').not.toContain('vapor.css');
    });

    it('resolves the module CSS to an external, root-relative id carrying the CSS in meta', () => {
        const { transform, resolveId } = setup();
        transform(SRC);
        const r = resolveId('./button.vapor.css')!;
        // 절대 경로면 rolldown 이 출력 기준 경로로 바꿔 renderChunk 에서 getModuleInfo 가 null 이 된다.
        expect(r.id).toBe('src/button/button.vapor.css');
        expect(r.external).toBe(true);
        expect(r.meta.css).toMatch(/\.v\w+ \{ gap: 0; \}/);
        expect(resolveId('./other.css')).toBeNull();
    });

    it('drops the per-file layer order statement (layers.css owns the order)', () => {
        const { transform, resolveId } = setup({ layer: 'composites' });
        transform(SRC);
        const { css } = resolveId('./button.vapor.css')!.meta;
        expect(css).toMatch(/^@layer composites \{/);
        expect(css).not.toMatch(/@layer composites;/);
    });

    it('renderChunk emits the CSS as an asset named after its source and rewrites the import', () => {
        const { transform, resolveId, renderChunk } = setup();
        const cls = /const cls = '(v\w+)';/.exec(transform(SRC)!.code)![1];
        resolveId('./button.vapor.css');
        const { code, emitted } = renderChunk(`import "src/button/button.vapor.css";\n`, {
            fileName: 'button/button.mjs',
            imports: ['src/button/button.vapor.css', 'react'],
        });
        expect(emitted).toEqual([
            {
                type: 'asset',
                name: 'button.vapor.css',
                originalFileName: 'src/button/button.vapor.css',
                source: expect.stringContaining(`.${cls} {`),
            },
        ]);
        expect(code).toBe(`import "./button.vapor.css";\n`);
    });

    it('output location follows the asset file name rolldown picks (assetFileNames)', () => {
        const { transform, resolveId, renderChunk } = setup();
        transform(SRC);
        resolveId('./button.vapor.css');
        const { code } = renderChunk(
            `require("src/button/button.vapor.css");\n`,
            { fileName: 'button/button.cjs', imports: ['src/button/button.vapor.css'] },
            () => 'assets/button.vapor-abc123.css',
        );
        expect(code).toBe(`require("./../assets/button.vapor-abc123.css");\n`);
    });

    it('leaves chunks without module CSS untouched', () => {
        const { renderChunk } = setup();
        const { emitted } = renderChunk(`import "react";\n`, {
            fileName: 'a.mjs',
            imports: ['react'],
        });
        expect(emitted).toEqual([]);
    });

    it('hashes the package name into class names', () => {
        const a = setup();
        const b = setup();
        writeFileSync(join(b.root, 'package.json'), JSON.stringify({ name: '@other/ui' }));
        const clsA = /'(v\w+)'/.exec(a.transform(SRC)!.code)![1];
        const clsB = /'(v\w+)'/.exec(b.transform(SRC)!.code)![1];
        expect(clsA).not.toBe(clsB);
    });
});

describe('rolldown() adapter — extract (single CSS file)', () => {
    type Hook = (...args: unknown[]) => unknown;
    type Info = {
        id: string;
        isEntry: boolean;
        importers: string[];
        importedIds: string[];
        meta: Record<string, unknown>;
    };

    function setup(extract: VaporRolldownOptions['extract']) {
        const root = mkdtempSync(join(tmpdir(), 'vapor-extract-'));
        writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@acme/ui' }));
        const plugin = vaporRolldownPlugin({ root, hash: true, extract }) as unknown as Record<
            string,
            Hook
        >;
        const ctx = {
            error: (m: string) => {
                throw new Error(m);
            },
        };
        const graph = new Map<string, Info>();
        const add = (id: string, o: Partial<Info>) =>
            graph.set(id, { id, isEntry: false, importers: [], importedIds: [], meta: {}, ...o });

        // index → a, index → b. a and b each use css().
        const src = (name: string, gap: string) =>
            `import { css } from '@vapor-ui/style-macro';\nexport const ${name} = css({ gap: '${gap}' });\n`;
        const files = { a: join(root, 'src', 'a.tsx'), b: join(root, 'src', 'b.tsx') };
        const code = {
            a: (plugin.transform!.call(ctx, src('a', '1px'), files.a) as { code: string }).code,
            b: (plugin.transform!.call(ctx, src('b', '2px'), files.b) as { code: string }).code,
        };
        const cssA = plugin.resolveId!.call(ctx, './a.vapor.css', files.a) as Info;
        const cssB = plugin.resolveId!.call(ctx, './b.vapor.css', files.b) as Info;
        add('index', { isEntry: true, importedIds: [files.a, files.b] });
        add(files.a, { importers: ['index'], importedIds: [cssA.id] });
        add(files.b, { importers: ['index'], importedIds: [cssB.id] });
        add(cssA.id, { importers: [files.a], meta: cssA.meta });
        add(cssB.id, { importers: [files.b], meta: cssB.meta });

        const emitted: Array<{ type: string; name: string; source: string }> = [];
        const warn: string[] = [];
        plugin.buildStart?.call({});
        // re-run transforms after buildStart cleared state is not needed: buildStart runs first in rolldown
        plugin.buildEnd?.call({
            getModuleIds: () => graph.keys(),
            getModuleInfo: (id: string) => graph.get(id) ?? null,
            emitFile: (f: (typeof emitted)[number]) => emitted.push(f),
            warn: (m: string) => warn.push(m),
        });
        const render = (chunkCode: string, imports: string[]) =>
            plugin.renderChunk!.call(
                {
                    getModuleInfo: (id: string) => graph.get(id) ?? null,
                    emitFile: () => {
                        throw new Error('extract mode must not emit per-module assets');
                    },
                    getFileName: () => '',
                },
                chunkCode,
                { fileName: 'a.mjs', imports },
            ) as { code: string } | null;
        const generate = (
            bundle: Record<string, { type: string; code?: string; imports?: string[] }>,
        ) => {
            plugin.generateBundle!.call({}, {}, bundle);
            return bundle;
        };
        return { code, cssA, cssB, emitted, render, generate };
    }

    it('without extract: no single CSS file', () => {
        const plugin = vaporRolldownPlugin() as unknown as Record<string, Hook>;
        expect(plugin.buildEnd).toBeUndefined();
    });

    it('extract: true emits one index.css with every module CSS in import order', () => {
        const { emitted, code } = setup(true);
        expect(emitted).toHaveLength(1);
        expect(emitted[0]).toMatchObject({ type: 'asset', name: 'index.css' });
        const clsA = /'(v\w+)'/.exec(code.a)![1];
        const clsB = /'(v\w+)'/.exec(code.b)![1];
        const css = emitted[0]!.source;
        expect(css.indexOf(`.${clsA}`)).toBeGreaterThan(-1);
        expect(css.indexOf(`.${clsA}`)).toBeLessThan(css.indexOf(`.${clsB}`));
    });

    it('extract: { name } sets the file name', () => {
        expect(setup({ name: 'styles.css' }).emitted[0]).toMatchObject({ name: 'styles.css' });
    });

    it('extract: renderChunk does not emit per-module assets', () => {
        const { render, cssA } = setup(true);
        expect(render(`import "${cssA.id}";\n`, [cssA.id])).toBeNull();
    });

    it('extract: strips the per-module CSS imports from the output', () => {
        const { generate, cssA } = setup(true);
        const bundle = generate({
            'a.mjs': {
                type: 'chunk',
                code: `import "${cssA.id}";\nexport const a = 1;\n`,
                imports: [cssA.id],
            },
            'a.cjs': {
                type: 'chunk',
                code: `require("${cssA.id}");\nexports.a = 1;\n`,
                imports: [cssA.id],
            },
            'react.mjs': { type: 'chunk', code: `import "react";\n`, imports: ['react'] },
        });
        expect(bundle['a.mjs']!.code).toBe('export const a = 1;\n');
        expect(bundle['a.cjs']!.code).toBe('exports.a = 1;\n');
        expect(bundle['react.mjs']!.code).toBe('import "react";\n');
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
