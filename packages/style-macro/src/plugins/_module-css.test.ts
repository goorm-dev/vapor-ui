import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { compileModule, isModuleCss, moduleCssName, sourceOfModuleCss } from './_module-css';
import { resolveOptions } from './_options';

describe('module CSS naming', () => {
    it('keeps the source extension so the CSS name maps back to one source file', () => {
        expect(moduleCssName('/x/src/button.tsx')).toBe('button.tsx.vapor.css');
        expect(moduleCssName('/x/src/button.ts')).toBe('button.ts.vapor.css');
    });

    it('sourceOfModuleCss inverts the name, ignoring a query', () => {
        expect(sourceOfModuleCss('/x/src/button.tsx.vapor.css')).toBe('/x/src/button.tsx');
        expect(sourceOfModuleCss('/x/src/button.tsx.vapor.css?direct')).toBe('/x/src/button.tsx');
    });

    it('isModuleCss matches only module CSS ids', () => {
        expect(isModuleCss('/x/a.tsx.vapor.css')).toBe(true);
        expect(isModuleCss('/x/a.tsx.vapor.css?used')).toBe(true);
        expect(isModuleCss('/x/a.css')).toBe(false);
        expect(isModuleCss('/x/a.tsx')).toBe(false);
    });
});

describe('compileModule', () => {
    function setup(layer?: string) {
        const root = mkdtempSync(join(tmpdir(), 'vapor-module-css-'));
        writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@acme/app' }));
        const opts = resolveOptions({ root, hash: true, layer });
        return { root, opts, file: join(root, 'src', 'button.tsx') };
    }

    const SRC = `import { css } from '@vapor-ui/style-macro';\nimport { Box } from './box';\nexport const cls = css({ gap: '0' });\n`;

    it('returns the JS with the module CSS import after the last import, and the CSS', () => {
        const { opts, file } = setup();
        const out = compileModule(SRC, file, opts)!;
        expect(out.code).toMatch(/from '\.\/box';\nimport '\.\/button\.tsx\.vapor\.css';/);
        expect(out.cssPath).toBe(join(file, '..', 'button.tsx.vapor.css'));
        expect(out.css).toMatch(/^@layer vapor-utilities \{/);
    });

    it('drops the layer order statement (layers.css owns the order)', () => {
        const { opts, file } = setup('composites');
        const { css } = compileModule(SRC, file, opts)!;
        expect(css).toMatch(/^@layer composites \{/);
        expect(css).not.toMatch(/@layer composites;/);
    });

    it('returns null for files outside include or without the macro import', () => {
        const { opts, root, file } = setup();
        expect(compileModule(SRC, join(root, 'node_modules', 'x', 'a.js'), opts)).toBeNull();
        expect(compileModule(`export const a = 1;\n`, file, opts)).toBeNull();
    });

    it('returns css null when the module emits no rules', () => {
        const { opts, file } = setup();
        const out = compileModule(
            `import { css } from '@vapor-ui/style-macro';\nimport { b } from './b';\nexport const c = css(b);\n`,
            file,
            opts,
        );
        expect(out?.css ?? null).toBeNull();
        expect(out?.code ?? '').not.toContain('vapor.css');
    });

    it('throws a formatted build error on invalid input', () => {
        const { opts, file } = setup();
        expect(() =>
            compileModule(
                `import { css } from '@vapor-ui/style-macro';\nexport const c = css({ border: '1px solid $basic-black' });\n`,
                file,
                opts,
            ),
        ).toThrow(/button\.tsx/);
    });
});
