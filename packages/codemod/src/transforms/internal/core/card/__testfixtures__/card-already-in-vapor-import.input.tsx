import { Badge, Card } from '@goorm-dev/vapor-core';
import { Card as VaporCard } from '@vapor-ui/core';
import { Text } from '@vapor-ui/core';

export const Component = () => (
    <Card>
        <Card.Body>
            <Text>Body content</Text>
            <Badge>New</Badge>
        </Card.Body>
    </Card>
);
