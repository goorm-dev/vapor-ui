import { Card } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Card className="custom-card" data-testid="test-card">
        <Card.Header className="header-class">
            <Card.Title>Title with props</Card.Title>
        </Card.Header>
        <Card.Body className="body-class">Body content</Card.Body>
        <Card.Footer style={{ display: 'flex' }}>Footer</Card.Footer>
    </Card>
);
