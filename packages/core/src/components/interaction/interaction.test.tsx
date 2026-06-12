import { render } from '@testing-library/react';

import { Interaction } from './interaction';

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
});
