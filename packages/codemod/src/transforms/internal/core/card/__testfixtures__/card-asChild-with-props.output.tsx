import { Card } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root
        render={
            <section data-testid="card-section">
                <Card.Header>
                    {
                        // TODO: Card.Title removed - consider using Text component or custom heading
                    }
                    Title
                </Card.Header>
                <Card.Body>Content</Card.Body>
            </section>
        }
        className="custom-card"
    />
);
