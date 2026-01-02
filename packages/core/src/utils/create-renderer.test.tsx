import { render } from '@testing-library/react';

import { createRender } from './create-renderer';

describe('renderer', () => {
    it('should return the children if it is a valid React element', () => {
        const element = <div>hello</div>;
        const result = createRender(element);
        // React elements are objects, so compare type and props
        expect(result).toBe(element);
    });

    it('should return fallback if children is not a valid React element', () => {
        const fallback = <span>fallback</span>;
        const result = createRender('not-element', fallback);
        // fallback should be returned as is
        expect(result).toBe(fallback);
    });

    it('should wrap non-element children in a fragment if no fallback', () => {
        const result = createRender('text');
        // Render the result and check the output
        const { container } = render(result);
        expect(container.textContent).toBe('text');
    });

    it('should render null as empty fragment if no fallback', () => {
        const result = createRender(null);
        const { container } = render(result);
        expect(container.textContent).toBe('');
    });
});
