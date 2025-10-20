import { Button, Badge } from '@goorm-dev/vapor-core';

import { Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Button>Click me</Button>
        <Checkbox.Root>
            <Checkbox.Indicator />
        </Checkbox.Root>
        <Badge>New</Badge>
    </div>
);
