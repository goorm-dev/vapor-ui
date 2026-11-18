import { describe, expect, it } from 'vitest';

import { includedPackages, resolveOptions } from './_options';

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
