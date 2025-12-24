import { render } from '@testing-library/react';
import { isValidElement } from 'react';

import { createRender } from './create-renderer';

describe('createRender', () => {
    describe('when children is a valid element', () => {
        it('should return the element as-is for regular elements', () => {
            const element = <div>hello</div>;
            const result = createRender(element);
            expect(result).toBe(element);
        });

        it('should return a render callback for Fragment children', () => {
            const fragment = (
                <>
                    <span>a</span>
                    <span>b</span>
                </>
            );
            const result = createRender(fragment);

            expect(typeof result).toBe('function');

            if (typeof result === 'function') {
                const rendered = result({}, {});
                expect(rendered).toBe(fragment);
            }
        });
    });

    describe('when fallback is provided', () => {
        it('should return the fallback as-is for regular elements', () => {
            const fallback = <span>fallback</span>;
            const result = createRender('not-element', fallback);
            expect(result).toBe(fallback);
        });

        it('should return a render callback for Fragment fallback', () => {
            const fragmentFallback = (
                <>
                    <span>fallback-a</span>
                    <span>fallback-b</span>
                </>
            );
            const result = createRender('not-element', fragmentFallback);

            expect(typeof result).toBe('function');

            if (typeof result === 'function') {
                const rendered = result({}, {});
                expect(rendered).toBe(fragmentFallback);
            }
        });
    });

    describe('when no fallback is provided', () => {
        it('should return a render callback that wraps non-element children in a Fragment', () => {
            const result = createRender('text');

            expect(typeof result).toBe('function');

            if (typeof result === 'function') {
                const rendered = result({}, {});
                expect(isValidElement(rendered)).toBe(true);
                const { container } = render(rendered);
                expect(container.textContent).toBe('text');
            }
        });

        it('should return a render callback that wraps null in an empty Fragment', () => {
            const result = createRender(null);

            expect(typeof result).toBe('function');

            if (typeof result === 'function') {
                const rendered = result({}, {});
                const { container } = render(rendered);
                expect(container.textContent).toBe('');
            }
        });
    });
});
