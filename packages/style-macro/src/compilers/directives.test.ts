import { describe, expect, it } from 'vitest';

import { directivePrologueEnd, insertAfterDirectives } from './directives';

describe('directivePrologueEnd', () => {
    it('returns 0 for empty source', () => {
        expect(directivePrologueEnd('')).toBe(0);
    });

    it('returns 0 when no leading directive', () => {
        const src = `import x from 'y';\n`;
        expect(directivePrologueEnd(src)).toBe(0);
    });

    it('skips a leading `use client` directive', () => {
        const src = `'use client';\nimport x from 'y';\n`;
        const pos = directivePrologueEnd(src);
        expect(src.slice(pos)).toBe(`import x from 'y';\n`);
    });

    it('skips `use strict`', () => {
        const src = `"use strict";\nconst a = 1;`;
        const pos = directivePrologueEnd(src);
        expect(src.slice(pos)).toBe(`const a = 1;`);
    });

    it('skips multiple stacked directives', () => {
        const src = `'use strict';\n'use client';\nimport x from 'y';`;
        const pos = directivePrologueEnd(src);
        expect(src.slice(pos)).toBe(`import x from 'y';`);
    });

    it('tolerates missing semicolon', () => {
        const src = `'use client'\nimport x from 'y';`;
        const pos = directivePrologueEnd(src);
        expect(src.slice(pos)).toBe(`import x from 'y';`);
    });

    it('tolerates leading whitespace', () => {
        const src = `   'use client';\nimport x from 'y';`;
        const pos = directivePrologueEnd(src);
        expect(src.slice(pos)).toBe(`import x from 'y';`);
    });
});

describe('insertAfterDirectives', () => {
    it('prepends when no directive present', () => {
        const lines = [`import x from 'y';`];
        const out = insertAfterDirectives(`const a = 1;`, lines);
        expect(out).toBe(`import x from 'y';\nconst a = 1;`);
    });

    it('inserts after `use client` directive', () => {
        const lines = [`import x from 'y';`];
        const out = insertAfterDirectives(`'use client';\nconst a = 1;`, lines);
        expect(out).toBe(`'use client';\nimport x from 'y';\nconst a = 1;`);
    });

    it('inserts after stacked directives', () => {
        const lines = [`import x from 'y';`];
        const out = insertAfterDirectives(`'use strict';\n'use client';\nconst a = 1;`, lines);
        expect(out).toBe(`'use strict';\n'use client';\nimport x from 'y';\nconst a = 1;`);
    });
});
