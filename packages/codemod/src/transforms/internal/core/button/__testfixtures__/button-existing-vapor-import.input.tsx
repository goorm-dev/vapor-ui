import { Button, Badge } from '@goorm-dev/vapor-core';
import { Card } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root>
        <Button shape="fill">Primary</Button>
        <Badge>New</Badge>
    </Card.Root>
);
