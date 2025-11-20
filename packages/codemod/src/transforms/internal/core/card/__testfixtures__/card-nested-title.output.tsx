import { Card } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root>
        <Card.Header>
            {
                // TODO: Card.Title removed - consider using Text component or custom heading
            }
            <span>Nested</span>Title
        </Card.Header>
        <Card.Body>Body</Card.Body>
    </Card.Root>
);
