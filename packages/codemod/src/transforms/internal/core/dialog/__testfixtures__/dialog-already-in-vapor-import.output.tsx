// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Dialog.Root>
            <Dialog.Trigger>Already migrated</Dialog.Trigger>
            <Dialog.Content>Content</Dialog.Content>
        </Dialog.Root>
        <Dialog.Root>
            <Dialog.Trigger>To migrate</Dialog.Trigger>
            <Dialog.Content>Old content</Dialog.Content>
        </Dialog.Root>
    </div>
);
