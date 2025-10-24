import { Card } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root>
        <Card.Header>
            {
                // TODO: Card.Title removed - consider using Text component or custom heading
            }
            Title with props
        </Card.Header>
        <Card.Body>Body content</Card.Body>
    </Card.Root>
);
