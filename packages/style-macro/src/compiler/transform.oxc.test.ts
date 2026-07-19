import type { ManifestShape } from '~/model/types';

import { transform } from './transform';

const MANIFEST: ManifestShape = {
    version: '1',
    tokens: {
        color: { primary: '--vapor-color-primary' },
        space: { '400': '--vapor-size-space-400', '200': '--vapor-size-space-200' },
        dimension: {},
        borderRadius: {},
        shadow: {},
        typography: {},
    },
    propertyScopes: {
        padding: 'space',
        color: 'color',
    },
};

describe('transform (oxc)', () => {
    it('replaces a styles call with a string literal', () => {
        const src = [
            `import { styles } from '@vapor-ui/core';`,
            `const cls = styles({ padding: '$400' });`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
        });
        expect(result.errors).toEqual([]);
        expect(result.classes.length).toBeGreaterThan(0);
        expect(result.code).not.toContain('styles(');
    });

    it('preserves surrounding whitespace and comments', () => {
        const src = [
            `import { styles } from '@vapor-ui/core';`,
            `// leading comment`,
            `const cls = styles({ padding: '$400' }); /* trailing */`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
        });
        expect(result.errors).toEqual([]);
        expect(result.code).toContain('// leading comment');
        expect(result.code).toContain('/* trailing */');
        expect(result.code).not.toContain('styles(');
    });

    it('honours import aliasing (import { styles as s })', () => {
        const src = [
            `import { styles as s } from '@vapor-ui/core';`,
            `const cls = s({ padding: '$400' });`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
        });
        expect(result.errors).toEqual([]);
        expect(result.classes.length).toBeGreaterThan(0);
        expect(result.code).not.toContain('s({');
    });

    it('skips parsing when the marker is absent', () => {
        const src = `const x = 42;`;
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
        });
        expect(result.code).toBe(src);
        expect(result.css).toBeNull();
        expect(result.classes).toEqual([]);
        expect(result.errors).toEqual([]);
    });

    it('handles nested styles calls in post-order (inner rewritten first)', () => {
        // styles call inside another function argument — inner fires first
        const src = [
            `import { styles } from '@vapor-ui/core';`,
            `const a = wrapper(styles({ padding: '$400' }));`,
            `const b = styles({ padding: '$200' });`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
        });
        expect(result.errors).toEqual([]);
        expect(result.classes.length).toBe(2);
        expect(result.code).not.toContain('styles(');
        // Positive: both calls must be rewritten to single-quoted string literals.
        expect(result.code).toMatch(/wrapper\(\s*'[a-zA-Z0-9_\- ]+'\s*\)/);
        expect(result.code).toMatch(/const b = '[a-zA-Z0-9_\- ]+'/);
    });

    it('inlines entry-level ternary using the original test expression source', () => {
        const src = [
            `import { styles } from '@vapor-ui/core';`,
            `const cls = styles({ padding: condition ? '$400' : '$200' });`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
        });
        expect(result.errors).toEqual([]);
        expect(result.code).toContain('condition ?');
        expect(result.code).not.toContain('styles(');
        // Lock in: ternary branches must be single-quoted, not double-quoted
        expect(result.code).toMatch(/\?\s*'[a-zA-Z0-9_\- ]+'\s*:\s*'[a-zA-Z0-9_\- ]+'/);
    });

    it('parses TSX generic call sites without error', () => {
        const src = [
            `import { styles } from '@vapor-ui/core';`,
            `function Component<T extends object>() {`,
            `  const cls = styles({ padding: '$400' });`,
            `  return null;`,
            `}`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
        });
        expect(result.errors).toEqual([]);
        expect(result.classes.length).toBeGreaterThan(0);
        expect(result.code).not.toContain('styles(');
    });

    it('sets hasProviderImport when ThemeProvider is imported from @vapor-ui/core', () => {
        const source = [
            `import { styles } from '@vapor-ui/core';`,
            `import { ThemeProvider } from '@vapor-ui/core';`,
            `export const app = (<ThemeProvider><div /></ThemeProvider>);`,
        ].join('\n');
        const result = transform({
            source,
            filename: '/t.tsx',
            manifest: MANIFEST,
        });
        expect(result.errors).toEqual([]);
        expect(result.hasProviderImport).toBe(true);
    });

    it('leaves hasProviderImport false when Provider import is absent', () => {
        const source = [
            `import { styles } from '@vapor-ui/core';`,
            `const cls = styles({ padding: '$400' });`,
        ].join('\n');
        const result = transform({
            source,
            filename: '/t.tsx',
            manifest: MANIFEST,
        });
        expect(result.hasProviderImport).toBe(false);
    });
});
