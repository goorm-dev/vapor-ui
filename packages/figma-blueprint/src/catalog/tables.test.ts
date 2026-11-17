import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { extractTables } from './tables';

const root = fileURLToPath(new URL('../__fixtures__/repo', import.meta.url));

describe('defaults and presets of the real packages', () => {
    const { defaults, presets } = extractTables(
        fileURLToPath(new URL('../../../..', import.meta.url)),
    );

    it('gives a part the defaults of the core component it renders with {...props}', () => {
        expect(defaults.IconButton).toMatchObject({
            size: 'md',
            colorPalette: 'primary',
            variant: 'fill',
        });
    });

    it("gives a root the defaults its parts' recipes agree on", () => {
        expect(defaults['Tabs.Root']).toMatchObject({ size: 'md', variant: 'line' });
    });

    it('keeps every branch of a preset prop the wrapper picks from context', () => {
        expect(presets['AlertDialog.Action']).toEqual({
            tag: 'Button',
            props: { size: 'lg', colorPalette: ['danger', 'primary'] },
        });
    });
});

describe('internalParts', () => {
    const { internalParts } = extractTables(root);

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
