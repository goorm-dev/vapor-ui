import { describe, expect, it, vi } from 'vitest';

import { $style } from './$style';

describe('$style runtime fallback', () => {
    it('returns empty string', () => {
        expect($style({ padding: '$400' })).toBe('');
    });

    it('warns when invoked at runtime in dev', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        $style({ padding: '$400' });
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});
