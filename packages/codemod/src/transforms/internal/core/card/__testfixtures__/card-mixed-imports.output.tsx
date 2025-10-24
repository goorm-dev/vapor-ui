import { Badge, Button } from '@goorm-dev/vapor-core';

import { Card } from '@vapor-ui/core';

export const Component = () => (
    <Card.Root>
        <Card.Header>
            {
                // TODO: Card.Title removed - consider using Text component or custom heading
            }
            Mixed imports
            <Badge>New</Badge>
        </Card.Header>
        <Card.Body>
            <Button>Click me</Button>
        </Card.Body>
    </Card.Root>
);
