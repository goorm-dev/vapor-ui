import { Badge } from '@goorm-dev/vapor-core';
import { Card, Button } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root>
        <Button variant="fill">Primary</Button>
        <Badge>New</Badge>
    </Card.Root>
);
