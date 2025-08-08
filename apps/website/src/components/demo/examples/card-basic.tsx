import { Card } from '@vapor-ui/core';

export default function CardBasic() {
    return (
        <Card.Root className="max-w-md">
            <Card.Header>Basic Template</Card.Header>
            <Card.Body>This is a Basic Template</Card.Body>
            <Card.Footer className="flex justify-center">Footer</Card.Footer>
        </Card.Root>
    );
}
