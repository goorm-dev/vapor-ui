// @ts-nocheck
import { Badge, Dialog } from '@goorm-dev/vapor-core';
import { Button, Dialog as VaporDialog } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Button>Button</Button>
        <Badge>Badge</Badge>
        <Dialog>
            <Dialog.Trigger>Old Dialog</Dialog.Trigger>
            <Dialog.Content>Old Content</Dialog.Content>
        </Dialog>
        <VaporDialog.Root>
            <VaporDialog.Trigger>New Dialog</VaporDialog.Trigger>
            <VaporDialog.Content>New Content</VaporDialog.Content>
        </VaporDialog.Root>
    </div>
);
