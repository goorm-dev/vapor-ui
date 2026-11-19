import type { AnyProp } from '~/models/types';

import plugin, { type VaporPluginOptions } from './_factory';

function makeCtx() {
    return {
        error: vi.fn((msg: string): never => {
            throw new Error(msg);
        }),
        warn: vi.fn(),
        parse: vi.fn(),
        getWatchFiles: vi.fn(() => []),
        addWatchFile: vi.fn(),
        emitFile: vi.fn(),
    };
}

function rawHooks(opts: VaporPluginOptions): AnyProp {
    return (plugin.raw as AnyProp)(opts, { framework: 'webpack', versions: {} });
}

/** 번들러 루트 없이 호출하는 단위 테스트라 `root` 를 직접 준다. */
function getHooks(opts: VaporPluginOptions = {}): AnyProp {
    return rawHooks({ root: '/', ...opts });
}

function callHook(hook: AnyProp, ctx: AnyProp, ...args: AnyProp[]): AnyProp {
    const fn = typeof hook === 'function' ? hook : hook?.handler;
    return fn.apply(ctx, args);
}

describe('unplugin — JS transform only', () => {
    it('does not register virtual-module hooks (the CSS loader compiles the source)', () => {
        const hooks = getHooks();
        expect(hooks.resolveId).toBeUndefined();
        expect(hooks.load).toBeUndefined();
    });

    describe('transformInclude', () => {
        it('includes .tsx source files', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            expect(callHook(hooks.transformInclude, ctx, '/src/App.tsx')).toBe(true);
        });

        it('excludes node_modules by default', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            expect(
                callHook(hooks.transformInclude, ctx, '/repo/node_modules/foo/dist/index.js'),
            ).toBe(false);
        });

        it('`include` globs opt node_modules packages in (relative to root)', () => {
            const hooks = getHooks({
                root: '/repo',
                include: ['node_modules/@acme/ui/dist/**'],
            });
            const ctx = makeCtx();
            expect(
                callHook(hooks.transformInclude, ctx, '/repo/node_modules/@acme/ui/dist/a.js'),
            ).toBe(true);
            expect(
                callHook(hooks.transformInclude, ctx, '/repo/node_modules/other/dist/a.js'),
            ).toBe(false);
        });

        it('`exclude` globs win over defaults and `include`', () => {
            const hooks = getHooks({
                root: '/repo',
                include: ['src/**'],
                exclude: ['src/**/*.test.tsx'],
            });
            const ctx = makeCtx();
            expect(callHook(hooks.transformInclude, ctx, '/repo/src/A.tsx')).toBe(true);
            expect(callHook(hooks.transformInclude, ctx, '/repo/src/A.test.tsx')).toBe(false);
        });

        it('`include` never admits non-source extensions', () => {
            const hooks = getHooks({ root: '/repo', include: ['assets/**'] });
            const ctx = makeCtx();
            expect(callHook(hooks.transformInclude, ctx, '/repo/assets/a.css')).toBe(false);
        });
    });

    describe('transform', () => {
        it('returns null when the source contains no styles call', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = `const x = 1;`;
            const out = callHook(hooks.transform, ctx, src, '/src/nostyle.tsx');
            expect(out).toBeNull();
        });

        it('rewrites css() and imports the module CSS as a CSS file keyed by the source', () => {
            const hooks = getHooks({ root: '/repo' });
            const ctx = makeCtx();
            const src = [
                `import { css } from '@vapor-ui/style-macro';`,
                `const cls = css({ padding: '$space-400' });`,
            ].join('\n');
            const out = callHook(hooks.transform, ctx, src, '/repo/src/A.tsx');
            expect(out.code).toMatch(/const cls = 'cls_[A-Za-z0-9]+'/);
            // 실제 .css 리소스라 Next 의 RSC CSS 수집·앱 CSS 규칙이 그대로 인식한다.
            expect(out.code).toMatch(
                /import '@vapor-ui\/style-macro\/module\.vapor\.css\?vapor-src=src%2FA\.tsx\.vapor\.css';/,
            );
        });

        it('adds no CSS import when the module emits no rules', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = `import { css } from '@vapor-ui/style-macro';\nimport { b } from './b';\nexport const c = css(b);\n`;
            const out = callHook(hooks.transform, ctx, src, '/src/A.tsx');
            expect(out?.code ?? '').not.toContain('vapor.css');
        });

        it('calls this.error and never returns when transform reports build errors', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = [
                `import { css } from '@vapor-ui/style-macro';`,
                `const cls = css({ padding: '$space-nope' });`,
            ].join('\n');
            expect(() => callHook(hooks.transform, ctx, src, '/src/err.tsx')).toThrow();
            expect(ctx.error).toHaveBeenCalledTimes(1);
        });
    });

    describe('root comes from webpack `compiler.context` as given', () => {
        const SRC = `import { css } from '@vapor-ui/style-macro';\nconst cls = css({ gap: 0 });\n`;
        const srcQuery = (out: AnyProp) =>
            /vapor-src=([^']+)\.vapor\.css'/.exec(out.code)?.[1] ?? null;

        it('include/exclude and the CSS source path follow compiler.context, not cwd', () => {
            const hooks = rawHooks({ exclude: ['src/skip/**'] });
            hooks.webpack({ context: '/ctx/app' });
            const ctx = makeCtx();
            expect(process.cwd()).not.toBe('/ctx/app');
            expect(callHook(hooks.transformInclude, ctx, '/ctx/app/src/skip/A.tsx')).toBe(false);
            expect(callHook(hooks.transformInclude, ctx, `${process.cwd()}/src/skip/A.tsx`)).toBe(
                true,
            );
            const out = callHook(hooks.transform, ctx, SRC, '/ctx/app/src/A.tsx');
            expect(srcQuery(out)).toBe('src%2FA.tsx');
        });

        it('explicit `root` wins over compiler.context', () => {
            const hooks = rawHooks({ root: '/explicit' });
            hooks.webpack({ context: '/ctx/app' });
            const out = callHook(hooks.transform, makeCtx(), SRC, '/explicit/src/A.tsx');
            expect(srcQuery(out)).toBe('src%2FA.tsx');
        });

        it('throws when neither `root` nor compiler.context exists', () => {
            expect(() => rawHooks({}).webpack({})).toThrow(/No project root/);
            const hooks = rawHooks({});
            expect(() => callHook(hooks.transformInclude, makeCtx(), '/src/A.tsx')).toThrow(
                /No project root/,
            );
        });
    });
});
