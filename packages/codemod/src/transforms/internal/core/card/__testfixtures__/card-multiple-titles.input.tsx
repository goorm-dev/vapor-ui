import { Card } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Card>
            <Card.Header>
                <Card.Title>First Card</Card.Title>
            </Card.Header>
            <Card.Body>First content</Card.Body>
        </Card>
        <Card>
            <Card.Header>
                <Card.Title>Second Card</Card.Title>
            </Card.Header>
            <Card.Body>Second content</Card.Body>
        </Card>
    </>
);
