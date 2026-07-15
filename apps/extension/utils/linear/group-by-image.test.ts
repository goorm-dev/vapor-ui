import { describe, expect, it } from 'vitest';

import type { QaItem } from '~/utils/data/session-store';

import { groupByImage } from './group-by-image';

let counter = 0;
const item = (over: Partial<QaItem>): QaItem => ({
    id: `id-${counter++}`,
    selector: 'div',
    rect: { top: 0, left: 0, width: 10, height: 10 },
    memo: '',
    createdAt: 0,
    ...over,
});

describe('groupByImage', () => {
    it('groups items that share an imageRef and sorts them by index', () => {
        const a2 = item({ imageRef: 'a', index: 2 });
        const a1 = item({ imageRef: 'a', index: 1 });
        const result = groupByImage([a2, a1]);
        expect(result).toEqual([[a1, a2]]);
    });

    it('keeps groups in first-seen order', () => {
        const a = item({ imageRef: 'a', index: 1 });
        const b = item({ imageRef: 'b', index: 1 });
        const result = groupByImage([a, b]);
        expect(result.map((g) => g[0].imageRef)).toEqual(['a', 'b']);
    });

    it('puts items without an imageRef in their own solo group', () => {
        const solo1 = item({});
        const solo2 = item({});
        const result = groupByImage([solo1, solo2]);
        expect(result).toEqual([[solo1], [solo2]]);
    });
});
