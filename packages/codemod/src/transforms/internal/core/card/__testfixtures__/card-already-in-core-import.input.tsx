import { Badge, Card as CoreCard } from '@goorm-dev/vapor-core';
import { Card, Text } from '@vapor-ui/core';

export const Component = () => (
    <>
        <CoreCard>
            <CoreCard.Body>
                <Text>Body content</Text>
                <Badge>New</Badge>
            </CoreCard.Body>
        </CoreCard>
        <Card.Root>
            <Card.Body>
                <Text>Body content</Text>
                <Badge>New</Badge>
            </Card.Body>
        </Card.Root>
    </>
);
