import { describe, expect, it, vi } from 'vitest';

import { styles } from './styles';

describe('styles runtime fallback', () => {
    it('returns empty string', () => {
        expect(styles({ padding: '$400' })).toBe('');
    });

    it('warns when invoked at runtime in dev', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        styles({ padding: '$400' });
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});
