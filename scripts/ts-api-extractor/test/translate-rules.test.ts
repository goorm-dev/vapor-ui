import { describe, expect, it } from 'vitest';

import { type Terms, checkDictionary } from '~/translate/core/rules';

const terms: Terms = {
    terms: [{ term: 'dialog', use: '다이얼로그', avoid: ['대화 상자'] }],
    sentencePatterns: [],
};

const check = (source: string, ko: string) =>
    checkDictionary(new Map([[source, ko]]), terms).map((f) => f.rule);

describe('checkDictionary', () => {
    it('정상 번역은 위반이 없다', () => {
        expect(check('Whether it is `open`.', '`open` 상태인지 여부입니다.')).toEqual([]);
    });

    it('코드 스팬이 번역되면 잡는다', () => {
        expect(check('Whether it is `open`.', '`열림` 상태인지 여부입니다.')).toContain('SPAN');
    });

    it('코드 스팬이 사라지면 잡는다', () => {
        expect(check('Renders a `<span>`.', 'span을 렌더링합니다.')).toContain('SPAN');
    });

    it('한글이 없으면 미번역으로 잡는다', () => {
        expect(check('Whether it is open.', 'Whether it is open.')).toContain('UNTRANSLATED');
    });

    it('빈 번역이면 다른 규칙은 건너뛴다', () => {
        expect(check('Renders a `<span>`.', '   ')).toEqual(['EMPTY']);
    });

    it('금지 표기를 쓰면 잡는다', () => {
        expect(check('Opens the dialog.', '대화 상자를 엽니다.')).toContain('TERM');
    });

    it('스팬 순서가 달라도 통과한다 — 어순이 바뀌는 건 정상이다', () => {
        expect(check('`a` then `b`.', '`b` 다음에 `a` 입니다.')).toEqual([]);
    });
});
