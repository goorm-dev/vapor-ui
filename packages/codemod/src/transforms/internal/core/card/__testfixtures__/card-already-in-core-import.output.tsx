import { Badge } from '@goorm-dev/vapor-core';
import { Card, Text } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Card.Root>
            <Card.Body>
                <Text>Body content</Text>
                <Badge>New</Badge>
            </Card.Body>
        </Card.Root>
        <Card.Root>
            <Card.Body>
                <Text>Body content</Text>
                <Badge>New</Badge>
            </Card.Body>
        </Card.Root>
    </>
);
