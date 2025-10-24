// @ts-nocheck
import { Badge } from '@vapor-ui/core';
import { Dialog, Button } from '@goorm-dev/vapor-core';

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
