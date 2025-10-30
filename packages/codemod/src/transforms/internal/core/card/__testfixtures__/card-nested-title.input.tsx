import { Card } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Card>
        <Card.Header>
            <Card.Title>
                <span>Nested</span> Title
            </Card.Title>
        </Card.Header>
        <Card.Body>Body</Card.Body>
    </Card>
);
