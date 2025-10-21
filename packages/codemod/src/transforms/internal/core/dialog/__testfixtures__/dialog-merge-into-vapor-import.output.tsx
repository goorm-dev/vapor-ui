// @ts-nocheck
import { Badge, Dialog } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Badge>New</Badge>
        <Dialog.Root>
            <Dialog.Trigger>Open</Dialog.Trigger>
            <Dialog.Content>Content</Dialog.Content>
        </Dialog.Root>
    </div>
);
