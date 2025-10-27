import { Badge, Button, Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div>
        <Badge>New</Badge>
        <Dialog>
            <Dialog.Trigger>
                <Button>Open</Button>
            </Dialog.Trigger>
            <Dialog.Contents>Content</Dialog.Contents>
        </Dialog>
    </div>
);
