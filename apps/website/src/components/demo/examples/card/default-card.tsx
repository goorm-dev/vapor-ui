import { Card } from '@vapor-ui/core';

export default function DefaultCard() {
    return (
        <Card.Root>
            <Card.Header>Basic Template</Card.Header>
            <Card.Body>This is a Basic Template</Card.Body>
            <Card.Footer style={{ display: 'flex', justifyContent: 'center' }}>Footer</Card.Footer>
        </Card.Root>
    );
}
