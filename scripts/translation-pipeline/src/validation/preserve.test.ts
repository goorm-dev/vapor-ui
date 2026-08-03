import { describe, expect, it } from 'vitest';

import { checkPreservation } from '~/validation/preserve';

describe('checkPreservation', () => {
    it('passes when every code span, identifier, URL, and structure survives', () => {
        const source = 'Sets `aria-label` on the trigger. See https://vapor.goorm.io/docs.';
        const translated = '트리거에 `aria-label`을 지정합니다. https://vapor.goorm.io/docs 참고.';

        expect(checkPreservation(source, translated)).toEqual([]);
    });

    it('flags a dropped inline code span', () => {
        const violations = checkPreservation('Renders a `<button>`.', '버튼을 렌더링합니다.');

        expect(violations).toEqual([{ rule: 'backtick_span', expected: '`<button>`' }]);
    });

    it('flags a translated bare identifier outside backticks', () => {
        const violations = checkPreservation(
            'Calls onClick when pressed.',
            '누르면 클릭을 호출합니다.',
        );

        expect(violations).toEqual([{ rule: 'identifier', expected: 'onClick' }]);
    });

    it('ignores identifiers that only appear inside backticks', () => {
        expect(checkPreservation('Use `asChild`.', '`asChild`를 쓰세요.')).toEqual([]);
    });

    it('flags an altered URL', () => {
        const violations = checkPreservation('See https://a.test/x.', 'https://a.test/y 참고.');

        expect(violations).toEqual([{ rule: 'url', expected: 'https://a.test/x' }]);
    });

    it('flags a lost markdown list structure', () => {
        const violations = checkPreservation('Options:\n- one\n- two', '옵션: 하나, 둘');

        expect(violations).toEqual([{ rule: 'markdown_structure', expected: '-|-::0' }]);
    });
});
