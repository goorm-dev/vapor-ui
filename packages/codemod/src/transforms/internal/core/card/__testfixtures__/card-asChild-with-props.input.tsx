import { Card } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Card asChild className="custom-card">
        <section data-testid="card-section">
            <Card.Header>
                <Card.Title>Title</Card.Title>
            </Card.Header>
            <Card.Body>Content</Card.Body>
        </section>
    </Card>
);
