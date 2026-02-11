import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { findTsconfig } from '~/core/discovery';

const FIXTURES_DIR = path.join(__dirname, '../fixtures');

describe('findTsconfig', () => {
    it('should find tsconfig.json in the same directory', () => {
        const result = findTsconfig(FIXTURES_DIR);
        expect(result).toBe(path.join(FIXTURES_DIR, 'tsconfig.json'));
    });

    it('should find tsconfig.json in parent directory', () => {
        const subDir = path.join(FIXTURES_DIR, 'subdir');
        const result = findTsconfig(subDir);
        expect(result).toBe(path.join(FIXTURES_DIR, 'tsconfig.json'));
    });

    it('should return null if no tsconfig.json found', () => {
        const result = findTsconfig('/');
        expect(result).toBeNull();
    });
});
