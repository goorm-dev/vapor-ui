import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { findComponentFiles } from '~/core/scanner';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('findComponentFiles', () => {
    it('should find .tsx files in given path', async () => {
        const files = await findComponentFiles(FIXTURES_DIR);

        expect(files.some((f) => f.endsWith('sample.tsx'))).toBe(true);
    });

    it('should exclude .stories.tsx and .css.ts by default', async () => {
        const files = await findComponentFiles(FIXTURES_DIR);

        expect(files.some((f) => f.endsWith('.stories.tsx'))).toBe(false);
    });

    it('should add ignore patterns to default when using --ignore', async () => {
        const files = await findComponentFiles(FIXTURES_DIR, { ignore: ['sample.tsx'] });

        expect(files.some((f) => f.endsWith('sample.tsx'))).toBe(false);
        expect(files.some((f) => f.endsWith('.stories.tsx'))).toBe(false);
    });

    it('should ignore default patterns when using --no-default-ignore', async () => {
        const files = await findComponentFiles(FIXTURES_DIR, { noDefaultIgnore: true });

        expect(files.some((f) => f.endsWith('.stories.tsx'))).toBe(true);
    });

    it('should use only custom ignore when both options provided', async () => {
        const files = await findComponentFiles(FIXTURES_DIR, {
            noDefaultIgnore: true,
            ignore: ['sample.tsx'],
        });

        expect(files.some((f) => f.endsWith('sample.tsx'))).toBe(false);
        expect(files.some((f) => f.endsWith('.stories.tsx'))).toBe(true);
    });
});
