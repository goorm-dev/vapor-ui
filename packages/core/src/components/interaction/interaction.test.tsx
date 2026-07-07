import { createRef } from 'react';

import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Interaction } from './interaction';

describe('Interaction', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(
            <Interaction>
                <button>Test Interaction</button>
            </Interaction>,
        );
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should forward refs correctly', () => {
        const ref = createRef<HTMLDivElement>();
        render(
            <Interaction ref={ref}>
                <button>Test Interaction</button>
            </Interaction>,
        );

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should apply custom class names', () => {
        const customClassName = 'custom-interaction';
        const rendered = render(
            <Interaction data-testid="interaction" className={customClassName}>
                <button>Test Interaction</button>
            </Interaction>,
        );
        const interactionElement = rendered.queryByTestId('interaction');

        expect(interactionElement).toHaveClass(customClassName);
    });

    it('should render children correctly', () => {
        const rendered = render(
            <Interaction data-testid="interaction">
                <button>Child Element</button>
            </Interaction>,
        );
        const childElement = rendered.getByText('Child Element');
        const interactionElement = rendered.queryByTestId('interaction');

        expect(childElement).toBeInTheDocument();
        expect(interactionElement).toBeInTheDocument();
    });

    describe('prop: type', () => {
        it('should not render children when type is form', () => {
            const rendered = render(
                <Interaction data-testid="interaction" type="form">
                    <button>Child Element</button>
                </Interaction>,
            );

            const interactionElement = rendered.queryByTestId('interaction');

            expect(interactionElement).toBeNull();
            expect(interactionElement).not.toBeInTheDocument();
        });
    });
});
