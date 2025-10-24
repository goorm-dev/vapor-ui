import { Card } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Card>
        <Card.Header>
            <Card.Title typography="heading4" color="primary">
                Title with props
            </Card.Title>
        </Card.Header>
        <Card.Body>Body content</Card.Body>
    </Card>
);
