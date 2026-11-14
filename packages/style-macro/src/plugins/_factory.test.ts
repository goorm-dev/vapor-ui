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

function getHooks(opts: VaporPluginOptions = {}): AnyProp {
    return (plugin.raw as AnyProp)(opts, { framework: 'rollup', versions: {} });
}

function callHook(hook: AnyProp, ctx: AnyProp, ...args: AnyProp[]): AnyProp {
    const fn = typeof hook === 'function' ? hook : hook?.handler;
    return fn.apply(ctx, args);
}

describe('unplugin — JS transform only', () => {
    it('does not register virtual-module hooks (CSS is collected elsewhere)', () => {
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

        it('rewrites css() to a string literal and emits no CSS import', () => {
            const hooks = getHooks();
            const ctx = makeCtx();
            const src = [
                `import { css } from '@vapor-ui/style-macro';`,
                `const cls = css({ padding: '$space-400' });`,
            ].join('\n');
            const out = callHook(hooks.transform, ctx, src, '/src/A.tsx');
            expect(out).not.toBeNull();
            expect(out.code).not.toMatch(/import\s+["'][^"']*\.css["']/);
            expect(out.code).toMatch(/const cls = 'cls_[A-Za-z0-9]+'/);
            expect(out.code).toContain(`import { css } from '@vapor-ui/style-macro';`);
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
});
