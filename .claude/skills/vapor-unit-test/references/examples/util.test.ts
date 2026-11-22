import { mergeStatefulProps, resolveClassName, resolveStyle } from './stateful-props';

describe('stateful-props', () => {
    describe('mergeStatefulProps', () => {
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

        it('returns the external value when the internal value is undefined', () => {
            const merged = mergeStatefulProps({}, { className: 'external' });

            expect(merged.className).toBe('external');
        });

        // 엣지 케이스: 빈 입력
        it('returns an empty object when both inputs are empty', () => {
            const merged = mergeStatefulProps({}, {});

            expect(merged).toEqual({});
        });
    });

    // 엣지 케이스: 잘못된 입력에 대한 throw
    describe('resolveClassName — invalid input', () => {
        it('throws when the resolver is neither a string nor a function', () => {
            expect(() => resolveClassName(42 as unknown as string, { active: true })).toThrow();
        });
    });

    describe('resolveClassName', () => {
        it('invokes the resolver with the given state', () => {
            const resolved = resolveClassName<{ active: boolean }>(
                (state) => (state.active ? 'active' : ''),
                { active: true },
            );

            expect(resolved).toBe('active');
        });

        it('returns string values as-is', () => {
            expect(resolveClassName('static', { active: true })).toBe('static');
        });
    });

    describe('resolveStyle', () => {
        it('resolves a generic stateful style object', () => {
            const style = resolveStyle<{ active: boolean }>(
                (state) => ({ opacity: state.active ? 1 : 0.4 }),
                { active: false },
            );

            expect(style).toEqual({ opacity: 0.4 });
        });
    });
});
