// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Popup>
            <Dialog.Title>Title</Dialog.Title>
            <Dialog.Body>Content</Dialog.Body>
        </Dialog.Popup>
    </Dialog.Root>
);
