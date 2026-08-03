import { describe, expect, it } from 'vitest';

import { isMqmError } from '~/validation/validator';

describe('isMqmError', () => {
    it('accepts a valid MQM error', () => {
        expect(
            isMqmError({
                category: 'Accuracy/Mistranslation',
                severity: 'critical',
                source_span: 'Click handler',
                mt_span: '클릭 대상',
                explanation: '동작 설명이 왜곡됐습니다.',
            }),
        ).toBe(true);
    });

    it('rejects unknown categories', () => {
        expect(
            isMqmError({
                category: 'Other',
                severity: 'critical',
                source_span: 'onClick',
                mt_span: '클릭',
                explanation: 'identifier must not be translated',
            }),
        ).toBe(false);
    });
});
