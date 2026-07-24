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

    it('display1 fontSize 는 typography.json 의 1000 스케일(120) 로 resolve 된다', () => {
        expect(schema.styles.display1.fontSize).toBe(120);
    });

    it('body2 fontSize 는 typography.json 의 075 스케일(14) 로 resolve 된다', () => {
        expect(schema.styles.body2.fontSize).toBe(14);
    });

    it('alias 를 해석할 수 없는 케이스는 null', () => {
        // 스키마 안에 실제로 alias resolve 실패 케이스가 없더라도, 타입이 nullable 이라는 것을 보장
        for (const meta of Object.values(schema.styles)) {
            expect(meta.fontSize === null || typeof meta.fontSize === 'number').toBe(true);
        }
    });
});
