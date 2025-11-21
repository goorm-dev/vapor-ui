import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Title</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>Content</Dialog.Body>
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog>
);
