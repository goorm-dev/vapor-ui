import { describe, expect, it } from 'vitest';

import { compileModule } from './_module-css';
import { createIncludeFilter, includedPackages, resolveOptions } from './_options';

const includeOf = (root: string, include: string[] = [], exclude: string[] = []) =>
    resolveOptions({ root, include, exclude }).include;

describe('resolveOptions — include / exclude', () => {
    describe('root is a literal path, not a glob', () => {
        it.each([
            '/work/proj (copy)',
            '/work/proj[x]',
            '/work/@(a)',
            '/work/+(a)',
            '/work/a*b',
            '/work/a?b',
            '/work/{a,b}',
        ])('root %j', (root) => {
            const include = includeOf(root, ['extra/**'], ['src/skip/**']);
            expect(include(`${root}/src/a.tsx`)).toBe(true);
            expect(include(`${root}/src/skip/a.tsx`)).toBe(false);
            expect(include(`${root}/extra/a.js`)).toBe(true);
        });

        it('keeps glob syntax in the pattern itself', () => {
            const include = includeOf('/work/p (1)', [], ['src/**/*.{test,spec}.tsx']);
            expect(include('/work/p (1)/src/a/b.test.tsx')).toBe(false);
            expect(include('/work/p (1)/src/a/b.tsx')).toBe(true);
        });

        it('resolves `../` patterns against the root', () => {
            const include = includeOf('/work/app (1)', ['../shared/src/**']);
            expect(include('/work/shared/src/a.tsx')).toBe(true);
            expect(include('/work/other/src/a.tsx')).toBe(true); // 기본 대상(.tsx)
            expect(includeOf('/work/app (1)', [], ['../shared/**'])('/work/shared/src/a.tsx')).toBe(
                false,
            );
        });
    });

    describe('packages are matched by their node_modules path, independent of the install layout', () => {
        const root = '/repo/app';
        const pnpm =
            '/repo/node_modules/.pnpm/@acme+ui@1.0.0_react@19.0.0/node_modules/@acme/ui/dist/a.js';

        it.each([
            ['symlinked (npm / yarn / pnpm link)', '/repo/app/node_modules/@acme/ui/dist/a.js'],
            ['pnpm store real path', pnpm],
            ['hoisted to a parent node_modules', '/repo/node_modules/@acme/ui/dist/a.js'],
        ])('include matches %s', (_, id) => {
            expect(includeOf(root, ['node_modules/@acme/ui/dist/**'])(id)).toBe(true);
        });

        it('does not match a different package with the same tail', () => {
            const include = includeOf(root, ['node_modules/@acme/ui/dist/**']);
            expect(
                include(
                    '/repo/node_modules/.pnpm/@other+ui@1.0.0/node_modules/@other/ui/dist/a.js',
                ),
            ).toBe(false);
        });

        it('uses the innermost package (nested node_modules)', () => {
            const include = includeOf(root, ['node_modules/@acme/ui/dist/**']);
            expect(include('/repo/node_modules/@acme/ui/node_modules/dep/dist/a.js')).toBe(false);
        });

        it('exclude applies to the same package path', () => {
            const include = includeOf(
                root,
                ['node_modules/@acme/ui/**'],
                ['node_modules/@acme/ui/dist/legacy/**'],
            );
            expect(include(pnpm)).toBe(true);
            expect(include(pnpm.replace('/dist/', '/dist/legacy/'))).toBe(false);
        });

        it('node_modules stays out by default', () => {
            expect(includeOf(root)(pnpm)).toBe(false);
        });
    });

    it('rejects virtual module ids', () => {
        expect(includeOf('/repo')('\0virtual:x.tsx')).toBe(false);
    });
});

describe('resolveOptions — root comes from the bundler as given', () => {
    // 테스트 프로세스의 cwd 와 다른 경로. 플러그인이 cwd 를 끼워 넣으면 아래 기대가 깨진다.
    const bundlerRoot = '/bundler/app';
    const css = `import { css } from '@vapor-ui/style-macro';\nexport const a = css({ gap: 0 });\n`;
    const classOf = (opts: ReturnType<typeof resolveOptions>, file: string) =>
        /a = '(\w+)'/.exec(compileModule(css, file, opts)!.code)![1];

    it('uses the bundler root when `root` is not given', () => {
        expect(process.cwd()).not.toBe(bundlerRoot);
        const opts = resolveOptions({ exclude: ['src/skip/**'] }, { root: bundlerRoot });
        expect(opts.root).toBe(bundlerRoot);
        expect(opts.include(`${bundlerRoot}/src/skip/a.tsx`)).toBe(false);
        expect(opts.include(`${bundlerRoot}/src/a.tsx`)).toBe(true);
        expect(opts.include(`${process.cwd()}/src/skip/a.tsx`)).toBe(true);
    });

    it('scopes the class hash by the bundler root', () => {
        const file = `${bundlerRoot}/src/a.tsx`;
        const viaBundler = resolveOptions({ hash: true }, { root: bundlerRoot });
        const viaOption = resolveOptions({ hash: true, root: bundlerRoot });
        const elsewhere = resolveOptions({ hash: true, root: '/other' });
        expect(classOf(viaBundler, file)).toBe(classOf(viaOption, file));
        expect(classOf(viaBundler, file)).not.toBe(classOf(elsewhere, file));
    });

    it('an explicit `root` wins over the bundler root', () => {
        const opts = resolveOptions(
            { root: '/explicit', exclude: ['src/**'] },
            { root: bundlerRoot },
        );
        expect(opts.root).toBe('/explicit');
        expect(opts.include('/explicit/src/a.tsx')).toBe(false);
        expect(opts.include(`${bundlerRoot}/src/a.tsx`)).toBe(true);
    });

    it('throws when neither the option nor the bundler gives a root', () => {
        expect(() => resolveOptions({})).toThrow(/No project root.*`root` option/);
        expect(() => resolveOptions({}, { root: undefined })).toThrow(/No project root/);
    });
});

describe('includedPackages — package names named by `include`', () => {
    it.each([
        [['node_modules/@acme/ui/dist/**'], ['@acme/ui']],
        [
            ['node_modules/lib/**', './node_modules/@a/b/x.js'],
            ['lib', '@a/b'],
        ],
        [['src/**', '../shared/**'], []],
        [['node_modules/@acme/*/dist/**', 'node_modules/{a,b}/**'], []],
        [['node_modules/lib/**', 'node_modules/lib/x/**'], ['lib']],
    ])('%j → %j', (include, expected) => {
        expect(includedPackages(include)).toEqual(expected);
    });
});

describe('createIncludeFilter — separators do not matter (Windows ids from Vite use `/`, webpack uses `\\`)', () => {
    const root = 'C:\\proj';
    const pnpmFwd = 'C:/proj/node_modules/.pnpm/@acme+ui@1.0.0/node_modules/@acme/ui/dist/a.js';
    const pnpmBack = pnpmFwd.replace(/\//g, '\\');

    it.each([
        ['Vite id (forward slashes)', pnpmFwd],
        ['webpack resource (backslashes)', pnpmBack],
    ])('pnpm store path is an included package: %s', (_, id) => {
        expect(createIncludeFilter(root, ['node_modules/@acme/ui/dist/**'], [])(id)).toBe(true);
    });

    it.each([['C:/proj/src/a.tsx'], ['C:\\proj\\src\\a.tsx']])(
        'default source include: %s',
        (id) => {
            expect(createIncludeFilter(root, [], [])(id)).toBe(true);
            expect(createIncludeFilter(root, [], ['src/**'])(id)).toBe(false);
        },
    );

    it('drive letter case is not significant', () => {
        expect(createIncludeFilter('c:\\proj', [], ['src/**'])('C:/proj/src/a.tsx')).toBe(false);
    });
});
