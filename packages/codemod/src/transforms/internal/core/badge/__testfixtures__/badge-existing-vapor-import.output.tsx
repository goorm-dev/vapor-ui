import { Text } from '@goorm-dev/vapor-core';
import { Badge, Card } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root>
        <Badge>New</Badge>
        <Text>Content</Text>
    </Card.Root>
);
