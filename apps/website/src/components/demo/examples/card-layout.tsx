import { Card } from '@vapor-ui/core';

export default function CardLayout() {
    return (
        <div className="flex gap-4 items-start">
            <Card.Root>
                <Card.Body>Body Only</Card.Body>
            </Card.Root>
            
            <Card.Root>
                <Card.Body>Body</Card.Body>
                <Card.Footer>Footer</Card.Footer>
            </Card.Root>
            
            <Card.Root>
                <Card.Header>Header</Card.Header>
                <Card.Body>Body</Card.Body>
            </Card.Root>
        </div>
    );
}