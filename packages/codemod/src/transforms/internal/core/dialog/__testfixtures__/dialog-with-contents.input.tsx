import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Dialog size="md" scrimClickable={true}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Contents>
            <Dialog.Header>
                <Dialog.Title>Title</Dialog.Title>
                <Dialog.Description>Description</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>Body content</Dialog.Body>
            <Dialog.Footer>
                <Dialog.Close>Close</Dialog.Close>
            </Dialog.Footer>
        </Dialog.Contents>
    </Dialog>
);
