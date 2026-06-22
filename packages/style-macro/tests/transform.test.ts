import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { transform } from '../src';
import { loadManifest } from '../src/tokens';

const manifest = loadManifest(new URL('./fixtures/manifest.sample.json', import.meta.url).pathname);
const FIX_DIR = new URL('./fixtures', import.meta.url).pathname;

describe('transform fixtures', () => {
    const dirs = readdirSync(FIX_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== 'reject')
        .map((d) => d.name);
    for (const name of dirs) {
        it(`accepts: ${name}`, () => {
            const dir = join(FIX_DIR, name);
            const source = readFileSync(join(dir, 'input.tsx'), 'utf-8');
            const result = transform({ source, filename: 'input.tsx', manifest });
            expect(result.errors).toEqual([]);
            const expectedCode = readFileSync(join(dir, 'expected.code.tsx'), 'utf-8');
            expect(result.code.replace(/\s+/g, ' ').trim()).toBe(expectedCode.replace(/\s+/g, ' ').trim());
            const expectedCss = readFileSync(join(dir, 'expected.css'), 'utf-8');
            expect(result.css?.replace(/\s+/g, ' ').trim()).toBe(expectedCss.replace(/\s+/g, ' ').trim());
        });
    }

    const rejectFiles = existsSync(join(FIX_DIR, 'reject'))
        ? readdirSync(join(FIX_DIR, 'reject'), { withFileTypes: true })
              .filter((d) => d.isFile() && d.name.endsWith('.input.tsx'))
              .map((d) => d.name)
        : [];
    for (const file of rejectFiles) {
        it(`rejects: ${file}`, () => {
            const source = readFileSync(join(FIX_DIR, 'reject', file), 'utf-8');
            const result = transform({ source, filename: file, manifest });
            const expectedJson = readFileSync(
                join(FIX_DIR, 'reject', file.replace('.input.tsx', '.expected.errors.json')),
                'utf-8',
            );
            const expected = JSON.parse(expectedJson) as Array<{ code: string }>;
            expect(result.errors.map((e) => e.code).sort()).toEqual(expected.map((e) => e.code).sort());
        });
    }
});
