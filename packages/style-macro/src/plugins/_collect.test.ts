import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import postcss, { type AtRule } from 'postcss';

import { collectCss, injectCss } from './_collect';
import { resolveOptions } from './_options';

function fixture() {
    const root = mkdtempSync(join(tmpdir(), 'vapor-collect-'));
    mkdirSync(join(root, 'src'), { recursive: true });
    mkdirSync(join(root, 'node_modules', '@acme', 'ui', 'dist'), { recursive: true });
    mkdirSync(join(root, '..', 'vapor-sibling-' + Date.now()), { recursive: true });
    writeFileSync(
        join(root, 'src', 'a.tsx'),
        `import { css } from '@vapor-ui/style-macro';\nexport const a = css({ paddingTop: '$space-100' });\n`,
    );
    writeFileSync(
        join(root, 'node_modules', '@acme', 'ui', 'dist', 'b.js'),
        `import { css } from '@vapor-ui/style-macro';\nexport const b = css({ color: '$fg-primary' });\n`,
    );
    return root;
}

describe('resolveOptions — glob resolution', () => {
    it('relative globs resolve against root; `..` and absolute globs are allowed', () => {
        const o = resolveOptions({
            root: '/repo/apps/storybook',
            include: ['../../packages/core/src/**', '/abs/lib/**'],
        });
        expect(o.includeGlobs).toEqual(['/repo/packages/core/src/**', '/abs/lib/**']);
        expect(o.include('/repo/packages/core/src/x.tsx')).toBe(true);
        expect(o.include('/abs/lib/y.ts')).toBe(true);
        expect(o.include('/repo/packages/other/src/x.tsx')).toBe(true); // default rule
        expect(o.include('/repo/node_modules/p/i.js')).toBe(false);
    });

    it('layer defaults to vapor-utilities', () => {
        expect(resolveOptions({}).layer).toBe('vapor-utilities');
    });

    it('accepts a custom layer name, including dotted sub-layers', () => {
        expect(resolveOptions({ layer: 'composites' }).layer).toBe('composites');
        expect(resolveOptions({ layer: 'acme.ui' }).layer).toBe('acme.ui');
    });

    it.each(['', ' ', 'my layer', '1abc', 'a{b}', 'a;b', 'a,b', 'a.', '.a'])(
        'rejects an invalid layer name %j',
        (layer) => {
            expect(() => resolveOptions({ layer })).toThrow(/layer/);
        },
    );

    it('bundler-provided default root is used when the user sets none', () => {
        const o = resolveOptions({ include: ['src/**'] }, { root: '/proj' });
        expect(o.root).toBe('/proj');
        expect(o.includeGlobs).toEqual(['/proj/src/**']);
    });
});

describe('collectCss', () => {
    it('scans root sources and include-globbed node_modules packages', () => {
        const root = fixture();
        const out = collectCss({ root, include: ['node_modules/@acme/ui/dist/**'] });
        expect(out.files).toHaveLength(2);
        expect(out.css).toContain('padding-top');
        expect(out.css).toContain('--vapor-color-foreground-primary');
    });

    it('puts the collected sheet into the configured layer', () => {
        const root = fixture();
        const out = collectCss({ root, layer: 'composites' });
        expect(out.css).toMatch(/@layer composites \{[\s\S]*padding-top/);
        expect(out.css).not.toContain('vapor-utilities');
    });

    it('skips node_modules without an include glob', () => {
        const root = fixture();
        expect(collectCss({ root }).files).toHaveLength(1);
    });
});

describe('injectCss', () => {
    const base = '@import "@vapor-ui/core/styles.css";\n';

    it('replaces the @vapor-utilities marker', () => {
        const root = fixture();
        const out = injectCss(`${base}@vapor-utilities;\n.x{}`, { root });
        expect(out?.css).toMatch(/@layer vapor-utilities \{[\s\S]*padding-top/);
        expect(out?.css).not.toContain('@vapor-utilities;');
        expect(out?.css).toContain('.x{}');
    });

    it('appends after an @import of @vapor-ui/core/layers.css when no marker', () => {
        const root = fixture();
        const src = `@import '@vapor-ui/core/layers.css';\n${base}.x{}`;
        const out = injectCss(src, { root });
        expect(out?.css.startsWith(src)).toBe(true);
        expect(out?.css).toContain('padding-top');
    });

    it('prefers the marker when both are present (no duplicate)', () => {
        const root = fixture();
        const out = injectCss(`@import '@vapor-ui/core/layers.css';\n@vapor-utilities;\n`, {
            root,
        });
        expect(out?.css.match(/@layer vapor-utilities \{/g)).toHaveLength(1);
    });

    it('the @vapor-utilities marker still triggers insertion with a custom layer', () => {
        const root = fixture();
        const out = injectCss(`@vapor-utilities;\n`, { root, layer: 'composites' });
        expect(out?.css).toMatch(/@layer composites \{[\s\S]*padding-top/);
        expect(out?.css).not.toContain('@vapor-utilities;');
    });

    it('returns null when neither marker nor import is present', () => {
        expect(injectCss('.x{}', { root: fixture() })).toBeNull();
    });

    it('terminates an unterminated last statement instead of extending its prelude', () => {
        // `@import "x"` at EOF is valid CSS. Appending text must not turn the sheet into
        // part of that prelude (postcss-import would emit `@media @layer vapor-utilities {}`).
        const root = fixture();
        const src = `@import '@vapor-ui/core/layers.css';\n@import "@vapor-ui/composites/styles.css"`;
        const out = injectCss(src, { root });

        const imports = postcss
            .parse(out!.css)
            .nodes.filter((n): n is AtRule => n.type === 'atrule' && n.name === 'import');
        expect(imports.map((n) => n.params)).toEqual([
            `'@vapor-ui/core/layers.css'`,
            `"@vapor-ui/composites/styles.css"`,
        ]);
        expect(out?.css).toMatch(/@layer vapor-utilities \{[\s\S]*padding-top/);
    });

    it('leaves the source untouched before the insertion point', () => {
        const root = fixture();
        const src = `/* keep */\n@import '@vapor-ui/core/layers.css';\n\n.a  {  color : red }\n`;
        const out = injectCss(src, { root });
        expect(out?.css.startsWith(src.trimEnd())).toBe(true);
    });

    it('ignores a marker inside a comment', () => {
        const root = fixture();
        const src = `/* put @vapor-utilities; here */\n@vapor-utilities;\n`;
        const out = injectCss(src, { root });
        expect(out?.css).toContain('/* put @vapor-utilities; here */');
        expect(out?.css.match(/@layer vapor-utilities \{/g)).toHaveLength(1);
    });

    it('does not trigger on a commented-out layers.css import', () => {
        const src = `/* @import '@vapor-ui/core/layers.css'; */\n.x{}`;
        expect(injectCss(src, { root: fixture() })).toBeNull();
    });

    it('recognises url() and layer()/media suffixed imports of layers.css', () => {
        const root = fixture();
        for (const imp of [
            `@import url("@vapor-ui/core/layers.css");`,
            `@import "@vapor-ui/core/layers.css" layer(vapor);`,
        ]) {
            expect(injectCss(imp, { root })?.css).toContain('padding-top');
        }
    });

    it('does not trigger on other files that merely mention layers.css', () => {
        const src = `@import '@vapor-ui/core/layers.css.bak';\n.x{}`;
        expect(injectCss(src, { root: fixture() })).toBeNull();
    });

    it('returns null on unparsable CSS so the bundler reports the syntax error', () => {
        const src = `@import '@vapor-ui/core/layers.css';\n.x { color: red`;
        expect(() => injectCss(`${src}\n}}}`, { root: fixture() })).not.toThrow();
        expect(injectCss(`${src}\n}}}`, { root: fixture() })).toBeNull();
    });
});
