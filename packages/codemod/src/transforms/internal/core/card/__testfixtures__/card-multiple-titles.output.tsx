import { Card } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Card.Root>
            <Card.Header>
                {
                    // TODO: Card.Title removed - consider using Text component or custom heading
                }
                First Card
            </Card.Header>
            <Card.Body>First content</Card.Body>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                {
                    // TODO: Card.Title removed - consider using Text component or custom heading
                }
                Second Card
            </Card.Header>
            <Card.Body>Second content</Card.Body>
        </Card.Root>
    </>
);
