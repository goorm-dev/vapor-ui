import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { transform } from '../src';
import { loadManifest } from '../src/tokens';

const manifest = loadManifest(new URL('./fixtures/manifest.sample.json', import.meta.url).pathname);
const FIX = new URL('./fixtures', import.meta.url).pathname;

describe('byte-identical output', () => {
    const dirs = readdirSync(FIX, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== 'reject')
        .map((d) => d.name);
    for (const name of dirs) {
        it(`${name} → identical on rerun`, () => {
            const src = readFileSync(join(FIX, name, 'input.tsx'), 'utf-8');
            const a = transform({ source: src, filename: 'x', manifest });
            const b = transform({ source: src, filename: 'x', manifest });
            expect(a.code).toBe(b.code);
            expect(a.css).toBe(b.css);
            expect(a.classes).toEqual(b.classes);
        });
    }
});
