// @ts-nocheck
import { Badge } from '@goorm-dev/vapor-core';
import { Button, Dialog as VaporDialog } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Button>Button</Button>
        <Badge>Badge</Badge>
        <VaporDialog.Root>
            <VaporDialog.Trigger>Old Dialog</VaporDialog.Trigger>
            <VaporDialog.Content>Old Content</VaporDialog.Content>
        </VaporDialog.Root>
        <VaporDialog.Root>
            <VaporDialog.Trigger>New Dialog</VaporDialog.Trigger>
            <VaporDialog.Content>New Content</VaporDialog.Content>
        </VaporDialog.Root>
    </div>
);
