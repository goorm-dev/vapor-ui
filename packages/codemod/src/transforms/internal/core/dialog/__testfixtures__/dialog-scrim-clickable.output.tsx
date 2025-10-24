import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Dialog.Root closeOnClickOverlay={true}>
            <Dialog.Trigger>Open 1</Dialog.Trigger>
            <Dialog.Content>Content 1</Dialog.Content>
        </Dialog.Root>
        <Dialog.Root closeOnClickOverlay={false}>
            <Dialog.Trigger>Open 2</Dialog.Trigger>
            <Dialog.Content>Content 2</Dialog.Content>
        </Dialog.Root>
        <Dialog.Root closeOnClickOverlay>
            <Dialog.Trigger>Open 3</Dialog.Trigger>
            <Dialog.Content>Content 3</Dialog.Content>
        </Dialog.Root>
    </>
);
