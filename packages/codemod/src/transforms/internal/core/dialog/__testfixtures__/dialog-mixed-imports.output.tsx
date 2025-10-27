// @ts-nocheck
import { Badge, Button } from '@goorm-dev/vapor-core';
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Badge>New</Badge>
        <Dialog.Root>
            <Dialog.Trigger>
                <Button>Open</Button>
            </Dialog.Trigger>
            <Dialog.Content>Content</Dialog.Content>
        </Dialog.Root>
    </div>
);
