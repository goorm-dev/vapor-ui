import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Dialog>
        <Dialog.Trigger>Open Dialog</Dialog.Trigger>
        <Dialog.Contents>
            <Dialog.Header>
                <Dialog.Title>Dialog Title</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Content goes here</Dialog.Body>
        </Dialog.Contents>
    </Dialog>
);
