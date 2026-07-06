import { describe, expect, it } from 'vitest';

import { PROPERTY_SHORT, shortenProperty } from './property-shorthand';

describe('PROPERTY_SHORT', () => {
    it('covers common spacing props', () => {
        expect(PROPERTY_SHORT.padding).toBe('p');
        expect(PROPERTY_SHORT.margin).toBe('m');
        expect(PROPERTY_SHORT.paddingTop).toBe('pt');
        expect(PROPERTY_SHORT.gap).toBe('gap');
    });
    it('covers color props', () => {
        expect(PROPERTY_SHORT.backgroundColor).toBe('bg');
        expect(PROPERTY_SHORT.color).toBe('color');
        expect(PROPERTY_SHORT.borderColor).toBe('bc');
    });
    it('shortenProperty kebabs unknown props', () => {
        expect(shortenProperty('textAlign')).toBe('text-align');
    });
});
