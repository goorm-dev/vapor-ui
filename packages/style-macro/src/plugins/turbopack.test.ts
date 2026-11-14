import type { VaporPluginOptions } from './_options';
import vaporStyleTurbopackLoader, { type TurbopackLoaderContext } from './turbopack';

function mkCtx(resourcePath: string, opts: VaporPluginOptions = {}): TurbopackLoaderContext {
    return {
        resourcePath,
        getOptions: () => opts,
    };
}

async function run(ctx: TurbopackLoaderContext, source: string) {
    return vaporStyleTurbopackLoader.call(ctx, source);
}

describe('turbopack', () => {
    it('returns source unmodified when there is no css() call (fast path)', async () => {
        const ctx = mkCtx('/src/plain.tsx');
        const src = `export const x = 1;`;
        const out = await run(ctx, src);
        expect(out).toBe(src);
    });

    it('rewrites css() to a string literal without any CSS import', async () => {
        const ctx = mkCtx('/src/A.tsx');
        const src = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const cls = css({ padding: '$space-400' });`,
        ].join('\n');
        const out = await run(ctx, src);
        expect(out).not.toContain('data:text/css');
        expect(out).toMatch(/const cls = 'cls_[A-Za-z0-9]+'/);
    });

    it('honours include/exclude globs passed as loader options', async () => {
        const src = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const cls = css({ padding: '$space-400' });`,
        ].join('\n');
        const excluded = mkCtx('/repo/src/skip/A.tsx', { root: '/repo', exclude: ['src/skip/**'] });
        expect(await run(excluded, src)).toBe(src);
        const included = mkCtx('/repo/node_modules/@acme/ui/dist/a.js', {
            root: '/repo',
            include: ['node_modules/@acme/ui/dist/**'],
        });
        expect(await run(included, src)).not.toBe(src);
    });

    it('throws when the transform reports a build error', async () => {
        const ctx = mkCtx('/src/err.tsx');
        const src = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const cls = css({ padding: '$space-nope' });`,
        ].join('\n');
        await expect(run(ctx, src)).rejects.toThrow();
    });
});
