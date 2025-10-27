// @ts-nocheck
import { Button, Dialog } from '@goorm-dev/vapor-core';
import { Badge } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Badge>Badge</Badge>
        <Button>Button</Button>
        <Dialog>
            <Dialog.Trigger>Open</Dialog.Trigger>
            <Dialog.Contents>Content</Dialog.Contents>
        </Dialog>
    </div>
);
