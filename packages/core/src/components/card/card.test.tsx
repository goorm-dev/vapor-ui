import { cleanup, render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Card } from '.';

const CardTest = (props: Card.Root.Props) => {
    return (
        <Card.Root {...props}>
            <Card.Header>Card Header</Card.Header>
            <Card.Body>Card Body</Card.Body>
            <Card.Footer>Card Footer</Card.Footer>
        </Card.Root>
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
