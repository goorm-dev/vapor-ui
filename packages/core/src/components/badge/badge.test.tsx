import { cleanup, render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import type { BadgeProps } from './badge';
import { Badge } from './badge';

const BadgeTest = (props: BadgeProps) => {
    return <Badge {...props}>Badge</Badge>;
};

describe('Badge', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const rendered = render(<BadgeTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });
});
