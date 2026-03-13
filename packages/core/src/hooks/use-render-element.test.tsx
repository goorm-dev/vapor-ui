import { render } from '@testing-library/react';

import { cn } from '~/utils/cn';

import { useRenderElement } from './use-render-element';

interface TestState extends Record<string, unknown> {
    active: boolean;
    disabled: boolean;
}

describe('useRenderElement', () => {
    it('resolves function className with state', () => {
        function TestComponent() {
            return useRenderElement<TestState, HTMLButtonElement>({
                defaultTagName: 'button',
                state: { active: true, disabled: false },
                props: {
                    'data-testid': 'target',
                    className: (state: TestState) => (state.active ? 'is-active' : 'is-inactive'),
                    children: 'button',
                },
            });
        }

        const rendered = render(<TestComponent />);
        const target = rendered.getByTestId('target');

        expect(target).toHaveClass('is-active');
        expect(target).not.toHaveClass('is-inactive');
    });

    it('resolves mixed className array values', () => {
        function TestComponent() {
            return useRenderElement<TestState, HTMLDivElement>({
                defaultTagName: 'div',
                state: { active: true, disabled: false },
                props: {
                    'data-testid': 'target',
                    className: cn(
                        'base',
                        (state: TestState) => (state.active ? 'from-fn' : undefined),
                        false,
                        null,
                    ),
                },
            });
        }

        const rendered = render(<TestComponent />);
        const target = rendered.getByTestId('target');

        expect(target).toHaveClass('base');
        expect(target).toHaveClass('from-fn');
    });

    it('resolves function style with state', () => {
        function TestComponent() {
            return useRenderElement<TestState, HTMLDivElement>({
                defaultTagName: 'div',
                state: { active: true, disabled: false },
                props: {
                    'data-testid': 'target',
                    style: (state: TestState) => ({
                        opacity: state.active ? 0.5 : 1,
                        pointerEvents: state.disabled ? 'none' : 'auto',
                    }),
                },
            });
        }

        const rendered = render(<TestComponent />);
        const target = rendered.getByTestId('target');

        expect(target).toHaveStyle({ opacity: '0.5' });
        expect(target).toHaveStyle({ pointerEvents: 'auto' });
    });
});

// describe('resolveStyle', () => {
//     it('returns plain style objects as-is', () => {
//         const style = { opacity: 0.8 };

//         expect(resolveStyle(style, { active: true })).toBe(style);
//     });

//     it('resolves style functions with state', () => {
//         const result = resolveStyle(
//             (state: { active: boolean }) => ({ opacity: state.active ? 1 : 0.2 }),
//             { active: false },
//         );

//         expect(result).toEqual({ opacity: 0.2 });
//     });
// });

// describe('resolveClassName', () => {
//     it('returns undefined when classNames is falsy', () => {
//         expect(resolveClassName(undefined, {})).toBeUndefined();
//         expect(resolveClassName(null, {})).toBeUndefined();
//         expect(resolveClassName('', {})).toBeUndefined();
//     });

//     it('resolves static className values', () => {
//         expect(resolveClassName('static-class', {})).toBe('static-class');
//     });

//     it('resolves function className values with state', () => {
//         const resolver = (state: { active: boolean }) =>
//             state.active ? 'active-class' : 'inactive-class';

//         expect(resolveClassName(resolver, { active: true })).toBe('active-class');
//         expect(resolveClassName(resolver, { active: false })).toBe('inactive-class');
//     });

//     it('resolves mixed static and function className values', () => {
//         const resolver = (state: { active: boolean }) =>
//             state.active ? 'active-class' : 'inactive-class';

//         expect(resolveClassName(['base', resolver], { active: true })).toBe('base active-class');
//         expect(resolveClassName(['base', resolver], { active: false })).toBe('base inactive-class');
//     });

//     it('filters falsy values from function className results', () => {
//         const resolver = (state: { active: boolean }) => (state.active ? 'x' : '');

//         expect(resolveClassName(resolver, { active: false })).toBe('');
//     });
// });
