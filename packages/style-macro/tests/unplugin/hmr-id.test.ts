import { describe, expect, it } from 'vitest';

import vaporStyleMacro from '../../src/unplugin';
import { manifest } from './fixtures/manifest';

function extractVirtualImport(code: string): string | null {
    const m = code.match(/import\s+"(virtual:vapor-style\/[a-f0-9]+\.css)"/);
    return m?.[1] ?? null;
}

interface TransformPlugin {
    transform: (
        this: { error: (msg: string) => void },
        code: string,
        id: string,
    ) => { code: string } | null;
}

function makePlugin(): TransformPlugin {
    const factory = vaporStyleMacro.raw(
        { manifest, importSource: './$style-stub', themeStylesImport: false },
        { framework: 'esbuild' },
    ) as unknown as TransformPlugin;
    return factory;
}

const errCtx = { error: () => {} };

describe('hmr id stability', () => {
    it('produces same id when source unchanged', () => {
        const plugin = makePlugin();
        const src = `import { $style } from './$style-stub';\nexport const c = $style({ padding: '$400' });`;
        const a = plugin.transform.call(errCtx, src, '/v/file.tsx')!;
        const b = plugin.transform.call(errCtx, src, '/v/file.tsx')!;
        expect(extractVirtualImport(a.code)).toBe(extractVirtualImport(b.code));
    });

    it('produces different id when source changes', () => {
        const plugin = makePlugin();
        const src1 = `import { $style } from './$style-stub';\nexport const c = $style({ padding: '$400' });`;
        const src2 = `import { $style } from './$style-stub';\nexport const c = $style({ padding: '$200' });`;
        const a = plugin.transform.call(errCtx, src1, '/v/file.tsx')!;
        const b = plugin.transform.call(errCtx, src2, '/v/file.tsx')!;
        expect(extractVirtualImport(a.code)).not.toBe(extractVirtualImport(b.code));
    });
});
