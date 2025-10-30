// @ts-nocheck
import { Avatar } from '@goorm-dev/vapor-core';
import { Badge, Button } from '@vapor-ui/core';

function Component() {
    return (
        <div>
            <Button>Click</Button>
            <Avatar label="User" />
            <Badge>New</Badge>
        </div>
    );
}
