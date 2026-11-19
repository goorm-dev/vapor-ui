import type { LoaderContext } from './_loader';
import type { VaporPluginOptions } from './_options';
import vaporStyleTurbopackLoader from './turbopack';

function mkCtx(resourcePath: string, opts: VaporPluginOptions = {}): LoaderContext {
    return {
        resourcePath,
        getOptions: () => opts,
    };
}

async function run(ctx: LoaderContext, source: string) {
    return vaporStyleTurbopackLoader.call(ctx, source);
}

describe('turbopack', () => {
    it('returns source unmodified when there is no css() call (fast path)', async () => {
        const ctx = mkCtx('/src/plain.tsx');
        const src = `export const x = 1;`;
        const out = await run(ctx, src);
        expect(out).toBe(src);
    });

    it('rewrites css() and imports the module CSS through the ?vapor-css query', async () => {
        const ctx = mkCtx('/src/A.tsx');
        const src = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const cls = css({ padding: '$space-400' });`,
        ].join('\n');
        const out = await run(ctx, src);
        expect(out).toMatch(/const cls = 'cls_[A-Za-z0-9]+'/);
        expect(out).toContain(`import './A.tsx?vapor-css';`);
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

describe('turbopack — source map', () => {
    it('passes the map through the loader callback when available', async () => {
        const src = `import { css } from '@vapor-ui/style-macro';\nconst cls = css({ gap: 0 });\n`;
        const callback = vi.fn();
        const out = await vaporStyleTurbopackLoader.call(
            { resourcePath: '/src/M.tsx', getOptions: () => ({}), callback },
            src,
        );
        expect(out).toBeUndefined();
        const [err, code, map] = callback.mock.calls[0]!;
        expect(err).toBeNull();
        expect(code).toContain(`const cls = 'cls_`);
        expect(map).toMatchObject({ version: 3, sources: ['/src/M.tsx'] });
    });
});
