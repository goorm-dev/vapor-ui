import { mergeStatefulProps, resolveClassName, resolveStyle } from './stateful-props';

describe('stateful-props', () => {
    it('merges static className and style values', () => {
        const merged = mergeStatefulProps(
            { className: 'base', style: { opacity: 0.4 } },
            { className: 'external', style: { pointerEvents: 'none' as const } },
        );

        expect(merged.className).toBe('base external');
        expect(merged.style).toEqual({ opacity: 0.4, pointerEvents: 'none' });
    });

    it('preserves function className when external className is a resolver', () => {
        const merged = mergeStatefulProps<{ active: boolean }>(
            { className: 'base' },
            { className: (state) => (state.active ? 'active' : undefined) },
        );

        expect(typeof merged.className).toBe('function');

        if (typeof merged.className === 'function') {
            expect(merged.className({ active: true })).toBe('base active');
            expect(merged.className({ active: false })).toBe('base');
        }
    });

    it('preserves function style when external style is a resolver', () => {
        const merged = mergeStatefulProps<{ disabled?: boolean }>(
            { style: { opacity: 0.4 } },
            {
                style: (state) => ({
                    pointerEvents: state.disabled ? 'none' : 'auto',
                }),
            },
        );

        expect(typeof merged.style).toBe('function');

        if (typeof merged.style === 'function') {
            expect(merged.style({ disabled: true })).toEqual({
                opacity: 0.4,
                pointerEvents: 'none',
            });
            expect(merged.style({ disabled: false })).toEqual({
                opacity: 0.4,
                pointerEvents: 'auto',
            });
        }
    });

    it('returns array className values as-is when not resolver', () => {
        const resolved = resolveClassName<{ active: boolean }>(
            (state) => (state.active ? 'active' : ''),
            { active: true },
        );

        expect(resolved).toBe('active');
    });

    it('resolves generic stateful value', () => {
        const style = resolveStyle<{ active: boolean }>(
            (state) => ({ opacity: state.active ? 1 : 0.4 }),
            { active: false },
        );

        expect(style).toEqual({ opacity: 0.4 });
    });
});
