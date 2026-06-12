import { createRef } from 'react';

import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Interaction } from './interaction';
import * as styles from './interaction.css';

describe('Interaction', () => {
    it('renders the single child element with no wrapper DOM', () => {
        const { container } = render(
            <Interaction>
                <button type="button" data-testid="child">
                    Click
                </button>
            </Interaction>,
        );

        expect(container.children).toHaveLength(1);
        expect(container.firstElementChild?.tagName).toBe('BUTTON');
        expect(container.firstElementChild?.getAttribute('data-testid')).toBe('child');
    });

    it('applies the interaction recipe className onto the child', () => {
        const { container } = render(
            <Interaction>
                <button type="button">Click</button>
            </Interaction>,
        );

        const expectedClass = styles.root({});
        expect(container.firstElementChild?.className.split(' ')).toEqual(
            expect.arrayContaining(expectedClass.split(' ').filter(Boolean)),
        );
    });

    it('preserves the child existing className', () => {
        const { container } = render(
            <Interaction>
                <button type="button" className="my-child-class">
                    Click
                </button>
            </Interaction>,
        );

        const classList = container.firstElementChild?.className.split(' ') ?? [];
        expect(classList).toContain('my-child-class');
    });

    it('merges external className prop with recipe and child classes', () => {
        const { container } = render(
            <Interaction className="external-class">
                <button type="button" className="child-class">
                    Click
                </button>
            </Interaction>,
        );

        const classList = container.firstElementChild?.className.split(' ') ?? [];
        expect(classList).toContain('external-class');
        expect(classList).toContain('child-class');
    });

    it('applies variant props through to the recipe', () => {
        const { container: defaultContainer } = render(
            <Interaction>
                <button type="button">Click</button>
            </Interaction>,
        );

        const { container: lightFormContainer } = render(
            <Interaction scale="light" type="form">
                <button type="button">Click</button>
            </Interaction>,
        );

        expect(defaultContainer.firstElementChild?.className).not.toBe(
            lightFormContainer.firstElementChild?.className,
        );

        const lightFormExpected = styles.root({ scale: 'light', type: 'form' });
        const lightFormActual = lightFormContainer.firstElementChild?.className.split(' ') ?? [];
        expect(lightFormActual).toEqual(
            expect.arrayContaining(lightFormExpected.split(' ').filter(Boolean)),
        );
    });

    it('throws when given multiple children', () => {
        const previousError = console.error;
        console.error = vi.fn();

        expect(() =>
            render(
                <Interaction>
                    <button type="button">A</button>
                    <button type="button">B</button>
                </Interaction>,
            ),
        ).toThrow();

        console.error = previousError;
    });

    it('throws when child is not a React element', () => {
        const previousError = console.error;
        console.error = vi.fn();

        expect(() => render(<Interaction>{'just a string' as unknown as never}</Interaction>)).toThrow();

        console.error = previousError;
    });

    it('preserves the child ref', () => {
        const ref = createRef<HTMLButtonElement>();

        render(
            <Interaction>
                <button ref={ref} type="button">
                    Click
                </button>
            </Interaction>,
        );

        expect(ref.current).not.toBeNull();
        expect(ref.current?.tagName).toBe('BUTTON');
    });

    it('has no axe violations', async () => {
        const { container } = render(
            <Interaction>
                <button type="button">Click</button>
            </Interaction>,
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
