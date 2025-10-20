import { Card } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Card>
            <Card.Header>
                <Card.Title>Card 1</Card.Title>
            </Card.Header>
            <Card.Body>Content 1</Card.Body>
        </Card>
        <Card>
            <Card.Body>Content 2</Card.Body>
            <Card.Footer>Footer 2</Card.Footer>
        </Card>
    </>
);
