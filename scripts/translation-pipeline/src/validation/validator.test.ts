import { describe, expect, it } from 'vitest';

import { isMqmError } from '~/validation/validator';

describe('isMqmError', () => {
    it('accepts a valid MQM error', () => {
        expect(
            isMqmError({
                category: 'Terminology/Prop name mistranslated',
                severity: 'critical',
                source_span: 'onClick',
                mt_span: '클릭',
                explanation: 'identifier must not be translated',
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
