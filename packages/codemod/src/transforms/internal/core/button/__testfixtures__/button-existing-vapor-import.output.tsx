import { Badge } from '@goorm-dev/vapor-core';
import { Button, Card } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root>
        <Button variant="fill">Primary</Button>
        <Badge>New</Badge>
    </Card.Root>
);
