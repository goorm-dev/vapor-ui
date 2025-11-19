// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.PopupPrimitive>
                <Dialog.Header>
                    <Dialog.Title>Title</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>Content</Dialog.Body>
            </Dialog.PopupPrimitive>
        </Dialog.Portal>
    </Dialog.Root>
);
