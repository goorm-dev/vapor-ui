import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
    findComponentFiles,
    findFileByComponentName,
    normalizeComponentName,
} from '~/core/scanner';

const FIXTURES_DIR = path.join(__dirname, '../fixtures');

describe('findComponentFiles', () => {
    it('should find .tsx files in given path', async () => {
        const files = await findComponentFiles(FIXTURES_DIR);

        expect(files.some((f) => f.endsWith('sample.tsx'))).toBe(true);
    });

    it('should exclude .stories.tsx and .css.ts by default', async () => {
        const files = await findComponentFiles(FIXTURES_DIR);

        expect(files.some((f) => f.endsWith('.stories.tsx'))).toBe(false);
    });

    it('should add exclude patterns to default when using --exclude', async () => {
        const files = await findComponentFiles(FIXTURES_DIR, { exclude: ['sample.tsx'] });

        expect(files.some((f) => f.endsWith('sample.tsx'))).toBe(false);
        expect(files.some((f) => f.endsWith('.stories.tsx'))).toBe(false);
    });

    it('should skip default excludes when using --no-exclude-defaults', async () => {
        const files = await findComponentFiles(FIXTURES_DIR, { skipDefaultExcludes: true });

        expect(files.some((f) => f.endsWith('.stories.tsx'))).toBe(true);
    });

    it('should use only custom exclude when both options provided', async () => {
        const files = await findComponentFiles(FIXTURES_DIR, {
            skipDefaultExcludes: true,
            exclude: ['sample.tsx'],
        });

        expect(files.some((f) => f.endsWith('sample.tsx'))).toBe(false);
        expect(files.some((f) => f.endsWith('.stories.tsx'))).toBe(true);
    });
});

describe('normalizeComponentName', () => {
    it('should convert to lowercase', () => {
        expect(normalizeComponentName('Button')).toBe('button');
    });

    it('should remove hyphens', () => {
        expect(normalizeComponentName('text-input')).toBe('textinput');
    });

    it('should handle PascalCase', () => {
        expect(normalizeComponentName('TextInput')).toBe('textinput');
    });

    it('should handle mixed case with hyphens', () => {
        expect(normalizeComponentName('Icon-Button')).toBe('iconbutton');
    });
});

describe('findFileByComponentName', () => {
    const files = ['/path/to/button.tsx', '/path/to/text-input.tsx', '/path/to/card.tsx'];

    it('should find file by exact name', () => {
        expect(findFileByComponentName(files, 'button')).toBe('/path/to/button.tsx');
    });

    it('should find file by PascalCase input', () => {
        expect(findFileByComponentName(files, 'Button')).toBe('/path/to/button.tsx');
    });

    it('should find kebab-case file by PascalCase input', () => {
        expect(findFileByComponentName(files, 'TextInput')).toBe('/path/to/text-input.tsx');
    });

    it('should return null for non-existent component', () => {
        expect(findFileByComponentName(files, 'Modal')).toBeNull();
    });

    it('should not match partial names', () => {
        expect(findFileByComponentName(files, 'but')).toBeNull();
    });
});
