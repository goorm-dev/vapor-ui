import { Badge, Dialog } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Badge>Badge</Badge>
        <Dialog.Root>
            <Dialog.Trigger>Open</Dialog.Trigger>
            <Dialog.Popup>Content</Dialog.Popup>
        </Dialog.Root>
    </>
);
