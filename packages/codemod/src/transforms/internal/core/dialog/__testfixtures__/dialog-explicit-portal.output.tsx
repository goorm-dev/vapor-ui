// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Popup>
                <Dialog.Header>
                    <Dialog.Title>Title</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>Content</Dialog.Body>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
);
