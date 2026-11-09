import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { extractTables } from './build';

const { internalParts } = extractTables(
    fileURLToPath(new URL('./__fixtures__/repo', import.meta.url)),
);

describe('internalParts', () => {
    it('lists the library components a part always draws, through local components and JSX attributes', () => {
        // VStack is layout, Divider's Code Connect file is excluded, and the slot's Button comes from the caller.
        expect(internalParts['Sheet.Root']).toEqual(['IconButton', 'Panel.Header']);
    });

    it.each(['Sheet.Flagged', 'Sheet.Choice', 'Sheet.Guarded'])(
        'leaves out what a condition guards (%s)',
        (part) => {
            expect(internalParts).not.toHaveProperty([part]);
        },
    );
});
