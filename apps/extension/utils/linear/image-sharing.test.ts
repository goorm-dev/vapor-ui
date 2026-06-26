import { describe, expect, it } from 'vitest';

import type { QaItem } from '~/utils/data/session-store';

import { findSharedImage } from './image-sharing';

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
        const items = [
            item({
                imageRef: 'a',
                index: 1,
                tabId: 1,
                pageUrl: 'https://example.com/a',
                scrollX: 0,
                scrollY: 0,
                width: 1200,
            }),
        ];
        expect(findSharedImage(items, 1, 'https://example.com/a', 0, 500, 1200)).toBeNull();
    });

    it('reuses the imageRef and increments index for the same viewport', () => {
        const items = [
            item({
                imageRef: 'a',
                index: 1,
                tabId: 1,
                pageUrl: 'https://example.com/a',
                scrollX: 0,
                scrollY: 0,
                width: 1200,
            }),
            item({
                imageRef: 'a',
                index: 2,
                tabId: 1,
                pageUrl: 'https://example.com/a',
                scrollX: 0,
                scrollY: 0,
                width: 1200,
            }),
        ];
        expect(findSharedImage(items, 1, 'https://example.com/a', 0, 0, 1200)).toEqual({
            imageRef: 'a',
            nextIndex: 3,
        });
    });

    it('ignores items without an imageRef', () => {
        const items = [
            item({
                tabId: 1,
                pageUrl: 'https://example.com/a',
                scrollX: 0,
                scrollY: 0,
                width: 1200,
            }),
        ];
        expect(findSharedImage(items, 1, 'https://example.com/a', 0, 0, 1200)).toBeNull();
    });

    it('returns null when the width differs at the same scroll position', () => {
        const items = [
            item({
                imageRef: 'a',
                index: 1,
                tabId: 1,
                pageUrl: 'https://example.com/a',
                scrollX: 0,
                scrollY: 0,
                width: 1200,
            }),
        ];
        expect(findSharedImage(items, 1, 'https://example.com/a', 0, 0, 800)).toBeNull();
    });

    it('does not reuse an image from another page at the same viewport', () => {
        const items = [
            item({
                imageRef: 'a',
                index: 1,
                tabId: 1,
                pageUrl: 'https://example.com/a',
                scrollX: 0,
                scrollY: 0,
                width: 1200,
            }),
        ];
        expect(findSharedImage(items, 1, 'https://example.com/b', 0, 0, 1200)).toBeNull();
    });

    it('does not reuse an image from another tab with the same URL', () => {
        const items = [
            item({
                imageRef: 'a',
                index: 1,
                tabId: 1,
                pageUrl: 'https://example.com/a',
                scrollX: 0,
                scrollY: 0,
                width: 1200,
            }),
        ];
        expect(findSharedImage(items, 2, 'https://example.com/a', 0, 0, 1200)).toBeNull();
    });
});
