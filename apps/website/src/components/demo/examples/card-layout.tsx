import { Card } from '@vapor-ui/core';

export default function CardLayout() {
    return (
        <div className="space-y-4">
            <Card.Root>
                <Card.Header>Header Only</Card.Header>
            </Card.Root>
            
            <Card.Root>
                <Card.Body>Body Only</Card.Body>
            </Card.Root>
            
            <Card.Root>
                <Card.Footer>Footer Only</Card.Footer>
            </Card.Root>
            
            <Card.Root>
                <Card.Header>Header</Card.Header>
                <Card.Body>Body</Card.Body>
            </Card.Root>
        </div>
    );
}