import {
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    realpathSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { type ViteDevServer, build, createServer } from 'vite';

import { fsPathFromFsUrl, vaporVitePlugin } from './vite';

const src = (name: string, gap: string) =>
    `import { css } from '@vapor-ui/style-macro';\nexport const ${name} = css({ gap: '${gap}' });\n`;

function fixture(files: Record<string, string>) {
    // macOS tmpdir 은 /var → /private/var 심볼릭 링크라 Vite 가 root 밖으로 본다.
    const root = realpathSync(mkdtempSync(join(tmpdir(), 'vapor-vite-')));
    const w = (p: string, s: string) => {
        mkdirSync(dirname(join(root, p)), { recursive: true });
        writeFileSync(join(root, p), s);
    };
    w('package.json', JSON.stringify({ name: 'app', type: 'module' }));
    w(
        'index.html',
        '<!doctype html><html><head></head><body><script type="module" src="./main.ts"></script></body></html>',
    );
    for (const [p, s] of Object.entries(files)) w(p, s);
    return { root, w };
}

const classOf = (code: string, name: string) =>
    new RegExp(`${name} = ['"](v\\w+)['"]`).exec(code)?.[1];

describe('vite adapter — per-module CSS (build)', () => {
    async function buildApp(files: Record<string, string>, opts = {}) {
        const { root } = fixture(files);
        const outDir = join(root, 'dist');
        await build({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [vaporVitePlugin({ hash: true, injectColorScheme: false, ...opts })],
            build: { outDir, minify: false, modulePreload: { polyfill: false } },
        });
        const assets = readdirSync(join(outDir, 'assets'));
        const read = (ext: string) =>
            assets
                .filter((f) => f.endsWith(ext))
                .map((f) => readFileSync(join(outDir, 'assets', f), 'utf8'))
                .join('\n');
        return { js: read('.js'), css: read('.css') };
    }

    it('emits the CSS of every imported module and matches the JS class names', async () => {
        const { js, css } = await buildApp({
            'a.tsx': src('a', '1px'),
            'b.tsx': src('b', '2px'),
            'main.ts': `import { a } from './a.tsx';\nimport { b } from './b.tsx';\ndocument.body.className = a + ' ' + b;\n`,
        });
        const clsA = classOf(js, 'a');
        const clsB = classOf(js, 'b');
        expect(clsA).toBeDefined();
        expect(css).toMatch(new RegExp(`\\.${clsA} \\{\\s*gap: 1px;?\\s*\\}`));
        expect(css).toMatch(new RegExp(`\\.${clsB} \\{\\s*gap: 2px;?\\s*\\}`));
        expect(js).not.toContain('vapor.css');
    });

    it('leaves out the CSS of modules that are never imported', async () => {
        const { css } = await buildApp({
            'a.tsx': src('a', '1px'),
            'unused.tsx': src('unused', '9px'),
            'main.ts': `import { a } from './a.tsx';\ndocument.body.className = a;\n`,
        });
        expect(css).toContain('gap: 1px');
        expect(css).not.toContain('gap: 9px');
    });

    it('wraps rules in the configured layer without a layer order statement', async () => {
        const { css } = await buildApp(
            {
                'a.tsx': src('a', '1px'),
                'main.ts': `import { a } from './a.tsx';\ndocument.body.className = a;\n`,
            },
            { layer: 'vapor-composites' },
        );
        expect(css).toMatch(/@layer vapor-composites\s*\{/);
        expect(css).not.toMatch(/@layer vapor-composites;/);
    });

    it.each(['raw', 'url'])(
        'a `?%s` import of the same source does not replace its module CSS',
        async (query) => {
            const { css } = await buildApp({
                'a.tsx': src('a', '1px'),
                'lazy.ts': `export { default } from './a.tsx?${query}';\n`,
                'main.ts': `import { a } from './a.tsx';\ndocument.body.className = a;\nvoid import('./lazy.ts');\n`,
            });
            expect(css).toContain('gap: 1px');
        },
    );

    it('fails the build with a code frame on invalid css()', async () => {
        await expect(
            buildApp({
                'a.tsx': `import { css } from '@vapor-ui/style-macro';\nexport const a = css({ border: '1px solid $basic-black' });\n`,
                'main.ts': `import { a } from './a.tsx';\ndocument.body.className = a;\n`,
            }),
        ).rejects.toThrow(/a\.tsx:\d+:\d+ \[unknown-property\][\s\S]*\| export const a = css/);
    });
});

describe('vite adapter — dev server', () => {
    let server: ViteDevServer | undefined;
    afterEach(async () => {
        await server?.close();
        server = undefined;
    });

    async function serve(files: Record<string, string>) {
        const fx = fixture(files);
        server = await createServer({
            root: fx.root,
            configFile: false,
            logLevel: 'silent',
            appType: 'custom',
            server: { middlewareMode: true, hmr: false, watch: null, ws: false },
            plugins: [vaporVitePlugin({ hash: true, injectColorScheme: false })],
        });
        return { ...fx, server };
    }

    it('serves the module CSS imported by the transformed module', async () => {
        const { server } = await serve({ 'a.tsx': src('a', '1px') });
        const js = (await server.transformRequest('/a.tsx'))!.code;
        expect(js).toMatch(/import "\/a\.tsx\.vapor\.css"/);
        const css = (await server.transformRequest('/a.tsx.vapor.css'))!.code;
        expect(css).toContain(`.${classOf(js, 'a')} {`);
    });

    it('compiles the source on demand when the CSS is requested first', async () => {
        const { server } = await serve({ 'a.tsx': src('a', '1px') });
        const css = (await server.transformRequest('/a.tsx.vapor.css'))!.code;
        expect(css).toContain('gap: 1px');
    });

    async function editable(files: Record<string, string>) {
        const fx = await serve(files);
        // 실제 invalidate + reloadModule 경로를 탄다 (spy 는 호출만 기록).
        const reload = vi.spyOn(fx.server, 'reloadModule');
        const edit = async (file: string, code: string) => {
            fx.w(file, code);
            fx.server.moduleGraph.onFileChange(join(fx.root, file));
            await fx.server.transformRequest(`/${file}`);
        };
        const css = async (file: string) =>
            (await fx.server.transformRequest(`/${file}.vapor.css`))!.code;
        return { ...fx, reload, edit, css };
    }

    it('reloads the module CSS when an edit changes it, and only then', async () => {
        const { root, server, reload, edit, css } = await editable({ 'a.tsx': src('a', '1px') });
        await server.transformRequest('/a.tsx');
        await css('a.tsx');

        await edit('a.tsx', `${src('a', '1px')}// comment only\n`);
        expect(reload).not.toHaveBeenCalled();

        await edit('a.tsx', src('a', '2px'));
        expect(reload).toHaveBeenCalledTimes(1);
        expect(reload.mock.calls[0]![0].file).toBe(join(root, 'a.tsx.vapor.css'));
        expect(await css('a.tsx')).toContain('gap: 2px');
    });

    it('reloads when the CSS is removed and when it comes back', async () => {
        const { server, reload, edit, css } = await editable({ 'a.tsx': src('a', '1px') });
        await server.transformRequest('/a.tsx');
        await css('a.tsx');

        await edit(
            'a.tsx',
            `import { css } from '@vapor-ui/style-macro';\nexport const a = 'x';\n`,
        );
        expect(reload).toHaveBeenCalledTimes(1);

        // 사이에 CSS 요청 없이 다시 추가해도 reload 된다.
        await edit('a.tsx', src('a', '3px'));
        expect(reload).toHaveBeenCalledTimes(2);
        expect(await css('a.tsx')).toContain('gap: 3px');
    });

    it('resolves module CSS of sources outside the Vite root (/@fs/ and absolute ids)', async () => {
        const outside = fixture({ 'lib/b.tsx': src('b', '5px') });
        const { server } = await serve({});
        const file = join(outside.root, 'lib', 'b.tsx');
        // 캐시가 비어 있을 때 (load 전) 절대 경로 id 를 root 밑으로 붙이지 않는다.
        const resolved = await server.pluginContainer.resolveId(`${file}.vapor.css`);
        expect(resolved?.id).toBe(`${file}.vapor.css`);
        const viaFs = (await server.transformRequest(`/@fs${file}.vapor.css`))!.code;
        expect(viaFs).toContain('gap: 5px');
    });
});

describe('vite adapter — included packages are compiled in SSR too', () => {
    it('an included node_modules package is not externalized and its SSR module is compiled', async () => {
        const { root, w } = fixture({ 'main.ts': `export { cls } from '@acme/ui';\n` });
        w(
            'node_modules/@acme/ui/package.json',
            JSON.stringify({ name: '@acme/ui', type: 'module', main: 'index.js' }),
        );
        const file = join(root, 'node_modules/@acme/ui/index.js');
        w(
            'node_modules/@acme/ui/index.js',
            `import { css } from '@vapor-ui/style-macro';\nexport const cls = css({ gap: '1px' });\n`,
        );
        const server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            server: { middlewareMode: true },
            plugins: [
                vaporVitePlugin({
                    include: ['node_modules/@acme/ui/**'],
                    injectColorScheme: false,
                }),
            ],
        });
        try {
            // SSR externalize 여부는 이 설정으로 정해진다 (Vite `shouldExternalize`).
            expect(server.config.ssr.noExternal).toEqual(expect.arrayContaining(['@acme/ui']));
            const out = await server.environments.ssr.transformRequest(file);
            expect(out?.code).toMatch(/cls = ['"]cls_\w+['"]/);
        } finally {
            await server.close();
        }
    });
});

describe('vite adapter — included packages skip dependency pre-bundling', () => {
    it('adds packages named in `include` to optimizeDeps.exclude', () => {
        const [plugin] = vaporVitePlugin({ include: ['node_modules/@acme/ui/dist/**', 'src/**'] });
        const config = (plugin as { config?: () => unknown }).config?.();
        expect(config).toEqual({
            optimizeDeps: { exclude: ['@acme/ui'] },
            ssr: { noExternal: ['@acme/ui'] },
        });
    });

    it('adds nothing without package includes', () => {
        const [plugin] = vaporVitePlugin();
        expect((plugin as { config?: () => unknown }).config?.() ?? null).toBeNull();
    });
});

describe('vite adapter — FOUC guard goes into <head> via Vite HTML tag injection', () => {
    async function htmlOf(index: string) {
        const { root, w } = fixture({ 'main.ts': 'export {};\n' });
        w('index.html', index);
        const outDir = join(root, 'dist');
        await build({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [vaporVitePlugin()],
            build: { outDir, minify: false, modulePreload: { polyfill: false } },
        });
        return readFileSync(join(outDir, 'index.html'), 'utf8');
    }
    const script = '<script type="module" src="./main.ts"></script>';
    const head = (html: string) => /<head[^>]*>([\s\S]*?)<\/head>/.exec(html)?.[1] ?? '';

    it.each([
        [
            '<head>',
            `<!doctype html><html><head><title>t</title></head><body>${script}</body></html>`,
        ],
        [
            '<head> with attributes',
            `<!doctype html><html><head lang="ko"><title>t</title></head><body>${script}</body></html>`,
        ],
        // `<head>` 없는 HTML 의 위치는 Vite 가 정한다 (Vite 7 의 head-prepend 정규식은 `<header>` 에도
        // 맞는다). 플러그인은 위치를 직접 찾지 않는다.
    ])('%s', async (_, index) => {
        const html = await htmlOf(index);
        expect(head(html)).toContain('data-vapor-theme');
    });

    it('runs before any other head script', async () => {
        const html = await htmlOf(
            `<!doctype html><html><head><script>window.first = 1</script></head><body>${script}</body></html>`,
        );
        expect(html.indexOf('data-vapor-theme')).toBeLessThan(html.indexOf('window.first'));
    });
});

describe('fsPathFromFsUrl — same rule as Vite fsPathFromId', () => {
    it.each([
        ['/@fs/Users/a/x.tsx.vapor.css', '/Users/a/x.tsx.vapor.css'],
        ['/@fs/C:/a/x.tsx.vapor.css', 'C:/a/x.tsx.vapor.css'],
        ['/@fs/d:/a/x.tsx.vapor.css', 'd:/a/x.tsx.vapor.css'],
    ])('%s → %s', (url, path) => {
        expect(fsPathFromFsUrl(url)).toBe(path);
    });
});
