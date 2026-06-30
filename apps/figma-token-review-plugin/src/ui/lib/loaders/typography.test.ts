import { describe, expect, it } from 'vitest';

import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';

describe('loadTextStyleSchema', () => {
    const schema = loadTextStyleSchema();

    it('order는 위계 큰 것부터 작은 것 순서를 유지한다 (display1 → ... → body4)', () => {
        expect(schema.order.indexOf('display1')).toBeLessThan(schema.order.indexOf('body4'));
    });

    it('각 스타일은 rank 인덱스를 갖는다', () => {
        for (const [name, meta] of Object.entries(schema.styles)) {
            expect(meta.rank).toBe(schema.order.indexOf(name));
        }
    });
});
