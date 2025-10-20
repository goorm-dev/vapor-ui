// @ts-nocheck
import { Button } from '@vapor-ui/core';
import { Avatar } from '@goorm-dev/vapor-core';
import { Badge } from '@vapor-ui/core';

function Component() {
    return (
        <div>
            <Button>Click</Button>
            <Avatar label="User" />
            <Badge>New</Badge>
        </div>
    );
}
