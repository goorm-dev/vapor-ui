// @ts-nocheck
import { Dialog, Badge } from '@goorm-dev/vapor-core';
import { Dialog as VaporDialog, Button } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Button>Button</Button>
        <Badge>Badge</Badge>
        <Dialog>
            <Dialog.Trigger>Old Dialog</Dialog.Trigger>
            <Dialog.Contents>Old Content</Dialog.Contents>
        </Dialog>
        <VaporDialog.Root>
            <VaporDialog.Trigger>New Dialog</VaporDialog.Trigger>
            <VaporDialog.Content>New Content</VaporDialog.Content>
        </VaporDialog.Root>
    </div>
);
