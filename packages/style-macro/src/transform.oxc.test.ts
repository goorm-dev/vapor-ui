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
        // Positive: both calls must be rewritten to single-quoted string literals.
        expect(result.code).toMatch(/wrapper\(\s*'[a-zA-Z0-9_\- ]+'\s*\)/);
        expect(result.code).toMatch(/const b = '[a-zA-Z0-9_\- ]+'/);
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
        // Lock in: ternary branches must be single-quoted, not double-quoted
        expect(result.code).toMatch(/\?\s*'[a-zA-Z0-9_\- ]+'\s*:\s*'[a-zA-Z0-9_\- ]+'/);

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

    it('emits layer-non-static when multiple <ThemeProvider layer> occur in the same file', () => {
        const source = [
            `import { $style } from '@vapor-ui/style-macro';`,
            `import { ThemeProvider } from '@vapor-ui/core';`,
            `export const app = (`,
            `  <ThemeProvider layer={(l) => [l.theme]}>`,
            `    <ThemeProvider layer={(l) => [l.reset]}>`,
            `      <div />`,
            `    </ThemeProvider>`,
            `  </ThemeProvider>`,
            `);`,
        ].join('\n');
        const result = transform({
            source,
            filename: '/t.tsx',
            manifest: MANIFEST,
            providerImportSource: ['@vapor-ui/core'],
            layerRegistry: { theme: 'vapor-theme', reset: 'vapor-reset' },
        });
        expect(result.errors.some((e) => e.code === 'layer-non-static')).toBe(true);
        // First occurrence still wins for layerOrder.
        expect(result.layerOrder).toEqual(['vapor-theme']);
    });
});
