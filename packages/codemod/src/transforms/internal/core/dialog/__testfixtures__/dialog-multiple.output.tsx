// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Dialog.Root size="md">
            <Dialog.Trigger>First Dialog</Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Title>First</Dialog.Title>
            </Dialog.Content>
        </Dialog.Root>

        <Dialog.Root size="lg" closeOnClickOverlay={true}>
            <Dialog.Trigger>Second Dialog</Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Title>Second</Dialog.Title>
            </Dialog.Content>
        </Dialog.Root>

        <Dialog.Root size="xl">
            <Dialog.Trigger>Third Dialog</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Popup>
                    <Dialog.Title>Third</Dialog.Title>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    </div>
);
