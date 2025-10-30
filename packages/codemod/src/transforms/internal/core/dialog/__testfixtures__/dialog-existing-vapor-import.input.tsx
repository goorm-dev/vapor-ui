import { Dialog } from '@goorm-dev/vapor-core';
import { Button } from '@vapor-ui/core';

export const Component = () => (
    <Dialog>
        <Dialog.Trigger asChild>
            <Button>Open</Button>
        </Dialog.Trigger>
        <Dialog.Contents>Content</Dialog.Contents>
    </Dialog>
);
