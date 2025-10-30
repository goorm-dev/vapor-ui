import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root>
        <Dialog.Trigger>Open Dialog</Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Dialog Title</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Content goes here</Dialog.Body>
        </Dialog.Content>
    </Dialog.Root>
);
