// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root size="md" closeOnClickOverlay={true}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Popup>
            <Dialog.Header>
                <Dialog.Title>Title</Dialog.Title>
                <Dialog.Description>Description</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>Body content</Dialog.Body>
            <Dialog.Footer>
                <Dialog.Close>Close</Dialog.Close>
            </Dialog.Footer>
        </Dialog.Popup>
    </Dialog.Root>
);
