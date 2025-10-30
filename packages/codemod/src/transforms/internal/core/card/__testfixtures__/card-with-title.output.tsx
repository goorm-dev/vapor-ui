import { Card } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root>
        <Card.Header>
            {
                // TODO: Card.Title removed - consider using Text component or custom heading
            }
            Basic Template
        </Card.Header>
        <Card.Body>This is a Basic Template</Card.Body>
        <Card.Footer>Footer</Card.Footer>
    </Card.Root>
);
