// @ts-nocheck
import { Button } from '@goorm-dev/vapor-core';
import { Badge, Dialog } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Badge>Badge</Badge>
        <Button>Button</Button>
        <Dialog.Root>
            <Dialog.Trigger>Open</Dialog.Trigger>
            <Dialog.Content>Content</Dialog.Content>
        </Dialog.Root>
    </div>
);
