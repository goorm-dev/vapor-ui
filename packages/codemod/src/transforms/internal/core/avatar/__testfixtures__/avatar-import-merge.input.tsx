// @ts-nocheck
import { Button, Badge } from '@vapor-ui/core';

import { Avatar } from '@goorm-dev/vapor-core';

function Component() {
    return (
        <div>
            <Button>Click</Button>
            <Avatar label="User" />
            <Badge>New</Badge>
        </div>
    );
}
