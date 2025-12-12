import { Dialog } from '@goorm-dev/vapor-core';
import { Badge } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Badge>Badge</Badge>
        <Dialog>
            <Dialog.Trigger>Open</Dialog.Trigger>
            <Dialog.Contents>Content</Dialog.Contents>
        </Dialog>
    </>
);
