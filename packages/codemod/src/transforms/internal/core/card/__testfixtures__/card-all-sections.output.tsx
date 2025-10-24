import { Card } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Card.Root>
            <Card.Header>
                {
                    // TODO: Card.Title removed - consider using Text component or custom heading
                }
                Card 1
            </Card.Header>
            <Card.Body>Content 1</Card.Body>
        </Card.Root>
        <Card.Root>
            <Card.Body>Content 2</Card.Body>
            <Card.Footer>Footer 2</Card.Footer>
        </Card.Root>
    </>
);
