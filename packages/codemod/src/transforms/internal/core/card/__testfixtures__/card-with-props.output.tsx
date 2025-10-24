import { Card } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root className="custom-card" data-testid="test-card">
        <Card.Header className="header-class">
            {
                // TODO: Card.Title removed - consider using Text component or custom heading
            }
            Title with props
        </Card.Header>
        <Card.Body className="body-class">Body content</Card.Body>
        <Card.Footer style={{ display: 'flex' }}>Footer</Card.Footer>
    </Card.Root>
);
