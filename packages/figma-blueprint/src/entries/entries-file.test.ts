import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { missingEntries } from './entries-file';

const dir = (path: string) => fileURLToPath(new URL(path, import.meta.url));

describe('missingEntries', () => {
    it.each(['core', 'composites', 'icons'])(
        'packages/%s/figma-entries.json holds every Code Connect entry (rerun `figma-blueprint entries` if not)',
        (pkg) => {
            expect(missingEntries(dir(`../../../${pkg}`))).toEqual([]);
        },
    );

    it('reports a URL the entries file lacks or holds with an outdated batch row, and skips excluded files', () => {
        expect(missingEntries(dir('../__fixtures__/entries'))).toEqual([
            'https://www.figma.com/design/F/Lib?node-id=1-3',
            'https://www.figma.com/design/F/Lib?node-id=1-4',
        ]);
    });
});
