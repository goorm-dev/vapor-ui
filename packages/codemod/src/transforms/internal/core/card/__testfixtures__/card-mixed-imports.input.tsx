import { Badge, Button, Card } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Card>
        <Card.Header>
            <Card.Title>Mixed imports</Card.Title>
            <Badge>New</Badge>
        </Card.Header>
        <Card.Body>
            <Button>Click me</Button>
        </Card.Body>
    </Card>
);
