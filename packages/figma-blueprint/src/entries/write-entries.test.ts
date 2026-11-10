import { describe, expect, it } from 'vitest';

import { parseFigmaUrl } from './write-entries';

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
