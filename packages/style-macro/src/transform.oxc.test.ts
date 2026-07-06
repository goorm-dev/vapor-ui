import { describe, expect, it } from 'vitest';

import type { ManifestShape } from './types';
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
    it('replaces a $style call with a string literal', () => {
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `const cls = $style({ padding: '$400' });`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
            providerImportSource: [],
        });
        expect(result.errors).toEqual([]);
        expect(result.classes.length).toBeGreaterThan(0);
        expect(result.code).not.toContain('$style(');
    });

    it('preserves surrounding whitespace and comments', () => {
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `// leading comment`,
            `const cls = $style({ padding: '$400' }); /* trailing */`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
            providerImportSource: [],
        });
        expect(result.errors).toEqual([]);
        expect(result.code).toContain('// leading comment');
        expect(result.code).toContain('/* trailing */');
        expect(result.code).not.toContain('$style(');
    });

    it('honours import aliasing (import { $style as s })', () => {
        const src = [
            `import { $style as s } from '@vapor-ui/style-macro';`,
            `const cls = s({ padding: '$400' });`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
            providerImportSource: [],
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
            providerImportSource: [],
        });
        expect(result.code).toBe(src);
        expect(result.css).toBeNull();
        expect(result.classes).toEqual([]);
        expect(result.errors).toEqual([]);
    });

    it('handles nested $style calls in post-order (inner rewritten first)', () => {
        // $style call inside another function argument — inner fires first
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `const a = wrapper($style({ padding: '$400' }));`,
            `const b = $style({ padding: '$200' });`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
            providerImportSource: [],
        });
        expect(result.errors).toEqual([]);
        expect(result.classes.length).toBe(2);
        expect(result.code).not.toContain('$style(');
    });

    it('inlines entry-level ternary using the original test expression source', () => {
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `const cls = $style({ padding: condition ? '$400' : '$200' });`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
            providerImportSource: [],
        });
        expect(result.errors).toEqual([]);
        expect(result.code).toContain('condition ?');
        expect(result.code).not.toContain('$style(');
    });

    it('parses TSX generic call sites without error', () => {
        const src = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `function Component<T extends object>() {`,
            `  const cls = $style({ padding: '$400' });`,
            `  return null;`,
            `}`,
        ].join('\n');
        const result = transform({
            source: src,
            filename: 't.tsx',
            manifest: MANIFEST,
            providerImportSource: [],
        });
        expect(result.errors).toEqual([]);
        expect(result.classes.length).toBeGreaterThan(0);
        expect(result.code).not.toContain('$style(');
    });
});
