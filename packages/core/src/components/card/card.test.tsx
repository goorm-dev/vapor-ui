import { cleanup, render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import type { CardProps } from './card';
import { Card } from './card';

const CardTest = (props: CardProps) => {
    return (
        <Card {...props}>
            <Card.Header>Card Header</Card.Header>
            <Card.Body>Card Body</Card.Body>
            <Card.Footer>Card Footer</Card.Footer>
        </Card>
    );
};

describe('Card', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const rendered = render(<CardTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });
});
