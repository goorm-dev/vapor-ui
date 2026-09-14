import { describe, expect, it } from 'vitest';

import type { PropsInfoJson } from '~/models/output';
import { applyDictionary, collectUnits } from '~/translate/core/document';

const doc: PropsInfoJson = {
    name: 'Badge',
    description: 'Renders a `<span>` element.',
    props: [
        { name: 'size', type: ['string'], required: false, description: 'Whether it is big.' },
        { name: 'color', type: ['string'], required: false },
    ],
};

describe('collectUnits', () => {
    it('설명문이 있는 곳만 모은다', () => {
        expect(collectUnits('badge.json', doc)).toEqual([
            { file: 'badge.json', path: 'description', source: 'Renders a `<span>` element.' },
            { file: 'badge.json', path: 'props.size.description', source: 'Whether it is big.' },
        ]);
    });

    it('설명문이 없으면 빈 배열이다', () => {
        expect(collectUnits('x.json', { name: 'X', props: [] })).toEqual([]);
    });
});

describe('applyDictionary', () => {
    it('사전에 있는 원문만 치환하고 나머지는 영어로 남긴다', () => {
        const result = applyDictionary(doc, new Map([['Whether it is big.', '큰지 여부입니다.']]));

        expect(result.doc.props[0]!.description).toBe('큰지 여부입니다.');
        expect(result.doc.description).toBe('Renders a `<span>` element.');
        expect(result).toMatchObject({ applied: 1, kept: 1 });
    });

    it('원본을 변형하지 않는다', () => {
        applyDictionary(doc, new Map([['Whether it is big.', '큰지 여부입니다.']]));

        expect(doc.props[0]!.description).toBe('Whether it is big.');
    });

    it('설명문이 없는 prop은 그대로 둔다', () => {
        const result = applyDictionary(doc, new Map());

        expect(result.doc.props[1]).toEqual({ name: 'color', type: ['string'], required: false });
    });

    // 수집과 적용이 같은 위치를 봐야 한다. 갈리면 검증은 통과하는데 적용이 달라진다.
    it('사전이 모든 유닛을 덮으면 영어가 하나도 남지 않는다', () => {
        const dictionary = new Map(collectUnits('badge.json', doc).map((u) => [u.source, 'ko']));
        const result = applyDictionary(doc, dictionary);

        expect(result.kept).toBe(0);
        expect(result.applied).toBe(collectUnits('badge.json', doc).length);
    });
});
