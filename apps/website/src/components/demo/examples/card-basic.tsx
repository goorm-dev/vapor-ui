import { Card } from '@vapor-ui/core';

export default function CardBasic() {
    return (
        <Card.Root>
            <Card.Header>Simple Card</Card.Header>
            <Card.Body>This is a simple card with header and body content.</Card.Body>
            <Card.Footer>Footer content</Card.Footer>
        </Card.Root>
    );
}