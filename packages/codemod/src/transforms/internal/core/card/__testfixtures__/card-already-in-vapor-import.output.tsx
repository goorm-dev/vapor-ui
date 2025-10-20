import { Badge } from '@goorm-dev/vapor-core';
import { Card as VaporCard, Text } from '@vapor-ui/core';

export const Component = () => (
    <VaporCard.Root>
        <VaporCard.Body>
            <Text>Body content</Text>
            <Badge>New</Badge>
        </VaporCard.Body>
    </VaporCard.Root>
);
