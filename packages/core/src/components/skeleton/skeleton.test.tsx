import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<Skeleton />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });
});
