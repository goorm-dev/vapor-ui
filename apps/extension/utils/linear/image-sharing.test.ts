import { describe, expect, it } from 'vitest';

import { findSharedImage } from './image-sharing';
import type { QaItem } from '../data/session-store';

let counter = 0;
const item = (over: Partial<QaItem>): QaItem => ({
    id: `id-${counter++}`,
    selector: 'div',
    rect: { top: 0, left: 0, width: 10, height: 10 },
    memo: '',
    createdAt: 0,
    ...over,
});

describe('findSharedImage', () => {
    it('returns null when no item shares the scroll position', () => {
        const items = [item({ imageRef: 'a', index: 1, scrollX: 0, scrollY: 0 })];
        expect(findSharedImage(items, 0, 500)).toBeNull();
    });

    it('reuses the imageRef and increments index for the same viewport', () => {
        const items = [
            item({ imageRef: 'a', index: 1, scrollX: 0, scrollY: 0 }),
            item({ imageRef: 'a', index: 2, scrollX: 0, scrollY: 0 }),
        ];
        expect(findSharedImage(items, 0, 0)).toEqual({ imageRef: 'a', nextIndex: 3 });
    });

    it('ignores items without an imageRef', () => {
        const items = [item({ scrollX: 0, scrollY: 0 })];
        expect(findSharedImage(items, 0, 0)).toBeNull();
    });
});
