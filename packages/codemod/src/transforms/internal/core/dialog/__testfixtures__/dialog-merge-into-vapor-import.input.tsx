import { Dialog } from '@goorm-dev/vapor-core';
import { Badge } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Badge>New</Badge>
        <Dialog>
            <Dialog.Trigger>Open</Dialog.Trigger>
            <Dialog.Contents>Content</Dialog.Contents>
        </Dialog>
    </div>
);
