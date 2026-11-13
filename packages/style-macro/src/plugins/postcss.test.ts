import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import postcss from 'postcss';
import postcssImport from 'postcss-import';

import { vaporPostcss } from './postcss';

/** core 의 `layers.css` 와 같은 내용을 가진 가짜 패키지 + `css()` 를 쓰는 소스 하나. */
function project({ withMacro = true } = {}) {
    const root = mkdtempSync(join(tmpdir(), 'vapor-postcss-'));
    const core = join(root, 'node_modules', '@vapor-ui', 'core');
    mkdirSync(core, { recursive: true });
    writeFileSync(
        join(core, 'package.json'),
        JSON.stringify({ name: '@vapor-ui/core', exports: { './layers.css': './layers.css' } }),
    );
    writeFileSync(
        join(core, 'layers.css'),
        '@layer vapor-theme;\n@layer vapor-reset;\n@layer vapor-components;\n@layer vapor-utilities;\n',
    );
    mkdirSync(join(root, 'src'));
    if (withMacro) {
        writeFileSync(
            join(root, 'src', 'a.tsx'),
            `import { css } from '@vapor-ui/style-macro';\nexport const a = css({ paddingTop: '$space-100' });\n`,
        );
    }
    return { root, from: join(root, 'src', 'index.css') };
}

async function run(plugins: postcss.AcceptedPlugin[], css: string, from: string) {
    const result = await postcss(plugins).process(css, { from });
    return { css: result.css, warnings: result.warnings().map((w) => w.text) };
}

const LAYERS_IMPORT = `@import '@vapor-ui/core/layers.css';\n`;

describe('vaporPostcss — insertion point', () => {
    it('vapor before postcss-import: the @import trigger appends the sheet', async () => {
        const p = project();
        const out = await run([vaporPostcss({ root: p.root }), postcssImport()], LAYERS_IMPORT, p.from);
        expect(out.css).toContain('padding-top');
        expect(out.warnings).toEqual([]);
    });

    it('explicit @vapor-utilities; works when postcss-import runs first', async () => {
        const p = project();
        const out = await run(
            [postcssImport(), vaporPostcss({ root: p.root })],
            `${LAYERS_IMPORT}@vapor-utilities;\n`,
            p.from,
        );
        expect(out.css).toContain('padding-top');
        expect(out.css).not.toContain('@vapor-utilities;');
        expect(out.warnings).toEqual([]);
    });
});

describe('vaporPostcss — unterminated last statement', () => {
    it('keeps the trailing @import intact when appending (no @media wrapping)', async () => {
        const p = project();
        const lib = join(p.root, 'node_modules', '@vapor-ui', 'core', 'lib.css');
        writeFileSync(lib, '._lib { gap: 0 }\n');
        const out = await run(
            [vaporPostcss({ root: p.root }), postcssImport()],
            `${LAYERS_IMPORT}@import "./node_modules/@vapor-ui/core/lib.css"`,
            join(p.root, 'index.css'),
        );
        expect(out.css).toContain('._lib { gap: 0 }');
        expect(out.css).not.toContain('@media');
        expect(out.css).toContain('padding-top');
    });
});

describe('vaporPostcss — warns when the insertion point is gone', () => {
    it('postcss-import inlined layers.css before vapor ran and no marker', async () => {
        const p = project();
        const out = await run([postcssImport(), vaporPostcss({ root: p.root })], LAYERS_IMPORT, p.from);
        expect(out.css).not.toContain('padding-top');
        expect(out.warnings).toHaveLength(1);
        expect(out.warnings[0]).toContain('@vapor-utilities;');
        expect(out.warnings[0]).toContain('postcss-import');
    });

    it('layer order declared by hand without a marker', async () => {
        const p = project();
        const out = await run(
            [vaporPostcss({ root: p.root })],
            '@layer base, vapor-theme, vapor-reset, vapor-components, vapor-utilities;\n',
            p.from,
        );
        expect(out.warnings).toHaveLength(1);
    });

    it('stays silent when the project has no css() call', async () => {
        const p = project({ withMacro: false });
        const out = await run([postcssImport(), vaporPostcss({ root: p.root })], LAYERS_IMPORT, p.from);
        expect(out.warnings).toEqual([]);
    });

    it('stays silent on CSS files that do not declare the Vapor layer order', async () => {
        const p = project();
        // e.g. a prebuilt library sheet: it names only `vapor-utilities`.
        const out = await run(
            [vaporPostcss({ root: p.root })],
            '@layer vapor-utilities;\n@layer vapor-utilities { ._x { gap: 0 } }\n.app { color: red }\n',
            p.from,
        );
        expect(out.warnings).toEqual([]);
    });
});
