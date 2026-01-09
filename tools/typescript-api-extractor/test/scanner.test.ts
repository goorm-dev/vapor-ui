import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { findComponentFiles } from '../src/core/scanner.js';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('findComponentFiles', () => {
  it('should find .tsx files in given path', async () => {
    const files = await findComponentFiles(FIXTURES_DIR);

    expect(files.some((f) => f.endsWith('sample.tsx'))).toBe(true);
  });

  it('should return empty array for path with no .tsx files', async () => {
    const files = await findComponentFiles(path.join(__dirname, '..', 'src', 'utils'));

    expect(files).toEqual([]);
  });
});
