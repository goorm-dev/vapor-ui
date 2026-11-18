import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { vaporNextPlugin } from './next';
import { type VaporRolldownOptions, vaporRolldownPlugin } from './rolldown';
import { vaporVitePlugin } from './vite';
import { applyModuleCss, moduleCssRule, tapHtmlFouc, vaporWebpackPlugin } from './webpack';

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

    it('FOUC plugin injects the guard script at the start of <head>', () => {
        const fouc = foucOf(vaporVitePlugin({ injectColorScheme: true }));
        const [tag] = fouc!.transformIndexHtml('') as unknown as Array<{
            tag: string;
            injectTo: string;
            children: string;
        }>;
        expect(tag).toMatchObject({ tag: 'script', injectTo: 'head-prepend' });
        expect(tag!.children).toContain('data-vapor-theme');
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
        const out = JSON.stringify(fouc!.transformIndexHtml(''));
        expect(out).toContain('my-key');
        expect(out).toContain('data-my-theme');
        expect(out).toContain('dark');
    });
});

describe("webpack adapter — FOUC guard via the app's html-webpack-plugin", () => {
    type Groups = { headTags: Array<{ tagName: string; innerHTML?: string }> };
    function fakeHtmlPlugin() {
        const taps: Array<(d: Groups) => Groups | void> = [];
        class HtmlWebpackPlugin {
            static getHooks() {
                return {
                    alterAssetTagGroups: {
                        tap: (_: string, fn: (d: Groups) => Groups | void) => taps.push(fn),
                    },
                };
            }
        }
        return { HtmlWebpackPlugin, taps };
    }
    function compilerWith(plugins: unknown[]) {
        const compilations: Array<(c: unknown) => void> = [];
        const compiler = {
            options: { module: { rules: [] }, resolve: {}, plugins },
            hooks: {
                compilation: {
                    tap: (_: string, fn: (c: unknown) => void) => compilations.push(fn),
                },
            },
        };
        return {
            compiler,
            compile: () => {
                for (const f of compilations) f({});
            },
        };
    }

    it('prepends the guard to the head tags of the plugin instance in the app config', () => {
        const { HtmlWebpackPlugin, taps } = fakeHtmlPlugin();
        const { compiler, compile } = compilerWith([new HtmlWebpackPlugin()]);
        tapHtmlFouc(compiler, {});
        compile();
        const out = taps[0]!({ headTags: [{ tagName: 'meta' }] }) as Groups;
        expect(out.headTags.map((t) => t.tagName)).toEqual(['script', 'meta']);
        expect(out.headTags[0]!.innerHTML).toContain('data-vapor-theme');
    });

    it('does nothing without html-webpack-plugin in the config', () => {
        const { compiler } = compilerWith([{}]);
        const tap = vi.spyOn(compiler.hooks.compilation, 'tap');
        tapHtmlFouc(compiler, {});
        expect(tap).not.toHaveBeenCalled();
    });

    it('does nothing when injectColorScheme is false', () => {
        const { HtmlWebpackPlugin, taps } = fakeHtmlPlugin();
        const { compiler, compile } = compilerWith([new HtmlWebpackPlugin()]);
        tapHtmlFouc(compiler, false);
        compile();
        expect(taps).toHaveLength(0);
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

describe('webpack() adapter — module CSS rule', () => {
    // loader 는 실행 중인 모듈 옆 파일로 찾는다 — 소스로 돌 때 dist 가 필요 없다.
    const here = dirname(fileURLToPath(import.meta.url));

    it('points the CSS loader at the sibling module (no dist needed)', () => {
        const loader = moduleCssRule({}).use[0]!.loader;
        expect(loader).toBe(join(here, 'css-loader.ts'));
        expect(existsSync(loader)).toBe(true);
    });

    it('points the Turbopack JS loader at the sibling module (no dist needed)', () => {
        const output = vaporNextPlugin({ mode: 'turbopack' })<TestNextConfig>({});
        const [js] = Object.values(output.turbopack!.rules!)[0] as Array<{
            loaders: Array<{ loader: string }>;
        }>;
        expect(js!.loaders[0]!.loader).toBe(join(here, 'turbopack.ts'));
    });

    it('aliases the placeholder specifier to the real file (exports patterns would swallow the query)', () => {
        const compiler = {
            context: '/repo',
            options: { module: { rules: [] as unknown[] }, resolve: {} as { alias?: unknown } },
            hooks: { compilation: { tap: () => {} } },
        };
        applyModuleCss(compiler, {});
        expect(compiler.options.resolve.alias).toEqual({
            '@vapor-ui/style-macro/module.vapor.css$': expect.stringMatching(
                /style-macro[\\/]module\.vapor\.css$/,
            ),
        });
        expect(compiler.options.module.rules).toHaveLength(1);
    });

    it('keeps an existing array alias config', () => {
        const compiler = {
            context: '/repo',
            options: {
                module: { rules: [] as unknown[] },
                resolve: { alias: [{ name: 'x', alias: 'y' }] as unknown },
            },
            hooks: { compilation: { tap: () => {} } },
        };
        applyModuleCss(compiler, {});
        expect(compiler.options.resolve.alias).toEqual([
            { name: 'x', alias: 'y' },
            {
                name: '@vapor-ui/style-macro/module.vapor.css',
                alias: expect.stringMatching(/module\.vapor\.css$/),
                onlyModule: true,
            },
        ]);
    });

    it('runs the CSS loader first on module CSS requests', () => {
        const rule = moduleCssRule({ layer: 'acme', injectColorScheme: false });
        expect(rule).toMatchObject({
            enforce: 'pre',
            test: /module\.vapor\.css$/,
            resourceQuery: /vapor-src=/,
            sideEffects: true,
        });
        expect(rule.use[0]!.loader).toMatch(/css-loader\.[cm]?[jt]s$/);
        // loader 옵션은 직렬화 가능한 값만 (Turbopack 과 같은 형태).
        // root 는 넘기지 않는다 — loader 가 번들러의 rootContext 를 쓴다 (Vanilla Extract 와 같음).
        expect(rule.use[0]!.options).toEqual({ layer: 'acme' });
        expect(moduleCssRule({ root: '/custom' }).use[0]!.options).toEqual({ root: '/custom' });
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
            /import \{ Box \} from '\.\/box';\nimport '\.\/button\.tsx\.vapor\.css';/,
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
        const r = resolveId('./button.tsx.vapor.css')!;
        // 절대 경로면 rolldown 이 출력 기준 경로로 바꿔 renderChunk 에서 getModuleInfo 가 null 이 된다.
        expect(r.id).toBe('src/button/button.tsx.vapor.css');
        expect(r.external).toBe(true);
        expect(r.meta.css).toMatch(/\.v\w+ \{ gap: 0; \}/);
        expect(resolveId('./other.css')).toBeNull();
    });

    it('drops the per-file layer order statement (layers.css owns the order)', () => {
        const { transform, resolveId } = setup({ layer: 'vapor-composites' });
        transform(SRC);
        const { css } = resolveId('./button.tsx.vapor.css')!.meta;
        expect(css).toMatch(/^@layer vapor-composites \{/);
        expect(css).not.toMatch(/@layer vapor-composites;/);
    });

    it('renderChunk emits the CSS as an asset named after its source and rewrites the import', () => {
        const { transform, resolveId, renderChunk } = setup();
        const cls = /const cls = '(v\w+)';/.exec(transform(SRC)!.code)![1];
        resolveId('./button.tsx.vapor.css');
        const { code, emitted } = renderChunk(`import "src/button/button.tsx.vapor.css";\n`, {
            fileName: 'button/button.mjs',
            imports: ['src/button/button.tsx.vapor.css', 'react'],
        });
        expect(emitted).toEqual([
            {
                type: 'asset',
                name: 'button.tsx.vapor.css',
                originalFileName: 'src/button/button.tsx.vapor.css',
                source: expect.stringContaining(`.${cls} {`),
            },
        ]);
        expect(code).toBe(`import "./button.tsx.vapor.css";\n`);
    });

    it('output location follows the asset file name rolldown picks (assetFileNames)', () => {
        const { transform, resolveId, renderChunk } = setup();
        transform(SRC);
        resolveId('./button.tsx.vapor.css');
        const { code } = renderChunk(
            `require("src/button/button.tsx.vapor.css");\n`,
            { fileName: 'button/button.cjs', imports: ['src/button/button.tsx.vapor.css'] },
            () => 'assets/button.tsx.vapor-abc123.css',
        );
        expect(code).toBe(`require("./../assets/button.tsx.vapor-abc123.css");\n`);
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
        dynamicallyImportedIds: string[];
        meta: Record<string, unknown>;
    };

    async function setup(extract: VaporRolldownOptions['extract']) {
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
            graph.set(id, {
                id,
                isEntry: false,
                importers: [],
                importedIds: [],
                dynamicallyImportedIds: [],
                meta: {},
                ...o,
            });

        // index → a, index → b. a and b each use css().
        const src = (name: string, gap: string) =>
            `import { css } from '@vapor-ui/style-macro';\nexport const ${name} = css({ gap: '${gap}' });\n`;
        const files = { a: join(root, 'src', 'a.tsx'), b: join(root, 'src', 'b.tsx') };
        const code = {
            a: (plugin.transform!.call(ctx, src('a', '1px'), files.a) as { code: string }).code,
            b: (plugin.transform!.call(ctx, src('b', '2px'), files.b) as { code: string }).code,
        };
        const cssA = plugin.resolveId!.call(ctx, './a.tsx.vapor.css', files.a) as Info;
        const cssB = plugin.resolveId!.call(ctx, './b.tsx.vapor.css', files.b) as Info;
        add('index', { isEntry: true, importedIds: [files.a, files.b] });
        add(files.a, { importers: ['index'], importedIds: [cssA.id] });
        add(files.b, { importers: ['index'], importedIds: [cssB.id] });
        // rolldown 은 external 모듈의 importers 를 채우지 않는다 (실측: 항상 []).
        add(cssA.id, { meta: cssA.meta });
        add(cssB.id, { meta: cssB.meta });

        const emitted: Array<{ type: string; name: string; source: string }> = [];
        const warn: string[] = [];
        // re-run transforms after buildStart cleared state is not needed: buildStart runs first in rolldown
        await plugin.buildEnd?.call({
            resolve: async () => null,
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

    it('extract: true emits one index.css with every module CSS in import order', async () => {
        const { emitted, code } = await setup(true);
        expect(emitted).toHaveLength(1);
        expect(emitted[0]).toMatchObject({ type: 'asset', name: 'index.css' });
        const clsA = /'(v\w+)'/.exec(code.a)![1];
        const clsB = /'(v\w+)'/.exec(code.b)![1];
        const css = emitted[0]!.source;
        expect(css.indexOf(`.${clsA}`)).toBeGreaterThan(-1);
        expect(css.indexOf(`.${clsA}`)).toBeLessThan(css.indexOf(`.${clsB}`));
    });

    describe('extract order = ES module evaluation order (dependencies first, in import order)', () => {
        const ctx = {
            error: (m: string) => {
                throw new Error(m);
            },
        };
        const src = (name: string) =>
            `import { css } from '@vapor-ui/style-macro';\nexport const ${name} = css({ gap: '1px' });\n`;

        /** 모듈 그래프를 rolldown 모양으로 만들고 extract 결과의 CSS 순서(모듈 이름)를 돌려준다. */
        async function order(
            entries: string[],
            imports: Record<string, string[]>,
            dynamic: Record<string, string[]> = {},
        ): Promise<string[]> {
            const root = mkdtempSync(join(tmpdir(), 'vapor-order-'));
            writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@acme/ui' }));
            const plugin = vaporRolldownPlugin({
                root,
                hash: false,
                extract: true,
            }) as unknown as Record<string, Hook>;
            const names = new Set([
                ...entries,
                ...Object.keys(imports),
                ...Object.values(imports).flat(),
                ...Object.values(dynamic).flat(),
            ]);
            const file = (n: string) => join(root, 'src', `${n}.tsx`);
            const graph = new Map<string, Info>();
            const cssOf = new Map<string, string>();
            for (const n of names) {
                plugin.transform!.call(ctx, src(n), file(n));
                const css = plugin.resolveId!.call(ctx, `./${n}.tsx.vapor.css`, file(n)) as Info;
                cssOf.set(css.id, n);
                graph.set(css.id, {
                    id: css.id,
                    isEntry: false,
                    importers: [],
                    importedIds: [],
                    dynamicallyImportedIds: [],
                    meta: css.meta,
                });
                // 모듈 CSS import 는 그 모듈의 마지막 import 뒤에 들어간다.
                graph.set(file(n), {
                    id: file(n),
                    isEntry: entries.includes(n),
                    importers: [],
                    importedIds: [...(imports[n] ?? []).map(file), css.id],
                    dynamicallyImportedIds: (dynamic[n] ?? []).map(file),
                    meta: {},
                });
            }
            for (const m of graph.values())
                for (const d of m.importedIds)
                    graph.get(d)!.importers.length >= 0 &&
                        !cssOf.has(d) &&
                        graph.get(d)!.importers.push(m.id);
            const emitted: Array<{ source: string }> = [];
            plugin.buildStart!.call(
                {},
                { input: Object.fromEntries(entries.map((e) => [e, file(e)])) },
            );
            await plugin.buildEnd!.call({
                resolve: async (s: string) => (graph.has(s) ? { id: s } : null),
                // 발견 순서는 import 순서와 다를 수 있다 — 일부러 뒤집어 넘긴다.
                getModuleIds: () => [...graph.keys()].reverse().values(),
                getModuleInfo: (id: string) => graph.get(id) ?? null,
                emitFile: (f: { source: string }) => emitted.push(f),
                warn: () => {},
            });
            const out = emitted[0]!.source;
            return [...cssOf.values()]
                .map((n) => [n, out.indexOf(`.${n}_`)] as const)
                .sort((a, b) => a[1] - b[1])
                .map(([n]) => n);
        }

        it('a dependency before its importer', async () => {
            expect(await order(['button'], { button: ['shared'] })).toEqual(['shared', 'button']);
        });

        it('siblings in import order', async () => {
            expect(await order(['index'], { index: ['a', 'b'] })).toEqual(['a', 'b', 'index']);
        });

        it('a shared module at its first evaluation', async () => {
            expect(await order(['index'], { index: ['a', 'b'], a: ['s'], b: ['s'] })).toEqual([
                's',
                'a',
                'b',
                'index',
            ]);
        });

        it('entries in buildStart input order, shared modules once', async () => {
            expect(await order(['x', 'y'], { x: ['s'], y: ['s', 't'] })).toEqual([
                's',
                'x',
                't',
                'y',
            ]);
        });

        it('a cycle stops at the module already being evaluated', async () => {
            expect(await order(['a'], { a: ['b'], b: ['a'] })).toEqual(['b', 'a']);
        });

        it('dynamic imports after all static code', async () => {
            expect(await order(['index'], { index: ['a'] }, { index: ['lazy'] })).toEqual([
                'a',
                'index',
                'lazy',
            ]);
        });
    });

    it('extract: { name } sets the file name', async () => {
        expect((await setup({ name: 'styles.css' })).emitted[0]).toMatchObject({
            name: 'styles.css',
        });
    });

    it('extract: renderChunk does not emit per-module assets', async () => {
        const { render, cssA } = await setup(true);
        expect(render(`import "${cssA.id}";\n`, [cssA.id])).toBeNull();
    });

    it('extract: strips the per-module CSS imports from the output', async () => {
        const { generate, cssA } = await setup(true);
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

    it('wires turbopack in `mode: turbopack`', () => {
        const output = vaporNextPlugin({ mode: 'turbopack' })<TestNextConfig>({});
        expect(output.webpack).toBeUndefined();
        expect(output.turbopack?.rules).toBeTypeOf('object');
    });

    it('preserves the user-supplied webpack fn and adds the vapor plugin', () => {
        const userWebpack = (cfg: unknown) => {
            const c = cfg as { plugins?: unknown[] };
            c.plugins ??= [];
            c.plugins.push({ marker: 'user-plugin' });
            return c;
        };
        const output = vaporNextPlugin({ mode: 'webpack' })<TestNextConfig>({
            webpack: userWebpack,
        });
        const config: { plugins?: unknown[]; module: { rules: unknown[] } } = {
            module: { rules: [] },
        };
        const returned = output.webpack?.(config, { dir: '/repo' }) as
            { plugins?: unknown[] } | undefined;
        expect(returned?.plugins).toContainEqual({ marker: 'user-plugin' });
        expect(returned?.plugins?.length).toBe(2);
    });

    it('does not inject Next ctx.dir as root (webpack compiler.context is used)', () => {
        const output = vaporNextPlugin({ mode: 'webpack' })<TestNextConfig>({});
        const config: {
            plugins: Array<{ apply(c: unknown): void }>;
            module: { rules: unknown[] };
        } = { plugins: [], module: { rules: [] } };
        output.webpack?.(config, { dir: '/repo' });
        const rules: Array<{ test?: unknown; use?: Array<{ options: Record<string, unknown> }> }> =
            [];
        config.plugins[0]!.apply({
            context: '/repo',
            options: { module: { rules }, resolve: {} },
            hooks: new Proxy({}, { get: () => ({ tap: () => {}, tapAsync: () => {} }) }),
            webpack: { version: '5.0.0' },
        });
        const cssRule = rules.find((r) => String(r.test).includes('vapor'));
        expect(cssRule!.use![0]!.options).not.toHaveProperty('root');
    });

    it('merges into existing turbopack.rules without clobbering', () => {
        const output = vaporNextPlugin({ mode: 'turbopack' })<TestNextConfig>({
            turbopack: {
                rules: {
                    '*.svg': { loaders: ['svg-loader'] },
                    '*.css': { loaders: ['@tailwindcss/turbopack'], as: '*.css' },
                },
            },
        });
        expect(output.turbopack?.rules?.['*.svg']).toEqual({ loaders: ['svg-loader'] });
        // 앱 CSS 규칙은 건드리지 않는다 (CSS 는 소스 모듈별로 나온다).
        expect(output.turbopack?.rules?.['*.css']).toEqual({
            loaders: ['@tailwindcss/turbopack'],
            as: '*.css',
        });
    });

    it('turbopack: JS loader without the query, CSS loader with it', () => {
        const output = vaporNextPlugin({ mode: 'turbopack', layer: 'acme' })<TestNextConfig>({});
        const rules = output.turbopack?.rules?.['**/*.{tsx,jsx,ts,js,mts,mjs,cts,cjs}'] as Array<{
            condition: unknown;
            loaders: Array<{ loader: string; options: Record<string, unknown> }>;
            as?: string;
        }>;
        expect(rules).toHaveLength(2);
        const [js, css] = rules;
        expect(js!.condition).toEqual({ not: { query: /[?&]vapor-css(?=&|$)/ } });
        expect(js!.loaders[0]!.loader).toMatch(/turbopack\.[cm]?[jt]s$/);
        expect(js!.as).toBeUndefined();
        expect(css!.condition).toEqual({ query: /[?&]vapor-css(?=&|$)/ });
        expect(css!.loaders[0]!.loader).toMatch(/css-loader\.[cm]?[jt]s$/);
        expect(css!.loaders[0]!.options).toMatchObject({ layer: 'acme' });
        expect(css!.as).toBe('*.css');
    });

    it('mode: auto follows process.env.TURBOPACK', () => {
        const prev = process.env.TURBOPACK;
        try {
            process.env.TURBOPACK = '1';
            const turboOutput = vaporNextPlugin({ mode: 'auto' })<TestNextConfig>({});
            expect(turboOutput.turbopack?.rules).toBeTypeOf('object');
            expect(turboOutput.webpack).toBeUndefined();

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
