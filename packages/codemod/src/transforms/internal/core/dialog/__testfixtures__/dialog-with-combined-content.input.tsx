import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.CombinedContent>
            <Dialog.Title>Title</Dialog.Title>
            <Dialog.Body>Content</Dialog.Body>
        </Dialog.CombinedContent>
    </Dialog>
);
