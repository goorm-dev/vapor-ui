import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import vaporCssLoader, { type CssLoaderContext } from './css-loader';
import vaporStyleTurbopackLoader from './turbopack';

const SRC = `import { css } from '@vapor-ui/style-macro';\nexport const cls = css({ gap: '0' });\n`;

function ctx(resourcePath: string, opts: Record<string, unknown> = {}): CssLoaderContext {
    return {
        resourcePath,
        getOptions: () => opts,
        addDependency: () => {},
    };
}

describe('css-loader — module CSS from the source module', () => {
    const root = mkdtempSync(join(tmpdir(), 'vapor-css-loader-'));
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@acme/app' }));
    const file = join(root, 'src', 'a.tsx');

    it('returns the CSS of the source module, matching the JS class names', async () => {
        const css = vaporCssLoader.call(ctx(file, { root, hash: true }), SRC);
        const js = await vaporStyleTurbopackLoader.call(
            { resourcePath: file, getOptions: () => ({ root, hash: true }) },
            SRC,
        );
        const cls = /const cls = '(v\w+)'/.exec(js)![1];
        expect(css).toMatch(
            new RegExp(`^@layer vapor-utilities \\{[\\s\\S]*\\.${cls} \\{ gap: 0; \\}`),
        );
    });

    it('uses the layer option and drops the layer order statement', () => {
        const css = vaporCssLoader.call(ctx(file, { root, layer: 'vapor-composites' }), SRC);
        expect(css).toMatch(/^@layer vapor-composites \{/);
        expect(css).not.toMatch(/@layer vapor-composites;/);
    });

    it('returns an empty sheet for excluded files or files without rules', () => {
        expect(vaporCssLoader.call(ctx(file, { root, exclude: ['src/**'] }), SRC)).toBe('');
        expect(vaporCssLoader.call(ctx(file, { root }), 'export const a = 1;\n')).toBe('');
    });

    it('throws a code frame on invalid css()', () => {
        expect(() =>
            vaporCssLoader.call(
                ctx(file, { root }),
                `import { css } from '@vapor-ui/style-macro';\nexport const c = css({ border: '1px solid $basic-black' });\n`,
            ),
        ).toThrow(/a\.tsx:\d+:\d+ \[unknown-property\]/);
    });

    it('webpack: compiles the source named by ?vapor-src (relative to root) and tracks it', () => {
        mkdirSync(join(root, 'src'), { recursive: true });
        writeFileSync(file, SRC);
        const deps: string[] = [];
        const css = vaporCssLoader.call(
            {
                resourcePath: '/pkg/module.vapor.css',
                resourceQuery: '?vapor-src=src%2Fa.tsx.vapor.css',
                getOptions: () => ({ root }),
                addDependency: (f: string) => deps.push(f),
            },
            '',
        );
        expect(css).toContain('gap: 0');
        expect(deps).toEqual([file]);
    });

    it('webpack: compiles an included source outside root (monorepo sibling package)', () => {
        const mono = mkdtempSync(join(tmpdir(), 'vapor-css-loader-mono-'));
        const appRoot = join(mono, 'apps', 'web');
        const shared = join(mono, 'packages', 'shared', 'src', 'card.tsx');
        mkdirSync(appRoot, { recursive: true });
        mkdirSync(join(mono, 'packages', 'shared', 'src'), { recursive: true });
        writeFileSync(shared, SRC);
        const deps: string[] = [];
        const css = vaporCssLoader.call(
            {
                resourcePath: '/pkg/module.vapor.css',
                resourceQuery: `?vapor-src=${encodeURIComponent('../../packages/shared/src/card.tsx.vapor.css')}`,
                getOptions: () => ({ root: appRoot, include: ['../../packages/shared/src/**'] }),
                addDependency: (f: string) => deps.push(f),
            },
            '',
        );
        expect(css).toContain('gap: 0');
        expect(deps).toEqual([shared]);
    });

    it.each([
        ['in node_modules', encodeURIComponent('../node_modules/x/a.tsx.vapor.css'), {}],
        ['excluded', 'src%2Fa.tsx.vapor.css', { exclude: ['src/**'] }],
        ['absolute', encodeURIComponent('/etc/a.tsx.vapor.css'), {}],
        ['missing suffix', 'src%2Fa.tsx', {}],
    ])('webpack: rejects a ?vapor-src that is %s', (_label, value, extra) => {
        const deps: string[] = [];
        expect(() =>
            vaporCssLoader.call(
                {
                    resourcePath: '/pkg/module.vapor.css',
                    resourceQuery: `?vapor-src=${value}`,
                    getOptions: () => ({ root, ...extra }),
                    addDependency: (f: string) => deps.push(f),
                },
                '',
            ),
        ).toThrow(/vapor-src/);
        expect(deps).toEqual([]);
    });
});
