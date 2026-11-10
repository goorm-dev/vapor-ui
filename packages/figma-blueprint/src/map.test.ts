import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { missingEntries, parseFigmaUrl } from './map';

const dir = (path: string) => fileURLToPath(new URL(path, import.meta.url));

describe('missingEntries', () => {
    it.each(['core', 'composites', 'icons'])(
        'packages/%s/figma-entries.json holds every Code Connect entry (rerun `figma-blueprint map` if not)',
        (pkg) => {
            expect(missingEntries(dir(`../../${pkg}`))).toEqual([]);
        },
    );

    it('reports a URL the entries file lacks or holds with an outdated batch row, and skips excluded files', () => {
        expect(missingEntries(dir('./__fixtures__/entries'))).toEqual([
            'https://www.figma.com/design/F/Lib?node-id=1-3',
            'https://www.figma.com/design/F/Lib?node-id=1-4',
        ]);
    });
});

describe('parseFigmaUrl', () => {
    it('turns every dash of a nested node id into a colon', () => {
        expect(
            parseFigmaUrl('https://www.figma.com/design/F/x?node-id=I529-7899%3B2847-43442'),
        ).toEqual({ fileKey: 'F', nodeId: 'I529:7899;2847:43442' });
    });

    it('reads a branch URL as the branch file', () => {
        expect(parseFigmaUrl('https://www.figma.com/design/F/branch/B/x?node-id=1-2').fileKey).toBe(
            'B',
        );
    });
});
