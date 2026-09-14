import { describe, expect, it } from 'vitest';

import type { Unit } from '~/translate/core/document';
import { planTranslation } from '~/translate/core/plan';

const unit = (source: string, path = 'description'): Unit => ({ file: 'a.json', path, source });

describe('planTranslation', () => {
    it('같은 원문은 한 번만 센다', () => {
        const units = [unit('A'), unit('A', 'props.x.description'), unit('B')];

        expect(planTranslation(units, new Map()).sources).toEqual(['A', 'B']);
    });

    it('사전에 없는 원문만 번역 대상이다', () => {
        const plan = planTranslation([unit('A'), unit('B')], new Map([['A', '가']]));

        expect(plan.misses).toEqual(['B']);
    });

    it('사전이 다 덮으면 번역 대상이 없다', () => {
        const plan = planTranslation([unit('A')], new Map([['A', '가']]));

        expect(plan.misses).toEqual([]);
    });
});
